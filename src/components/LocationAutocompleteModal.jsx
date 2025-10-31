/**
 * LocationAutocompleteModal.jsx
 * 
 * Componente de autocompletado de ubicación usando Google Places API (Nueva versión)
 * Evita el problema de VirtualizedLists anidadas
 */

import { GOOGLE_PLACES_API_KEY } from '@/src/config/googlePlaces';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export const LocationAutocompleteModal = ({ 
  value, 
  onChangeText, 
  placeholder = "Ubicación...",
  onLocationSelect 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalSearchText, setModalSearchText] = useState('');

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

  const searchPlaces = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowModal(false);
      return;
    }

    setLoading(true);
    try {
      // Nueva API Places - Text Search (New)
      const response = await fetch(
        'https://places.googleapis.com/v1/places:searchText',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location'
          },
          body: JSON.stringify({
            textQuery: query,
            languageCode: 'es',
            regionCode: 'CO',
            maxResultCount: 5,
            locationRestriction: {
              rectangle: {
                low: {
                  latitude: -4.2,
                  longitude: -81.8
                },
                high: {
                  latitude: 13.4,
                  longitude: -66.9
                }
              }
            }
          })
        }
      );

      const data = await response.json();
      
      console.log('Google Places response:', data);
      
      if (data.places && data.places.length > 0) {
        // Convertir el formato de la nueva API al formato esperado
        const formattedSuggestions = data.places.map(place => ({
          place_id: place.id,
          description: place.formattedAddress || place.displayName?.text,
          name: place.displayName?.text,
          formatted_address: place.formattedAddress,
          location: place.location
        }));
        
        setSuggestions(formattedSuggestions);
        setShowModal(true);
      } else {
        setSuggestions([]);
        setShowModal(false);
      }
    } catch (error) {
      console.log('Error searching places:', error);
      setSuggestions([]);
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  const searchPlacesFromModal = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      // Nueva API Places - Text Search (New)
      const response = await fetch(
        'https://places.googleapis.com/v1/places:searchText',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location'
          },
          body: JSON.stringify({
            textQuery: query,
            languageCode: 'es',
            regionCode: 'CO',
            maxResultCount: 5,
            locationRestriction: {
              rectangle: {
                low: {
                  latitude: -4.2,
                  longitude: -81.8
                },
                high: {
                  latitude: 13.4,
                  longitude: -66.9
                }
              }
            }
          })
        }
      );

      const data = await response.json();
      
      console.log('Google Places response (modal):', data);
      
      if (data.places && data.places.length > 0) {
        // Convertir el formato de la nueva API al formato esperado
        const formattedSuggestions = data.places.map(place => ({
          place_id: place.id,
          description: place.formattedAddress || place.displayName?.text,
          name: place.displayName?.text,
          formatted_address: place.formattedAddress,
          location: place.location
        }));
        
        setSuggestions(formattedSuggestions);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.log('Error searching places (modal):', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const selectPlace = async (place) => {
    try {
      // Con la nueva API, ya tenemos toda la información necesaria
      // No necesitamos hacer otra llamada para obtener detalles
      const location = {
        address: place.formatted_address || place.description,
        latitude: place.location?.latitude,
        longitude: place.location?.longitude,
        placeId: place.place_id,
        name: place.name
      };
      
      onChangeText(place.formatted_address || place.description);
      if (onLocationSelect) {
        onLocationSelect(location);
      }
      
      // Cerrar el modal y limpiar las sugerencias
      setShowModal(false);
      setSuggestions([]);
      setModalSearchText('');
    } catch (error) {
      console.log('Error selecting place:', error);
      // Aún así cerrar el modal en caso de error
      setShowModal(false);
      setSuggestions([]);
      setModalSearchText('');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textInput}
        placeholder={placeholder}
        value={value}
        onChangeText={(text) => {
          onChangeText(text);
          setModalSearchText(text);
          if (text.length >= 2) {
            searchPlaces(text);
          }
        }}
        placeholderTextColor="#888"
        onFocus={() => {
          setModalSearchText(value);
          if (value.length >= 2) {
            searchPlaces(value);
          }
        }}
      />
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#666" />
        </View>
      )}

      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.dragIndicator} />
              <Text style={styles.modalTitle}>Seleccionar ubicación</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                  setShowModal(false);
                  setSuggestions([]);
                  setModalSearchText('');
                }}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Buscar ubicación..."
                value={modalSearchText}
                onChangeText={(text) => {
                  setModalSearchText(text);
                  searchPlacesFromModal(text);
                }}
                placeholderTextColor="#888"
                autoFocus={true}
              />
            </View>
            
            {suggestions.length > 0 ? (
              <FlatList
                data={suggestions}
                keyExtractor={(item) => item.place_id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.suggestionItem}
                    onPress={() => selectPlace(item)}
                  >
                    <Text style={styles.suggestionText}>{item.description}</Text>
                  </TouchableOpacity>
                )}
                style={styles.suggestionsList}
                removeClippedSubviews={true}
                maxToRenderPerBatch={5}
                windowSize={5}
                initialNumToRender={5}
              />
            ) : (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>
                  {loading ? 'Buscando...' : 'No se encontraron resultados'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 100,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxHeight: '50%',
    marginHorizontal: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    position: 'absolute',
    top: 8,
    left: '50%',
    marginLeft: -20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  suggestionsList: {
    maxHeight: 400,
  },
  suggestionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalSearchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
});