/**
 * useUserProfile.js
 * 
 * Hook personalizado que maneja el perfil completo del usuario:
 * - Información básica (nombre, email)
 * - Foto de perfil
 * - Descripción personal
 * - Usuario de Instagram
 * - Hobbies
 * - Funciones para actualizar perfil
 */

import { db, storage } from '@/firebaseconfig';
import * as ImagePicker from 'expo-image-picker';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useEffect, useState } from 'react';

export const useUserProfile = (user) => {
  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
    photoURL: '',
    description: '',
    instagram: '',
    hobbies: [],
    location: '',
    locationData: null,
    isPublic: true,
    hasMatchingConsent: false,
    matchingEnabled: false,
    role: 'user',
    onboardingComplete: false,
    createdAt: null,
    updatedAt: null
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Cargar perfil del usuario - Optimizado
  useEffect(() => {
    if (!user) {
      setProfile({
        displayName: '',
        email: '',
        photoURL: '',
        description: '',
        instagram: '',
        hobbies: [],
        location: '',
        locationData: null,
        isPublic: true,
        hasMatchingConsent: false,
        matchingEnabled: false,
        role: 'user',
        onboardingComplete: false,
        createdAt: null,
        updatedAt: null
      });
      setLoading(false);
      return;
    }

    // Solo cargar una vez cuando el usuario cambie
    if (user.uid) {
      loadUserProfile();
    }
  }, [user?.uid]); // Solo depende del UID, no del objeto completo

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      
      const userDoc = await getDoc(doc(db, 'userProfiles', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Crear perfil optimizado sin operaciones pesadas
        const profileData = {
          displayName: userData.displayName || user.displayName || '',
          email: userData.email || user.email || '',
          photoURL: userData.photoURL || user.photoURL || '',
          description: userData.description || '',
          instagram: userData.instagram || '',
          hobbies: userData.hobbies || [],
          location: userData.location || '',
          locationData: userData.locationData || null,
          isPublic: userData.isPublic !== undefined ? userData.isPublic : true,
          hasMatchingConsent: userData.hasMatchingConsent === true,
          matchingEnabled: userData.matchingEnabled === true,
          role: userData.role || 'user',
          onboardingComplete: userData.onboardingComplete === true,
          createdAt: userData.createdAt || null,
          updatedAt: userData.updatedAt || null
        };
        
        setProfile(profileData);
      } else {
        // Crear perfil por defecto simplificado
        const defaultProfile = {
          displayName: user.displayName || '',
          email: user.email || '',
          photoURL: user.photoURL || '',
          description: '',
          instagram: '',
          hobbies: [],
          location: '',
          locationData: null,
          isPublic: true,
          hasMatchingConsent: false,
          matchingEnabled: false,
          role: 'user',
          onboardingComplete: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Crear perfil de forma asíncrona sin bloquear
        setDoc(doc(db, 'userProfiles', user.uid), defaultProfile).catch(error => {
          console.error('Error creando perfil por defecto:', error);
        });
        
        setProfile(defaultProfile);
      }
    } catch (error) {
      console.error('❌ Error cargando perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar imagen de la galería
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0];
      }
      return null;
    } catch (error) {
      console.error('Error seleccionando imagen:', error);
      return null;
    }
  };

  // Subir foto de perfil - Optimizado
  const uploadProfilePhoto = async () => {
    try {
      const imageAsset = await pickImage();
      if (!imageAsset) return false;

      setUpdating(true);
      
      // Crear referencia única para la imagen
      const imageRef = ref(storage, `profilePhotos/${user.uid}_${Date.now()}.jpg`);
      
      // Convertir URI a blob
      const response = await fetch(imageAsset.uri);
      const blob = await response.blob();
      
      // Subir imagen de forma asíncrona
      uploadBytes(imageRef, blob).then(async () => {
        // Obtener URL de descarga
        const downloadURL = await getDownloadURL(imageRef);
        
        // Actualizar perfil con nueva foto
        updateProfile({ photoURL: downloadURL });
        
        // Eliminar foto anterior de forma asíncrona
        if (profile.photoURL && profile.photoURL !== downloadURL) {
          try {
            const oldImageRef = ref(storage, profile.photoURL);
            await deleteObject(oldImageRef);
          } catch (error) {
            console.log('No se pudo eliminar foto anterior:', error);
          }
        }
      }).catch(error => {
        console.error('Error subiendo imagen:', error);
      });
      
      return true;
    } catch (error) {
      console.error('Error subiendo foto:', error);
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Actualizar perfil - Optimizado
  const updateProfile = async (updates) => {
    try {
      setUpdating(true);
      
      // Actualizar solo los campos específicos, no todo el perfil
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };
      
      // Actualizar Firestore de forma asíncrona
      updateDoc(doc(db, 'userProfiles', user.uid), updateData).catch(error => {
        console.error('Error actualizando en Firestore:', error);
      });
      
      // Actualizar el estado local inmediatamente para UI responsiva
      setProfile(prevProfile => ({
        ...prevProfile,
        ...updates,
        updatedAt: new Date()
      }));
      
      return true;
    } catch (error) {
      console.error('❌ Error actualizando perfil:', error);
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Agregar hobby
  const addHobby = async (hobby) => {
    if (!hobby.trim() || profile.hobbies.includes(hobby.trim())) return false;
    
    const newHobbies = [...profile.hobbies, hobby.trim()];
    return await updateProfile({ hobbies: newHobbies });
  };

  // Eliminar hobby
  const removeHobby = async (hobbyToRemove) => {
    const newHobbies = profile.hobbies.filter(hobby => hobby !== hobbyToRemove);
    return await updateProfile({ hobbies: newHobbies });
  };

  // Actualizar descripción
  const updateDescription = async (description) => {
    return await updateProfile({ description });
  };

  // Actualizar Instagram
  const updateInstagram = async (instagram) => {
    return await updateProfile({ instagram });
  };

  return {
    profile,
    loading,
    updating,
    uploadProfilePhoto,
    updateProfile,
    addHobby,
    removeHobby,
    updateDescription,
    updateInstagram,
    loadUserProfile,
    refreshProfile: loadUserProfile // Alias para recargar el perfil
  };
}; 