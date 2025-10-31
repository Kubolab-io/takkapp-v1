/**
 * useMatching.js
 * 
 * Hook personalizado que maneja todo el sistema de matching tipo Tinder:
 * - Matching diario con usuarios al azar
 * - Historial de matches
 * - Aceptar/rechazar matches
 * - Sistema de 24 horas entre matches
 * - Integración con perfiles de usuario
 */

import { db } from "@/firebaseconfig";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where
} from "firebase/firestore";
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export const useMatching = (user) => {
  const [todayMatch, setTodayMatch] = useState(null);
  const [activeChatId, setActiveChatId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canGetNewMatch, setCanGetNewMatch] = useState(false);
  const [timeUntilNextMatch, setTimeUntilNextMatch] = useState(0);
  const [onboardingDelayRemaining, setOnboardingDelayRemaining] = useState(0);

  // Función para verificar si puede obtener un nuevo match
  const checkCanGetNewMatch = async () => {
    if (!user) return;

    try {
      // Buscar el último match del usuario
      const lastMatchQuery = query(
        collection(db, "dailyMatches"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc"),
        limit(1)
      );

      const lastMatchSnapshot = await getDocs(lastMatchQuery);
      
      if (lastMatchSnapshot.empty) {
        setCanGetNewMatch(true);
        setTimeUntilNextMatch(0);
        return;
      }

      const lastMatch = lastMatchSnapshot.docs[0].data();
      const lastMatchTime = lastMatch.createdAt?.toDate?.() || new Date(lastMatch.createdAt);
      const now = new Date();
      const timeDiff = now - lastMatchTime;

      if (timeDiff >= 24 * 60 * 60 * 1000) { // 24 horas en milisegundos
        setCanGetNewMatch(true);
        setTimeUntilNextMatch(0);
      } else {
        setCanGetNewMatch(false);
        setTimeUntilNextMatch(24 * 60 * 60); // 24 horas = 86400 segundos
      }
    } catch (error) {
      console.error("Error verificando disponibilidad de match:", error);
      setCanGetNewMatch(false);
      Alert.alert(
        "Error de conexión",
        "No se pudo verificar la disponibilidad de match. Verifica tu conexión a internet e intenta de nuevo."
      );
    }
  };

  // Función para obtener el match del día (nuevo sistema de emparejamiento)
  const getTodaysMatch = async () => {
    if (!user) {
      console.log("❌ No hay usuario, no se puede obtener match");
      return;
    }
    
    console.log("🔍 Iniciando getTodaysMatch...");
    
    // Primero verificar si el usuario actual tiene consentimiento
    // Si no lo tiene, no buscar matches aún
    let userProfile;
    try {
      const userProfileQuery = query(
        collection(db, "userProfiles"),
        where("__name__", "==", user.uid)
      );
      
      const userProfileSnapshot = await getDocs(userProfileQuery);
      if (userProfileSnapshot.empty) {
        console.log("⏳ Usuario no tiene perfil completo, esperando onboarding...");
        setLoading(false);
        return;
      }
      
      userProfile = userProfileSnapshot.docs[0].data();
      if (!userProfile.hasMatchingConsent) {
        console.log("⏳ Usuario no ha dado consentimiento, esperando...");
        setLoading(false);
        return;
      }

      // Saltar verificación de delay de onboarding para testing
      console.log("✅ Usuario con consentimiento, puede buscar matches");
      setOnboardingDelayRemaining(0);
    } catch (profileError) {
      console.error("Error obteniendo perfil de usuario:", profileError);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Verificar si ya existe un match en las últimas 24 horas
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const existingMatchQuery = query(
        collection(db, "dailyMatches"),
        where("userId", "==", user.uid),
        where("createdAt", ">=", twentyFourHoursAgo),
        orderBy("createdAt", "desc"),
        limit(1)
      );

      const existingMatchSnapshot = await getDocs(existingMatchQuery);
      
      if (!existingMatchSnapshot.empty) {
        // Ya existe un match reciente, usar ese
        const existingMatch = existingMatchSnapshot.docs[0].data();
        const matchTime = existingMatch.createdAt?.toDate?.() || new Date(existingMatch.createdAt);
        const timeDiff = now - matchTime;
        const remainingTime = Math.max(0, 24 * 60 * 60 - Math.floor(timeDiff / 1000));
        
        setTodayMatch({
          ...existingMatch,
          id: existingMatchSnapshot.docs[0].id
        });
        setCanGetNewMatch(remainingTime <= 0);
        setTimeUntilNextMatch(remainingTime);
        setLoading(false);
        return;
      }
      
      // No hay match reciente, crear uno nuevo
      console.log("🔄 Creando nuevo match...");
      await createTodaysMatch();
      
    } catch (error) {
      console.error("Error obteniendo match del día:", error);
      setLoading(false);
      Alert.alert(
        "Error de conexión",
        "No se pudo obtener el match. Verifica tu conexión a internet e intenta de nuevo."
      );
    }
  };

  // Función para crear el match del día
  const createTodaysMatch = async () => {
    try {
      console.log("🔄 Creando nuevo match para hoy...");
      console.log("🔐 Usuario autenticado:", user?.uid, user?.email);
      
      if (!user?.uid) {
        console.error("❌ No hay usuario autenticado");
        throw new Error("Usuario no autenticado");
      }
      
      // Obtener todos los usuarios disponibles que han dado consentimiento
      const availableUsersQuery = query(
        collection(db, "userProfiles"),
        where("hasMatchingConsent", "==", true)
      );

      const availableUsersSnapshot = await getDocs(availableUsersQuery);
      const allUsers = availableUsersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log("🔍 Todos los usuarios encontrados:", allUsers.length);
      console.log("🔍 Usuarios con consentimiento:", allUsers.map(u => ({
        id: u.id,
        displayName: u.displayName,
        hasMatchingConsent: u.hasMatchingConsent,
        matchingEnabled: u.matchingEnabled,
        onboardingComplete: u.onboardingComplete,
        isPublic: u.isPublic
      })));

      // Filtrar usuarios que no sean el usuario actual
      const otherUsers = allUsers.filter(u => u.id !== user.uid);
      console.log("👥 Usuarios disponibles para matching:", otherUsers.length);

      if (otherUsers.length === 0) {
        console.log("❌ No hay usuarios disponibles para matching");
        setTodayMatch(null);
        setCanGetNewMatch(false);
        setLoading(false);
        
        // Solo mostrar alerta si el usuario ya completó el onboarding
        if (userProfile && userProfile.onboardingComplete) {
          Alert.alert(
            "Sin usuarios disponibles",
            "No hay usuarios disponibles para matching en este momento. Intenta más tarde o invita a más amigos a unirse."
          );
        } else {
          console.log("⏳ Usuario en onboarding, no mostrar error de usuarios no disponibles");
        }
        return;
      }

      // Seleccionar un usuario al azar de todos los disponibles (sin verificar matches recientes)
      const randomIndex = Math.floor(Math.random() * otherUsers.length);
      const selectedUser = otherUsers[randomIndex];
      console.log("🎯 Usuario seleccionado:", selectedUser.displayName);

      // Crear el match bidireccional
      const now = new Date();
      const matchId = `match_${user.uid}_${selectedUser.id}_${Date.now()}`;
      
      const matchData = {
        id: matchId,
        userId: user.uid,
        matchedUserId: selectedUser.id,
        matchedUserData: {
          displayName: selectedUser.displayName || 'Usuario',
          photoURL: selectedUser.photoURL || null,
          age: selectedUser.age || null,
          location: selectedUser.location || null,
          description: selectedUser.description || null,
          hobbies: selectedUser.hobbies || [],
          instagram: selectedUser.instagram || null,
          email: selectedUser.email || null
        },
        status: "pending",
        createdAt: now,
        expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Expira en 24 horas
        isActive: true
      };
      
      console.log("📝 Datos del match a crear:", JSON.stringify(matchData, null, 2));

      // Guardar el match en la base de datos
      console.log("💾 Creando match principal:", {
        matchId,
        userId: user.uid,
        matchedUserId: selectedUser.id,
        authUid: user.uid
      });
      await setDoc(doc(db, "dailyMatches", matchId), matchData);
      
      // Crear el match inverso para el otro usuario
      const reverseMatchId = `match_${selectedUser.id}_${user.uid}_${Date.now()}`;
      const reverseMatchData = {
        id: reverseMatchId,
        userId: selectedUser.id,
        matchedUserId: user.uid,
        matchedUserData: {
          displayName: user.displayName || user.email?.split('@')[0] || 'Usuario',
          photoURL: user.photoURL,
          age: null,
          location: null,
          description: null,
          hobbies: [],
          instagram: null,
          email: user.email
        },
        status: "pending",
        createdAt: now,
        expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Expira en 24 horas
        isActive: true
      };

      console.log("💾 Creando match inverso:", {
        reverseMatchId,
        userId: selectedUser.id,
        matchedUserId: user.uid,
        authUid: user.uid
      });
      await setDoc(doc(db, "dailyMatches", reverseMatchId), reverseMatchData);
      
      console.log("✅ Match bidireccional creado:", selectedUser.displayName);
      setTodayMatch(matchData);
      setCanGetNewMatch(false);
      setTimeUntilNextMatch(24 * 60 * 60); // Iniciar timer de 24 horas
      
    } catch (error) {
      console.error("Error creando match del día:", error);
      setTodayMatch(null);
      setCanGetNewMatch(false);
      Alert.alert(
        "Error de conexión",
        "No se pudo crear el match. Verifica tu conexión a internet e intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  // Función para generar ID único del chat basado en los participantes
  const generateChatId = (userId1, userId2) => {
    // Ordenar los IDs para asegurar consistencia
    const sortedIds = [userId1, userId2].sort();
    const chatId = `chat_${sortedIds[0]}_${sortedIds[1]}`;
    console.log(`🔗 Generando chatId: ${userId1} + ${userId2} = ${chatId}`);
    console.log(`🔗 IDs ordenados: [${sortedIds[0]}, ${sortedIds[1]}]`);
    return chatId;
  };

  // Función para crear chat con el match del día
  const startMatchChat = async (matchUser) => {
    try {
      // Usar siempre el ID del usuario real, no el ID del match
      const matchUserId = matchUser.matchedUserId || matchUser.id;
      console.log(`🔍 DEBUG startMatchChat - matchUser:`, matchUser);
      console.log(`🔍 DEBUG startMatchChat - matchUserId:`, matchUserId);
      console.log(`🔍 DEBUG startMatchChat - user.uid:`, user.uid);
      const chatId = generateChatId(user.uid, matchUserId);
      console.log(`💬 Usuario ${user.uid} iniciando chat con ${matchUserId} -> chatId: ${chatId}`);
      
      // Verificar si ya existe un chat con este ID único
      const chatDocRef = doc(db, "chats", chatId);
      const chatDoc = await getDoc(chatDocRef);

      if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        if (chatData.isActive) {
          console.log("✅ Chat individual ya existe y está activo:", chatId);
          setActiveChatId(chatId);
          return chatId;
        } else {
          // El chat existe pero está inactivo, reactivarlo
          console.log("🔄 Reactivando chat existente:", chatId);
          await updateDoc(chatDocRef, {
            isActive: true,
            lastMessageAt: serverTimestamp(),
            expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000) // Nueva expiración (12 horas)
          });
          setActiveChatId(chatId);
          return chatId;
        }
      }

      // Crear nueva conversación individual temporal
      const chatData = {
        id: chatId, // ID único basado en participantes
        name: `Chat con ${matchUser.displayName || matchUser.matchedUserData?.displayName || 'Usuario'}`,
        type: "individual",
        participants: [user.uid, matchUserId],
        participantNames: [
          user.displayName || user.email?.split('@')[0] || 'Usuario',
          matchUser.displayName || matchUser.matchedUserData?.displayName || 'Usuario'
        ],
        participantPhotos: [
          user.photoURL || null,
          matchUser.photoURL || matchUser.matchedUserData?.photoURL || null
        ],
        lastMessage: null,
        lastMessageAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        isActive: true,
        createdBy: user.uid,
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // Expira en 12 horas
        isTemporary: true
      };

      // Validar que no haya campos undefined
      const cleanChatData = {};
      Object.keys(chatData).forEach(key => {
        if (chatData[key] !== undefined) {
          cleanChatData[key] = chatData[key];
        } else {
          console.warn(`⚠️ Campo ${key} es undefined, usando valor por defecto`);
          if (key === 'participants') {
            cleanChatData[key] = [user.uid, 'unknown'];
          } else if (key === 'participantNames') {
            cleanChatData[key] = [user.displayName || 'Usuario', 'Usuario'];
          } else if (key === 'participantPhotos') {
            cleanChatData[key] = [user.photoURL || null, null];
          } else if (key === 'name') {
            cleanChatData[key] = 'Chat con Usuario';
          } else {
            cleanChatData[key] = null;
          }
        }
      });

      console.log("📝 Datos del chat a crear:", JSON.stringify(cleanChatData, null, 2));
      
      // Usar setDoc con el ID específico en lugar de addDoc
      await setDoc(chatDocRef, cleanChatData);
      
      console.log("✅ Chat individual temporal creado:", chatId);
      setActiveChatId(chatId);
      return chatId;
    } catch (error) {
      console.error("Error creando chat:", error);
      Alert.alert(
        "Error de conexión",
        "No se pudo crear el chat. Verifica tu conexión a internet e intenta de nuevo."
      );
      return null;
    }
  };


  // Función para restaurar chat existente
  const restoreExistingChat = async () => {
    if (!todayMatch || !user) return;

    try {
      // Usar siempre el ID del usuario real, no el ID del match
      const matchUserId = todayMatch.matchedUserId || todayMatch.id;
      console.log(`🔍 DEBUG restoreExistingChat - todayMatch:`, todayMatch);
      console.log(`🔍 DEBUG restoreExistingChat - matchUserId:`, matchUserId);
      console.log(`🔍 DEBUG restoreExistingChat - user.uid:`, user.uid);
      const chatId = generateChatId(user.uid, matchUserId);
      
      // Verificar si existe el chat con este ID único
      const chatDocRef = doc(db, "chats", chatId);
      const chatDoc = await getDoc(chatDocRef);

      if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        if (chatData.isActive) {
          console.log("✅ Restaurando chat existente activo:", chatId);
          setActiveChatId(chatId);
          return chatId;
        } else {
          // El chat existe pero está inactivo, reactivarlo
          console.log("🔄 Reactivando chat existente inactivo:", chatId);
          await updateDoc(chatDocRef, {
            isActive: true,
            lastMessageAt: serverTimestamp(),
            expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000) // Expira en 12 horas
          });
          setActiveChatId(chatId);
          return chatId;
        }
      }
    } catch (error) {
      console.error("Error restaurando chat existente:", error);
      Alert.alert(
        "Error de conexión",
        "No se pudo restaurar el chat existente. Verifica tu conexión a internet e intenta de nuevo."
      );
    }
    return null;
  };

  // Función para verificar si el chat ha expirado
  const checkChatExpiration = async () => {
    if (!activeChatId) return;

    try {
      const chatDocRef = doc(db, "chats", activeChatId);
      const chatDoc = await getDoc(chatDocRef);
      
      if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        const expiresAt = chatData.expiresAt?.toDate?.() || new Date(chatData.expiresAt);
        const now = new Date();
        
        if (now > expiresAt) {
          console.log("⏰ Chat expirado, marcando como inactivo y buscando nuevo match...");
          
          // Marcar chat como inactivo en lugar de eliminarlo
          await updateDoc(chatDocRef, {
            isActive: false,
            expiredAt: serverTimestamp()
          });
          
          setActiveChatId(null);
          setTodayMatch(null);
          // Buscar nuevo match
          getTodaysMatch();
        }
      }
    } catch (error) {
      console.error("Error verificando expiración del chat:", error);
      // No mostrar alerta para este error ya que es un proceso en segundo plano
    }
  };

  // Función para ver perfil del match
  const viewProfile = (matchUser) => {
    // Navegar a la pantalla de perfil del usuario
    console.log("Ver perfil de:", matchUser);
    // La navegación se manejará desde el componente padre
    return matchUser;
  };


  // Cargar match del día cuando hay usuario
  useEffect(() => {
    if (user?.uid) {
      const loadMatchingData = async () => {
        await checkCanGetNewMatch();
        await getTodaysMatch();
      };
      loadMatchingData();
    }
  }, [user?.uid]);

  // Timer simple que cuenta desde 86400 segundos (24 horas) hacia 0
  useEffect(() => {
    if (timeUntilNextMatch > 0) {
      const timer = setInterval(() => {
        setTimeUntilNextMatch(prev => {
          if (prev <= 1) { // 1 segundo
            setCanGetNewMatch(true);
            return 0;
          }
          return prev - 1; // Restar 1 segundo cada vez
        });
      }, 1000); // Cada 1 segundo

      return () => clearInterval(timer);
    }
  }, [timeUntilNextMatch]);


  // Efecto separado para manejar cuando se puede obtener nuevo match
  useEffect(() => {
    if (canGetNewMatch && user?.uid) {
      console.log("🔄 Timer llegó a 0, buscando nuevo match...");
      getTodaysMatch();
    }
  }, [canGetNewMatch, user?.uid]);

  // Timer para el delay de onboarding (30 minutos)
  useEffect(() => {
    if (onboardingDelayRemaining > 0) {
      const timer = setInterval(() => {
        setOnboardingDelayRemaining(prev => {
          if (prev <= 1000) { // Menos de 1 segundo
            console.log("✅ Delay de onboarding completado - Puede buscar matches");
            return 0;
          }
          return prev - 1000; // Restar 1 segundo
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [onboardingDelayRemaining]);

  // Verificar expiración del chat cada minuto
  useEffect(() => {
    if (activeChatId) {
      const expirationTimer = setInterval(() => {
        checkChatExpiration();
      }, 60000); // Verificar cada minuto

      return () => clearInterval(expirationTimer);
    }
  }, [activeChatId]);

  return {
    todayMatch,
    activeChatId,
    setActiveChatId,
    loading,
    canGetNewMatch,
    timeUntilNextMatch,
    onboardingDelayRemaining,
    getTodaysMatch,
    startMatchChat,
    restoreExistingChat,
    viewProfile
  };
};
