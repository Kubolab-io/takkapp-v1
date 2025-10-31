/**
 * Script para limpiar participaciones huérfanas
 * Ejecutar con: node scripts/cleanup-orphaned-participations.js
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc 
} = require('firebase/firestore');

// Configuración de Firebase (tu proyecto real)
const firebaseConfig = {
  apiKey: "AIzaSyAaNknqCxQ7QZj27belrcWVIFtCyMeCuzE",
  authDomain: "superchat-83b3d.firebaseapp.com",
  projectId: "superchat-83b3d",
  storageBucket: "superchat-83b3d.firebasestorage.app",
  messagingSenderId: "498226680288",
  appId: "1:498226680288:web:9a89f79ffc821c62679b85"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanupOrphanedParticipations() {
  try {
    console.log('🧹 Iniciando limpieza de participaciones huérfanas...');
    
    // Obtener todas las participaciones
    const participationsQuery = query(collection(db, 'participations'));
    const participationsSnapshot = await getDocs(participationsQuery);
    
    console.log(`📊 Total de participaciones encontradas: ${participationsSnapshot.size}`);
    
    let orphanedCount = 0;
    const cleanupPromises = participationsSnapshot.docs.map(async (doc) => {
      const participation = doc.data();
      
      try {
        // Verificar si el post padre existe
        const postRef = doc(db, 'posts', participation.postId);
        const postDoc = await getDocs(query(collection(db, 'posts'), where('__name__', '==', participation.postId)));
        
        if (postDoc.empty) {
          // El post no existe, eliminar la participación huérfana
          console.log(`🗑️ Eliminando participación huérfana: ${doc.id} (postId: ${participation.postId})`);
          await deleteDoc(doc.ref);
          orphanedCount++;
        }
      } catch (error) {
        console.error(`❌ Error verificando post ${participation.postId}:`, error);
        // Si hay error, también eliminar la participación
        await deleteDoc(doc.ref);
        orphanedCount++;
      }
    });
    
    await Promise.all(cleanupPromises);
    console.log(`✅ Limpieza completada. Se eliminaron ${orphanedCount} participaciones huérfanas`);
    
    return orphanedCount;
  } catch (error) {
    console.error('❌ Error en limpieza de participaciones huérfanas:', error);
    throw error;
  }
}

// Ejecutar la limpieza
if (require.main === module) {
  cleanupOrphanedParticipations()
    .then(count => {
      console.log(`🎉 Limpieza exitosa: ${count} participaciones eliminadas`);
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Error en limpieza:', error);
      process.exit(1);
    });
}

module.exports = { cleanupOrphanedParticipations }; 