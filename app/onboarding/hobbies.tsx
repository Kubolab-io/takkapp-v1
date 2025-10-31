import { Colors } from '@/src/constants/Colors';
import { useOnboarding } from '@/src/features/onboarding/useOnboarding';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const HOBBY_CATEGORIES = {
  'Deportes': ['Fútbol', 'Básquetbol', 'Tenis', 'Natación', 'Ciclismo', 'Running', 'Gimnasio', 'Yoga', 'Pilates', 'Boxeo', 'Artes marciales', 'Escalada'],
  'Música': ['Tocar instrumentos', 'Cantar', 'Conciertos', 'DJ', 'Producción musical', 'Rock', 'Pop', 'Reggaetón', 'Salsa', 'Jazz', 'Clásica', 'Electrónica'],
  'Arte y Cultura': ['Pintura', 'Dibujo', 'Fotografía', 'Escultura', 'Teatro', 'Danza', 'Museos', 'Galerías', 'Literatura', 'Poesía', 'Cine', 'Series'],
  'Tecnología': ['Programación', 'Videojuegos', 'Realidad virtual', 'Inteligencia artificial', 'Robótica', 'Criptomonedas', 'Streaming', 'Podcasts', 'YouTube', 'TikTok', 'Redes sociales', 'Blogging'],
  'Gastronomía': ['Cocinar', 'Repostería', 'Vinos', 'Cerveza artesanal', 'Café', 'Restaurantes', 'Comida internacional', 'Vegetariano', 'Vegano', 'Food trucks', 'Chef', 'Mixología'],
  'Naturaleza': ['Senderismo', 'Camping', 'Montañismo', 'Surf', 'Buceo', 'Pesca', 'Jardinería', 'Observación de aves', 'Astronomía', 'Sostenibilidad', 'Meditación', 'Mindfulness'],
  'Viajes': ['Turismo', 'Backpacking', 'Lujo', 'Aventura', 'Cultural', 'Gastronómico', 'Fotografía de viajes', 'Idiomas', 'Intercambios', 'Voluntariado', 'Cruceros', 'Road trips'],
  'Social': ['Networking', 'Eventos', 'Fiestas', 'Bares', 'Clubes', 'Meetups', 'Voluntariado', 'Comunidad', 'Amistades', 'Relaciones', 'Mentoring', 'Coaching']
};

export default function OnboardingHobbies() {
  const { onboardingData, saveOnboardingData, saving } = useOnboarding();
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>(onboardingData.hobbies || []);

  const toggleHobby = (hobby: string) => {
    setSelectedHobbies(prev => {
      if (prev.includes(hobby)) {
        return prev.filter(h => h !== hobby);
      } else {
        if (prev.length >= 10) {
          Alert.alert('Límite alcanzado', 'Puedes seleccionar máximo 10 hobbies');
          return prev;
        }
        return [...prev, hobby];
      }
    });
  };

  const handleNext = async () => {
    if (selectedHobbies.length === 0) {
      Alert.alert('Error', 'Por favor selecciona al menos un hobby o interés');
      return;
    }

    const success = await saveOnboardingData({
      hobbies: selectedHobbies
    });

    if (success) {
      router.push('/onboarding/completado');
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
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.stepIndicator}>Paso 5 de 5</Text>
            <Text style={styles.title}>Tus Intereses</Text>
            <Text style={styles.subtitle}>
              Selecciona tus hobbies e intereses para conectarte con personas afines
            </Text>
            <Text style={styles.counter}>
              {selectedHobbies.length}/10 seleccionados
            </Text>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {Object.entries(HOBBY_CATEGORIES).map(([category, hobbies]) => (
              <View key={category} style={styles.categoryContainer}>
                <Text style={styles.categoryTitle}>{category}</Text>
                <View style={styles.hobbiesGrid}>
                  {hobbies.map((hobby) => (
                    <TouchableOpacity
                      key={hobby}
                      style={[
                        styles.hobbyChip,
                        selectedHobbies.includes(hobby) && styles.hobbyChipSelected
                      ]}
                      onPress={() => toggleHobby(hobby)}
                    >
                      <Text style={[
                        styles.hobbyText,
                        selectedHobbies.includes(hobby) && styles.hobbyTextSelected
                      ]}>
                        {hobby}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.nextButton, (selectedHobbies.length === 0 || saving) && styles.nextButtonDisabled]}
              onPress={handleNext}
              disabled={selectedHobbies.length === 0 || saving}
            >
              <Text style={styles.nextButtonText}>
                {saving ? 'Guardando...' : 'Finalizar'}
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
  },
  header: {
    paddingTop: 40,
    alignItems: 'center',
    marginBottom: 24,
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
    marginBottom: 8,
  },
  counter: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
    marginBottom: 24,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 12,
  },
  hobbiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hobbyChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  hobbyChipSelected: {
    backgroundColor: Colors.white,
    borderColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  hobbyText: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '500',
  },
  hobbyTextSelected: {
    color: '#1E3A8A',
    fontWeight: '700',
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
