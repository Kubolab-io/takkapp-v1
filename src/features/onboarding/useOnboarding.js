import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../../../firebaseconfig';
import { useAuth } from '../auth/useAuth';

export const useOnboarding = () => {
  const { user } = useAuth();
  const [onboardingData, setOnboardingData] = useState({
    displayName: '',
    age: '',
    location: '',
    locationData: null, // Datos completos de ubicación con coordenadas
    description: '',
    instagram: '',
    hobbies: []
  });
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Verificar si el onboarding está completo
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user || !user.uid) {
        setLoading(false);
        return;
      }

      try {
        console.log("🔍 Verificando onboarding para usuario:", user.uid);
        const userDoc = await getDoc(doc(db, 'userProfiles', user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const isComplete = userData.onboardingComplete === true;
          
          setIsOnboardingComplete(isComplete);
          
          if (!isComplete) {
            // Cargar datos existentes si los hay
            setOnboardingData({
              displayName: userData.displayName || user.displayName || '',
              age: userData.age || '',
              location: userData.location || '',
              locationData: userData.locationData || null,
              description: userData.description || '',
              instagram: userData.instagram || '',
              hobbies: userData.hobbies || []
            });
          }
        } else {
          // Usuario nuevo, inicializar con datos básicos
          setOnboardingData(prev => ({
            ...prev,
            displayName: user.displayName || user.email?.split('@')[0] || ''
          }));
        }
      } catch (error) {
        console.error('Error verificando onboarding:', error);
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user?.uid]);

  // Actualizar datos del onboarding
  const updateOnboardingData = (newData) => {
    setOnboardingData(prev => ({ ...prev, ...newData }));
  };

  // Guardar datos del onboarding
  const saveOnboardingData = async (stepData) => {
    if (!user) return false;

    setSaving(true);
    try {
      const updatedData = { ...onboardingData, ...stepData };
      
      await setDoc(doc(db, 'userProfiles', user.uid), {
        ...updatedData,
        email: user.email,
        photoURL: user.photoURL,
        onboardingComplete: false, // Se marcará como completo al final
        createdAt: new Date(),
        updatedAt: new Date()
      }, { merge: true });

      setOnboardingData(updatedData);
      return true;
    } catch (error) {
      console.error('Error guardando onboarding:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Completar onboarding
  const completeOnboarding = async () => {
    if (!user) return false;

    setSaving(true);
    try {
      // Actualizar estado local inmediatamente
      setIsOnboardingComplete(true);
      
      const now = new Date();
      // Usar setDoc con merge para asegurar que el documento existe
      await setDoc(doc(db, 'userProfiles', user.uid), {
        onboardingComplete: true,
        onboardingCompletedAt: now, // Timestamp de cuándo se completó el onboarding
        updatedAt: now
      }, { merge: true });

      console.log('✅ Onboarding completado exitosamente');
      console.log('✅ Estado local actualizado inmediatamente');
      console.log('⏰ Usuario podrá buscar matches en 30 minutos:', new Date(now.getTime() + 30 * 60 * 1000));
      return true;
    } catch (error) {
      console.error('❌ Error completando onboarding:', error);
      // Revertir estado local si hay error
      setIsOnboardingComplete(false);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    onboardingData,
    updateOnboardingData,
    saveOnboardingData,
    completeOnboarding,
    isOnboardingComplete,
    loading,
    saving
  };
};
