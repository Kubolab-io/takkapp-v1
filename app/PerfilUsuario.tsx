import { Colors } from '@/src/constants/Colors';
import { usePhotoUpload } from '@/src/hooks/usePhotoUpload';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { collection, doc, getDoc, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { auth, db } from '../firebaseconfig';

export default function PerfilUsuario() {
  const params = useLocalSearchParams();
  
  // Memoizar parámetros para evitar re-renders innecesarios
  const stableParams = useMemo(() => ({
    userId: params.userId as string,
    userData: params.userData ? JSON.parse(params.userData as string) : null,
    userName: params.userName as string,
    userPhoto: params.userPhoto as string,
    userAge: params.userAge as string,
    userLocation: params.userLocation as string,
    userDescription: params.userDescription as string,
    userHobbies: params.userHobbies ? JSON.parse(params.userHobbies as string) : [],
    userInstagram: params.userInstagram as string
  }), [params.userId, params.userData, params.userName, params.userPhoto, params.userAge, params.userLocation, params.userDescription, params.userHobbies, params.userInstagram]);
  
  const { userId, userData, userName, userPhoto, userAge, userLocation, userDescription, userHobbies, userInstagram } = stableParams;
  
  const [usuario, setUsuario] = useState<any>(userData || null);
  const [loading, setLoading] = useState(!userData);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [actividadesCreadas, setActividadesCreadas] = useState<any[]>([]);
  const [loadingActividades, setLoadingActividades] = useState(false);
  const [userPhotos, setUserPhotos] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  // Verificar si es el perfil propio
  const isOwnProfile = currentUser?.uid === userId;
  
  // Hook para subir fotos (solo si es el perfil propio)
  const { uploading, selectAndUploadPhoto } = usePhotoUpload({
    userId: isOwnProfile && userId ? userId : '',
    onPhotoUploaded: (photoUrl) => {
      console.log('📸 Foto subida, actualizando estado local:', photoUrl);
      // Recargar las fotos desde Firebase para asegurar sincronización
      loadUserPhotosFromFirebase();
    }
  });
  
  // Funciones memoizadas
  const loadUsuarioData = useCallback(async () => {
    try {
      setLoading(true);
      // Aquí podrías cargar datos adicionales del usuario desde Firestore
      // Por ahora usamos los datos pasados como parámetro
      setUsuario(userData);
      
      // Cargar fotos del usuario si están disponibles
      if (userData?.photos && Array.isArray(userData.photos)) {
        setUserPhotos(userData.photos);
      } else {
        // Fotos por defecto si no tiene fotos subidas
        setUserPhotos([]);
      }
    } catch (error) {
      console.error('Error cargando datos del usuario:', error);
    } finally {
      setLoading(false);
    }
  }, [userData]);

  const loadUserProfileFromFirebase = useCallback(async (userId: string) => {
    try {
      const userProfileDoc = await getDoc(doc(db, 'userProfiles', userId));
      if (userProfileDoc.exists()) {
        const profileData = userProfileDoc.data();
        setUsuario((prev: any) => ({
          ...prev,
          ...profileData,
          // Mantener datos básicos de auth si no están en el perfil
          displayName: profileData.displayName || prev?.displayName || prev?.author,
          email: profileData.email || prev?.email || prev?.authorEmail
        }));
      }
    } catch (error) {
      console.error('Error cargando perfil desde Firebase:', error);
    }
  }, []);

  const loadUserPhotosFromFirebase = useCallback(async () => {
    try {
      if (!userId) return;
      
      console.log('📸 Cargando fotos desde Firebase para usuario:', userId);
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const photos = userData.photos || [];
        console.log('📸 Fotos obtenidas desde Firebase:', photos);
        setUserPhotos(photos);
      } else {
        console.log('📸 Usuario no encontrado en Firestore, usando fotos vacías');
        setUserPhotos([]);
      }
    } catch (error) {
      console.error('Error cargando fotos desde Firebase:', error);
    }
  }, [userId]);

  // Efecto para manejar autenticación
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  // Memoizar datos del match para evitar re-renders innecesarios
  const matchUserData = useMemo(() => {
    if (stableParams.userName && !stableParams.userData) {
      return {
        displayName: stableParams.userName,
        photoURL: stableParams.userPhoto,
        age: stableParams.userAge,
        location: stableParams.userLocation,
        description: stableParams.userDescription,
        hobbies: stableParams.userHobbies,
        instagram: stableParams.userInstagram,
        email: null
      };
    }
    return null;
  }, [stableParams]);

  // Efecto para inicializar datos del usuario
  useEffect(() => {
    if (matchUserData) {
      setUsuario(matchUserData);
      setLoading(false);
    } else if (!stableParams.userData && stableParams.userId) {
      loadUsuarioData();
    }
  }, [matchUserData, stableParams.userData, stableParams.userId, loadUsuarioData]);

  // Efecto para cargar fotos del usuario
  useEffect(() => {
    if (userId) {
      loadUserPhotosFromFirebase();
    }
  }, [userId, loadUserPhotosFromFirebase]);

  // Efecto para cargar perfil y actividades
  useEffect(() => {
    if (stableParams.userId) {
      loadUserProfileFromFirebase(stableParams.userId);
      
      // Cargar actividades con limpieza adecuada
      let unsubscribeActividades: (() => void) | null = null;
      
      const setupListeners = async () => {
        try {
          setLoadingActividades(true);
          
          // Actividades creadas por el usuario
          const actividadesQuery = query(
            collection(db, 'posts'),
            where('type', '==', 'activity'),
            where('authorId', '==', stableParams.userId),
            orderBy('createdAt', 'desc')
          );

          unsubscribeActividades = onSnapshot(actividadesQuery, (snapshot) => {
            if (!auth.currentUser) {
              console.log("🔐 Usuario no autenticado, cancelando listener de actividades");
              return;
            }
            
            const actividades = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setActividadesCreadas(actividades);
          }, (error) => {
            console.error("Error en listener de actividades:", error);
            if (error.code === 'permission-denied') {
              setActividadesCreadas([]);
            }
          });


          setLoadingActividades(false);
        } catch (error) {
          console.error('Error cargando actividades:', error);
          setLoadingActividades(false);
        }
      };
      
      setupListeners();
      
      return () => {
        if (unsubscribeActividades) unsubscribeActividades();
      };
    }
  }, [stableParams.userId, loadUserProfileFromFirebase]);

  const handleVerActividad = (actividadId: string, actividadData: any) => {
    router.push({
      pathname: '/ActividadDetalle',
      params: { 
        actividadId: actividadId,
        actividadData: JSON.stringify(actividadData)
      }
    });
  };

  // Función helper para manejar fechas de Firebase
  const formatFirebaseDate = (dateValue: any) => {
    if (!dateValue) return 'No disponible';
    
    try {
      // Si es un timestamp de Firebase (tiene seconds y nanoseconds)
      if (dateValue.seconds && dateValue.nanoseconds) {
        return new Date(dateValue.seconds * 1000).toLocaleDateString();
      }
      
      // Si es un string de fecha ISO
      if (typeof dateValue === 'string') {
        return new Date(dateValue).toLocaleDateString();
      }
      
      // Si es un timestamp en milisegundos
      if (typeof dateValue === 'number') {
        return new Date(dateValue).toLocaleDateString();
      }
      
      return 'Formato no válido';
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return 'Error en fecha';
    }
  };

  const renderActividad = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.actividadCard}
      onPress={() => handleVerActividad(item.id, item)}
    >
      <Text style={styles.actividadTitulo}>{item.title}</Text>
      <Text style={styles.actividadDescripcion} numberOfLines={2}>
        {item.description}
      </Text>
      <Text style={styles.actividadFecha}>
        {formatFirebaseDate(item.createdAt)}
      </Text>
    </TouchableOpacity>
  );

  // Renderizar foto individual
  const renderPhoto = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity style={styles.photoFeedItem}>
      <Image source={{ uri: item }} style={styles.photoFeedImage} />
    </TouchableOpacity>
  );

  // Renderizar placeholder para foto vacía
  const renderPhotoPlaceholder = ({ index }: { index: number }) => (
    <TouchableOpacity 
      style={[styles.photoFeedItem, styles.photoFeedPlaceholder]}
      onPress={() => {
        // TODO: Implementar funcionalidad para agregar foto
        console.log(`Agregar foto ${index + 1}`);
      }}
    >
      <Text style={styles.photoFeedPlaceholderText}>+</Text>
      <Text style={styles.photoFeedPlaceholderLabel}>Agregar foto</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <LinearGradient
        colors={Colors.gradient.blue}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.white} />
            <Text style={styles.loadingText}>Cargando perfil...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!usuario) {
    return (
      <LinearGradient
        colors={Colors.gradient.blue}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>No se pudo cargar el perfil del usuario</Text>
            <TouchableOpacity
              style={styles.backButtonError}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>Volver</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={Colors.gradient.blue}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
          
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              {usuario.photoURL ? (
                <Image 
                  source={{ uri: usuario.photoURL }} 
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarText}>
                  {usuario.displayName?.charAt(0) || usuario.author?.charAt(0) || 'U'}
                </Text>
              )}
            </View>
            <Text style={styles.userName}>
              {usuario.displayName || usuario.author || 'Usuario'}
            </Text>
            {usuario.age && (
              <Text style={styles.userAge}>
                {usuario.age} años
              </Text>
            )}
            {usuario.location && (
              <Text style={styles.userLocation}>
                📍 {usuario.location}
              </Text>
            )}
            {usuario.instagram && (
              <Text style={styles.userInstagram}>
                📷 @{usuario.instagram}
              </Text>
            )}
            {usuario.description && (
              <Text style={styles.userDescription}>
                {usuario.description}
              </Text>
            )}
            {usuario.hobbies && usuario.hobbies.length > 0 && (
              <View style={styles.hobbiesContainer}>
                {usuario.hobbies.map((hobby: string, index: number) => (
                  <View key={index} style={styles.hobbyTag}>
                    <Text style={styles.hobbyText}>{hobby}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Galería de Fotos */}
        <View style={styles.photosSection}>
          <Text style={styles.sectionTitle}>
            {isOwnProfile ? 'Mis Fotos' : 'Fotos'}
          </Text>
          <View style={styles.photosFeed}>
            {[0, 1, 2].map((index) => {
              const photo = userPhotos[index];
              return photo ? (
                <TouchableOpacity 
                  key={index} 
                  style={styles.photoFeedItem}
                  onPress={() => {
                    if (isOwnProfile && !uploading) {
                      selectAndUploadPhoto(index);
                    }
                  }}
                  disabled={uploading || !isOwnProfile}
                >
                  <Image source={{ uri: photo }} style={styles.photoFeedImage} />
                  {uploading && (
                    <View style={styles.photoOverlay}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ) : (
                isOwnProfile ? (
                  <TouchableOpacity 
                    key={index} 
                    style={[styles.photoFeedItem, styles.photoFeedPlaceholder]}
                    onPress={() => {
                      if (!uploading) {
                        selectAndUploadPhoto(index);
                      }
                    }}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <ActivityIndicator size="large" color={Colors.primary} />
                        <Text style={styles.photoFeedPlaceholderLabel}>Subiendo...</Text>
                      </>
                    ) : (
                      <>
                        <Text style={styles.photoFeedPlaceholderText}>+</Text>
                        <Text style={styles.photoFeedPlaceholderLabel}>Agregar foto</Text>
                      </>
                    )}
                  </TouchableOpacity>
                ) : (
                  <View 
                    key={index} 
                    style={[styles.photoFeedItem, styles.photoFeedPlaceholder]}
                  >
                    <Text style={styles.photoFeedPlaceholderText}>📷</Text>
                    <Text style={styles.photoFeedPlaceholderLabel}>Sin foto</Text>
                  </View>
                )
              );
            })}
          </View>
          
        </View>

        {/* Actividades Creadas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actividades Creadas</Text>
          {loadingActividades ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : actividadesCreadas.length > 0 ? (
            <FlatList
              data={actividadesCreadas}
              renderItem={renderActividad}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.emptyText}>No ha creado actividades aún</Text>
          )}
        </View>

      </ScrollView>
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
    padding: 20,
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
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  profileInfo: {
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  userAge: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 3,
  },
  userLocation: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 3,
  },
  userInstagram: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    fontWeight: '600',
  },
  userDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  hobbiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  hobbyTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hobbyText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 15,
  },
  actividadCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  actividadTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: 5,
  },
  actividadDescripcion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  actividadFecha: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  photosSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  photosFeed: {
    marginTop: 12,
  },
  photoFeedItem: {
    width: '100%',
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F8F9FA',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  photoFeedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoFeedPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  photoFeedPlaceholderText: {
    fontSize: 48,
    marginBottom: 8,
    color: Colors.primary,
  },
  photoFeedPlaceholderLabel: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  photoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
});
