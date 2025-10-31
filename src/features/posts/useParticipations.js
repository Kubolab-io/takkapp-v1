/**
 * useParticipations.js
 * 
 * Hook personalizado que maneja las participaciones de usuarios en actividades:
 * - Inscribir usuarios en actividades
 * - Verificar si un usuario ya está inscrito
 * - Actualizar contador de participantes
 * - Cancelar inscripción
 */

import { db } from "@/firebaseconfig";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    increment,
    onSnapshot,
    query,
    serverTimestamp,
    updateDoc,
    where
} from "firebase/firestore";
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { usePlanChats } from './usePlanChats';

// Función para formatear fechas de Firebase
const formatFirebaseDate = (dateValue) => {
  if (!dateValue) return 'Fecha no especificada';
  
  try {
    // Si es un timestamp de Firebase (tiene seconds y nanoseconds)
    if (dateValue.seconds && dateValue.nanoseconds) {
      return new Date(dateValue.seconds * 1000).toLocaleDateString('es-ES');
    }
    
    // Si es un string de fecha ISO
    if (typeof dateValue === 'string') {
      return new Date(dateValue).toLocaleDateString('es-ES');
    }
    
    // Si es un timestamp en milisegundos
    if (typeof dateValue === 'number') {
      return new Date(dateValue).toLocaleDateString('es-ES');
    }
    
    return 'Formato no válido';
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return 'Error en fecha';
  }
};

export const useParticipations = (user) => {
  const [myParticipations, setMyParticipations] = useState([]);
  const [loadingParticipation, setLoadingParticipation] = useState(false);

  // Hook para chats de planes
  const { joinPlanChat, leavePlanChat } = usePlanChats(user);

  // Escuchar las participaciones del usuario actual
  useEffect(() => {
    if (!user) {
      setMyParticipations([]);
      return;
    }

    console.log("👂 Configurando listener de participaciones para:", user.uid);
    
    // Verificar que el usuario esté completamente autenticado
    if (!user || !user.uid) {
      console.log("🔐 Usuario no disponible para participaciones");
      setMyParticipations([]);
      return;
    }
    
    const q = query(
      collection(db, "participations"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Verificar que el usuario sigue autenticado
      if (!user || !user.uid) {
        console.log("🔐 Usuario no autenticado, cancelando listener de participaciones");
        setMyParticipations([]);
        return;
      }
      
      const participations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log("✅ Participaciones del usuario:", participations.length);
      setMyParticipations(participations);
    }, (error) => {
      console.error("❌ Error en listener de participaciones:", error);
      // Si hay error de permisos, limpiar el estado
      if (error.code === 'permission-denied') {
        setMyParticipations([]);
        return;
      }
      // Solo mostrar alerta si hay usuario (para evitar errores de permisos al cerrar sesión)
      if (user) {
        Alert.alert("Error", "No se pudieron cargar las participaciones: " + error.message);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Verificar si el usuario está inscrito en una actividad
  const isUserParticipating = (postId) => {
    return myParticipations.some(p => p.postId === postId);
  };

  // Obtener participación específica
  const getUserParticipation = (postId) => {
    return myParticipations.find(p => p.postId === postId);
  };

  // Inscribirse en una actividad
  const joinActivity = async (postId, activityData) => {
    console.log("🔥 DEBUG ===== INICIO useParticipations.joinActivity =====");
    console.log("🔥 DEBUG postId:", postId);
    console.log("🔐 DEBUG: Usuario autenticado:", user?.uid);
    console.log("🔐 DEBUG: Auth token:", user?.accessToken ? "Presente" : "Ausente");
    
    // Verificar que activityData existe
    if (!activityData) {
      console.log("❌ DEBUG: activityData es null o undefined");
      Alert.alert("Error", "Datos de actividad no válidos");
      return false;
    }
    
    console.log("🔥 DEBUG activityData existe:", !!activityData);
    console.log("🔥 DEBUG activityData keys:", Object.keys(activityData || {}));
    
    // Verificar propiedades individuales de forma segura
    console.log("🔥 DEBUG activityData.title:", activityData?.title);
    console.log("🔥 DEBUG activityData.type:", activityData?.type);
    console.log("🔥 DEBUG activityData.maxParticipants:", activityData?.maxParticipants);
    console.log("🔥 DEBUG activityData.participants:", activityData?.participants);
    console.log("🔥 DEBUG activityData.authorId:", activityData?.authorId);
    console.log("🔥 DEBUG activityData.availableSlots:", activityData?.availableSlots);
    
    console.log("🔥 DEBUG user:", user?.uid);
    console.log("🔥 DEBUG user existe:", !!user);
    console.log("🔥 DEBUG user.uid existe:", !!user?.uid);
    
    if (!user) {
      console.log("❌ DEBUG: No hay usuario autenticado");
      Alert.alert("Error", "Debes iniciar sesión para apuntarte");
      return false;
    }

    // Verificar si es el creador de la actividad
    console.log("🔥 DEBUG: Verificando si es creador...");
    console.log("🔥 DEBUG: activityData.authorId:", activityData.authorId);
    console.log("🔥 DEBUG: user.uid:", user.uid);
    console.log("🔥 DEBUG: ¿Es creador?:", activityData.authorId === user.uid);
    
    if (activityData.authorId === user.uid) {
      console.log("⚠️ DEBUG: El usuario es el creador de esta actividad");
      Alert.alert("Info", "Ya estás inscrito como organizador de esta actividad");
      return false;
    }

    // Verificar si ya está inscrito
    console.log("🔥 DEBUG: Verificando si ya está inscrito...");
    const isAlreadyParticipating = isUserParticipating(postId);
    console.log("🔥 DEBUG: ¿Ya está inscrito?:", isAlreadyParticipating);
    
    if (isAlreadyParticipating) {
      console.log("⚠️ DEBUG: Usuario ya está inscrito");
      Alert.alert("Info", "Ya estás apuntado a esta actividad");
      return false;
    }

    // Verificar si hay cupos disponibles
    console.log("🔥 DEBUG: Verificando cupos disponibles...");
    console.log("🔥 DEBUG: maxParticipants:", activityData.maxParticipants);
    console.log("🔥 DEBUG: participants:", activityData.participants);
    console.log("🔥 DEBUG: availableSlots (si existe):", activityData.availableSlots);
    
    const availableSlots = activityData.maxParticipants - activityData.participants;
    console.log(`📊 DEBUG: maxParticipants: ${activityData.maxParticipants}, participants: ${activityData.participants}`);
    console.log(`📊 Cupos disponibles: ${availableSlots}/${activityData.maxParticipants}`);
    
    if (availableSlots <= 0) {
      console.log("❌ DEBUG: No hay cupos disponibles");
      Alert.alert("Lo sentimos", "Esta actividad ya está llena");
      return false;
    }

    console.log(`📊 Cupos disponibles: ${availableSlots}/${activityData.maxParticipants}`);

    try {
      setLoadingParticipation(true);
      console.log("🚀 Inscribiendo usuario en actividad:", postId);

      // Verificar autenticación antes de proceder
      if (!user || !user.uid) {
        console.error("❌ Usuario no autenticado");
        Alert.alert("Error", "Debes iniciar sesión para inscribirte");
        return false;
      }

      console.log("🔥 DEBUG: Usuario autenticado:", user.uid);
      console.log("🔥 DEBUG: Email del usuario:", user.email);
      console.log("🔥 DEBUG: Display name:", user.displayName);

      // 1. Crear registro de participación
      console.log("🔥 DEBUG: Creando registro de participación...");
      const participationData = {
        userId: user.uid,
        postId: postId,
        userEmail: user.email || '',
        userName: user.displayName || user.email?.split('@')[0] || 'Usuario',
        activityTitle: activityData.title || 'Actividad sin título',
        activityDate: activityData.date || 'Fecha no especificada',
        activityLocation: activityData.location || 'Ubicación no especificada',
        activityEmoji: activityData.emoji || '🎯',
        createdAt: serverTimestamp(),
        status: "confirmed"
      };
      console.log("🔥 DEBUG: Datos de participación:", participationData);
      
      try {
        const participationRef = await addDoc(collection(db, "participations"), participationData);
        console.log("✅ DEBUG: Participación creada con ID:", participationRef.id);
      } catch (participationError) {
        console.error("❌ ERROR específico en creación de participación:", participationError);
        console.error("❌ Código de error:", participationError.code);
        console.error("❌ Mensaje de error:", participationError.message);
        throw participationError; // Re-lanzar el error para que sea capturado por el catch principal
      }

      // 2. Actualizar contador de participantes en el post
      console.log("🔥 DEBUG: Actualizando contadores del post...");
      const postRef = doc(db, "posts", postId);
      const updateData = {
        participants: increment(1),
        availableSlots: increment(-1) // Reducir cupos disponibles
      };
      console.log("🔥 DEBUG: Datos de actualización:", updateData);
      
      await updateDoc(postRef, updateData);
      console.log("✅ DEBUG: Post actualizado exitosamente");

      console.log("✅ Usuario inscrito exitosamente");
      
      // Unirse automáticamente al chat del plan
      try {
        const chatJoined = await joinPlanChat(postId);
        if (chatJoined) {
          console.log("✅ Usuario agregado al chat del plan");
        }
      } catch (chatError) {
        console.error("⚠️ Error uniéndose al chat del plan:", chatError);
        // No mostrar error al usuario, la inscripción ya fue exitosa
      }
      
      Alert.alert(
        "¡Éxito! 🎉", 
        `Te has apuntado a "${activityData.title}"\n📅 ${formatFirebaseDate(activityData.date)}\n📍 ${activityData.location}\n\n💬 También te has unido al chat del plan.`
      );
      
      return true;
    } catch (error) {
      console.error("❌ Error al inscribirse:", error);
      Alert.alert("Error", "No se pudo completar la inscripción: " + error.message);
      return false;
    } finally {
      setLoadingParticipation(false);
    }
  };

  // Cancelar inscripción en una actividad
  const leaveActivity = async (postId) => {
    if (!user) {
      Alert.alert("Error", "Debes iniciar sesión");
      return false;
    }

    const participation = getUserParticipation(postId);
    if (!participation) {
      Alert.alert("Error", "No estás inscrito en esta actividad");
      return false;
    }

    Alert.alert(
      "Confirmar",
      "¿Estás seguro de que quieres cancelar tu inscripción?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, cancelar inscripción",
          style: "destructive",
          onPress: async () => {
            try {
              setLoadingParticipation(true);
              console.log("🗑️ Cancelando inscripción:", participation.id);
              console.log("🔐 Usuario autenticado:", user?.uid);
              console.log("🔐 Auth token:", user?.accessToken ? "Presente" : "Ausente");

              // 1. Eliminar registro de participación
              console.log("🗑️ Eliminando documento de participación...");
              await deleteDoc(doc(db, "participations", participation.id));
              console.log("✅ Documento de participación eliminado");

              // 2. Actualizar contador de participantes
              const postRef = doc(db, "posts", postId);
              await updateDoc(postRef, {
                participants: increment(-1),
                availableSlots: increment(1) // Liberar cupo
              });

              console.log("✅ Inscripción cancelada");
              
              // Salir automáticamente del chat del plan
              try {
                const chatLeft = await leavePlanChat(postId);
                if (chatLeft) {
                  console.log("✅ Usuario removido del chat del plan");
                }
              } catch (chatError) {
                console.error("⚠️ Error saliendo del chat del plan:", chatError);
                // No mostrar error al usuario, la cancelación ya fue exitosa
              }
              
              Alert.alert("Confirmado", "Tu inscripción ha sido cancelada y has salido del chat del plan.");
              
              return true;
            } catch (error) {
              console.error("❌ Error al cancelar inscripción:", error);
              Alert.alert("Error", "No se pudo cancelar la inscripción");
              return false;
            } finally {
              setLoadingParticipation(false);
            }
          }
        }
      ]
    );
  };

  // Obtener todos los participantes de una actividad
  const getActivityParticipants = async (postId) => {
    try {
      const q = query(
        collection(db, "participations"),
        where("postId", "==", postId)
      );
      
      const snapshot = await getDocs(q);
      const participants = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return participants;
    } catch (error) {
      console.error("❌ Error obteniendo participantes:", error);
      return [];
    }
  };

  return {
    myParticipations,
    loadingParticipation,
    isUserParticipating,
    getUserParticipation,
    joinActivity,
    leaveActivity,
    getActivityParticipants
  };
};