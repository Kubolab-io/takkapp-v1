/**
 * delete-users-from-app.js
 * 
 * Funciones para eliminar usuarios desde la aplicación
 * Se puede importar y usar en la app
 */

import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseconfig';

// Función para eliminar usuarios de prueba
export const deleteTestUsers = async () => {
  try {
    console.log('🗑️ Eliminando usuarios de prueba...');
    
    const testEmails = [
      'maria@test.com',
      'carlos@test.com', 
      'ana@test.com',
      'diego@test.com',
      'laura@test.com',
      'andres@test.com',
      'sofia@test.com',
      'miguel@test.com'
    ];
    
    const userProfilesQuery = query(
      collection(db, 'userProfiles'),
      where('email', 'in', testEmails)
    );
    
    const userProfilesSnapshot = await getDocs(userProfilesQuery);
    console.log(`📊 Usuarios de prueba encontrados: ${userProfilesSnapshot.size}`);
    
    const results = [];
    
    for (const docSnapshot of userProfilesSnapshot.docs) {
      try {
        const userData = docSnapshot.data();
        console.log(`🗑️ Eliminando usuario: ${userData.displayName} (${userData.email})`);
        
        await deleteDoc(doc(db, 'userProfiles', docSnapshot.id));
        results.push({ 
          success: true, 
          name: userData.displayName, 
          email: userData.email 
        });
      } catch (error) {
        console.error(`❌ Error eliminando usuario ${docSnapshot.id}:`, error);
        results.push({ 
          success: false, 
          name: docSnapshot.id, 
          error: error.message 
        });
      }
    }
    
    console.log('✅ Proceso de eliminación terminado');
    return results;
    
  } catch (error) {
    console.error('❌ Error eliminando usuarios de prueba:', error);
    throw error;
  }
};

// Función para eliminar todos los matches
export const deleteAllMatches = async () => {
  try {
    console.log('🧹 Eliminando todos los matches...');
    
    const matchesQuery = collection(db, 'dailyMatches');
    const matchesSnapshot = await getDocs(matchesQuery);
    console.log(`📊 Matches encontrados: ${matchesSnapshot.size}`);
    
    const results = [];
    
    for (const docSnapshot of matchesSnapshot.docs) {
      try {
        console.log(`🗑️ Eliminando match: ${docSnapshot.id}`);
        await deleteDoc(doc(db, 'dailyMatches', docSnapshot.id));
        results.push({ 
          success: true, 
          matchId: docSnapshot.id 
        });
      } catch (error) {
        console.error(`❌ Error eliminando match ${docSnapshot.id}:`, error);
        results.push({ 
          success: false, 
          matchId: docSnapshot.id, 
          error: error.message 
        });
      }
    }
    
    console.log('✅ Proceso de eliminación de matches terminado');
    return results;
    
  } catch (error) {
    console.error('❌ Error eliminando matches:', error);
    throw error;
  }
};

// Función para limpiar todo (usuarios de prueba + matches)
export const cleanupAll = async () => {
  try {
    console.log('🧹 Iniciando limpieza completa...');
    
    const userResults = await deleteTestUsers();
    const matchResults = await deleteAllMatches();
    
    const successCount = userResults.filter(r => r.success).length;
    const matchSuccessCount = matchResults.filter(r => r.success).length;
    
    console.log(`✅ Limpieza completa terminada:`);
    console.log(`  - Usuarios eliminados: ${successCount}`);
    console.log(`  - Matches eliminados: ${matchSuccessCount}`);
    
    return {
      users: userResults,
      matches: matchResults,
      totalUsersDeleted: successCount,
      totalMatchesDeleted: matchSuccessCount
    };
    
  } catch (error) {
    console.error('❌ Error en limpieza completa:', error);
    throw error;
  }
};

// Función para listar usuarios
export const listUsers = async () => {
  try {
    console.log('📋 Listando usuarios...');
    
    const userProfilesQuery = collection(db, 'userProfiles');
    const userProfilesSnapshot = await getDocs(userProfilesQuery);
    
    const users = userProfilesSnapshot.docs.map(docSnapshot => ({
      id: docSnapshot.id,
      ...docSnapshot.data()
    }));
    
    console.log(`📊 Total de usuarios: ${users.length}`);
    users.forEach(user => {
      console.log(`  - ${user.displayName} (${user.email}) - ID: ${user.id}`);
    });
    
    return users;
    
  } catch (error) {
    console.error('❌ Error listando usuarios:', error);
    throw error;
  }
};
