/**
 * matching-paused.tsx
 * 
 * Pantalla que se muestra cuando el matching está pausado
 * Explica cómo funciona el sistema y permite reanudar
 */

import { auth, db } from '@/firebaseconfig';
import { Colors } from '@/src/constants/Colors';
import { useMatchingConsent } from '@/src/features/matching/useMatchingConsent';
import { useActiveTab } from '@/src/hooks/useActiveTab';
import { router } from 'expo-router';
import { doc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function MatchingPausedScreen() {
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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Cerrar esta pantalla si el matching se reanuda
  useEffect(() => {
    if (!consentLoading && isMatchingEnabled) {
      router.push('/(tabs)/matching');
    }
  }, [consentLoading, isMatchingEnabled]);

  // Manejar reanudar matching
  const handleResumeMatching = async () => {
    try {
      // Actualizar el perfil del usuario en Firebase
      await updateDoc(doc(db, 'userProfiles', user?.uid), {
        hasMatchingConsent: true,
        matchingEnabled: true,
        updatedAt: new Date()
      });
      
      // Actualizar el estado local
      const success = await toggleMatching();
      if (!success) {
        Alert.alert('Error', 'No se pudo reanudar el matching. Inténtalo de nuevo.');
      } else {
        // Navegar de vuelta a la pantalla de matching
        router.push('/(tabs)/matching');
      }
    } catch (error) {
      console.error('Error reanudando matching:', error);
      Alert.alert('Error', 'No se pudo reanudar el matching. Inténtalo de nuevo.');
    }
  };

  if (loading || consentLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>⏸️ Matching Pausado</Text>
          <Text style={styles.headerSubtitle}>
            Has pausado temporalmente el sistema de matching
          </Text>
        </View>

        {/* Información sobre el sistema */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>¿Cómo funciona?</Text>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>🎯</Text>
              <Text style={styles.infoText}>
                Cada minuto conoces a una nueva persona al azar
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>👋</Text>
              <Text style={styles.infoText}>
                Puedes conectar y chatear directamente con esa persona
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>🤝</Text>
              <Text style={styles.infoText}>
                Cada persona es una oportunidad de hacer una nueva amistad
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>🔄</Text>
              <Text style={styles.infoText}>
                La próxima conexión estará disponible en 1 minuto
              </Text>
            </View>
          </View>
        </View>

        {/* Botón para reanudar */}
        <View style={styles.resumeContainer}>
          <TouchableOpacity
            style={styles.resumeButton}
            onPress={handleResumeMatching}
          >
            <Text style={styles.resumeButtonIcon}>▶️</Text>
            <Text style={styles.resumeButtonText}>Reanudar Matching</Text>
          </TouchableOpacity>
        </View>

        {/* Información adicional */}
        <View style={styles.additionalInfo}>
          <Text style={styles.additionalInfoTitle}>💡 Consejos</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Text style={styles.tipIcon}>✨</Text>
              <Text style={styles.tipText}>
                Sé auténtico en tus conversaciones
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipIcon}>🌟</Text>
              <Text style={styles.tipText}>
                Comparte tus intereses y hobbies
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipIcon}>🎉</Text>
              <Text style={styles.tipText}>
                ¡Disfruta conociendo gente nueva!
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    paddingVertical: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  infoList: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 16,
    color: Colors.primary,
    lineHeight: 22,
  },
  resumeContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  resumeButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
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
  resumeButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  resumeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  additionalInfo: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  additionalInfoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tipIcon: {
    fontSize: 16,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: Colors.primary,
    lineHeight: 20,
  },
});
