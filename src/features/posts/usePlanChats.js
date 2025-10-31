/**
 * usePlanChats.js
 * 
 * Hook personalizado para manejar chats automáticos de planes:
 * - Crear chat automático cuando se crea un plan
 * - Unirse automáticamente al chat cuando se registra a un plan
 * - Obtener chat de un plan específico
 */

import { db } from '@/firebaseconfig';
import {
    addDoc,
    arrayUnion,
    collection,
    doc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where
} from 'firebase/firestore';

// Función para generar ID único para grupos de planes
const generatePlanGroupId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PLAN_${result}`;
};

// Función para extraer la ciudad de una dirección
const extractCityFromAddress = (address) => {
  if (!address) return 'Sin ubicación';
  
  // Lista de ciudades principales de Colombia para validación
  const colombianCities = [
    'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Cúcuta', 
    'Bucaramanga', 'Pereira', 'Santa Marta', 'Ibagué', 'Pasto', 'Manizales',
    'Neiva', 'Villavicencio', 'Armenia', 'Valledupar', 'Montería', 'Sincelejo',
    'Popayán', 'Buenaventura', 'Tunja', 'Florencia', 'Riohacha', 'Quibdó',
    'Arauca', 'Yopal', 'Mocoa', 'Leticia', 'San José del Guaviare', 'Inírida',
    'Mitú', 'Puerto Carreño', 'Bogotá D.C.', 'Bogota', 'Medellin', 'Cali',
    // Ciudades de Cundinamarca y área metropolitana
    'Chía', 'Soacha', 'Zipaquirá', 'Facatativá', 'Girardot', 'Madrid',
    'Mosquera', 'Sibaté', 'Tabio', 'Tenjo', 'Cajicá', 'Cota',
    // Otras ciudades importantes
    'Sabaneta', 'Itagüí', 'Envigado', 'Bello', 'Copacabana', 'Girón',
    'Floridablanca', 'Piedecuesta', 'Soledad', 'Malambo', 'Sabanalarga'
  ];
  
  // Intentar extraer la ciudad de diferentes formatos de dirección
  const parts = address.split(',').map(part => part.trim());
  
  console.log('🔍 Analizando partes de la dirección:', parts);
  
  // Buscar una ciudad conocida en las partes de la dirección
  // Empezar desde el final (donde suele estar la ciudad en Google Maps)
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    
    // Saltar si es "Colombia" o "CO"
    if (part.toLowerCase() === 'colombia' || part.toLowerCase() === 'co') {
      continue;
    }
    
    // Buscar coincidencia exacta
    const exactMatch = colombianCities.find(city => 
      part.toLowerCase() === city.toLowerCase()
    );
    if (exactMatch) {
      console.log('✅ Coincidencia exacta encontrada:', exactMatch);
      return exactMatch;
    }
    
    // Buscar coincidencia parcial (para casos como "Bogotá D.C.")
    const partialMatch = colombianCities.find(city => 
      part.toLowerCase().includes(city.toLowerCase()) || 
      city.toLowerCase().includes(part.toLowerCase())
    );
    if (partialMatch) {
      console.log('✅ Coincidencia parcial encontrada:', partialMatch);
      return partialMatch;
    }
  }
  
  // Si no encuentra una ciudad conocida, intentar extraer del penúltimo elemento
  if (parts.length >= 2) {
    const cityPart = parts[parts.length - 2];
    // Si el penúltimo elemento parece una ciudad (no contiene números)
    if (!/\d/.test(cityPart) && cityPart.length > 2) {
      return cityPart;
    }
  }
  
  // Si no se puede extraer, devolver 'Sin ubicación'
  return 'Sin ubicación';
};

export const usePlanChats = (user) => {
  
  // Crear chat automático para un plan
  const createPlanChat = async (planData) => {
    if (!user?.uid) {
      throw new Error('Usuario no autenticado');
    }

    try {
      console.log('🔗 Creando chat automático para plan:', planData.title);
      
      const planGroupId = generatePlanGroupId();
      
      // Extraer ciudad de la dirección
      let extractedCity = 'Ciudad por confirmar';
      
      console.log('🏙️ Extrayendo ciudad de:', {
        location: planData.location,
        locationData: planData.locationData
      });
      
      // 1. Intentar con locationData.city si existe
      if (planData.locationData?.city && planData.locationData.city !== 'Ciudad por confirmar') {
        extractedCity = planData.locationData.city;
        console.log('✅ Ciudad extraída de locationData.city:', extractedCity);
      }
      // 2. Intentar extraer de la dirección completa
      else if (planData.location) {
        extractedCity = extractCityFromAddress(planData.location);
        console.log('✅ Ciudad extraída de location:', extractedCity);
      }
      // 3. Intentar con locationData.address si existe
      else if (planData.locationData?.address) {
        extractedCity = extractCityFromAddress(planData.locationData.address);
        console.log('✅ Ciudad extraída de locationData.address:', extractedCity);
      }
      
      console.log('🏙️ Ciudad final para el chat:', extractedCity);

      const planChatData = {
        groupId: planGroupId,
        name: planData.title,
        description: `Chat del plan: ${planData.title}`,
        location: planData.location || 'Ubicación por confirmar',
        city: extractedCity,
        category: 'Plan',
        emoji: planData.activityType || '🎯',
        members: [user.uid],
        memberCount: 1,
        createdBy: user.uid,
        createdByDisplayName: user.displayName || user.email?.split('@')[0] || 'Usuario',
        createdAt: serverTimestamp(),
        isPublic: false, // Los chats de planes son privados
        isPlanChat: true, // Marcar como chat de plan
        planId: planData.id || null, // Referencia al plan original
        planData: {
          title: planData.title,
          description: planData.description,
          location: planData.location,
          date: planData.date,
          time: planData.time,
          price: planData.price,
          activityType: planData.activityType,
          maxParticipants: planData.maxParticipants
        }
      };

      const docRef = await addDoc(collection(db, 'groups'), planChatData);
      
      console.log('✅ Chat de plan creado:', docRef.id);
      
      return { 
        docId: docRef.id, 
        groupId: planGroupId,
        chatId: docRef.id // Para compatibilidad con el sistema existente
      };
    } catch (error) {
      console.error('❌ Error creando chat de plan:', error);
      console.error('❌ Datos del plan:', planData);
      throw new Error(`No se pudo crear el chat del plan: ${error.message}`);
    }
  };

  // Obtener chat de un plan específico
  const getPlanChat = async (planId) => {
    if (!user?.uid) {
      throw new Error('Usuario no autenticado');
    }

    try {
      console.log('🔍 Buscando chat del plan:', planId);
      
      // Buscar grupos que sean chats de planes y tengan el planId
      const groupsRef = collection(db, 'groups');
      const q = query(
        groupsRef,
        where('isPlanChat', '==', true),
        where('planId', '==', planId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const groupDoc = querySnapshot.docs[0];
        const groupData = { id: groupDoc.id, ...groupDoc.data() };
        
        console.log('✅ Chat de plan encontrado:', groupData.id);
        return groupData;
      }
      
      console.log('❌ No se encontró chat para el plan:', planId);
      return null;
    } catch (error) {
      console.error('❌ Error obteniendo chat de plan:', error);
      return null;
    }
  };

  // Unirse al chat de un plan
  const joinPlanChat = async (planId) => {
    if (!user?.uid) {
      throw new Error('Usuario no autenticado');
    }

    try {
      console.log('👥 Uniéndose al chat del plan:', planId);
      
      // Buscar el chat del plan
      const planChat = await getPlanChat(planId);
      
      if (!planChat) {
        console.log('❌ No se encontró chat para el plan');
        return false;
      }

      // Verificar si ya es miembro
      if (planChat.members.includes(user.uid)) {
        console.log('ℹ️ Usuario ya es miembro del chat');
        return true;
      }

      // Agregar usuario al chat
      const groupRef = doc(db, 'groups', planChat.id);
      await updateDoc(groupRef, {
        members: arrayUnion(user.uid),
        memberCount: planChat.memberCount + 1
      });

      console.log('✅ Usuario agregado al chat del plan');
      return true;
    } catch (error) {
      console.error('❌ Error uniéndose al chat del plan:', error);
      return false;
    }
  };

  // Salir del chat de un plan
  const leavePlanChat = async (planId) => {
    if (!user?.uid) {
      throw new Error('Usuario no autenticado');
    }

    try {
      console.log('👋 Saliendo del chat del plan:', planId);
      
      // Buscar el chat del plan
      const planChat = await getPlanChat(planId);
      
      if (!planChat) {
        console.log('❌ No se encontró chat para el plan');
        return false;
      }

      // Verificar si es miembro
      if (!planChat.members.includes(user.uid)) {
        console.log('ℹ️ Usuario no es miembro del chat');
        return true;
      }

      // Remover usuario del chat
      const updatedMembers = planChat.members.filter(memberId => memberId !== user.uid);
      const groupRef = doc(db, 'groups', planChat.id);
      
      await updateDoc(groupRef, {
        members: updatedMembers,
        memberCount: updatedMembers.length
      });

      console.log('✅ Usuario removido del chat del plan');
      return true;
    } catch (error) {
      console.error('❌ Error saliendo del chat del plan:', error);
      return false;
    }
  };

  return {
    createPlanChat,
    getPlanChat,
    joinPlanChat,
    leavePlanChat
  };
};
