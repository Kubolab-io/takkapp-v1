/**
 * useLocation.ts
 * 
 * Hook personalizado para manejar ubicación con Google Places API
 */

import { GOOGLE_PLACES_API_KEY } from '@/src/config/googlePlaces';
import * as Location from 'expo-location';
import { useState } from 'react';
import { Alert, Linking } from 'react-native';

export interface LocationData {
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  city?: string;
  country?: string;
  formattedAddress?: string;
}

export const useLocation = () => {
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);

  // Solicitar permisos de ubicación
  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permisos de ubicación',
          'Necesitamos acceso a tu ubicación para conectarte con personas cerca de ti. Puedes cambiar esto en la configuración de tu dispositivo.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Configuración', onPress: () => Linking.openSettings() }
          ]
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error solicitando permisos de ubicación:', error);
      return false;
    }
  };

  // Obtener ubicación actual del usuario usando expo-location
  const getCurrentLocation = async (): Promise<LocationData | null> => {
    setLoading(true);
    
    try {
      console.log('🔍 Iniciando obtención de ubicación actual...');
      
      // Verificar permisos
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        console.log('❌ Permisos denegados');
        return null;
      }

      console.log('✅ Permisos otorgados, obteniendo coordenadas...');

      // Obtener ubicación actual con expo-location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 15000,
        maximumAge: 60000
      });

      const { latitude, longitude } = location.coords;
      console.log('📍 Coordenadas obtenidas:', { latitude, longitude });

      // Usar reverse geocoding de expo-location (más confiable)
      console.log('🔄 Obteniendo dirección con expo-location...');
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      if (reverseGeocode && reverseGeocode.length > 0) {
        const addressInfo = reverseGeocode[0];
        console.log('✅ Dirección obtenida con expo-location:', addressInfo);
        
        // Construir dirección legible
        const addressParts = [];
        if (addressInfo.street) addressParts.push(addressInfo.street);
        if (addressInfo.city) addressParts.push(addressInfo.city);
        if (addressInfo.region) addressParts.push(addressInfo.region);
        if (addressInfo.country) addressParts.push(addressInfo.country);
        
        const formattedAddress = addressParts.join(', ') || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        
        const locationData: LocationData = {
          address: formattedAddress,
          coordinates: { latitude, longitude },
          city: addressInfo.city || 'Ciudad no detectada',
          country: addressInfo.country || 'País no detectado',
          formattedAddress: formattedAddress
        };
        
        setCurrentLocation(locationData);
        return locationData;
      } else {
        console.log('❌ No se pudo obtener dirección con expo-location');
        // Fallback: usar coordenadas como dirección
        const fallbackAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        const locationData: LocationData = {
          address: fallbackAddress,
          coordinates: { latitude, longitude },
          city: 'Ubicación detectada',
          country: 'Coordenadas GPS',
          formattedAddress: fallbackAddress
        };
        
        setCurrentLocation(locationData);
        return locationData;
      }
    } catch (error) {
      console.error('❌ Error obteniendo ubicación actual:', error);
      Alert.alert('Error', 'No se pudo obtener tu ubicación actual. Inténtalo de nuevo.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Convertir coordenadas a dirección usando Google Places API
  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      console.log('🌐 Consultando Google Geocoding API...');
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_PLACES_API_KEY}&language=es`;
      console.log('URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('📡 Respuesta de Google API:', data.status, data.results?.length || 0, 'resultados');
      
      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const addressComponents = result.address_components;
        
        let city = '';
        let country = '';
        
        // Extraer ciudad y país de los componentes de dirección
        addressComponents.forEach((component: any) => {
          if (component.types.includes('locality') || component.types.includes('administrative_area_level_2')) {
            city = component.long_name;
          }
          if (component.types.includes('country')) {
            country = component.long_name;
          }
        });

        const addressData = {
          formattedAddress: result.formatted_address,
          city: city || 'Ciudad no encontrada',
          country: country || 'País no encontrado'
        };
        
        console.log('✅ Dirección procesada:', addressData);
        return addressData;
      } else {
        console.log('❌ Error en Google API:', data.status, data.error_message || 'Sin mensaje de error');
        return null;
      }
    } catch (error) {
      console.error('❌ Error obteniendo dirección:', error);
      return null;
    }
  };

  // Buscar ubicaciones usando Google Places API
  const searchLocations = async (query: string): Promise<LocationData[]> => {
    if (!query.trim()) return [];

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${GOOGLE_PLACES_API_KEY}&language=es&types=(cities)`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.predictions.length > 0) {
        const locations: LocationData[] = [];
        
        // Procesar las primeras 5 sugerencias
        for (const prediction of data.predictions.slice(0, 5)) {
          try {
            // Obtener detalles del lugar para conseguir coordenadas
            const detailsResponse = await fetch(
              `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id}&key=${GOOGLE_PLACES_API_KEY}&fields=geometry,formatted_address,address_components&language=es`
            );
            
            const detailsData = await detailsResponse.json();
            
            if (detailsData.status === 'OK' && detailsData.result) {
              const result = detailsData.result;
              const { lat, lng } = result.geometry.location;
              
              let city = '';
              let country = '';
              
              // Extraer ciudad y país
              result.address_components.forEach((component: any) => {
                if (component.types.includes('locality') || component.types.includes('administrative_area_level_2')) {
                  city = component.long_name;
                }
                if (component.types.includes('country')) {
                  country = component.long_name;
                }
              });

              locations.push({
                address: prediction.description,
                coordinates: { latitude: lat, longitude: lng },
                city: city || prediction.structured_formatting?.main_text || '',
                country: country || prediction.structured_formatting?.secondary_text || '',
                formattedAddress: result.formatted_address
              });
            }
          } catch (error) {
            console.error('Error obteniendo detalles del lugar:', error);
          }
        }
        
        return locations;
      }
      
      return [];
    } catch (error) {
      console.error('Error buscando ubicaciones:', error);
      return [];
    }
  };

  // Función simplificada para obtener ubicación actual (solo expo-location)
  const getSimpleCurrentLocation = async (): Promise<LocationData | null> => {
    setLoading(true);
    
    try {
      console.log('🔍 Obteniendo ubicación simple...');
      
      // Verificar permisos
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        console.log('❌ Permisos denegados');
        return null;
      }

      // Obtener ubicación actual
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000,
        maximumAge: 30000
      });

      const { latitude, longitude } = location.coords;
      console.log('📍 Coordenadas obtenidas:', { latitude, longitude });

      // Intentar obtener dirección con expo-location
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude,
          longitude
        });

        if (reverseGeocode && reverseGeocode.length > 0) {
          const addressInfo = reverseGeocode[0];
          console.log('✅ Dirección obtenida:', addressInfo);
          
          // Construir dirección legible
          const addressParts = [];
          if (addressInfo.street) addressParts.push(addressInfo.street);
          if (addressInfo.city) addressParts.push(addressInfo.city);
          if (addressInfo.region) addressParts.push(addressInfo.region);
          if (addressInfo.country) addressParts.push(addressInfo.country);
          
          const formattedAddress = addressParts.join(', ') || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          
          const locationData: LocationData = {
            address: formattedAddress,
            coordinates: { latitude, longitude },
            city: addressInfo.city || 'Ciudad detectada',
            country: addressInfo.country || 'País detectado',
            formattedAddress: formattedAddress
          };
          
          // NO actualizar el estado aquí para evitar bucles infinitos
          // setCurrentLocation(locationData);
          return locationData;
        }
      } catch (geocodeError) {
        console.log('⚠️ Error en reverse geocoding, usando coordenadas:', geocodeError);
      }

      // Fallback: usar coordenadas como dirección
      const fallbackAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      const locationData: LocationData = {
        address: fallbackAddress,
        coordinates: { latitude, longitude },
        city: 'Ubicación detectada',
        country: 'Coordenadas GPS',
        formattedAddress: fallbackAddress
      };
      
      console.log('✅ Usando coordenadas como fallback:', locationData);
      // NO actualizar el estado aquí para evitar bucles infinitos
      // setCurrentLocation(locationData);
      return locationData;
      
    } catch (error) {
      console.error('❌ Error obteniendo ubicación:', error);
      Alert.alert('Error', 'No se pudo obtener tu ubicación actual. Verifica que tengas GPS habilitado.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    currentLocation,
    getCurrentLocation,
    getSimpleCurrentLocation,
    searchLocations,
    requestLocationPermission
  };
};
