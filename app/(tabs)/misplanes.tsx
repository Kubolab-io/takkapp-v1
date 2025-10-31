/**
 * misplanes.tsx
 * 
 * Pantalla que muestra los planes del usuario:
 * - Actividades que ha creado
 * - Actividades en las que participa
 */

import { auth } from '@/firebaseconfig';
import { Colors } from '@/src/constants/Colors';
import { useGroups } from '@/src/features/groups/useGroups';
import { useWeeklyMatching } from '@/src/features/matching/useWeeklyMatching';
import { useParticipations } from '@/src/features/posts/useParticipations';
import { usePosts } from '@/src/features/posts/usePosts';
import { useActiveTab } from '@/src/hooks/useActiveTab';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function MisPlanesScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const activeTab = useActiveTab();

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

  // Hooks personalizados
  const { posts, loading: loadingPosts, deletePost } = usePosts(user);
  const { myParticipations, loadingParticipation } = useParticipations(user) as any;
  const { myGroups } = useGroups(user);
  const { weeklyMatches } = useWeeklyMatching(user);

  // Listener para cambios de autenticación
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        setLoading(false);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Función para obtener fecha de un plan
  const getPlanDate = (plan: any) => {
    if (!plan.date) return null;
    
    try {
      // Si es un timestamp de Firebase
      if (plan.date.seconds && plan.date.nanoseconds) {
        return new Date(plan.date.seconds * 1000);
      }
      
      // Si es un string de fecha ISO
      if (typeof plan.date === 'string') {
        return new Date(plan.date);
      }
      
      // Si es un timestamp en milisegundos
      if (typeof plan.date === 'number') {
        return new Date(plan.date);
      }
      
      return null;
    } catch (error) {
      console.error('Error obteniendo fecha del plan:', error);
      return null;
    }
  };

  // Función para filtrar planes por fecha
  const filterPlansByDate = (plans: any[], filter: string) => {
    if (filter === 'todos') return plans;
    
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Inicio del día actual
    
    return plans.filter(plan => {
      const planDate = getPlanDate(plan);
      if (!planDate) return filter === 'todos'; // Si no hay fecha, mostrar solo en "todos"
      
      const planDateOnly = new Date(planDate);
      planDateOnly.setHours(0, 0, 0, 0);
      
      if (filter === 'proximos') {
        return planDateOnly >= now;
      } else if (filter === 'pasados') {
        return planDateOnly < now;
      }
      
      return true;
    });
  };

  // Filtrar mis planes creados desde el estado unificado
  // IMPORTANTE: Solo mostrar planes que realmente existen en Firebase
  const misPlanes = useMemo(() => {
    return (posts as any[]).filter(post => 
      post && 
      post.type === 'activity' && 
      post.authorId === user?.uid &&
      post.id // Verificar que tenga ID válido
    ).map(post => ({
      ...post,
      tipo: 'creado' // Marcar explícitamente como creado por el usuario
    }));
  }, [posts, user?.uid]);

  // Aplicar filtros a los planes creados
  const misPlanesFiltrados = useMemo(() => {
    const planesBase = (!posts || posts.length === 0 || loadingPosts) ? [] : misPlanes;
    return filterPlansByDate(planesBase, selectedFilter);
  }, [posts, loadingPosts, misPlanes, selectedFilter]);

  // Aplicar filtros a las participaciones
  const participacionesFiltradas = useMemo(() => {
    if (!myParticipations || myParticipations.length === 0) return [];
    
    const participacionesConFecha = myParticipations.map((participation: any) => ({
      ...participation,
      date: participation.activityDate // Usar activityDate como fecha para el filtro
    }));
    
    return filterPlansByDate(participacionesConFecha, selectedFilter);
  }, [myParticipations, selectedFilter]);

  // Actualizar loading basado en ambos estados
  const isLoading = loading || loadingPosts;

  const getDisplayName = (obj: any) => {
    if (obj?.author) return obj.author;
    if (obj?.displayName) return obj.displayName;
    if (obj?.email) return obj.email.split('@')[0];
    return "Usuario";
  };

  const getInitials = (obj: any) => {
    const name = getDisplayName(obj);
    return name.substring(0, 2).toUpperCase();
  };

  // Función para eliminar plan propio
  const handleDeleteMyPlan = async (planId: string, planTitle: string) => {
    try {
      // Confirmar eliminación usando Alert nativo
      Alert.alert(
        "Confirmar eliminación",
        `¿Estás seguro de que quieres eliminar "${planTitle}"? Esta acción no se puede deshacer.`,
        [
          { text: "Cancelar", style: "cancel" },
          { 
            text: "Eliminar", 
            style: "destructive", 
            onPress: async () => {
              try {
                console.log('🗑️ Eliminando plan propio:', planId);
                await deletePost(planId);
                console.log('✅ Plan eliminado correctamente');
              } catch (error: any) {
                console.error('❌ Error eliminando plan:', error);
                Alert.alert('Error', 'No se pudo eliminar el plan: ' + (error.message || 'Error desconocido'));
              }
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('❌ Error en confirmación:', error);
    }
  };

  // Función para compartir plan al chat
  const handleSharePlan = async (plan: any) => {
    console.log('🔍 Debug - myGroups:', myGroups);
    console.log('🔍 Debug - weeklyMatches:', weeklyMatches);
    
    // Verificar si hay matches semanales disponibles
    const mutualMatches = weeklyMatches.filter((match: any) => match.status === 'mutual');
    console.log('🔍 Debug - mutualMatches:', mutualMatches);
    
    // Obtener el primer grupo disponible como chat grupal
    const activeGroupId = myGroups.length > 0 ? myGroups[0].id : null;
    console.log('🔍 Debug - activeGroupId:', activeGroupId);
    
    if (mutualMatches.length === 0 && !activeGroupId) {
      Alert.alert(
        'Sin Destinatarios', 
        'No tienes matches activos para compartir este plan.\n\nVe a la pestaña "Conectar" para hacer matches o crear un chat grupal.',
        [{ text: 'Entendido' }]
      );
      return;
    }

    // Crear opciones para el modal de selección
    const shareOptions = [];
    
    // Agregar opción de chat grupal si existe
    if (activeGroupId) {
      shareOptions.push({
        text: '💬 Chat Grupal',
        onPress: () => shareToGroupChat(plan, activeGroupId)
      });
    }
    
    // Agregar opciones de matches individuales
    mutualMatches.forEach((match: any, index: number) => {
      shareOptions.push({
        text: `👤 ${match.matchedUserData.displayName}`,
        onPress: () => shareToIndividualMatch(plan, match)
      });
    });

    console.log('🔍 Debug - shareOptions:', shareOptions);

    // Mostrar modal de selección
    Alert.alert(
      'Compartir Plan',
      `¿Dónde quieres compartir "${plan.title}"?`,
      [
        ...shareOptions,
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const shareToGroupChat = async (plan: any, groupId: string) => {
    try {
      const shareMessage = `🎯 *${plan.title}*\n\n` +
        `📅 Fecha: ${formatFirebaseDate(plan.date)}\n` +
        `📍 Lugar: ${plan.location}\n` +
        `👥 Participantes: ${plan.participants}/${plan.maxParticipants}\n` +
        `💰 Precio: ${plan.price === 'Gratis' ? 'Gratis' : `$${plan.price}`}\n\n` +
        `¿Te gustaría participar en esta actividad?`;

      // Enviar mensaje directamente a Firestore
      const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('@/firebaseconfig');
      
      const messageData = {
        groupId: groupId,
        senderId: user.uid,
        senderDisplayName: user.displayName || user.email?.split('@')[0] || 'Usuario',
        text: shareMessage,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "groupMessages"), messageData);
      
      Alert.alert('¡Plan Compartido!', `Has compartido "${plan.title}" en el chat grupal.`);
    } catch (error) {
      console.error('Error compartiendo a chat grupal:', error);
      Alert.alert('Error', 'No se pudo compartir el plan en el chat grupal.');
    }
  };

  const shareToIndividualMatch = async (plan: any, match: any) => {
    try {
      const shareMessage = `🎯 *${plan.title}*\n\n` +
        `📅 Fecha: ${formatFirebaseDate(plan.date)}\n` +
        `📍 Lugar: ${plan.location}\n` +
        `👥 Participantes: ${plan.participants}/${plan.maxParticipants}\n` +
        `💰 Precio: ${plan.price === 'Gratis' ? 'Gratis' : `$${plan.price}`}\n\n` +
        `¿Te gustaría participar en esta actividad?`;

      // Enviar mensaje directamente a Firestore
      const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('@/firebaseconfig');
      
      const messageData = {
        chatId: match.matchId,
        senderId: user.uid,
        senderName: user.displayName || user.email?.split('@')[0] || 'Usuario',
        senderPhoto: user.photoURL,
        text: shareMessage,
        createdAt: serverTimestamp(),
        isRead: false
      };

      await addDoc(collection(db, "messages"), messageData);
      
      Alert.alert('¡Plan Compartido!', `Has compartido "${plan.title}" con ${match.matchedUserData.displayName}.`);
    } catch (error) {
      console.error('Error compartiendo a match individual:', error);
      Alert.alert('Error', 'No se pudo compartir el plan con este match.');
    }
  };

  const handleVerPerfilUsuario = (userId: string, userData: any) => {
    router.push({
      pathname: '/PerfilUsuario',
      params: { 
        userId: userId,
        userData: JSON.stringify(userData)
      }
    });
  };

  const renderPlan = useCallback(({ item }: { item: any }) => {
    // Remover el log excesivo para mejorar rendimiento
    // console.log("🎯 Renderizando plan:", {
    //   id: item.id,
    //   title: item.title,
    //   tipo: item.tipo,
    //   authorId: item.authorId,
    //   userUid: user?.uid
    // });
    
    return (
      <View style={styles.planCard}>
        <View style={styles.cardHeader}>
          <View style={styles.planTitleContainer}>
            <Text style={styles.planEmoji}>{item.emoji}</Text>
            <View style={styles.planInfo}>
              <Text style={styles.planTitle}>{item.title}</Text>
              <Text style={styles.planCreator}>
                {item.tipo === 'creado' ? 'Creado por ti' : 'Participando'}
              </Text>
            </View>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {item.tipo === 'creado' ? 'Organizador' : 'Participante'}
            </Text>
          </View>
        </View>

        <View style={styles.planDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📅</Text>
            <Text style={styles.detailText}>{formatFirebaseDate(item.date)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📍</Text>
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>👥</Text>
            <Text style={styles.detailText}>
              {item.participants}/{item.maxParticipants} personas
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>💰</Text>
            <Text style={styles.detailText}>
              {item.price === 'Gratis' ? 'Gratis' : `$${item.price}`}
            </Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => router.push({
              pathname: '/ActividadDetalle',
              params: { 
                actividadId: item.id,
                actividadData: JSON.stringify(item)
              }
            })}
          >
            <Text style={styles.actionBtnText}>Ver detalles</Text>
          </TouchableOpacity>
          
          {/* Botón de compartir */}
          <TouchableOpacity 
            style={styles.shareBtn}
            onPress={() => handleSharePlan(item)}
          >
            <Text style={styles.shareBtnText}>→</Text>
          </TouchableOpacity>
          
          {/* Botón de eliminar solo para planes propios */}
          <TouchableOpacity 
            style={styles.deleteBtn}
            onPress={() => handleDeleteMyPlan(item.id, item.title)}
          >
            <Text style={styles.deleteBtnText}>🗑️ </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [user?.uid]);

  const filterButtons = [
    { key: 'todos', label: 'Todos' },
    { key: 'proximos', label: 'Próximos' },
    { key: 'pasados', label: 'Pasados' }
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando tus planes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.filterContainer}>
          {filterButtons.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterBtn,
                selectedFilter === filter.key && styles.filterBtnActive
              ]}
              onPress={() => setSelectedFilter(filter.key)}
            >
              <Text style={[
                styles.filterBtnText,
                selectedFilter === filter.key && styles.filterBtnTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sección de Actividades Creadas */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            🎯 Mis Actividades Creadas 
            {misPlanesFiltrados.length > 0 && (
              <Text style={styles.countText}> ({misPlanesFiltrados.length})</Text>
            )}
          </Text>
        </View>
        
        <FlatList
          data={misPlanesFiltrados}
          keyExtractor={(item) => item.id}
          renderItem={renderPlan}
          contentContainerStyle={styles.plansList}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyTitle}>
                {selectedFilter === 'todos' 
                  ? 'No has creado actividades aún'
                  : selectedFilter === 'proximos'
                  ? 'No tienes actividades próximas'
                  : 'No tienes actividades pasadas'
                }
              </Text>
              <Text style={styles.emptyText}>
                {selectedFilter === 'todos' 
                  ? 'Crea tu primera actividad para organizar planes con otros usuarios'
                  : selectedFilter === 'proximos'
                  ? 'Crea actividades futuras para verlas aquí'
                  : 'Las actividades pasadas aparecerán aquí'
                }
              </Text>
            </View>
          }
        />

        {/* Sección de Actividades Inscritas */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            👥 Actividades en las que Participo
            {participacionesFiltradas.length > 0 && (
              <Text style={styles.countText}> ({participacionesFiltradas.length})</Text>
            )}
          </Text>
        </View>
        
        <View style={styles.participationsContainer}>
          {participacionesFiltradas.length > 0 ? (
            participacionesFiltradas.map((participation: any) => (
              <View key={participation.id} style={styles.participationCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.planTitleContainer}>
                    <Text style={styles.planEmoji}>{participation.activityEmoji || '🎯'}</Text>
                    <View style={styles.planInfo}>
                      <Text style={styles.planTitle}>{participation.activityTitle || 'Sin título'}</Text>
                      <Text style={styles.planCreator}>Participando</Text>
                    </View>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Participante</Text>
                  </View>
                </View>

                <View style={styles.planDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>📅</Text>
                    <Text style={styles.detailText}>{formatFirebaseDate(participation.activityDate)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>📍</Text>
                    <Text style={styles.detailText}>{participation.activityLocation || 'Ubicación no especificada'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>📊</Text>
                    <Text style={styles.detailText}>
                      Estado: {participation.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity 
                    style={styles.actionBtn}
                    onPress={() => router.push({
                      pathname: '/ActividadDetalle',
                      params: { 
                        actividadId: participation.postId,
                        actividadData: JSON.stringify({
                          id: participation.postId,
                          title: participation.activityTitle,
                          date: participation.activityDate,
                          location: participation.activityLocation,
                          emoji: participation.activityEmoji,
                          status: participation.status,
                          type: 'activity'
                        })
                      }
                    })}
                  >
                    <Text style={styles.actionBtnText}>Ver detalles</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyTitle}>
                {selectedFilter === 'todos' 
                  ? 'No participas en actividades aún'
                  : selectedFilter === 'proximos'
                  ? 'No tienes participaciones próximas'
                  : 'No tienes participaciones pasadas'
                }
              </Text>
              <Text style={styles.emptyText}>
                {selectedFilter === 'todos' 
                  ? 'Únete a actividades de otros usuarios para verlas aquí'
                  : selectedFilter === 'proximos'
                  ? 'Únete a actividades futuras para verlas aquí'
                  : 'Las participaciones pasadas aparecerán aquí'
                }
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 12,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  filterBtnTextActive: {
    color: Colors.textLight,
  },
  plansList: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  planCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planTitleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    paddingRight: 8,
  },
  planEmoji: {
    fontSize: 22,
    marginRight: 12,
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  planCreator: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusBadge: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  statusText: {
    fontSize: 12,
    color: Colors.info,
    fontWeight: '600',
  },
  planDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 20,
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  shareBtn: {
    backgroundColor: Colors.secondary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  shareBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteBtn: {
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dc2626',
  },
  deleteBtnText: {
    color: Colors.textLight,
    fontSize: 14,
    fontWeight: '600',
  },
  cleanupHeaderButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cleanupHeaderButtonText: {
    color: Colors.textLight,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  // Estilos para las nuevas secciones
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
  },
  countText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  participationCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  participationsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Más espacio para evitar que se corte con la navegación
  },
  // Estilos para el ScrollView
  scrollContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  joinButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  createButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginTop: 16,
  },
}); 