import { Colors } from '@/src/constants/Colors';
import { useOnboarding } from '@/src/features/onboarding/useOnboarding';
import { LocationData, useLocation } from '@/src/hooks/useLocation';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const POPULAR_CITIES = [
  'Bogotá, Colombia',
  'Medellín, Colombia', 
  'Cali, Colombia',
  'Barranquilla, Colombia',
  'Cartagena, Colombia',
  'Bucaramanga, Colombia',
  'Pereira, Colombia',
  'Santa Marta, Colombia',
  'Ibagué, Colombia',
  'Pasto, Colombia',
  'Ciudad de México, México',
  'Guadalajara, México',
  'Monterrey, México',
  'Buenos Aires, Argentina',
  'Santiago, Chile',
  'Lima, Perú',
  'Quito, Ecuador',
  'Caracas, Venezuela',
  'Madrid, España',
  'Barcelona, España'
];

export default function OnboardingUbicacion() {
  const { onboardingData, saveOnboardingData, saving } = useOnboarding();
  const { getSimpleCurrentLocation, searchLocations, loading: locationLoading } = useLocation();
  const [location, setLocation] = useState(onboardingData.location || '');
  const [locationData, setLocationData] = useState(onboardingData.locationData || null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationData[]>([]);
  const [searching, setSearching] = useState(false);

  const handleNext = async () => {
    if (!location.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu ubicación');
      return;
    }

    const success = await saveOnboardingData({
      location: location.trim(),
      locationData: locationData
    });

    if (success) {
      router.push('/onboarding/descripcion');
    } else {
      Alert.alert('Error', 'No se pudo guardar la información. Inténtalo de nuevo.');
    }
  };

  const handleCitySelect = (city: string) => {
    setLocation(city);
    setShowSuggestions(false);
  };

  const handleLocationSelect = (selectedLocation: LocationData) => {
    setLocation(selectedLocation.address);
    setLocationData(selectedLocation);
    setShowSuggestions(false);
  };

  const handleUseCurrentLocation = async () => {
    const currentLocationData = await getSimpleCurrentLocation();
    if (currentLocationData) {
      setLocation(currentLocationData.address);
      setLocationData(currentLocationData);
      setShowSuggestions(false);
    }
  };

  const handleSearchLocation = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSearching(true);
    const searchResults = await searchLocations(query);
    setSuggestions(searchResults);
    setShowSuggestions(searchResults.length > 0);
    setSearching(false);
  };

  const filteredCities = POPULAR_CITIES.filter(city =>
    city.toLowerCase().includes(location.toLowerCase())
  );

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
              <Text style={styles.stepIndicator}>Paso 2 de 4</Text>
              <Text style={styles.title}>Tu Ubicación</Text>
              <Text style={styles.subtitle}>
                Esto nos ayuda a conectarte con personas cerca de ti
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>¿Dónde vives?</Text>
                
                {/* Botón para usar ubicación actual */}
                <TouchableOpacity 
                  style={styles.currentLocationButton}
                  onPress={handleUseCurrentLocation}
                  disabled={locationLoading}
                >
                  {locationLoading ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <Text style={styles.currentLocationIcon}>📍</Text>
                  )}
                  <Text style={styles.currentLocationText}>
                    {locationLoading ? 'Obteniendo ubicación...' : 'Usar mi ubicación actual'}
                  </Text>
                </TouchableOpacity>

                <TextInput
                  style={styles.input}
                  value={location}
                  onChangeText={(text) => {
                    setLocation(text);
                    handleSearchLocation(text);
                  }}
                  placeholder="Buscar ciudad o escribir manualmente"
                  placeholderTextColor={Colors.textSecondary}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
                
                {/* Sugerencias de Google Places */}
                {showSuggestions && suggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    <ScrollView style={styles.suggestionsList} showsVerticalScrollIndicator={false}>
                      {searching && (
                        <View style={styles.loadingSuggestion}>
                          <ActivityIndicator size="small" color={Colors.primary} />
                          <Text style={styles.loadingText}>Buscando...</Text>
                        </View>
                      )}
                      {suggestions.map((suggestion, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.suggestionItem}
                          onPress={() => handleLocationSelect(suggestion)}
                        >
                          <Text style={styles.suggestionText}>📍 {suggestion.address}</Text>
                          {suggestion.city && suggestion.country && (
                            <Text style={styles.suggestionSubtext}>
                              {suggestion.city}, {suggestion.country}
                            </Text>
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Sugerencias de ciudades populares (fallback) */}
                {showSuggestions && suggestions.length === 0 && filteredCities.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    <ScrollView style={styles.suggestionsList} showsVerticalScrollIndicator={false}>
                      {filteredCities.slice(0, 5).map((city, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.suggestionItem}
                          onPress={() => handleCitySelect(city)}
                        >
                          <Text style={styles.suggestionText}>📍 {city}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              <View style={styles.popularCities}>
                <Text style={styles.popularTitle}>Ciudades populares:</Text>
                <View style={styles.citiesGrid}>
                  {POPULAR_CITIES.slice(0, 6).map((city, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.cityChip}
                      onPress={() => handleCitySelect(city)}
                    >
                      <Text style={styles.cityChipText}>{city.split(',')[0]}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.nextButton, (!location.trim() || saving) && styles.nextButtonDisabled]}
                onPress={handleNext}
                disabled={!location.trim() || saving}
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
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E3A8A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    maxHeight: 200,
    zIndex: 1000,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30, 58, 138, 0.1)',
  },
  suggestionText: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '500',
  },
  popularCities: {
    marginTop: 20,
  },
  popularTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 12,
  },
  citiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cityChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cityChipText: {
    fontSize: 12,
    color: '#1E3A8A',
    fontWeight: '600',
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
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  currentLocationIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  currentLocationText: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '600',
  },
  loadingSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  suggestionSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
