/**
 * Script para promover usuarios a administrador
 * Uso: node scripts/promote-admin.js <email-del-usuario>
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAaNknqCxQ7QZj27belrcWVIFtCyMeCuzE",
  authDomain: "superchat-83b3d.firebaseapp.com",
  projectId: "superchat-83b3d",
  storageBucket: "superchat-83b3d.firebasestorage.app",
  messagingSenderId: "498226680288",
  appId: "1:498226680288:web:9a89f79ffc821c62679b85"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function promoteToAdmin(userEmail) {
  try {
    console.log(`🔍 Buscando usuario con email: ${userEmail}`);
    
    // Buscar el usuario por email en la colección users
    // Nota: Esto requiere que el email esté almacenado en el documento del usuario
    // En una implementación real, podrías necesitar una consulta más compleja
    
    console.log('⚠️  Nota: Este script requiere que el usuario ya tenga un documento en la colección "users"');
    console.log('💡 Para promover a administrador manualmente:');
    console.log('1. Ve a Firebase Console > Firestore');
    console.log('2. Busca la colección "users"');
    console.log('3. Encuentra el documento del usuario por su UID');
    console.log('4. Cambia el campo "role" de "user" a "admin"');
    console.log('');
    console.log('🎯 Alternativamente, puedes usar la función promoteToAdmin() en la app');
    console.log('   cuando tengas acceso de administrador para promover otros usuarios.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Ejecutar el script
const userEmail = process.argv[2];
if (!userEmail) {
  console.log('❌ Uso: node scripts/promote-admin.js <email-del-usuario>');
  process.exit(1);
}

promoteToAdmin(userEmail);
