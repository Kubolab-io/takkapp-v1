/**
 * Script para verificar el rol de un usuario
 * Uso: node scripts/check-user-role.js <uid-del-usuario>
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

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

async function checkUserRole(userUid) {
  try {
    console.log(`🔍 Verificando rol del usuario: ${userUid}`);
    
    const userDocRef = doc(db, 'users', userUid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log(`✅ Usuario encontrado:`);
      console.log(`   - Email: ${userData.email || 'No especificado'}`);
      console.log(`   - DisplayName: ${userData.displayName || 'No especificado'}`);
      console.log(`   - Role: ${userData.role || 'user'}`);
      console.log(`   - Is Admin: ${userData.role === 'admin' ? 'SÍ' : 'NO'}`);
      console.log(`   - Created: ${userData.createdAt?.toDate?.() || userData.createdAt || 'No especificado'}`);
    } else {
      console.log(`❌ Usuario no encontrado en la colección 'users'`);
      console.log(`💡 El usuario podría estar en 'userProfiles' o no tener documento creado`);
    }
    
  } catch (error) {
    console.error('❌ Error verificando usuario:', error);
  }
}

// Ejecutar el script
const userUid = process.argv[2];
if (!userUid) {
  console.log('❌ Uso: node scripts/check-user-role.js <uid-del-usuario>');
  console.log('💡 Para obtener el UID:');
  console.log('   1. Ve a Firebase Console > Authentication');
  console.log('   2. Busca el usuario por email');
  console.log('   3. Copia el UID del usuario');
  process.exit(1);
}

checkUserRole(userUid);
