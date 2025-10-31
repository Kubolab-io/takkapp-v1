/**
 * Script para promover usuarios a administrador
 * Uso: node scripts/promote-user-admin.js <uid-del-usuario>
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, setDoc, getDoc } = require('firebase/firestore');

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

async function promoteToAdmin(userUid) {
  try {
    console.log(`🔍 Promoviendo usuario ${userUid} a administrador...`);
    
    const userDocRef = doc(db, 'users', userUid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      // El documento existe, actualizar el rol
      await updateDoc(userDocRef, { role: 'admin' });
      console.log(`✅ Usuario ${userUid} promovido a administrador exitosamente!`);
    } else {
      // El documento no existe, crearlo con rol admin
      await setDoc(userDocRef, { 
        uid: userUid, 
        role: 'admin' 
      });
      console.log(`✅ Usuario ${userUid} creado como administrador!`);
    }
    
  } catch (error) {
    console.error('❌ Error promoviendo usuario:', error);
  }
}

// Ejecutar el script
const userUid = process.argv[2];
if (!userUid) {
  console.log('❌ Uso: node scripts/promote-user-admin.js <uid-del-usuario>');
  console.log('💡 Para obtener el UID del usuario:');
  console.log('   1. Ve a Firebase Console > Authentication');
  console.log('   2. Busca el usuario por email');
  console.log('   3. Copia el UID del usuario');
  process.exit(1);
}

promoteToAdmin(userUid);
