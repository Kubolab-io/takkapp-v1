/**
 * matching.tsx
 * 
 * Nueva pantalla de matching semanal con sistema mutuo:
 * - 3-5 matches por semana
 * - Matching bidireccional
 * - Interfaz rediseñada para múltiples matches
 */

import { auth } from '@/firebaseconfig';
import { Colors } from '@/src/constants/Colors';
import { useMatchingConsent } from '@/src/features/matching/useMatchingConsent';
import { useWeeklyMatching } from '@/src/features/matching/useWeeklyMatching';
import { useActiveTab } from '@/src/hooks/useActiveTab';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface WeeklyMatch {
  matchId: string;
  matchedUserId: string;
  matchedUserData: {
    displayName: string;
    photoURL?: string;
    age?: number;
    location?: string;
    description?: string;
    hobbies?: string[];
    email?: string;
  };
  status: 'pending' | 'accepted' | 'rejected' | 'mutual';
}

export default function MatchingScreen() {
  const activeTab = useActiveTab();
  const [user, setUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(true);

  // Hook para manejar consentimiento de matching
  const {
    hasConsented,
    isMatchingEnabled,
    loading: consentLoading,
    giveConsent,
    toggleMatching
  } = useMatchingConsent(user);

  // Hook para el nuevo sistema de matching semanal
  const {
    weeklyMatches,
    loading: matchingLoading,
    canGetNewMatches,
    timeUntilNextMatch,
    currentWeekId,
    getWeeklyMatches,
    generateWeeklyMatches,
    acceptMatch,
    rejectMatch
  } = useWeeklyMatching(user);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        setLoading(false);
      } else {
        router.replace('/');
      }
    });

    return () => unsubscribe();
  }, []);

  // Redirigir si no tiene consentimiento
  useEffect(() => {
    if (!loading && !consentLoading && !hasConsented) {
      router.replace('/(tabs)/matching-paused');
    }
  }, [loading, consentLoading, hasConsented]);


  // Manejar toggle del estado de matching
  const handleToggleMatching = async () => {
    try {
      const success = await toggleMatching();
      if (!success) {
        Alert.alert('Error', 'No se pudo actualizar tu preferencia. Inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error actualizando consentimiento:', error);
      Alert.alert('Error', 'No se pudo actualizar tu preferencia. Inténtalo de nuevo.');
    }
  };

  // Manejar aceptar match
  const handleAcceptMatch = async (matchId: string) => {
    const success = await acceptMatch(matchId);
    if (success) {
      Alert.alert('¡Match Aceptado!', 'Has aceptado este match. Si la otra persona también te acepta, podrán chatear.');
    } else {
      Alert.alert('Error', 'No se pudo aceptar el match. Inténtalo de nuevo.');
    }
  };

  // Manejar rechazar match
  const handleRejectMatch = async (matchId: string) => {
    const success = await rejectMatch(matchId);
    if (success) {
      Alert.alert('Match Rechazado', 'Has rechazado este match.');
    } else {
      Alert.alert('Error', 'No se pudo rechazar el match. Inténtalo de nuevo.');
    }
  };

  // Manejar ver perfil
  const handleViewProfile = (match: WeeklyMatch) => {
    router.push({
      pathname: '/PerfilUsuario',
      params: {
        userId: match.matchedUserId,
        userName: match.matchedUserData.displayName,
        userPhoto: match.matchedUserData.photoURL,
        userAge: match.matchedUserData.age,
        userLocation: match.matchedUserData.location,
        userDescription: match.matchedUserData.description,
        userHobbies: JSON.stringify(match.matchedUserData.hobbies || [])
      }
    });
  };

  // Formatear tiempo hasta la próxima semana
  const formatTimeUntilNextWeek = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  // Generar nuevos matches
  const handleGenerateMatches = async () => {
    await generateWeeklyMatches();
  };


  if (loading || matchingLoading || consentLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>
            {matchingLoading ? 'Generando tus matches semanales...' : 'Cargando...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Nueva Semana, Nuevos Amigos</Text>
          <Text style={styles.headerSubtitle}>
            {currentWeekId ? `Semana ${currentWeekId}` : 'Cargando...'}
          </Text>
        </View>

        {/* Control de matching - Movido arriba para mejor accesibilidad */}
        <View style={styles.controlContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              {
                backgroundColor: isMatchingEnabled ? '#f8f9fa' : Colors.primary,
                borderColor: isMatchingEnabled ? '#e9ecef' : Colors.primary,
              }
            ]}
            onPress={handleToggleMatching}
          >
            <Text style={styles.toggleButtonIcon}>
              {isMatchingEnabled ? '⏸️' : '▶️'}
            </Text>
            <Text style={[
              styles.toggleButtonText,
              {
                color: isMatchingEnabled ? Colors.textPrimary : '#fff',
              }
            ]}>
              {isMatchingEnabled ? 'Pausar Matching' : 'Reanudar Matching'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Timer de próxima semana */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            {canGetNewMatches
              ? "¡Nuevos matches disponibles!"
              : `Próxima semana en: ${formatTimeUntilNextWeek(timeUntilNextMatch)}`
            }
          </Text>
        </View>

        {/* Botón para generar matches si no hay */}
        {weeklyMatches.length === 0 && canGetNewMatches && (
          <View style={styles.generateContainer}>
            <TouchableOpacity
              style={styles.generateButton}
              onPress={handleGenerateMatches}
            >
              <Text style={styles.generateButtonIcon}>🎯</Text>
              <Text style={styles.generateButtonText}>Generar Mis Matches</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Lista de matches */}
        {weeklyMatches.length > 0 ? (
          <View style={styles.matchesContainer}>
            <Text style={styles.matchesTitle}>
              {weeklyMatches.length} {weeklyMatches.length === 1 ? 'Match' : 'Matches'} Disponibles
            </Text>
            
            {weeklyMatches.map((match: WeeklyMatch, index: number) => (
              <View key={`${match.matchId}_${index}_${match.matchedUserId}`} style={styles.matchCard}>
                {/* Avatar del match */}
                <View style={styles.matchHeader}>
                  <View style={styles.avatarContainer}>
                    <Image 
                      source={
                        match.matchedUserData.photoURL 
                          ? { uri: match.matchedUserData.photoURL }
                          : require('@/assets/images/profilepicturetemplate.png')
                      }
                      style={styles.matchAvatar}
                    />
                    {match.status === 'mutual' && (
                      <View style={styles.mutualBadge}>
                        <Text style={styles.mutualBadgeText}>🤝</Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.matchInfo}>
                    <Text style={styles.matchName}>{match.matchedUserData.displayName}</Text>
                    {match.matchedUserData.age && (
                      <Text style={styles.matchAge}>{match.matchedUserData.age} años</Text>
                    )}
                    {match.matchedUserData.location && (
                      <Text style={styles.matchLocation}>📍 {match.matchedUserData.location}</Text>
                    )}
                  </View>
                </View>

                {/* Descripción */}
                {match.matchedUserData.description && (
                  <Text style={styles.matchDescription} numberOfLines={2}>
                    &quot;{match.matchedUserData.description}&quot;
                  </Text>
                )}

                {/* Hobbies */}
                {match.matchedUserData.hobbies && match.matchedUserData.hobbies.length > 0 && (
                  <View style={styles.hobbiesContainer}>
                    <View style={styles.hobbiesList}>
                      {match.matchedUserData.hobbies.slice(0, 3).map((hobby: string, hobbyIndex: number) => (
                        <View key={hobbyIndex} style={styles.hobbyChip}>
                          <Text style={styles.hobbyText}>{hobby}</Text>
                        </View>
                      ))}
                      {match.matchedUserData.hobbies.length > 3 && (
                        <View style={styles.hobbyChip}>
                          <Text style={styles.hobbyText}>+{match.matchedUserData.hobbies.length - 3}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {/* Estado del match */}
                <View style={styles.matchStatus}>
                  {match.status === 'pending' && (
                    <Text style={styles.statusText}>⏳ Esperando tu respuesta</Text>
                  )}
                  {match.status === 'accepted' && (
                    <Text style={styles.statusTextAccepted}>✅ Aceptado - Esperando respuesta</Text>
                  )}
                  {match.status === 'mutual' && (
                    <Text style={styles.statusTextMutual}>🤝 ¡Match Mutuo! Pueden chatear</Text>
                  )}
                  {match.status === 'rejected' && (
                    <Text style={styles.statusTextRejected}>❌ Rechazado</Text>
                  )}
                </View>

                {/* Botones de acción */}
                {match.status === 'pending' && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.rejectButton}
                      onPress={() => handleRejectMatch(match.matchId)}
                    >
                      <Text style={styles.rejectButtonText}>❌ Rechazar</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={() => handleAcceptMatch(match.matchId)}
                    >
                      <Text style={styles.acceptButtonText}>✅ Aceptar</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Botones para matches aceptados/mutuales */}
                {(match.status === 'accepted' || match.status === 'mutual') && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.profileButton}
                      onPress={() => handleViewProfile(match)}
                    >
                      <Text style={styles.profileButtonText}>👤 Ver Perfil</Text>
                    </TouchableOpacity>
                    
                    {match.status === 'mutual' && (
                      <TouchableOpacity
                        style={styles.chatButton}
                        onPress={() => {
                          router.push({
                            pathname: '/IndividualChat',
                            params: {
                              matchId: match.matchId,
                              matchedUserId: match.matchedUserId,
                              matchedUserName: match.matchedUserData.displayName,
                              matchedUserPhoto: match.matchedUserData.photoURL
                            }
                          });
                        }}
                      >
                        <Text style={styles.chatButtonText}>💬 Chatear</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : !canGetNewMatches ? (
          <View style={styles.noMatchesContainer}>
            <Text style={styles.noMatchesIcon}>🤷‍♂️</Text>
            <Text style={styles.noMatchesTitle}>No hay matches disponibles</Text>
            <Text style={styles.noMatchesText}>
              {canGetNewMatches 
                ? "No hay usuarios disponibles para hacer match" 
                : `Tus próximos matches estarán disponibles en ${formatTimeUntilNextWeek(timeUntilNextMatch)}`
              }
            </Text>
          </View>
        ) : null}

      </ScrollView>

    </SafeAreaView>
  );
}

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
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  timerContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timerText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  generateContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  generateButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  generateButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  matchesContainer: {
    marginBottom: 20,
  },
  matchesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 16,
  },
  matchCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  matchAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
  },
  mutualBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: Colors.success,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  mutualBadgeText: {
    fontSize: 12,
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  matchAge: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  matchLocation: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  matchDescription: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  hobbiesContainer: {
    marginBottom: 12,
  },
  hobbiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  hobbyChip: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hobbyText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  matchStatus: {
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  statusTextAccepted: {
    fontSize: 14,
    color: Colors.warning,
    textAlign: 'center',
    fontWeight: '600',
  },
  statusTextMutual: {
    fontSize: 14,
    color: Colors.success,
    textAlign: 'center',
    fontWeight: '600',
  },
  statusTextRejected: {
    fontSize: 14,
    color: Colors.error,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.error,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: Colors.success,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  profileButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  profileButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  chatButton: {
    flex: 1,
    backgroundColor: Colors.success,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  chatButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  noMatchesContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noMatchesIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noMatchesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  noMatchesText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  controlContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  toggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  toggleButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});