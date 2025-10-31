/**
 * usePhotoUpload.ts
 * 
 * Hook personalizado para manejar la subida de fotos a Firebase Storage
 */

import { db, storage } from '@/firebaseconfig';
import * as ImagePicker from 'expo-image-picker';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useState } from 'react';
import { Alert } from 'react-native';

interface UsePhotoUploadProps {
  userId: string;
  onPhotoUploaded?: (photoUrl: string) => void;
}

export const usePhotoUpload = ({ userId, onPhotoUploaded }: UsePhotoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  
  // Validar parámetros de entrada
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    return {
      uploading: false,
      selectAndUploadPhoto: async () => {
        return Promise.resolve();
      },
      removePhoto: async () => {
        return Promise.resolve();
      },
      requestPermissions: async () => false
    };
  }

  // Solicitar permisos de la galería
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permisos necesarios',
        'Necesitamos acceso a tu galería para seleccionar fotos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  // Subir foto a Firebase Storage
  const uploadPhotoToStorage = async (uri: string, photoIndex: number) => {
    try {
      // Convertir URI a blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Crear referencia en Storage
      const photoRef = ref(storage, `user-photos/${userId}/photo-${photoIndex}-${Date.now()}.jpg`);

      // Subir foto
      const snapshot = await uploadBytes(photoRef, blob);
      
      // Obtener URL de descarga
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Error subiendo foto a Storage:', error);
      throw error;
    }
  };

  // Actualizar perfil del usuario con nueva foto
  const updateUserProfile = async (photoUrl: string, photoIndex: number) => {
    try {
      // Validar parámetros antes de proceder
      if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        throw new Error('userId no válido para actualizar perfil');
      }
      
      if (!photoUrl || typeof photoUrl !== 'string') {
        throw new Error('photoUrl no válido');
      }
      
      if (typeof photoIndex !== 'number' || photoIndex < 0 || photoIndex > 2) {
        throw new Error('photoIndex debe ser un número entre 0 y 2');
      }
      
      
      const userRef = doc(db, 'users', userId);
      
      // Crear un array completamente limpio de 3 elementos
      const photos = ['', '', '']; // Array inicial con 3 strings vacíos
      
      // Obtener fotos existentes del usuario
      const currentPhotos = await getUserPhotos();
      
      // Copiar fotos existentes válidas
      if (Array.isArray(currentPhotos)) {
        currentPhotos.forEach((photo, index) => {
          if (photo && typeof photo === 'string' && photo.trim() !== '' && index < 3) {
            photos[index] = photo;
          }
        });
      }
      
      // Agregar la nueva foto en la posición especificada
      if (photoIndex >= 0 && photoIndex < 3) {
        photos[photoIndex] = photoUrl;
      }
      
      
      // Verificar que no hay valores undefined
      const hasUndefined = photos.some(photo => photo === undefined || photo === null);
      if (hasUndefined) {
        throw new Error('Se detectó un valor undefined en el array de fotos');
      }
      
      // Actualizar o crear el documento con merge: true
      await setDoc(userRef, {
        photos: photos
      }, { merge: true });

      return photos;
    } catch (error) {
      console.error('❌ Error actualizando perfil del usuario:', error);
      throw error;
    }
  };

  // Obtener fotos actuales del usuario
  const getUserPhotos = async (): Promise<string[]> => {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const photos = userData.photos;
        
        // Asegurar que photos es un array válido
        if (Array.isArray(photos)) {
          return photos.filter(photo => photo && typeof photo === 'string');
        }
      }
      
      // Retornar array vacío si no hay fotos
      return [];
    } catch (error) {
      console.error('Error obteniendo fotos del usuario:', error);
      return [];
    }
  };

  // Función principal para seleccionar y subir foto
  const selectAndUploadPhoto = async (photoIndex: number) => {
    try {
      // Validar que tenemos un userId válido
      if (!userId || typeof userId !== 'string' || userId.trim() === '' || userId === 'dummy-user-id') {
        console.error('❌ selectAndUploadPhoto: userId no válido:', userId);
        throw new Error('userId no válido');
      }
      
      // Validar photoIndex
      if (typeof photoIndex !== 'number' || photoIndex < 0 || photoIndex > 2) {
        console.error('❌ selectAndUploadPhoto: photoIndex no válido:', photoIndex);
        throw new Error('photoIndex debe ser un número entre 0 y 2');
      }

      // Verificar permisos
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      setUploading(true);

      // Configurar opciones del picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Foto cuadrada
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const selectedPhoto = result.assets[0];
        
        // Subir foto a Storage
        const photoUrl = await uploadPhotoToStorage(selectedPhoto.uri, photoIndex);
        
        // Actualizar perfil del usuario
        const updatedPhotos = await updateUserProfile(photoUrl, photoIndex);
        
        // Notificar que la foto fue subida
        if (onPhotoUploaded) {
          onPhotoUploaded(photoUrl);
        }

        Alert.alert(
          '¡Foto subida!',
          'Tu foto se ha actualizado correctamente.',
          [{ text: 'OK' }]
        );

        return updatedPhotos;
      }
    } catch (error) {
      console.error('Error en selectAndUploadPhoto:', error);
      Alert.alert(
        'Error',
        'No se pudo subir la foto. Por favor, inténtalo de nuevo.',
        [{ text: 'OK' }]
      );
    } finally {
      setUploading(false);
    }
  };

  // Función para eliminar foto
  const removePhoto = async (photoIndex: number) => {
    try {
      setUploading(true);

      const userRef = doc(db, 'users', userId);
      
      // Crear un array completamente limpio de 3 elementos
      const photos = ['', '', '']; // Array inicial con 3 strings vacíos
      
      // Obtener fotos existentes del usuario
      const currentPhotos = await getUserPhotos();
      
      // Copiar fotos existentes válidas
      if (Array.isArray(currentPhotos)) {
        currentPhotos.forEach((photo, index) => {
          if (photo && typeof photo === 'string' && photo.trim() !== '' && index < 3) {
            photos[index] = photo;
          }
        });
      }
      
      // Vaciar la posición especificada
      if (photoIndex >= 0 && photoIndex < 3) {
        photos[photoIndex] = '';
      }


      // Actualizar o crear el documento con merge: true
      await setDoc(userRef, {
        photos: photos
      }, { merge: true });

      Alert.alert(
        'Foto eliminada',
        'La foto se ha eliminado correctamente.',
        [{ text: 'OK' }]
      );

      return photos;
    } catch (error) {
      console.error('❌ Error eliminando foto:', error);
      Alert.alert(
        'Error',
        'No se pudo eliminar la foto. Por favor, inténtalo de nuevo.',
        [{ text: 'OK' }]
      );
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    selectAndUploadPhoto,
    removePhoto,
    requestPermissions
  };
};
