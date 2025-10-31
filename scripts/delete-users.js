/**
 * delete-users.js
 * 
 * Script para eliminar usuarios de la base de datos
 * Opciones:
 * 1. Eliminar solo usuarios de prueba
 * 2. Eliminar todos los usuarios (excepto el actual)
 * 3. Eliminar usuarios específicos por email
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, deleteDoc, query, where } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAaNknqCxQ7QZj27belrcWVIFtCyMeCuzE",
  authDomain: "superchat-83b3d.firebaseapp.com",
  projectId: "superchat-83b3d",
  storageBucket: "superchat-83b3d.firebasestorage.app",
  messagingSenderId: "498226680288",
  appId: "1:498226680288:web:1a89f79ffc821c62679b85"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Función para eliminar usuarios de prueba
async function deleteTestUsers() {
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
    
    const deletePromises = [];
    
    userProfilesSnapshot.docs.forEach(docSnapshot => {
      const userData = docSnapshot.data();
      console.log(`🗑️ Eliminando usuario: ${userData.displayName} (${userData.email})`);
      deletePromises.push(deleteDoc(doc(db, 'userProfiles', docSnapshot.id)));
    });
    
    await Promise.all(deletePromises);
    console.log('✅ Usuarios de prueba eliminados correctamente');
    
  } catch (error) {
    console.error('❌ Error eliminando usuarios de prueba:', error);
  }
}

// Función para eliminar todos los usuarios excepto el especificado
async function deleteAllUsersExcept(excludeEmail) {
  try {
    console.log(`🗑️ Eliminando todos los usuarios excepto: ${excludeEmail}`);
    
    const userProfilesQuery = query(
      collection(db, 'userProfiles'),
      where('email', '!=', excludeEmail)
    );
    
    const userProfilesSnapshot = await getDocs(userProfilesQuery);
    console.log(`📊 Usuarios encontrados para eliminar: ${userProfilesSnapshot.size}`);
    
    const deletePromises = [];
    
    userProfilesSnapshot.docs.forEach(docSnapshot => {
      const userData = docSnapshot.data();
      console.log(`🗑️ Eliminando usuario: ${userData.displayName} (${userData.email})`);
      deletePromises.push(deleteDoc(doc(db, 'userProfiles', docSnapshot.id)));
    });
    
    await Promise.all(deletePromises);
    console.log('✅ Usuarios eliminados correctamente');
    
  } catch (error) {
    console.error('❌ Error eliminando usuarios:', error);
  }
}

// Función para eliminar usuarios específicos por email
async function deleteSpecificUsers(emails) {
  try {
    console.log(`🗑️ Eliminando usuarios específicos: ${emails.join(', ')}`);
    
    const userProfilesQuery = query(
      collection(db, 'userProfiles'),
      where('email', 'in', emails)
    );
    
    const userProfilesSnapshot = await getDocs(userProfilesQuery);
    console.log(`📊 Usuarios encontrados: ${userProfilesSnapshot.size}`);
    
    const deletePromises = [];
    
    userProfilesSnapshot.docs.forEach(docSnapshot => {
      const userData = docSnapshot.data();
      console.log(`🗑️ Eliminando usuario: ${userData.displayName} (${userData.email})`);
      deletePromises.push(deleteDoc(doc(db, 'userProfiles', docSnapshot.id)));
    });
    
    await Promise.all(deletePromises);
    console.log('✅ Usuarios específicos eliminados correctamente');
    
  } catch (error) {
    console.error('❌ Error eliminando usuarios específicos:', error);
  }
}

// Función para limpiar matches relacionados
async function cleanupMatches() {
  try {
    console.log('🧹 Limpiando matches relacionados...');
    
    const matchesQuery = collection(db, 'dailyMatches');
    const matchesSnapshot = await getDocs(matchesQuery);
    console.log(`📊 Matches encontrados: ${matchesSnapshot.size}`);
    
    const deletePromises = [];
    
    matchesSnapshot.docs.forEach(docSnapshot => {
      console.log(`🗑️ Eliminando match: ${docSnapshot.id}`);
      deletePromises.push(deleteDoc(doc(db, 'dailyMatches', docSnapshot.id)));
    });
    
    await Promise.all(deletePromises);
    console.log('✅ Matches eliminados correctamente');
    
  } catch (error) {
    console.error('❌ Error eliminando matches:', error);
  }
}

// Función para listar todos los usuarios
async function listAllUsers() {
  try {
    console.log('📋 Listando todos los usuarios...');
    
    const userProfilesQuery = collection(db, 'userProfiles');
    const userProfilesSnapshot = await getDocs(userProfilesQuery);
    
    console.log(`📊 Total de usuarios: ${userProfilesSnapshot.size}`);
    console.log('👥 Usuarios:');
    
    userProfilesSnapshot.docs.forEach(docSnapshot => {
      const userData = docSnapshot.data();
      console.log(`  - ${userData.displayName} (${userData.email}) - ID: ${docSnapshot.id}`);
    });
    
  } catch (error) {
    console.error('❌ Error listando usuarios:', error);
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'test':
      await deleteTestUsers();
      break;
      
    case 'all':
      const excludeEmail = args[1];
      if (!excludeEmail) {
        console.log('❌ Debes especificar un email para excluir: node delete-users.js all tu@email.com');
        return;
      }
      await deleteAllUsersExcept(excludeEmail);
      break;
      
    case 'specific':
      const emails = args.slice(1);
      if (emails.length === 0) {
        console.log('❌ Debes especificar al menos un email: node delete-users.js specific email1@test.com email2@test.com');
        return;
      }
      await deleteSpecificUsers(emails);
      break;
      
    case 'matches':
      await cleanupMatches();
      break;
      
    case 'list':
      await listAllUsers();
      break;
      
    case 'clean':
      console.log('🧹 Limpieza completa...');
      await deleteTestUsers();
      await cleanupMatches();
      console.log('✅ Limpieza completa terminada');
      break;
      
    default:
      console.log(`
🗑️ Script para eliminar usuarios

Uso:
  node delete-users.js test                    - Eliminar solo usuarios de prueba
  node delete-users.js all tu@email.com        - Eliminar todos excepto tu email
  node delete-users.js specific email1 email2  - Eliminar usuarios específicos
  node delete-users.js matches                 - Eliminar todos los matches
  node delete-users.js list                    - Listar todos los usuarios
  node delete-users.js clean                   - Limpieza completa (test users + matches)

Ejemplos:
  node delete-users.js test
  node delete-users.js all juan@email.com
  node delete-users.js specific maria@test.com carlos@test.com
  node delete-users.js matches
  node delete-users.js list
  node delete-users.js clean
      `);
  }
}

// Ejecutar el script
main().then(() => {
  console.log('🎉 Script terminado');
  process.exit(0);
}).catch(error => {
  console.error('❌ Error ejecutando script:', error);
  process.exit(1);
});
