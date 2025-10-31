import { Colors } from '@/src/constants/Colors';
import { useOnboarding } from '@/src/features/onboarding/useOnboarding';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function OnboardingWelcome() {
  const { loading } = useOnboarding();
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleStart = () => {
    if (!acceptedTerms) {
      Alert.alert(
        'Términos y Condiciones',
        'Debes aceptar los Términos y Condiciones y la Política de Privacidad para continuar.',
        [{ text: 'OK' }]
      );
      return;
    }
    router.push('/onboarding/basica');
  };

  const openTerms = () => {
    router.push('/onboarding/terminos');
  };

  const openPrivacy = () => {
    router.push('/onboarding/privacidad');
  };

  if (loading) {
    return (
      <LinearGradient
        colors={Colors.gradient.blue}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={Colors.gradient.blue}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.emoji}>👋</Text>
            <Text style={styles.title}>¡Bienvenido a takk!</Text>
            <Text style={styles.subtitle}>
              Para conectarte mejor con otros usuarios, necesitamos conocer un poco más sobre ti
            </Text>
          </View>

          <View style={styles.stepsContainer}>
            <Text style={styles.stepsTitle}>Te haremos algunas preguntas:</Text>
            
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>Información básica</Text>
            </View>
            
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>Tu ubicación</Text>
            </View>
            
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>Cuéntanos sobre ti</Text>
            </View>
            
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>4</Text>
              <Text style={styles.stepText}>Tu Instagram</Text>
            </View>
            
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>5</Text>
              <Text style={styles.stepText}>Tus intereses</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Solo te tomará unos minutos y podrás empezar a conectar con personas increíbles
            </Text>

            {/* Checkbox de términos y condiciones */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                {acceptedTerms && (
                  <Ionicons name="checkmark" size={18} color="#1E3A8A" />
                )}
              </View>
              <View style={styles.termsTextContainer}>
                <Text style={styles.termsText}>
                  Acepto los{' '}
                  <Text style={styles.termsLink} onPress={openTerms}>
                    Términos y Condiciones
                  </Text>
                  {' '}y la{' '}
                  <Text style={styles.termsLink} onPress={openPrivacy}>
                    Política de Privacidad
                  </Text>
                </Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.startButton, !acceptedTerms && styles.startButtonDisabled]}
              onPress={handleStart}
              activeOpacity={acceptedTerms ? 0.7 : 1}
            >
              <Text style={[styles.startButtonText, !acceptedTerms && styles.startButtonTextDisabled]}>
                Comenzar
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
    paddingTop: 40,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.white,
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
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
  stepsContainer: {
    marginBottom: 32,
  },
  stepsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 24,
    textAlign: 'center',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 32,
    marginRight: 16,
  },
  stepText: {
    fontSize: 16,
    color: Colors.white,
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 20,
    marginBottom: 24,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.white,
    backgroundColor: 'transparent',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.white,
    borderColor: Colors.white,
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    fontSize: 14,
    color: Colors.white,
    lineHeight: 20,
  },
  termsLink: {
    color: Colors.white,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  startButton: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
    alignItems: 'center',
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    opacity: 1,
  },
  startButtonText: {
    color: '#1E3A8A',
    fontSize: 16,
    fontWeight: '700',
  },
  startButtonTextDisabled: {
    color: 'rgba(30, 58, 138, 0.5)',
  },
});
