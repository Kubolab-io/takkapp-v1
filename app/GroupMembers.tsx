/**
 * GroupMembers.tsx
 * 
 * Pantalla que muestra todos los miembros de un grupo
 */

import { auth } from '@/firebaseconfig';
import { Colors } from '@/src/constants/Colors';
import { Group, useGroups } from '@/src/features/groups/useGroups';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

export default function GroupMembersScreen() {
  const { groupId, groupName, groupEmoji } = useLocalSearchParams<{
    groupId: string;
    groupName: string;
    groupEmoji: string;
  }>();

  const [groupData, setGroupData] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<any[]>([]);
  const lastMembersRef = useRef<string[]>([]);
  const hasLoadedRef = useRef(false);

  const user = auth.currentUser;

  // Hook para obtener datos del grupo
  const { getGroupData } = useGroups(user);

  // Función mejorada para cargar información de los miembros
  const loadMembersInfo = useCallback(async (memberIds: string[]) => {
    try {
      // Limpiar los IDs de comillas extra y espacios
      const cleanMemberIds = memberIds.map(id => {
        // Remover comillas simples, dobles y espacios
        const cleanId = id.replace(/['"]/g, '').trim();
        console.log('🧹 Limpiando ID:', id, '→', cleanId);
        return cleanId;
      });
      
      // Verificar si los miembros ya están cargados
      const lastLoadedIds = lastMembersRef.current.map(id => 
        typeof id === 'string' ? id.replace(/['"]/g, '').trim() : id
      );
      
      if (JSON.stringify(cleanMemberIds.sort()) === JSON.stringify(lastLoadedIds.sort()) && 
          members.length > 0 && 
          !members.some(m => m.displayName === 'Usuario')) {
        console.log('⏭️ Miembros ya cargados correctamente, saltando...');
        return;
      }

      console.log('👤 Cargando información de miembros:', cleanMemberIds);
      console.log('👤 Usuario actual:', user?.uid);
      lastMembersRef.current = cleanMemberIds;
      
      const { collection, getDocs, query, where, doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('@/firebaseconfig');
      
      if (!cleanMemberIds || cleanMemberIds.length === 0) {
        console.log('❌ No hay IDs de miembros para cargar');
        setMembers([]);
        return;
      }

      let membersData: any[] = [];
      
      // Estrategia 1: Buscar por documentos individuales usando el ID como clave del documento
      console.log('🔍 Estrategia 1: Buscando documentos individuales...');
      for (const memberId of cleanMemberIds) {
        try {
          // Intentar en userProfiles usando el ID como clave del documento
          const profileDocRef = doc(db, 'userProfiles', memberId);
          const profileDoc = await getDoc(profileDocRef);
          
          if (profileDoc.exists()) {
            const data = profileDoc.data();
            console.log('✅ Usuario encontrado en userProfiles:', memberId);
            console.log('   Datos:', data);
            membersData.push({
              id: memberId,
              uid: memberId,
              ...data
            });
            continue;
          }
          
          // Intentar en users usando el ID como clave del documento
          const userDocRef = doc(db, 'users', memberId);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            console.log('✅ Usuario encontrado en users:', memberId);
            console.log('   Datos:', data);
            membersData.push({
              id: memberId,
              uid: memberId,
              ...data
            });
            continue;
          }
          
          console.log('⚠️ Usuario no encontrado por ID de documento:', memberId);
        } catch (error) {
          console.error(`Error buscando documento individual ${memberId}:`, error);
        }
      }
      
      // Estrategia 2: Si no encontramos todos por ID de documento, buscar por campo uid
      if (membersData.length < cleanMemberIds.length) {
        const foundIds = membersData.map(m => m.uid || m.id);
        const missingIds = cleanMemberIds.filter(id => !foundIds.includes(id));
        
        if (missingIds.length > 0) {
          console.log('🔍 Estrategia 2: Buscando usuarios faltantes por campo uid:', missingIds);
          
          try {
            // Buscar en userProfiles por campo uid
            const profilesRef = collection(db, 'userProfiles');
            const profilesQuery = query(profilesRef, where('uid', 'in', missingIds));
            const profilesSnapshot = await getDocs(profilesQuery);
            
            profilesSnapshot.forEach((docSnapshot) => {
              const data = docSnapshot.data();
              console.log('✅ Usuario encontrado en userProfiles por uid:', docSnapshot.id);
              console.log('   Datos:', data);
              membersData.push({
                id: docSnapshot.id,
                ...data
              });
            });
          } catch (error) {
            console.error('Error buscando en userProfiles por uid:', error);
          }
          
          // Si aún faltan usuarios, buscar en users por campo uid
          const stillMissingIds = missingIds.filter(id => 
            !membersData.some(m => m.uid === id || m.id === id)
          );
          
          if (stillMissingIds.length > 0) {
            try {
              const usersRef = collection(db, 'users');
              const usersQuery = query(usersRef, where('uid', 'in', stillMissingIds));
              const usersSnapshot = await getDocs(usersQuery);
              
              usersSnapshot.forEach((docSnapshot) => {
                const data = docSnapshot.data();
                console.log('✅ Usuario encontrado en users por uid:', docSnapshot.id);
                console.log('   Datos:', data);
                membersData.push({
                  id: docSnapshot.id,
                  ...data
                });
              });
            } catch (error) {
              console.error('Error buscando en users por uid:', error);
            }
          }
        }
      }
      
      // Estrategia 3: Buscar por email si los IDs podrían ser emails
      if (membersData.length < cleanMemberIds.length) {
        const foundIds = membersData.map(m => m.uid || m.id);
        const missingIds = cleanMemberIds.filter(id => !foundIds.includes(id));
        const emailIds = missingIds.filter(id => id.includes('@'));
        
        if (emailIds.length > 0) {
          console.log('🔍 Estrategia 3: Intentando buscar por email:', emailIds);
          
          try {
            const profilesRef = collection(db, 'userProfiles');
            const profilesQuery = query(profilesRef, where('email', 'in', emailIds));
            const profilesSnapshot = await getDocs(profilesQuery);
            
            profilesSnapshot.forEach((docSnapshot) => {
              const data = docSnapshot.data();
              console.log('✅ Usuario encontrado por email:', docSnapshot.id);
              console.log('   Datos:', data);
              membersData.push({
                id: docSnapshot.id,
                ...data
              });
            });
          } catch (error) {
            console.error('Error buscando por email:', error);
          }
        }
      }
      
      // Para los usuarios no encontrados, crear datos mejorados
      const foundIds = membersData.map(m => m.uid || m.id);
      const notFoundIds = cleanMemberIds.filter(id => !foundIds.includes(id));
      
      if (notFoundIds.length > 0) {
        console.log('⚠️ Usuarios no encontrados:', notFoundIds);
        
        for (const missingId of notFoundIds) {
          const isCurrentUser = missingId === user?.uid;
          
          if (isCurrentUser && user) {
            // Si es el usuario actual, usar sus datos de auth
            membersData.push({
              id: missingId,
              uid: missingId,
              displayName: user.displayName || user.email?.split('@')[0] || 'Tú',
              email: user.email || '',
              bio: 'Mi perfil',
              age: null,
              location: '',
              profilePicture: user.photoURL || null,
              photoURL: user.photoURL || null
            });
          } else {
            // Para otros usuarios no encontrados
            membersData.push({
              id: missingId,
              uid: missingId,
              displayName: `Usuario`,
              email: '',
              bio: 'Perfil no disponible',
              age: null,
              location: '',
              profilePicture: null
            });
          }
        }
        
        // Si hay usuarios no encontrados, programar un reintento
        if (notFoundIds.length > 0) {
          setTimeout(() => {
            console.log('🔄 Reintentando carga de usuarios no encontrados...');
            lastMembersRef.current = [];
            if (groupData?.members) {
              loadMembersInfo(groupData.members);
            }
          }, 3000);
        }
      }
      
      console.log('✅ Total de usuarios cargados:', membersData.length);
      membersData.forEach((member, index) => {
        console.log(`   ${index + 1}. ${member.displayName || member.name || 'Sin nombre'} (${member.uid || member.id})`);
      });
      
      setMembers(membersData);
      
    } catch (error) {
      console.error('❌ Error general cargando miembros:', error);
      
      // Crear datos básicos como último recurso
      const basicMembers = memberIds.map(id => {
        const cleanId = id.replace(/['"]/g, '').trim();
        const isCurrentUser = cleanId === user?.uid;
        return {
          id: cleanId,
          uid: cleanId,
          displayName: isCurrentUser ? 
            (user.displayName || user.email?.split('@')[0] || 'Tú') : 
            'Usuario',
          email: isCurrentUser ? user.email : '',
          bio: 'Error al cargar perfil',
          age: null,
          location: '',
          profilePicture: isCurrentUser ? user.photoURL : null
        };
      });
      
      setMembers(basicMembers);
      lastMembersRef.current = [];
    }
  }, [user, groupData]);

  // Cargar datos del grupo
  useEffect(() => {
    if (!user || !groupId) return;
    
    let isMounted = true;
    
    const loadGroupData = async () => {
      try {
        console.log('🔍 Cargando datos del grupo:', groupId);
        
        const data = await getGroupData(groupId);
        
        if (!isMounted) return;
        
        console.log('📊 Datos del grupo obtenidos:', data);
        if (data) {
          setGroupData(data);
          console.log('👥 Miembros del grupo (IDs raw):', JSON.stringify(data.members));
          // Cargar información de los miembros
          await loadMembersInfo(data.members);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error cargando datos del grupo:', error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadGroupData();
    
    return () => {
      isMounted = false;
    };
  }, [groupId, user]);

  // Función para forzar recarga de miembros
  const forceReloadMembers = useCallback(() => {
    if (groupData?.members) {
      console.log('🔄 Forzando recarga de miembros...');
      lastMembersRef.current = [];
      setMembers([]);
      loadMembersInfo(groupData.members);
    }
  }, [groupData?.members, loadMembersInfo]);

  // Funciones helper para obtener datos del usuario
  const getUserDisplayName = (user: any) => {
    if (user.displayName) return user.displayName;
    if (user.name) return user.name;
    if (user.author) return user.author;
    if (user.email) return user.email.split('@')[0];
    return 'Usuario';
  };

  const getUserPhoto = (user: any) => {
    if (user.profilePicture) return user.profilePicture;
    if (user.photoURL) return user.photoURL;
    if (user.avatar) return user.avatar;
    return null;
  };

  const getUserLocation = (user: any) => {
    if (user.location) return user.location;
    if (user.ubicacion) return user.ubicacion;
    return null;
  };

  const getUserBio = (user: any) => {
    if (user.bio) return user.bio;
    if (user.description) return user.description;
    return null;
  };

  const getUserAge = (user: any) => {
    if (user.age) return user.age;
    
    if (user.birthDate) {
      try {
        const birthDate = new Date(user.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        return age > 0 ? age : null;
      } catch (error) {
        console.error('Error calculando edad:', error);
        return null;
      }
    }
    
    return null;
  };

  // Verificar si solo tenemos datos básicos
  const hasOnlyBasicData = members.length > 0 && members.every(member => 
    member.displayName === 'Usuario' || member.bio === 'Perfil no disponible'
  );

  // Validar parámetros
  if (!groupId || !groupName) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: Parámetros del grupo no encontrados</Text>
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

  // Renderizar miembro individual
  const renderMember = ({ item }: { item: any }) => {
    const isCurrentUser = item.id === user?.uid || item.uid === user?.uid;
    
    return (
      <TouchableOpacity 
        style={styles.memberCard}
        onPress={() => {
          console.log('👤 Navegando al perfil de:', getUserDisplayName(item), item.id);
          router.navigate({
            pathname: '../PerfilUsuario' as any,
            params: {
              userId: item.uid || item.id,
              userName: getUserDisplayName(item)
            }
          } as any);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.memberAvatarContainer}>
          {getUserPhoto(item) ? (
            <Image 
              source={{ uri: getUserPhoto(item) }} 
              style={styles.memberAvatar} 
            />
          ) : (
            <View style={styles.memberAvatarPlaceholder}>
              <Text style={styles.memberAvatarText}>
                {getUserDisplayName(item)?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
          )}
          {isCurrentUser && (
            <View style={styles.currentUserBadge}>
              <Text style={styles.currentUserBadgeText}>Tú</Text>
            </View>
          )}
        </View>
        
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>
            {getUserDisplayName(item)}
            {isCurrentUser && ' (Tú)'}
          </Text>
          {getUserBio(item) && (
            <Text style={styles.memberBio} numberOfLines={2}>
              {getUserBio(item)}
            </Text>
          )}
          <View style={styles.memberStats}>
            {getUserAge(item) ? (
              <Text style={styles.memberStatsText}>{getUserAge(item)} años</Text>
            ) : (
              <Text style={styles.memberStatsText}>Edad no especificada</Text>
            )}
            {getUserLocation(item) && (
              <Text style={styles.memberStatsText}>• {getUserLocation(item)}</Text>
            )}
            {!getUserLocation(item) && getUserAge(item) && (
              <Text style={styles.memberStatsText}>• Miembro activo</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        
        <View style={styles.customHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerEmoji}>{groupEmoji}</Text>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Miembros</Text>
              <Text style={styles.headerSubtitle}>Cargando...</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando miembros...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.customHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerEmoji}>{groupEmoji}</Text>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Miembros</Text>
            <Text style={styles.headerSubtitle}>
              {members.length} {members.length === 1 ? 'miembro' : 'miembros'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{groupName}</Text>
        {groupData?.description && (
          <Text style={styles.groupDescription}>{groupData.description}</Text>
        )}
        {hasOnlyBasicData && (
          <TouchableOpacity 
            style={styles.reloadButton}
            onPress={forceReloadMembers}
          >
            <Text style={styles.reloadButtonText}>🔄 Recargar información</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={members}
        keyExtractor={(item) => item.uid || item.id}
        renderItem={renderMember}
        contentContainerStyle={styles.membersList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>👥</Text>
            <Text style={styles.emptyStateTitle}>No hay miembros</Text>
            <Text style={styles.emptyStateText}>
              Este grupo no tiene miembros aún.
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  groupInfo: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  reloadButton: {
    backgroundColor: Colors.primary,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  reloadButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  membersList: {
    padding: 16,
    paddingTop: 8,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  memberAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.background,
  },
  memberAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  currentUserBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  currentUserBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  memberBio: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 6,
    lineHeight: 18,
  },
  memberStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberStatsText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginRight: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 12,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});