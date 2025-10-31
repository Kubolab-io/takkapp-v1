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

const DESCRIPTION_EXAMPLES = [
  "Soy una persona apasionada por la música y los viajes. Me encanta conocer gente nueva y compartir experiencias únicas.",
  "Amante de la naturaleza y los deportes al aire libre. Siempre estoy buscando nuevas aventuras y personas con las que compartirlas.",
  "Estudiante de arte que disfruta de las conversaciones profundas y las actividades culturales. Me gusta conectar con personas creativas.",
  "Profesional en tecnología que busca equilibrar el trabajo con actividades sociales. Me gusta el cine, la buena comida y las charlas interesantes.",
  "Deportista que disfruta del fitness y la vida saludable. Busco personas con las que pueda entrenar y compartir un estilo de vida activo."
];

export default function OnboardingDescripcion() {
  const { onboardingData, saveOnboardingData, saving } = useOnboarding();
  const [description, setDescription] = useState(onboardingData.description || '');

  const handleNext = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Por favor escribe una descripción sobre ti');
      return;
    }

    if (description.trim().length < 20) {
      Alert.alert('Error', 'La descripción debe tener al menos 20 caracteres');
      return;
    }

    const success = await saveOnboardingData({
      description: description.trim()
    });

    if (success) {
      router.push('/onboarding/instagram');
    } else {
      Alert.alert('Error', 'No se pudo guardar la información. Inténtalo de nuevo.');
    }
  };

  const handleExampleSelect = (example: string) => {
    setDescription(example);
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
              <Text style={styles.stepIndicator}>Paso 3 de 5</Text>
              <Text style={styles.title}>Cuéntanos sobre ti</Text>
              <Text style={styles.subtitle}>
                Escribe una breve descripción que te represente. Esto ayudará a otros a conocerte mejor
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>¿Cómo te describirías?</Text>
                <TextInput
                  style={styles.textArea}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Escribe algo sobre ti, tus intereses, personalidad, lo que te gusta hacer..."
                  placeholderTextColor={Colors.textSecondary}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  maxLength={500}
                />
                <Text style={styles.characterCount}>
                  {description.length}/500 caracteres
                </Text>
              </View>

              <View style={styles.examplesContainer}>
                <Text style={styles.examplesTitle}>Ejemplos de descripciones:</Text>
                {DESCRIPTION_EXAMPLES.slice(0, 3).map((example, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.exampleItem}
                    onPress={() => handleExampleSelect(example)}
                  >
                    <Text style={styles.exampleText}>{example}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.nextButton, (!description.trim() || description.trim().length < 20 || saving) && styles.nextButtonDisabled]}
                onPress={handleNext}
                disabled={!description.trim() || description.trim().length < 20 || saving}
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
    marginBottom: 24,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 12,
  },
  textArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E3A8A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    minHeight: 120,
    maxHeight: 200,
  },
  characterCount: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.8,
    textAlign: 'right',
    marginTop: 4,
  },
  examplesContainer: {
    marginTop: 20,
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 12,
  },
  exampleItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  exampleText: {
    fontSize: 14,
    color: '#1E3A8A',
    lineHeight: 18,
    fontWeight: '500',
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
