import { Colors } from '@/src/constants/Colors';
import { useUserProfile } from '@/src/features/auth/useUserProfile';
import { useActiveTab } from '@/src/hooks/useActiveTab';
import { router } from 'expo-router';
import { getAuth } from 'firebase/auth';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { auth } from '../../firebaseconfig';

const TabOneScreen = React.memo(function TabOneScreen() {
  const [user, setUser] = useState(auth.currentUser);
  const [displayName, setDisplayName] = useState('');
  const [editing, setEditing] = useState(false);
  const [tempInstagram, setTempInstagram] = useState('');
  const [tempDescription, setTempDescription] = useState('');
  const [tempLocation, setTempLocation] = useState('');
  const activeTab = useActiveTab();

  
  // Hook para perfil completo del usuario
  const { profile, loading: profileLoading, updating, updateProfile: updateUserProfile, uploadProfilePhoto, refreshProfile } = useUserProfile(user);
  
  
  useEffect(() => {
    const unsubscribe = getAuth().onAuthStateChanged(async (newUser) => {
      if (!newUser) {
        router.replace('/');
      } else {
        // Solo actualizar si el usuario ha cambiado
        if (user?.uid !== newUser.uid) {
          console.log("📱 Perfil - Usuario actualizado:", {
            email: newUser?.email,
            displayName: newUser?.displayName,
            uid: newUser?.uid
          });
          
          setUser(newUser);
        }
      }
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Cargar datos del perfil una sola vez - Optimizado
  useEffect(() => {
    if (profile?.displayName && !displayName) {
      setDisplayName(profile.displayName);
    }
  }, [profile?.displayName]); // Solo depende del displayName específico

  const getUserDisplayName = useCallback(() => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split('@')[0];
    return "Usuario";
  }, [user?.displayName, user?.email]);

  const getUserInitials = useMemo(() => {
    const name = getUserDisplayName();
    return name.substring(0, 2).toUpperCase();
  }, [getUserDisplayName]);

  const handleUpdateProfile = useCallback(async () => {
    if (!displayName.trim()) {
      Alert.alert("Error", "El nombre no puede estar vacío");
      return;
    }

    try {
      if (user) {
        console.log("🔄 Actualizando perfil...");
        
        // Actualizar el perfil en Firestore usando el hook
        const success = await updateUserProfile({
          displayName: displayName.trim(),
          instagram: tempInstagram.trim(),
          description: tempDescription.trim(),
          location: tempLocation.trim()
        });
        
        if (success) {
          console.log("✅ Perfil actualizado en Firestore");
          setEditing(false);
          Alert.alert("✅ Éxito", "Perfil actualizado correctamente");
        } else {
          Alert.alert("❌ Error", "No se pudo actualizar el perfil");
        }
      }
    } catch (error: any) {
      console.error("❌ Error actualizando perfil:", error);
      Alert.alert("❌ Error", error.message || "Error desconocido al actualizar el perfil");
    }
  }, [displayName, tempInstagram, tempDescription, tempLocation, user, updateUserProfile]);





  // Función para subir foto de perfil
  const handleUploadPhoto = useCallback(async () => {
    try {
      const success = await uploadProfilePhoto();
      if (success) {
        Alert.alert("¡Éxito!", "Foto de perfil actualizada correctamente");
      } else {
        Alert.alert("Error", "No se pudo actualizar la foto");
      }
    } catch (error) {
      Alert.alert("Error", "Ocurrió un error al subir la foto");
    }
  }, [uploadProfilePhoto]);

  const handleSignOut = useCallback(async () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro que quieres cerrar sesión?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Cerrar Sesión",
          style: "destructive",
          onPress: async () => {
            try {
              await auth.signOut();
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          }
        }
      ]
    );
  }, []);

  // Función de debug para verificar y actualizar el displayName
  const debugUpdateDisplayName = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert("Debug", "No hay usuario autenticado");
        return;
      }

      const newName = currentUser.email?.split('@')[0] || 'Usuario';
      
      Alert.alert(
        "Debug - Actualizar DisplayName",
        `Email: ${currentUser.email}\nDisplayName actual: ${currentUser.displayName || 'No definido'}\n\n¿Actualizar a "${newName}"?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Actualizar",
            onPress: async () => {
              try {
                await updateUserProfile({ displayName: newName });
                await currentUser.reload();
                const updated = auth.currentUser;
                
                setUser(updated);
                setDisplayName(updated?.displayName || '');
                
                Alert.alert("✅", `DisplayName actualizado a: ${updated?.displayName}`);
              } catch (error: any) {
                Alert.alert("Error", error.message);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error("Error en debug:", error);
    }
  };

  // Mostrar loading si no hay usuario o si está cargando el perfil
  if (!user || profileLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>
            {!user ? 'Verificando usuario...' : 'Cargando perfil...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.appTitle}>Mi Perfil</Text>
          <Text style={styles.subtitle}>Gestiona tu información personal</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar y información básica */}
        <View style={styles.profileCard}>
          <TouchableOpacity 
            style={styles.avatarLarge}
            onPress={handleUploadPhoto}
          >
            {profile.photoURL ? (
              <Image 
                source={{ uri: profile.photoURL }} 
                style={styles.avatarLarge}
              />
            ) : (
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarLargeText}>
                  {getUserInitials}
                </Text>
              </View>
            )}
            <View style={styles.photoEditOverlay}>
              <Text style={styles.photoEditText}>📷</Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.basicInfo}>
            <Text style={styles.userName}>{profile.displayName || getUserDisplayName()}</Text>
            <Text style={styles.userEmail}>{profile.email || user?.email || ''}</Text>
            {profile.description && (
              <Text style={styles.userDescription} numberOfLines={2}>
                {profile.description}
              </Text>
            )}
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Cuenta Activa</Text>
            </View>
          </View>

        </View>

        {/* Tarjeta unificada de información personal */}
        <View style={styles.unifiedCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Información Personal</Text>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => {
                if (editing) {
                  setDisplayName(profile?.displayName || user?.displayName || '');
                  setTempInstagram(profile.instagram || '');
                  setTempDescription(profile.description || '');
                  setTempLocation(profile.location || '');
                  setEditing(false);
                } else {
                  setEditing(true);
                }
              }}
            >
              <Text style={styles.editBtnText}>
                {editing ? "Cancelar" : "Editar"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Nombre completo */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>👤 Nombre completo</Text>
            <TextInput
              style={[
                styles.input,
                editing && styles.inputEditing,
                !editing && styles.inputDisabled
              ]}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Ingresa tu nombre completo"
              placeholderTextColor="#888"
              editable={editing}
            />
            {!displayName && !editing && (
              <Text style={styles.warningText}>
                ⚠️ No tienes un nombre configurado. Edita tu perfil para agregarlo.
              </Text>
            )}
          </View>

          {/* Email */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>📧 Email</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={user?.email || ''}
              editable={false}
            />
            <Text style={styles.helpText}>
              El email no se puede modificar por seguridad
            </Text>
          </View>

          {/* Instagram */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>📱 Instagram</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={tempInstagram}
                onChangeText={setTempInstagram}
                placeholder="Ingresa tu usuario de Instagram"
                placeholderTextColor="#888"
              />
            ) : (
              <Text style={styles.infoText}>
                {profile.instagram ? `@${profile.instagram}` : 'No configurado'}
              </Text>
            )}
          </View>

          {/* Ubicación */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>📍 Ubicación</Text>
            {editing ? (
              <View>
                <TextInput
                  style={styles.input}
                  value={tempLocation}
                  onChangeText={setTempLocation}
                  placeholder="Ingresa tu ciudad"
                  placeholderTextColor="#888"
                />
              </View>
            ) : (
              <Text style={styles.infoText}>
                {profile.location || 'No configurado'}
              </Text>
            )}
          </View>

          {/* Hobbies */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>🎨 Hobbies e Intereses</Text>
            <View style={styles.hobbiesGrid}>
              {profile.hobbies && profile.hobbies.length > 0 ? (
                profile.hobbies.map((hobby: string, index: number) => (
                  <View key={index} style={styles.hobbyChip}>
                    <Text style={styles.hobbyChipText}>{hobby}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.infoText}>No hay hobbies configurados</Text>
              )}
            </View>
            <Text style={styles.helpText}>
              Los hobbies se pueden editar desde la configuración de la app
            </Text>
          </View>

          {/* Descripción personal */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>💬 Sobre ti</Text>
            {editing ? (
              <TextInput
                style={styles.descriptionInput}
                value={tempDescription}
                onChangeText={setTempDescription}
                placeholder="Cuéntanos sobre ti..."
                placeholderTextColor="#888"
                multiline
                numberOfLines={4}
              />
            ) : (
              <Text style={styles.infoText}>
                {profile.description || 'No configurado'}
              </Text>
            )}
          </View>

          {editing && (
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={async () => {
                try {
                  // Consolidar todas las actualizaciones en una sola operación
                  const updates: any = {};
                  
                  if (displayName.trim() !== (profile.displayName || '')) {
                    updates.displayName = displayName.trim();
                  }
                  
                  if (tempInstagram.trim() !== (profile.instagram || '')) {
                    updates.instagram = tempInstagram.trim();
                  }
                  
                  if (tempLocation.trim() !== (profile.location || '')) {
                    updates.location = tempLocation.trim();
                  }
                  
                  if (tempDescription.trim() !== (profile.description || '')) {
                    updates.description = tempDescription.trim();
                  }
                  
                  // Solo actualizar si hay cambios
                  if (Object.keys(updates).length > 0) {
                    await updateUserProfile(updates);
                  }
                  
                  setEditing(false);
                  Alert.alert('¡Éxito!', 'Perfil actualizado correctamente');
                } catch (error) {
                  Alert.alert('Error', 'No se pudo actualizar el perfil');
                }
              }}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Guardar Cambios</Text>
              )}
            </TouchableOpacity>
          )}
        </View>





        {/* Editor de Perfil Expandido */}

          {/* Configuración y acciones */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>⚙️ Configuración</Text>
            <View style={styles.configButtons}>
              <TouchableOpacity style={styles.configButton}>
                <Text style={styles.configButtonIcon}>🔔</Text>
                <Text style={styles.configButtonText}>Notificaciones</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.configButton}>
                <Text style={styles.configButtonIcon}>🔒</Text>
                <Text style={styles.configButtonText}>Privacidad</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.configButton}>
                <Text style={styles.configButtonIcon}>ℹ️</Text>
                <Text style={styles.configButtonText}>Acerca de</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Botón de cerrar sesión */}
          <View style={styles.formGroup}>
            <TouchableOpacity
              style={styles.signOutBtn}
              onPress={handleSignOut}
            >
              <Text style={styles.signOutIcon}>⚠️</Text>
              <Text style={styles.signOutText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

    </SafeAreaView>
  );
});

export default TabOneScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    backgroundColor: '#1E3A8A',
    paddingTop: 25,
    paddingBottom: 25,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarLarge: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    backgroundColor: Colors.primary,
  },
  avatarLargeText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
  },
  basicInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '500',
  },
  debugButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fef3c7',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  debugButtonText: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '500',
  },
  editCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  unifiedCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a202c',
  },
  editBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1a202c',
    backgroundColor: '#fff',
  },
  inputEditing: {
    borderColor: Colors.primary,
    backgroundColor: '#fff',
  },
  inputDisabled: {
    backgroundColor: '#f8fafc',
    color: '#64748b',
  },
  helpText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 6,
    fontStyle: 'italic',
  },
  warningText: {
    fontSize: 12,
    color: '#f59e0b',
    marginTop: 6,
    fontWeight: '500',
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  configButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  configButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    width: '30%',
    marginBottom: 8,
  },
  configButtonIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  configButtonText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '500',
  },
  signOutBtn: {
    backgroundColor: '#ff4444',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  signOutIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  bottomPadding: {
    height: 40,
  },


  // Estilos para el perfil expandido
  photoEditOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  photoEditText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  userDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    lineHeight: 20,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // Estilos para las tarjetas de información
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoCardIconText: {
    fontSize: 24,
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: 4,
  },
  infoCardSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoCardAction: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  infoCardActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  hobbiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hobbyChip: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  hobbyChipText: {
    color: '#0369a1',
    fontSize: 14,
    fontWeight: '500',
  },
  descriptionText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    textAlign: 'justify',
  },
  
  // Estilos para edición inline
  inlineInput: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    color: '#1a202c',
    backgroundColor: '#fff',
    marginTop: 4,
  },
  inlineActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelBtn: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cancelBtnText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
  addHobbyContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1a202c',
    backgroundColor: '#fff',
    marginTop: 8,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  locationActions: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  currentLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  currentLocationIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  currentLocationText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  infoText: {
    fontSize: 16,
    color: '#374151',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
});