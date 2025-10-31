/**
 * LocationAutocomplete.jsx
 * 
 * Componente de autocompletado de ubicación usando Google Places
 */

import { GOOGLE_PLACES_API_KEY } from '@/src/config/googlePlaces';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

export const LocationAutocomplete = ({ 
  value, 
  onChangeText, 
  placeholder = "Ubicación...",
  onLocationSelect 
}) => {
  // Si no hay API key configurada, mostrar un TextInput normal
  if (GOOGLE_PLACES_API_KEY === 'YOUR_GOOGLE_PLACES_API_KEY') {
    return (
      <TextInput
        style={styles.textInput}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#888"
      />
    );
  }

  return (
    <GooglePlacesAutocomplete
      placeholder={placeholder}
      onPress={(data, details = null) => {
        // 'details' is provided when fetchDetails = true
        const location = {
          address: data.description,
          latitude: details?.geometry?.location?.lat,
          longitude: details?.geometry?.location?.lng,
          placeId: data.place_id
        };
        
        onChangeText(data.description);
        if (onLocationSelect) {
          onLocationSelect(location);
        }
      }}
      query={{
        key: GOOGLE_PLACES_API_KEY,
        language: 'es',
        components: 'country:co', // Restringir a Colombia
        types: 'establishment', // Solo lugares establecidos
      }}
      fetchDetails={true}
      predefinedPlaces={[]} // Agregar array vacío para evitar error
      styles={{
        container: styles.container,
        textInputContainer: styles.textInputContainer,
        textInput: styles.textInput,
        predefinedPlacesDescription: styles.predefinedPlacesDescription,
        listView: styles.listView,
        row: styles.row,
        description: styles.description,
        poweredContainer: styles.poweredContainer,
      }}
      listViewDisplayed="auto"
      renderRow={(data) => (
        <View style={styles.row}>
          <Text style={styles.description}>{data.description}</Text>
        </View>
      )}
      textInputProps={{
        value: value,
        onChangeText: onChangeText,
        placeholderTextColor: '#888',
      }}
      enablePoweredByContainer={false}
      debounce={300}
      minLength={2}
      nearbyPlacesAPI="GooglePlacesSearch"
      GooglePlacesSearchQuery={{
        rankby: 'distance',
        type: 'establishment',
      }}
      GooglePlacesDetailsQuery={{
        fields: 'geometry,formatted_address,place_id,name',
      }}
      filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']}
      enableHighAccuracyLocation={true}
      timeout={20000}
      onFail={(error) => console.log('Google Places Error:', error)}
      onNotFound={() => console.log('No results found')}
      suppressDefaultStyles={false}
      keepResultsAfterBlur={false}
      enablePoweredByContainer={false}
      listEmptyComponent={() => null}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  textInputContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: '#1a202c',
    backgroundColor: '#fff',
  },
  predefinedPlacesDescription: {
    color: '#1fa5fa',
  },
  listView: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxHeight: 200,
  },
  row: {
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  description: {
    fontSize: 14,
    color: '#1a202c',
  },
  poweredContainer: {
    display: 'none',
  },
});
