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

export default function OnboardingBasica() {
  const { onboardingData, saveOnboardingData, saving } = useOnboarding();
  const [displayName, setDisplayName] = useState(onboardingData.displayName || '');
  const [age, setAge] = useState(onboardingData.age || '');

  const handleNext = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu nombre');
      return;
    }

    if (!age.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu edad');
      return;
    }

    const ageNumber = parseInt(age);
    if (isNaN(ageNumber) || ageNumber < 13 || ageNumber > 100) {
      Alert.alert('Error', 'Por favor ingresa una edad válida (13-100 años)');
      return;
    }

    const success = await saveOnboardingData({
      displayName: displayName.trim(),
      age: ageNumber.toString()
    });

    if (success) {
      router.push('/onboarding/ubicacion');
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
              <Text style={styles.stepIndicator}>Paso 1 de 4</Text>
              <Text style={styles.title}>Información Básica</Text>
              <Text style={styles.subtitle}>
                Cuéntanos un poco sobre ti para personalizar tu experiencia
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>¿Cuál es tu nombre?</Text>
                <TextInput
                  style={styles.input}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Tu nombre completo"
                  placeholderTextColor={Colors.textSecondary}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>¿Cuántos años tienes?</Text>
                <TextInput
                  style={styles.input}
                  value={age}
                  onChangeText={setAge}
                  placeholder="Tu edad"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.nextButton, (!displayName.trim() || !age.trim() || saving) && styles.nextButtonDisabled]}
                onPress={handleNext}
                disabled={!displayName.trim() || !age.trim() || saving}
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
    paddingVertical: 40,
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
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E3A8A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  footer: {
    paddingBottom: 40,
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
