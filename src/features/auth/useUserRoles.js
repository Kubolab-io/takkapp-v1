/**
 * useUserRoles.js
 * 
 * Hook para manejar roles de usuario y funcionalidades de administrador
 */

import { db } from '@/firebaseconfig';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export const useUserRoles = (user) => {
  console.log(`🔍 DEBUG useUserRoles: Usuario recibido:`, user?.email, user?.uid);
  const [userRole, setUserRole] = useState('user');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cargar rol del usuario cuando cambie
  useEffect(() => {
    if (user?.uid) {
      loadUserRole();
    } else {
      setUserRole('user');
      setIsAdmin(false);
    }
  }, [user?.uid]);

  const loadUserRole = async () => {
    try {
      setLoading(true);
      const userDocRef = doc(db, 'userProfiles', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role || 'user';
        setUserRole(role);
        setIsAdmin(role === 'admin');
        console.log(`👤 Usuario ${user.email} tiene rol: ${role}`);
        console.log(`🔍 DEBUG: userData completo:`, userData);
        console.log(`🔍 DEBUG: isAdmin será:`, role === 'admin');
      } else {
        // Si no existe el documento, crear uno con rol de usuario normal
        await createUserDocument();
        setUserRole('user');
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('❌ Error cargando rol de usuario:', error);
      setUserRole('user');
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const createUserDocument = async () => {
    try {
      const userDocRef = doc(db, 'userProfiles', user.uid);
      await setDoc(userDocRef, {
        email: user.email,
        displayName: user.displayName,
        role: 'user',
        createdAt: new Date(),
        lastLogin: new Date()
      }, { merge: true });
      console.log('✅ Documento de usuario creado en userProfiles');
    } catch (error) {
      console.error('❌ Error creando documento de usuario:', error);
    }
  };

  const updateUserRole = async (newRole) => {
    try {
      setLoading(true);
      const userDocRef = doc(db, 'userProfiles', user.uid);
      await updateDoc(userDocRef, {
        role: newRole,
        updatedAt: new Date()
      });
      
      setUserRole(newRole);
      setIsAdmin(newRole === 'admin');
      console.log(`✅ Rol actualizado a: ${newRole}`);
      return true;
    } catch (error) {
      console.error('❌ Error actualizando rol:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const promoteToAdmin = async () => {
    return await updateUserRole('admin');
  };

  const demoteToUser = async () => {
    return await updateUserRole('user');
  };

  return {
    userRole,
    isAdmin,
    loading,
    updateUserRole,
    promoteToAdmin,
    demoteToUser,
    loadUserRole
  };
};
