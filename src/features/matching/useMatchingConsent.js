/**
 * useMatchingConsent.js
 * 
 * Hook personalizado que maneja el consentimiento del usuario para participar
 * en el sistema de matching diario.
 */

import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../../../firebaseconfig';

export const useMatchingConsent = (user) => {
  const [hasConsented, setHasConsented] = useState(false);
  const [isMatchingEnabled, setIsMatchingEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  // Escuchar cambios en tiempo real del estado de consentimiento
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    console.log('👂 Configurando listener para consentimiento de matching...');
    
    const unsubscribe = onSnapshot(doc(db, 'userProfiles', user.uid), (userDoc) => {
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('📄 Datos del perfil actualizados:', { 
          hasMatchingConsent: userData.hasMatchingConsent, 
          matchingEnabled: userData.matchingEnabled 
        });
        
        // Solo actualizar si los campos existen en el documento
        if (userData.hasMatchingConsent !== undefined) {
          setHasConsented(userData.hasMatchingConsent === true);
        } else {
          setHasConsented(false);
        }
        
        if (userData.matchingEnabled !== undefined) {
          setIsMatchingEnabled(userData.matchingEnabled === true);
        } else {
          setIsMatchingEnabled(false);
        }
      } else {
        // Usuario nuevo, no ha respondido al popup
        console.log('👤 Usuario nuevo, no ha respondido al popup');
        setHasConsented(false);
        setIsMatchingEnabled(false);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error en listener de consentimiento:', error);
      setHasConsented(false);
      setIsMatchingEnabled(false);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Dar consentimiento para matching
  const giveConsent = async () => {
    if (!user?.uid) return false;

    try {
      await setDoc(doc(db, 'userProfiles', user.uid), {
        hasMatchingConsent: true,
        matchingEnabled: true,
        matchingConsentDate: new Date(),
        updatedAt: new Date()
      }, { merge: true });

      setHasConsented(true);
      setIsMatchingEnabled(true);
      return true;
    } catch (error) {
      console.error('Error guardando consentimiento:', error);
      return false;
    }
  };

  // Toggle del estado de matching
  const toggleMatching = async () => {
    if (!user?.uid) return false;

    try {
      const newState = !isMatchingEnabled;
      await setDoc(doc(db, 'userProfiles', user.uid), {
        matchingEnabled: newState,
        updatedAt: new Date()
      }, { merge: true });

      setIsMatchingEnabled(newState);
      return true;
    } catch (error) {
      console.error('Error actualizando estado de matching:', error);
      return false;
    }
  };

  return {
    hasConsented,
    isMatchingEnabled,
    loading,
    giveConsent,
    toggleMatching
  };
};
