import { ShareToGroupsModal } from '@/src/components/ShareToGroupsModal';
import { Colors } from '@/src/constants/Colors';
import { useParticipations } from '@/src/features/posts/useParticipations';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { collection, deleteDoc, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { auth, db } from '../firebaseconfig';

// Función helper para obtener imágenes predeterminadas
const getDefaultImage = (imageKey: string) => {
  const imageMap: { [key: string]: any } = {
    cocina: require('@/assets/images/planes/cocina.jpg'),
    art: require('@/assets/images/planes/art.jpg'),
    concert: require('@/assets/images/planes/concert.jpg'),
    running: require('@/assets/images/planes/Running.jpg'),
    senderismo: require('@/assets/images/planes/senderismo.jpg'),
  };
  return imageMap[imageKey] || imageMap.art;
};

export default function ActividadDetalle() {
  const params = useLocalSearchParams();
  const actividadId = params.actividadId as string;
  const actividadData = params.actividadData ? JSON.parse(params.actividadData as string) : null;
  
  const [actividad, setActividad] = useState(actividadData || null);
  const [loading, setLoading] = useState(!actividadData);
  const [user, setUser] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Hook para manejar participaciones
  const { joinActivity, leaveActivity, isUserParticipating } = useParticipations(user);

  useEffect(() => {
    // Verificar usuario autenticado
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    // Si no tenemos los datos de la actividad, los cargamos
    if (!actividadData && actividadId) {
      loadActividadData();
    }

    return () => unsubscribe();
  }, [actividadId, actividadData]);

  const loadActividadData = async () => {
    try {
      setLoading(true);
      const actividadDoc = await getDoc(doc(db, 'posts', actividadId));
      
      if (actividadDoc.exists()) {
        setActividad({
          id: actividadDoc.id,
          ...actividadDoc.data()
        });
      } else {
        Alert.alert('Error', 'No se encontró la actividad');
        router.back();
      }
    } catch (error) {
      console.error('Error cargando actividad:', error);
      Alert.alert('Error', 'No se pudo cargar la actividad');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleJoinActivity = async () => {
    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión para unirte a actividades');
      return;
    }

    try {
      await joinActivity(actividadId, actividad);
      Alert.alert('¡Éxito!', 'Te has unido a la actividad');
    } catch (error) {
      console.error('Error uniéndose a la actividad:', error);
      Alert.alert('Error', 'No se pudo unir a la actividad');
    }
  };

  const handleLeaveActivity = async () => {
    try {
      await leaveActivity(actividadId);
      Alert.alert('¡Éxito!', 'Has cancelado tu participación');
    } catch (error) {
      console.error('Error cancelando participación:', error);
      Alert.alert('Error', 'No se pudo cancelar la participación');
    }
  };

  const handleDeleteActivity = async () => {
    Alert.alert(
      'Eliminar actividad',
      '¿Estás seguro de que quieres eliminar esta actividad? Esta acción no se puede deshacer y se eliminarán todas las participaciones.',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              
              // 1. Eliminar todas las participaciones de esta actividad
              const participationsQuery = query(
                collection(db, 'participations'),
                where('postId', '==', actividadId)
              );
              
              const participationsSnapshot = await getDocs(participationsQuery);
              const deleteParticipationsPromises = participationsSnapshot.docs.map(doc => 
                deleteDoc(doc.ref)
              );
              await Promise.all(deleteParticipationsPromises);
              
              // 2. Eliminar la actividad
              await deleteDoc(doc(db, 'posts', actividadId));
              
              Alert.alert('Éxito', 'Actividad eliminada correctamente');
              router.back();
            } catch (error) {
              console.error('Error eliminando actividad:', error);
              const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
              Alert.alert('Error', 'No se pudo eliminar la actividad: ' + errorMessage);
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const openCreatorProfile = () => {
    if (!actividad.authorId) {
      Alert.alert('Error', 'No se pudo obtener la información del creador');
      return;
    }

    router.push({
      pathname: '/PerfilUsuario',
      params: {
        userId: actividad.authorId,
        userName: actividad.author || 'Usuario',
        userPhoto: '', // Se puede agregar foto del usuario si está disponible
        userAge: '', // Se puede agregar edad si está disponible
        userLocation: actividad.location || '',
        userDescription: '', // Se puede agregar descripción del usuario si está disponible
        userHobbies: JSON.stringify([]), // Se puede agregar hobbies si están disponibles
        userInstagram: '' // Se puede agregar Instagram si está disponible
      }
    });
  };

  // Función helper para manejar fechas de Firebase
  const formatFirebaseDate = (dateValue: any) => {
    if (!dateValue) return 'Fecha no disponible';
    
    try {
      console.log('📅 Formateando fecha:', dateValue, 'Tipo:', typeof dateValue);
      
      // Si es un timestamp de Firebase (tiene toDate)
      if (dateValue && typeof dateValue.toDate === 'function') {
        const formatted = dateValue.toDate().toLocaleDateString('es-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        console.log('✅ Fecha formateada (toDate):', formatted);
        return formatted;
      }
      
      // Si es un timestamp de Firebase serializado (tiene seconds y nanoseconds)
      if (dateValue && typeof dateValue === 'object' && 'seconds' in dateValue) {
        const date = new Date(dateValue.seconds * 1000);
        const formatted = date.toLocaleDateString('es-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        console.log('✅ Fecha formateada (seconds):', formatted);
        return formatted;
      }
      
      // Si ya es un string formateado
      if (typeof dateValue === 'string' && dateValue.includes('de')) {
        console.log('✅ Fecha ya formateada:', dateValue);
        return dateValue;
      }
      
      // Si es un string de fecha ISO
      if (typeof dateValue === 'string') {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          const formatted = date.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          });
          console.log('✅ Fecha formateada (ISO string):', formatted);
          return formatted;
        }
      }
      
      // Si es un timestamp en milisegundos
      if (typeof dateValue === 'number') {
        const formatted = new Date(dateValue).toLocaleDateString('es-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        console.log('✅ Fecha formateada (timestamp):', formatted);
        return formatted;
      }
      
      console.log('❌ No se pudo formatear la fecha');
      return 'Fecha no disponible';
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return 'Fecha no disponible';
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={Colors.gradient.blue}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.white} />
            <Text style={styles.loadingText}>Cargando actividad...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!actividad) {
    return (
      <LinearGradient
        colors={Colors.gradient.blue}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>No se pudo cargar la actividad</Text>
            <TouchableOpacity style={styles.backButtonError} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>Volver</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const isMyPost = user?.uid === actividad.authorId;
  const isParticipating = isUserParticipating(actividadId);
  const availableSlots = actividad.maxParticipants - (actividad.participants || 0);

  // Debug: ver qué contiene la fecha
  console.log('🔍 Actividad completa:', actividad);
  console.log('🔍 actividad.date:', actividad.date);

  return (
    <LinearGradient
      colors={Colors.gradient.blue}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButtonHeader} 
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonHeaderText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{actividad.title}</Text>
          <Text style={styles.headerSubtitle}>
            {isMyPost ? 'Tu actividad' : `Actividad de ${actividad.author || 'otro usuario'}`}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Tarjeta Principal de la Actividad */}
        <View style={styles.mainCard}>
          <View style={styles.cardHeader}>
            <View style={styles.planTitleContainer}>
              {/* Foto de perfil circular del plan */}
              <View style={styles.planAvatarContainer}>
                <Image
                  source={
                    actividad.image 
                      ? { uri: actividad.image }
                      : actividad.imageUrl
                      ? { uri: actividad.imageUrl }
                      : actividad.defaultImageKey
                      ? getDefaultImage(actividad.defaultImageKey)
                      : require('@/assets/images/planes/art.jpg')
                  }
                  style={styles.planAvatar}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.planInfo}>
                <Text style={styles.planTitle}>{actividad.title}</Text>
                <Text style={styles.planCreator}>
                  {isMyPost ? 'Creado por ti' : `Creado por ${actividad.author || 'otro usuario'}`}
                </Text>
              </View>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {isMyPost ? 'Organizador' : 'Participante'}
              </Text>
            </View>
          </View>

          <View style={styles.planDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📅</Text>
              <Text style={styles.detailText}>{formatFirebaseDate(actividad.date)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📍</Text>
              <Text style={styles.detailText}>{actividad.location || 'Ubicación no especificada'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>👥</Text>
              <Text style={styles.detailText}>
                {actividad.participants || 0}/{actividad.maxParticipants} personas
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>🎫</Text>
              <Text style={styles.detailText}>
                Cupos disponibles: {availableSlots}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>💰</Text>
              <Text style={styles.detailText}>
                {actividad.price === 'Gratis' ? 'Gratis' : `$${actividad.price}`}
              </Text>
            </View>
          </View>


          {/* Botones de Acción */}
          <View style={styles.cardActions}>
            {!isMyPost && (
              <>
                {!isParticipating ? (
                  <TouchableOpacity 
                    style={[
                      styles.actionBtn,
                      availableSlots <= 0 && styles.fullActivityBtn
                    ]}
                    onPress={handleJoinActivity}
                    disabled={availableSlots <= 0}
                  >
                    <Text style={[
                      styles.actionBtnText,
                      availableSlots <= 0 && styles.fullActivityBtnText
                    ]}>
                      {availableSlots <= 0 ? 'Sin cupos disponibles' : '¡Me apunto!'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={styles.alreadyJoinedBtn}
                    onPress={handleLeaveActivity}
                  >
                    <Text style={styles.alreadyJoinedBtnText}>Cancelar participación</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
            
            {isMyPost && (
              <TouchableOpacity 
                style={styles.deleteBtn}
                onPress={handleDeleteActivity}
              >
                <Text style={styles.deleteBtnText}>🗑️ Eliminar actividad</Text>
              </TouchableOpacity>
            )}

            {/* Botón de Compartir */}
            <TouchableOpacity 
              style={styles.shareBtn}
              onPress={() => setShowShareModal(true)}
            >
              <Text style={styles.shareBtnText}>📤 Compartir</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tarjeta del Creador */}
        {!isMyPost && (
          <TouchableOpacity 
            style={styles.creatorCard}
            onPress={() => openCreatorProfile()}
            activeOpacity={0.8}
          >
            <View style={styles.creatorHeader}>
              <Text style={styles.creatorTitle}>👤 Organizador</Text>
              <Text style={styles.creatorArrow}>→</Text>
            </View>
            <View style={styles.creatorInfo}>
              <View style={styles.creatorAvatar}>
                <Text style={styles.creatorAvatarText}>
                  {actividad.author && typeof actividad.author === 'string' 
                    ? actividad.author.charAt(0).toUpperCase() 
                    : 'U'}
                </Text>
              </View>
              <View style={styles.creatorDetails}>
                <Text style={styles.creatorName}>{actividad.author || 'Usuario'}</Text>
                <Text style={styles.creatorSubtitle}>Ver perfil completo</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Información Adicional */}
        <View style={styles.additionalInfo}>
          <Text style={styles.additionalInfoTitle}>ℹ️ Información adicional</Text>
          
          {/* Descripción */}
          {(actividad.content || actividad.description) && (
            <View style={styles.descriptionSection}>
              <Text style={styles.additionalInfoSubtitle}>📝 Descripción del plan</Text>
              <Text style={styles.descriptionText}>
                {actividad.content || actividad.description}
              </Text>
            </View>
          )}

          {/* Hora */}
          {actividad.time && (
            <Text style={styles.additionalInfoText}>
              • Hora: {actividad.time}
            </Text>
          )}
          
          {/* Categoría */}
          {actividad.activityType && (
            <Text style={styles.additionalInfoText}>
              • Categoría: {actividad.activityType}
            </Text>
          )}
          
          <Text style={styles.additionalInfoText}>
            • Creado el: {formatFirebaseDate(actividad.createdAt)}
          </Text>
        </View>
      </ScrollView>

      {/* Modal para compartir a grupos */}
      <ShareToGroupsModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        plan={actividad}
        user={user}
      />
    </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.white,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
  },
  backButtonError: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  headerContent: {
    alignItems: 'center',
  },
  backButtonHeader: {
    position: 'absolute',
    left: 0,
    top: 0,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonHeaderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  mainCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  planAvatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  planAvatar: {
    width: '100%',
    height: '100%',
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: 4,
  },
  planCreator: {
    fontSize: 14,
    color: '#64748b',
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
    color: '#0369a1',
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
    marginTop: 16,
    gap: 12,
  },
  actionBtn: {
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
  fullActivityBtn: {
    backgroundColor: '#9ca3af',
  },
  fullActivityBtnText: {
    color: '#fff',
  },
  alreadyJoinedBtn: {
    backgroundColor: '#fef3c7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  alreadyJoinedBtnText: {
    color: '#92400e',
    fontSize: 14,
    fontWeight: '600',
  },
  additionalInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  additionalInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: 12,
  },
  additionalInfoText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    lineHeight: 20,
  },
  additionalInfoSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: 8,
    marginTop: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 16,
  },
  creatorCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  creatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  creatorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a202c',
  },
  creatorArrow: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: '600',
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  creatorAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  creatorDetails: {
    flex: 1,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: 2,
  },
  creatorSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  shareBtn: {
    backgroundColor: Colors.secondary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  shareBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteBtn: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  descriptionSection: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
}); 