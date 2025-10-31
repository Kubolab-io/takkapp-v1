/**
 * useChatNotifications.ts
 * 
 * Hook personalizado para manejar notificaciones de chat
 */

import * as Notifications from 'expo-notifications';
import { User } from 'firebase/auth';
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

// Configurar el comportamiento de las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface UseChatNotificationsProps {
  user: User | null;
  groupId?: string;
  isChatActive?: boolean;
}

export const useChatNotifications = ({ 
  user, 
  groupId, 
  isChatActive = false 
}: UseChatNotificationsProps) => {
  const appState = useRef(AppState.currentState);
  const lastMessageTime = useRef<Date>(new Date());

  // Solicitar permisos de notificaciones
  const requestPermissions = async () => {
    if (!user) return false;

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Permisos de notificación denegados');
        return false;
      }

      console.log('✅ Permisos de notificación concedidos');
      return true;
    } catch (error) {
      console.error('Error solicitando permisos de notificación:', error);
      return false;
    }
  };

  // Mostrar notificación local
  const showNotification = async (title: string, body: string, data?: any) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: null, // Mostrar inmediatamente
      });
    } catch (error) {
      console.error('Error mostrando notificación:', error);
    }
  };

  // Detectar si la app está en background o cerrada
  const isAppInBackground = (currentAppState: AppStateStatus) => {
    return currentAppState === 'background' || currentAppState === 'inactive';
  };

  // Verificar si debe mostrar notificación
  const shouldShowNotification = (
    messageSenderId: string,
    messageTime: Date,
    currentAppState: AppStateStatus
  ) => {
    // No mostrar si es el propio usuario
    if (messageSenderId === user?.uid) return false;

    // No mostrar si el chat está activo
    if (isChatActive) return false;

    // No mostrar si la app está en primer plano
    if (currentAppState === 'active') return false;

    // No mostrar si es un mensaje muy antiguo
    if (messageTime.getTime() - lastMessageTime.current.getTime() < 1000) {
      return false;
    }

    return true;
  };

  // Función para manejar nuevo mensaje
  const handleNewMessage = (
    message: {
      senderId: string;
      senderDisplayName: string;
      text: string;
      createdAt: any;
      groupId: string;
    },
    groupName?: string,
    groupEmoji?: string
  ) => {
    if (!user || !shouldShowNotification(message.senderId, message.createdAt.toDate(), appState.current)) {
      return;
    }

    const title = `${groupEmoji || '💬'} ${groupName || 'Grupo'}`;
    const body = `${message.senderDisplayName}: ${message.text}`;

    showNotification(title, body, {
      groupId: message.groupId,
      senderId: message.senderId,
      type: 'chat_message'
    });

    lastMessageTime.current = message.createdAt.toDate();
  };

  // Escuchar cambios de estado de la app
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      appState.current = nextAppState;
    });

    return () => subscription?.remove();
  }, []);

  // Solicitar permisos al montar
  useEffect(() => {
    if (user) {
      requestPermissions();
    }
  }, [user]);

  return {
    handleNewMessage,
    showNotification,
    requestPermissions
  };
};
