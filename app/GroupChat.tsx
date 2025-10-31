/**
 * GroupChat.tsx
 * 
 * Pantalla de chat grupal donde los miembros del grupo pueden conversar
 */

import { auth } from '@/firebaseconfig';
import { ActivityCard } from '@/src/components/ActivityCard';
import { SharePlanButton } from '@/src/components/SharePlanButton';
import { SharePlanModal } from '@/src/components/SharePlanModal';
import { Colors } from '@/src/constants/Colors';
import { GroupMessage, useGroupMessages, useGroups } from '@/src/features/groups/useGroups';
import { usePosts } from '@/src/features/posts/usePosts';
import { useChatNotifications } from '@/src/hooks/useChatNotifications';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

const GroupChatScreen = React.memo(() => {
  const { groupId, groupName, groupEmoji, preWrittenMessage } = useLocalSearchParams<{
    groupId: string;
    groupName: string;
    groupEmoji: string;
    preWrittenMessage?: string;
  }>();
  
  const [user, setUser] = useState(auth.currentUser);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [groupData, setGroupData] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const initialMessageSetRef = useRef(false);

  // Función para formatear fechas de Firebase
  const formatFirebaseDate = (dateValue: any) => {
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

  // Hook para obtener los posts del usuario (planes creados)
  const { posts } = usePosts(user);
  
  // Filtrar solo las actividades creadas por el usuario
  const userPlans = useMemo(() => {
    return posts.filter(post => 
      post && 
      post.type === 'activity' && 
      post.authorId === user?.uid
    ).map(post => ({
      id: post.id,
      title: post.title,
      location: post.location || 'Ubicación por confirmar',
      date: post.date ? new Date(post.date.seconds * 1000).toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      }) : 'Fecha por confirmar',
      emoji: post.activityType || '📅',
      price: post.price || 'Precio por confirmar',
      authorId: post.authorId,
      author: typeof post.author === 'string' ? post.author : post.author?.displayName || 'Usuario', // Asegurar que sea string
      imageType: post.imageType || 'default',
      defaultImageKey: post.defaultImageKey || 'art',
      // Pasar el objeto completo para ActividadDetalle
      originalPost: post
    }));
  }, [posts, user?.uid]);

  // Hook para notificaciones (mover antes del return condicional)
  const { handleNewMessage } = useChatNotifications({
    user,
    groupId,
    isChatActive: true // El chat está activo cuando estamos en esta pantalla
  });

  // Hook personalizado para mensajes del grupo
  const { messages, loading, sendMessage } = useGroupMessages(user, groupId, {
    onNewMessage: (newMessage) => {
      // Manejar nueva notificación (aunque no se mostrará porque el chat está activo)
      handleNewMessage(newMessage, groupName, groupEmoji);
    },
    isChatActive: true,
    groupName,
    groupEmoji
  });

  // Hook para funciones de grupos (salir/eliminar)
  const { leaveGroup, deleteGroup } = useGroups(user);


  // Validar que los parámetros estén presentes
  if (!groupId || !groupName) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Error: Parámetros del grupo no encontrados</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Función para manejar salir del grupo
  const handleLeaveGroup = async () => {
    if (!groupId || !user) return;

    Alert.alert(
      'Salir del Grupo',
      '¿Estás seguro de que quieres salir de este grupo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveGroup(groupId);
              Alert.alert('¡Listo!', 'Has salido del grupo correctamente.');
              router.back();
            } catch (error) {
              console.error('Error saliendo del grupo:', error);
              Alert.alert('Error', 'No se pudo salir del grupo. Inténtalo de nuevo.');
            }
          }
        }
      ]
    );
  };

  // Función para manejar eliminar el grupo
  const handleDeleteGroup = async () => {
    if (!groupId || !user || !groupData) return;

    // Solo el creador puede eliminar
    if (groupData.createdBy !== user.uid) {
      Alert.alert('Error', 'Solo el creador del grupo puede eliminarlo.');
      return;
    }

    Alert.alert(
      'Eliminar Grupo',
      '¿Estás seguro de que quieres eliminar este grupo? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGroup(groupId);
              Alert.alert('¡Listo!', 'El grupo ha sido eliminado correctamente.');
              router.back();
            } catch (error) {
              console.error('Error eliminando grupo:', error);
              Alert.alert('Error', 'No se pudo eliminar el grupo. Inténtalo de nuevo.');
            }
          }
        }
      ]
    );
  };

  // Función para mostrar opciones del grupo
  const showGroupOptions = () => {
    const options = [];
    
    // Siempre mostrar opción de salir
    options.push({
      text: 'Salir del Grupo',
      onPress: handleLeaveGroup
    });
    
    // Solo el creador puede eliminar
    if (groupData?.createdBy === user?.uid) {
      options.push({
        text: 'Eliminar Grupo',
        style: 'destructive' as const,
        onPress: handleDeleteGroup
      });
    }
    
    options.push({
      text: 'Cancelar',
      style: 'cancel' as const
    });

    Alert.alert('Opciones del Grupo', '', options);
  };

  // Cargar datos del grupo
  useEffect(() => {
    if (!user || !groupId) return;

    const loadGroupData = async () => {
      try {
        const { getDoc, doc } = await import('firebase/firestore');
        const { db } = await import('@/firebaseconfig');
        const groupDoc = await getDoc(doc(db, 'groups', groupId));
        if (groupDoc.exists()) {
          setGroupData({ id: groupDoc.id, ...groupDoc.data() });
        }
      } catch (error) {
        console.error('Error cargando datos del grupo:', error);
      }
    };

    loadGroupData();
  }, [user, groupId]);

  // Establecer mensaje pre-escrito solo una vez
  useEffect(() => {
    if (preWrittenMessage && !initialMessageSetRef.current) {
      setNewMessage(preWrittenMessage);
      initialMessageSetRef.current = true;
    }
  }, [preWrittenMessage]);

  // Enviar mensaje (useCallback)
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage(newMessage.trim());
      setNewMessage('');
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo enviar el mensaje');
    } finally {
      setSending(false);
    }
  }, [newMessage, sending, sendMessage]);

  // Compartir plan en el chat (useCallback)
  const handleSharePlan = useCallback(async (plan: any) => {
    try {
      const shareMessage = `📅 Plan compartido: ${plan.title}\n📍 ${plan.location}\n🕐 ${formatFirebaseDate(plan.date) || 'Fecha por confirmar'}\n💰 ${plan.price || 'Gratis'}\n👥 ${plan.participants || 1}/${plan.maxParticipants || 10} participantes`;
      await sendMessage(shareMessage);
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir el plan');
    }
  }, [sendMessage]);

  // Obtener nombre de usuario para mostrar (memoizado)
  const getUserDisplayName = useMemo(() => (userObj?: any) => {
    if (userObj?.displayName) return userObj.displayName;
    if (userObj?.email) return userObj.email.split('@')[0];
    return "Usuario";
  }, []);

  // Obtener iniciales del usuario (memoizado)
  const getUserInitials = useMemo(() => (userObj?: any) => {
    const name = getUserDisplayName(userObj);
    return name.substring(0, 2).toUpperCase();
  }, [getUserDisplayName]);

  // Formatear fecha del mensaje (memoizado)
  const formatMessageTime = useMemo(() => (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, []);

  // Renderizar mensaje (useCallback)
  const renderMessage = useCallback(({ item }: { item: GroupMessage }) => {
    const isMyMessage = item.senderId === user?.uid;
    
    // Verificar si es un mensaje de plan compartido
    const isSharedPlan = item.text.includes('📅 Plan compartido:');
    
    if (isSharedPlan) {
      // Extraer información del plan del mensaje de forma más robusta
      const lines = item.text.split('\n');
      const titleLine = lines.find(line => line.includes('📅 Plan compartido:'));
      const locationLine = lines.find(line => line.includes('📍'));
      const dateLine = lines.find(line => line.includes('🕐'));
      const priceLine = lines.find(line => line.includes('💰'));
      const participantsLine = lines.find(line => line.includes('👥'));
      
      // Extraer participantes si está disponible
      let participants = 1;
      let maxParticipants = 10;
      if (participantsLine) {
        const participantsMatch = participantsLine.match(/(\d+)\/(\d+)/);
        if (participantsMatch) {
          participants = parseInt(participantsMatch[1]);
          maxParticipants = parseInt(participantsMatch[2]);
        }
      }
      
      const planData = {
        id: `shared-${item.id}`,
        title: titleLine?.split('📅 Plan compartido: ')[1]?.trim() || 'Plan compartido',
        location: locationLine?.split('📍 ')[1]?.trim() || 'Ubicación no especificada',
        date: dateLine?.split('🕐 ')[1]?.trim() || 'Fecha por confirmar',
        emoji: '🎵', // Cambiar a emoji de música para concierto
        authorId: item.senderId,
        author: item.senderDisplayName,
        imageType: 'default',
        defaultImageKey: 'concert', // Usar imagen de concierto
        type: 'activity',
        description: `Plan compartido por ${item.senderDisplayName}. Únete a esta increíble experiencia.`,
        participants: participants,
        maxParticipants: maxParticipants,
        price: priceLine?.split('💰 ')[1]?.trim() || 'Gratis',
        createdAt: item.createdAt,
        // Agregar campos adicionales que ActividadDetalle podría necesitar
        activityType: '🎵',
        isFeatured: false,
        status: 'active'
      };

      return (
        <View style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
        ]}>
          {!isMyMessage && (
            <View style={styles.senderAvatar}>
              <Text style={styles.senderInitials}>
                {getUserInitials(item.senderDisplayName)}
              </Text>
            </View>
          )}
          
          <View style={styles.sharedPlanContainer}>
            <Text style={[
              styles.senderName,
              isMyMessage ? styles.mySenderName : styles.otherSenderName
            ]}>
              {item.senderDisplayName}
            </Text>
            
            {/* Usar ActivityCard existente */}
            <ActivityCard
              item={planData}
              user={user}
              onJoinActivity={() => {}} // No necesario en chat
              onOpenComments={() => {}} // No necesario en chat
              onOpenDetails={(item) => {
                router.push({
                  pathname: '/ActividadDetalle',
                  params: {
                    actividadId: item.id,
                    actividadData: JSON.stringify(item)
                  }
                });
              }}
              getUserDisplayName={getUserDisplayName}
              getUserInitials={getUserInitials}
            />
            
            <Text style={[
              styles.messageTime,
              isMyMessage ? styles.myMessageTime : styles.otherMessageTime
            ]}>
              {formatMessageTime(item.createdAt)}
            </Text>
          </View>
        </View>
      );
    }
    
    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
      ]}>
        {!isMyMessage && (
          <View style={styles.senderAvatar}>
            <Text style={styles.senderInitials}>
              {getUserInitials(item.senderDisplayName)}
            </Text>
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble
        ]}>
          {!isMyMessage && (
            <Text style={styles.senderName}>{item.senderDisplayName}</Text>
          )}
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.otherMessageText
          ]}>
            {item.text}
          </Text>
          <Text style={[
            styles.messageTime,
            isMyMessage ? styles.myMessageTime : styles.otherMessageTime
          ]}>
            {formatMessageTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  }, [user, getUserInitials, getUserDisplayName, formatMessageTime]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando chat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header personalizado */}
      <View style={styles.customHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
               <View style={styles.headerInfo}>
                 <Text style={styles.headerEmoji}>{groupEmoji}</Text>
                 <TouchableOpacity 
                   style={styles.headerTextContainer}
                   onPress={() => {
                     router.navigate({
                       pathname: '../GroupMembers' as any,
                       params: {
                         groupId,
                         groupName,
                         groupEmoji
                       }
                     } as any);
                   }}
                   activeOpacity={0.7}
                 >
                   <Text style={styles.headerTitle}>{groupName}</Text>
                   <Text style={styles.headerSubtitle}>
                     {groupData?.memberCount || 0} miembros • Toca para ver
                   </Text>
                 </TouchableOpacity>
               </View>
               
               {/* Botón de opciones */}
               <TouchableOpacity
                 style={styles.optionsButton}
                 onPress={showGroupOptions}
                 activeOpacity={0.7}
               >
                 <Text style={styles.optionsButtonText}>⋯</Text>
               </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>💬</Text>
              <Text style={styles.emptyStateTitle}>¡Primer mensaje!</Text>
              <Text style={styles.emptyStateText}>
                Sé el primero en escribir en este grupo
              </Text>
            </View>
          )}
        />

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <SharePlanButton
            onPress={() => {
              setShowShareModal(true);
            }}
            style={styles.shareButton}
          />
          
          <TextInput
            style={styles.messageInput}
            placeholder="Escribe un mensaje..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={500}
            editable={!sending}
          />
          <TouchableOpacity
            style={[styles.sendButton, sending && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!newMessage.trim() || sending}
          >
            <Text style={styles.sendButtonText}>
              {sending ? "..." : "📤"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Modal para compartir planes */}
      <SharePlanModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        onSharePlan={handleSharePlan}
        user={user}
        getUserDisplayName={getUserDisplayName}
        getUserInitials={getUserInitials}
        plans={userPlans}
      />
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 44, // Espacio para el status bar
    backgroundColor: '#FFFFFF',
    // Sin border para unificación completa
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerEmoji: {
    fontSize: 36,
    marginRight: 16,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
    letterSpacing: 0.3,
    textAlign: 'left',
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    textAlign: 'left',
  },
  optionsButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginLeft: 12,
  },
  optionsButtonText: {
    fontSize: 20,
    color: Colors.textPrimary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  messagesContainer: {
    padding: 20,
    paddingBottom: 8,
    paddingTop: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  senderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  senderInitials: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  messageBubble: {
    maxWidth: '78%',
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  myMessageBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 6,
    shadowColor: Colors.primary,
    shadowOpacity: 0.2,
  },
  otherMessageBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  senderName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 6,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: Colors.textPrimary,
  },
  messageTime: {
    fontSize: 11,
    textAlign: 'right',
  },
  myMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  otherMessageTime: {
    color: Colors.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    alignItems: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  shareButton: {
    marginRight: 12,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginRight: 12,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#f8fafc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateEmoji: {
    fontSize: 72,
    marginBottom: 20,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  sharedPlanContainer: {
    maxWidth: '78%',
    alignItems: 'flex-start',
  },
  mySenderName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 0.3,
    alignSelf: 'flex-end',
  },
  otherSenderName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
});

export default GroupChatScreen;