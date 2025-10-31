import { Colors } from '@/src/constants/Colors';
import { useAuth } from '@/src/features/auth/useAuth';
import { useOnboarding } from '@/src/features/onboarding/useOnboarding';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function OnboardingCompletado() {
  const { completeOnboarding, saving } = useOnboarding();
  const { user } = useAuth();
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    setIsCompleting(true);
    
    const success = await completeOnboarding();
    
    if (success) {
      console.log('🎉 Onboarding completado, redirigiendo...');
      console.log('🎉 Onboarding completado para usuario');
      
      // Redirigir inmediatamente ya que el estado local se actualiza al instante
      router.replace('/(tabs)');
    } else {
      Alert.alert('Error', 'No se pudo completar el registro. Inténtalo de nuevo.');
      setIsCompleting(false);
    }
  };

  return (
    <LinearGradient
      colors={Colors.gradient.blue}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.emoji}>🎉</Text>
            <Text style={styles.title}>¡Perfecto!</Text>
            <Text style={styles.subtitle}>
              Has completado tu perfil. Ahora puedes empezar a conectar con personas increíbles
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>¿Qué puedes hacer ahora?</Text>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureEmoji}>🤝</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Conectar diariamente</Text>
                <Text style={styles.featureDescription}>
                  Recibe un match nuevo cada 24 horas con personas afines
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureEmoji}>💬</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Chatear temporalmente</Text>
                <Text style={styles.featureDescription}>
                  Conversa con tu match por 24 horas antes del siguiente
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureEmoji}>🎯</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Crear y unirte a planes</Text>
                <Text style={styles.featureDescription}>
                  Organiza actividades y participa en las de otros
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.completeButton, (saving || isCompleting) && styles.completeButtonDisabled]}
              onPress={handleComplete}
              disabled={saving || isCompleting}
            >
              <Text style={styles.completeButtonText}>
                {saving || isCompleting ? 'Finalizando...' : '¡Empezar a Conectar!'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.95,
    lineHeight: 24,
  },
  featuresContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  featuresTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  featureEmoji: {
    fontSize: 32,
    marginRight: 16,
    marginTop: 4,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
    lineHeight: 20,
  },
  footer: {
    paddingBottom: 40,
  },
  completeButton: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  completeButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    opacity: 1,
  },
  completeButtonText: {
    color: '#1E3A8A',
    fontSize: 18,
    fontWeight: '700',
  },
});
