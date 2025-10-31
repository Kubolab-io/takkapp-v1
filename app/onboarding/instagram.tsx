import { Colors } from '@/src/constants/Colors';
import { useOnboarding } from '@/src/features/onboarding/useOnboarding';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function OnboardingInstagram() {
  const { onboardingData, saveOnboardingData, saving } = useOnboarding();
  const [instagram, setInstagram] = useState(onboardingData.instagram || '');

  const handleNext = async () => {
    if (!instagram.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu usuario de Instagram');
      return;
    }

    // Limpiar el input (remover @ si existe)
    const cleanInstagram = instagram.trim().replace('@', '');

    const success = await saveOnboardingData({
      instagram: cleanInstagram
    });

    if (success) {
      router.push('/onboarding/hobbies');
    } else {
      Alert.alert('Error', 'No se pudo guardar la información. Inténtalo de nuevo.');
    }
  };


  return (
    <LinearGradient
      colors={Colors.gradient.blue}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.stepIndicator}>Paso 4 de 5</Text>
              <Text style={styles.title}>Tu Instagram</Text>
              <Text style={styles.subtitle}>
                Comparte tu Instagram para verificación de seguridad (obligatorio)
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>¿Cuál es tu usuario de Instagram?</Text>
                <View style={styles.instagramInputContainer}>
                  <Text style={styles.instagramPrefix}>@</Text>
                  <TextInput
                    style={styles.instagramInput}
                    value={instagram}
                    onChangeText={setInstagram}
                    placeholder="tu_usuario"
                    placeholderTextColor={Colors.textSecondary}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="off"
                  />
                </View>
                <Text style={styles.helpText}>
                  Solo necesitas escribir tu usuario, sin el @
                </Text>
              </View>

              <View style={styles.benefitsContainer}>
                <Text style={styles.benefitsTitle}>¿Por qué es obligatorio?</Text>
                
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitEmoji}>🔒</Text>
                  <Text style={styles.benefitText}>Verificación de identidad para mayor seguridad</Text>
                </View>
                
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitEmoji}>👥</Text>
                  <Text style={styles.benefitText}>Garantiza que los usuarios son personas reales</Text>
                </View>
                
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitEmoji}>📸</Text>
                  <Text style={styles.benefitText}>Muestra más de tu personalidad</Text>
                </View>
              </View>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.nextButton, (!instagram.trim() || saving) && styles.nextButtonDisabled]}
                onPress={handleNext}
                disabled={!instagram.trim() || saving}
              >
                <Text style={styles.nextButtonText}>
                  {saving ? 'Guardando...' : 'Continuar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    paddingTop: 40,
    alignItems: 'center',
  },
  stepIndicator: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.8,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.95,
    lineHeight: 22,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  inputGroup: {
    marginBottom: 32,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 12,
  },
  instagramInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
  },
  instagramPrefix: {
    fontSize: 16,
    color: '#1E3A8A',
    fontWeight: '700',
    marginRight: 4,
  },
  instagramInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1E3A8A',
  },
  helpText: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.8,
    marginTop: 8,
    textAlign: 'center',
  },
  benefitsContainer: {
    marginTop: 20,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 16,
    textAlign: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  benefitEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  benefitText: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
    flex: 1,
  },
  footer: {
    paddingBottom: 40,
    gap: 12,
  },
  nextButton: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    opacity: 1,
  },
  nextButtonText: {
    color: '#1E3A8A',
    fontSize: 16,
    fontWeight: '700',
  },
});
