/**
 * useGroups.ts
 * 
 * Hook personalizado para manejar grupos y chats grupales
 */

import { db } from '@/firebaseconfig';
import { useChatNotifications } from '@/src/hooks/useChatNotifications';
import { User } from 'firebase/auth';
import {
    addDoc,
    arrayUnion,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

// Función para generar ID único para grupos
const generateGroupId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export interface Group {
  id: string;
  groupId: string; // ID único generado para búsqueda
  name: string;
  description: string;
  location: string;
  city: string; // Ciudad obligatoria
  category: string;
  emoji: string;
  members: string[];
  memberCount: number;
  createdBy: string;
  createdByDisplayName: string;
  createdAt: any;
  isPlanChat?: boolean; // Para diferenciar chats de planes vs chats grupales
  planId?: string; // ID del plan asociado si es un chat de plan
  isPublic: boolean;
}

export interface GroupMessage {
  id: string;
  text: string;
  senderId: string;
  senderDisplayName: string;
  createdAt: any;
  groupId: string;
}

export const useGroups = (user: User | null) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [communityGroups, setCommunityGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar todos los grupos
  const loadGroups = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const groupsRef = collection(db, 'groups');
      const q = query(groupsRef, orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const allGroups: Group[] = [];
        snapshot.forEach((doc) => {
          allGroups.push({ id: doc.id, ...doc.data() } as Group);
        });

        setGroups(allGroups);
        
        // Filtrar mis grupos (donde soy miembro)
        const myGroupsFiltered = allGroups.filter(group => 
          group.members.includes(user.uid)
        );
        setMyGroups(myGroupsFiltered);

        // Filtrar grupos de la comunidad (donde NO soy miembro)
        const communityGroupsFiltered = allGroups.filter(group => 
          !group.members.includes(user.uid) && group.isPublic
        );
        setCommunityGroups(communityGroupsFiltered);

        setLoading(false);
        setError(null);
      });

      return unsubscribe;
    } catch (err) {
      console.error('Error cargando grupos:', err);
      setError('No se pudieron cargar los grupos');
      setLoading(false);
    }
  };

  // Crear nuevo grupo
  const createGroup = async (groupData: {
    name: string;
    description: string;
    location: string;
    city: string; // Ciudad obligatoria
    category: string;
    emoji: string;
  }) => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    // Validar que la ciudad sea obligatoria
    if (!groupData.city || groupData.city.trim() === '') {
      throw new Error('La ciudad es obligatoria para crear un grupo');
    }

    try {
      const groupId = generateGroupId();
      
      const newGroup = {
        ...groupData,
        groupId: groupId, // ID único para búsqueda
        members: [user.uid],
        memberCount: 1,
        createdBy: user.uid,
        createdByDisplayName: user.displayName || user.email?.split('@')[0] || 'Usuario',
        createdAt: serverTimestamp(),
        isPublic: true,
        isPlanChat: false // Marcar explícitamente como chat grupal normal
      };

      const docRef = await addDoc(collection(db, 'groups'), newGroup);
      return { docId: docRef.id, groupId: groupId };
    } catch (err) {
      console.error('Error creando grupo:', err);
      throw new Error('No se pudo crear el grupo');
    }
  };

  // Unirse a un grupo
  const joinGroup = async (groupId: string) => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const groupRef = doc(db, 'groups', groupId);
      const group = groups.find(g => g.id === groupId);
      
      if (!group) {
        throw new Error('Grupo no encontrado');
      }

      if (group.members.includes(user.uid)) {
        throw new Error('Ya eres miembro de este grupo');
      }

      await updateDoc(groupRef, {
        members: arrayUnion(user.uid),
        memberCount: group.memberCount + 1
      });

      return true;
    } catch (err) {
      console.error('Error uniéndose al grupo:', err);
      throw err;
    }
  };

  // Salir de un grupo
  const leaveGroup = async (groupId: string) => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const groupRef = doc(db, 'groups', groupId);
      const group = groups.find(g => g.id === groupId);
      
      if (!group) {
        throw new Error('Grupo no encontrado');
      }

      if (!group.members.includes(user.uid)) {
        throw new Error('No eres miembro de este grupo');
      }

      const updatedMembers = group.members.filter(memberId => memberId !== user.uid);
      
      await updateDoc(groupRef, {
        members: updatedMembers,
        memberCount: updatedMembers.length
      });

      return true;
    } catch (err) {
      console.error('Error saliendo del grupo:', err);
      throw err;
    }
  };

  // Eliminar un grupo (solo el creador)
  const deleteGroup = async (groupId: string) => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const groupRef = doc(db, 'groups', groupId);
      const group = groups.find(g => g.id === groupId);
      
      if (!group) {
        throw new Error('Grupo no encontrado');
      }

      if (group.createdBy !== user.uid) {
        throw new Error('Solo el creador puede eliminar el grupo');
      }

      // Eliminar el grupo
      await deleteDoc(groupRef);

      return true;
    } catch (err) {
      console.error('Error eliminando grupo:', err);
      throw err;
    }
  };

  // Obtener datos de un grupo específico
  const getGroupData = async (groupId: string): Promise<Group | null> => {
    try {
      const groupDoc = await getDoc(doc(db, 'groups', groupId));
      if (groupDoc.exists()) {
        return { id: groupDoc.id, ...groupDoc.data() } as Group;
      }
      return null;
    } catch (err) {
      console.error('Error obteniendo datos del grupo:', err);
      throw new Error('No se pudieron cargar los datos del grupo');
    }
  };

  // Buscar grupo por ID único
  const findGroupById = async (groupId: string): Promise<Group | null> => {
    try {
      const groupsRef = collection(db, 'groups');
      const q = query(groupsRef, where('groupId', '==', groupId));
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Group;
      }
      return null;
    } catch (err) {
      console.error('Error buscando grupo por ID:', err);
      throw new Error('No se pudo buscar el grupo');
    }
  };

  // Filtrar grupos por ciudad
  const getGroupsByCity = (city: string): Group[] => {
    if (!city || city === 'Todas') {
      return groups;
    }
    return groups.filter(group => 
      group.city && group.city.toLowerCase() === city.toLowerCase()
    );
  };

  // Obtener ciudades únicas de los grupos
  const getAvailableCities = (): string[] => {
    const cities = new Set<string>();
    groups.forEach(group => {
      if (group.city) {
        cities.add(group.city);
      }
    });
    return Array.from(cities).sort();
  };

  // Cargar grupos al montar el componente
  useEffect(() => {
    if (user) {
      loadGroups();
    }
  }, [user]);

  return {
    groups,
    myGroups,
    communityGroups,
    loading,
    error,
    createGroup,
    joinGroup,
    leaveGroup,
    deleteGroup,
    getGroupData,
    findGroupById,
    getGroupsByCity,
    getAvailableCities,
    loadGroups
  };
};

export const useGroupMessages = (user: User | null, groupId: string, options?: {
  onNewMessage?: (message: GroupMessage) => void;
  isChatActive?: boolean;
  groupName?: string;
  groupEmoji?: string;
}) => {
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar mensajes del grupo
  useEffect(() => {
    if (!user || !groupId) return;

    const messagesRef = collection(db, 'groupMessages');
    const q = query(
      messagesRef,
      where('groupId', '==', groupId)
      // Temporalmente sin orderBy hasta que se cree el índice
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData: GroupMessage[] = [];
      
      snapshot.forEach((doc) => {
        messagesData.push({ id: doc.id, ...doc.data() } as GroupMessage);
      });
      
      // Ordenar por fecha en el cliente temporalmente
      messagesData.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateA.getTime() - dateB.getTime();
      });
      
      setMessages(messagesData);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error('Error cargando mensajes:', err);
      setError('No se pudieron cargar los mensajes');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, groupId]);

  // Manejar notificaciones de nuevos mensajes
  useEffect(() => {
    if (messages.length > 0 && options?.onNewMessage) {
      const lastMessage = messages[messages.length - 1];
      // Solo notificar si el mensaje es nuevo (no del usuario actual)
      if (lastMessage.senderId !== user?.uid) {
        options.onNewMessage(lastMessage);
      }
    }
  }, [messages.length]); // Solo depende de la longitud, no del array completo

  // Enviar mensaje
  const sendMessage = async (text: string) => {
    if (!user || !groupId || !text.trim()) {
      throw new Error('Datos inválidos para enviar mensaje');
    }

    try {
      await addDoc(collection(db, 'groupMessages'), {
        text: text.trim(),
        senderId: user.uid,
        senderDisplayName: user.displayName || user.email?.split('@')[0] || 'Usuario',
        groupId: groupId,
        createdAt: serverTimestamp()
      });

      return true;
    } catch (err) {
      console.error('Error enviando mensaje:', err);
      throw new Error('No se pudo enviar el mensaje');
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage
  };
};

// Hook global para escuchar mensajes de todos los grupos del usuario
export const useGlobalChatNotifications = (user: User | null, activeGroupId?: string) => {
  const { handleNewMessage } = useChatNotifications({
    user,
    isChatActive: !!activeGroupId
  });

  useEffect(() => {
    if (!user) return;

    // Escuchar mensajes de todos los grupos donde el usuario es miembro
    const groupsRef = collection(db, 'groups');
    const userGroupsQuery = query(groupsRef, where('members', 'array-contains', user.uid));

    const unsubscribeGroups = onSnapshot(userGroupsQuery, (groupsSnapshot) => {
      groupsSnapshot.forEach((groupDoc) => {
        const groupData = { id: groupDoc.id, ...groupDoc.data() } as Group;
        
        // Escuchar mensajes de este grupo
        const messagesRef = collection(db, 'groupMessages');
        const messagesQuery = query(
          messagesRef,
          where('groupId', '==', groupData.id)
        );

        const unsubscribeMessages = onSnapshot(messagesQuery, (messagesSnapshot) => {
          const messagesData: GroupMessage[] = [];
          messagesSnapshot.forEach((doc) => {
            messagesData.push({ id: doc.id, ...doc.data() } as GroupMessage);
          });

          // Ordenar por fecha
          messagesData.sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
            return dateA.getTime() - dateB.getTime();
          });

          // Verificar si hay mensajes nuevos (último mensaje)
          if (messagesData.length > 0) {
            const lastMessage = messagesData[messagesData.length - 1];
            
            // Solo mostrar notificación si es de otro usuario y no estamos en ese chat
            if (lastMessage.senderId !== user.uid && 
                lastMessage.groupId !== activeGroupId) {
              
              handleNewMessage(lastMessage, groupData.name, groupData.emoji);
            }
          }
        });

        // Cleanup function se manejará automáticamente
        return () => unsubscribeMessages();
      });
    });

    return () => {
      unsubscribeGroups();
    };
  }, [user, activeGroupId, handleNewMessage]);

  return {
    handleNewMessage
  };
};
