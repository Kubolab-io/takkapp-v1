import { auth, db } from "@/firebaseconfig";
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
} from "firebase/auth";
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useUserRoles } from './useUserRoles';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  // Hook de roles de usuario
  const userRoles = useUserRoles(user);

  // Listener para estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Solo recargar si es necesario (evitar bucles infinitos)
        const refreshedUser = auth.currentUser;
        
        console.log("✅ Usuario autenticado:");
        console.log("  - Email:", refreshedUser?.email);
        console.log("  - DisplayName:", refreshedUser?.displayName);
        console.log("  - UID:", refreshedUser?.uid);
        
        // Verificar si el onboarding está completo
        try {
          const userDoc = await getDoc(doc(db, 'userProfiles', refreshedUser.uid));
          const userData = userDoc.exists() ? userDoc.data() : null;
          const isOnboardingComplete = userDoc.exists() && userData?.onboardingComplete === true;
          
          console.log("📋 Verificando onboarding para usuario:", refreshedUser.uid);
          console.log("📋 Documento existe:", userDoc.exists());
          console.log("📋 Datos del usuario:", userData);
          console.log("📋 onboardingComplete:", userData?.onboardingComplete);
          console.log("📋 Estado final:", isOnboardingComplete ? "Completo" : "Pendiente");
          
          setOnboardingComplete(isOnboardingComplete);
        } catch (error) {
          console.error("❌ Error verificando onboarding:", error);
          setOnboardingComplete(false);
        }
        
        setUser(refreshedUser);
        setShowAuthModal(false);
        
        // Pequeño delay para asegurar que el estado se propague correctamente
        setTimeout(() => {
          console.log("✅ Estado de autenticación actualizado completamente");
        }, 100);
      } else {
        console.log("❌ No hay usuario autenticado");
        setUser(null);
        setOnboardingComplete(false);
        setShowAuthModal(true);
      }
      setInitialLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listener en tiempo real para cambios en el perfil del usuario
  useEffect(() => {
    if (!user?.uid) return;

    console.log("👂 Configurando listener para perfil del usuario:", user.uid);
    
    const userDocRef = doc(db, 'userProfiles', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        const isComplete = userData.onboardingComplete === true;
        
        console.log("📋 Listener - Onboarding actualizado:", isComplete ? "Completo" : "Pendiente");
        console.log("📋 Listener - Datos del usuario:", userData);
        
        setOnboardingComplete(isComplete);
      } else {
        console.log("📋 Listener - Documento no existe, onboarding pendiente");
        setOnboardingComplete(false);
      }
    }, (error) => {
      console.error("❌ Error en listener de perfil:", error);
      setOnboardingComplete(false);
    });

    return () => {
      console.log("🔄 Limpiando listener de perfil");
      unsubscribe();
    };
  }, [user?.uid]);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    if (!isLogin && !displayName) {
      Alert.alert("Error", "Por favor ingresa tu nombre");
      return;
    }

    try {
      setAuthLoading(true);
      
      if (isLogin) {
        // Login
        console.log("🔐 Iniciando sesión...");
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Recargar el usuario para obtener los datos más recientes
        await userCredential.user.reload();
        const updatedUser = auth.currentUser;
        
        console.log("✅ Usuario logueado:");
        console.log("  - Email:", updatedUser?.email);
        console.log("  - DisplayName actual:", updatedUser?.displayName);
        
        // Si el usuario no tiene displayName, crear uno basado en el email
        if (!updatedUser?.displayName) {
          const newDisplayName = updatedUser.email.split('@')[0];
          console.log("⚠️ Usuario sin displayName, actualizando a:", newDisplayName);
          
          await updateProfile(updatedUser, {
            displayName: newDisplayName
          });
          
          // Recargar nuevamente después de actualizar el perfil
          await updatedUser.reload();
          console.log("✅ DisplayName actualizado correctamente");
        }
        
        // Forzar actualización del estado con el usuario actualizado
        setUser(auth.currentUser);
        
      } else {
        // Registro
        console.log("📝 Registrando nuevo usuario...");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Actualizar profile con displayName inmediatamente
        await updateProfile(userCredential.user, {
          displayName: displayName
        });
        
        // Recargar el usuario después de actualizar el perfil
        await userCredential.user.reload();
        
        console.log("✅ Usuario registrado:");
        console.log("  - Email:", userCredential.user.email);
        console.log("  - DisplayName configurado:", displayName);
        
        // Forzar actualización del estado con el usuario actualizado
        setUser(auth.currentUser);
      }
      
      // Limpiar campos
      setEmail("");
      setPassword("");
      setDisplayName("");
      setShowAuthModal(false);
      
    } catch (error) {
      let errorMessage = "Ha ocurrido un error";
      
      console.error("❌ Error de auth:", error.code, error.message);
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Este email ya está registrado";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "La contraseña debe tener al menos 6 caracteres";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "El email no es válido";
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = "Email o contraseña incorrectos";
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = "No existe una cuenta con este email";
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      console.log("🚪 Iniciando cierre de sesión...");
      
      // Limpiar estado antes de cerrar sesión
      setUser(null);
      setShowAuthModal(true);
      
      // Cerrar sesión en Firebase
      await signOut(auth);
      
      console.log("👋 Sesión cerrada correctamente");
    } catch (error) {
      console.error("❌ Error al cerrar sesión:", error);
      Alert.alert("Error", "No se pudo cerrar la sesión: " + error.message);
    }
  };

  return {
    user,
    showAuthModal,
    setShowAuthModal,
    isLogin,
    setIsLogin,
    email,
    setEmail,
    password,
    setPassword,
    displayName,
    setDisplayName,
    authLoading,
    initialLoading,
    onboardingComplete,
    handleAuth,
    handleSignOut,
    // Agregar datos de roles
    ...userRoles
  };
};
