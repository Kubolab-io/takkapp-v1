/**
 * cleanup-bad-plans-client.js
 * 
 * Script para limpiar planes mal creados usando Firebase Client SDK
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc, query, where } = require('firebase/firestore');

// Configuración de Firebase
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

async function cleanupBadPlans() {
  try {
    console.log('🧹 Iniciando limpieza de planes mal creados...');
    
    // Obtener todos los posts de tipo 'activity'
    const activitiesQuery = query(
      collection(db, 'posts'),
      where('type', '==', 'activity')
    );
    
    const activitiesSnapshot = await getDocs(activitiesQuery);
    
    console.log(`📊 Total de actividades encontradas: ${activitiesSnapshot.size}`);
    
    let deletedCount = 0;
    let validCount = 0;
    
    for (const docSnapshot of activitiesSnapshot.docs) {
      const data = docSnapshot.data();
      
      // Verificar si tiene fecha válida
      const hasValidDate = data.date && (
        // Timestamp de Firebase
        (data.date.seconds && data.date.nanoseconds) ||
        // String de fecha válida
        (typeof data.date === 'string' && !isNaN(Date.parse(data.date))) ||
        // Objeto Date
        (data.date instanceof Date)
      );
      
      // Verificar si tiene título válido
      const hasValidTitle = data.title && 
        typeof data.title === 'string' && 
        data.title.trim().length > 0;
      
      // Verificar si tiene ubicación válida
      const hasValidLocation = data.location && 
        typeof data.location === 'string' && 
        data.location.trim().length > 0;
      
      if (!hasValidDate || !hasValidTitle || !hasValidLocation) {
        console.log(`❌ Eliminando plan inválido: ${data.title || 'Sin título'} (ID: ${docSnapshot.id})`);
        console.log(`   - Fecha válida: ${hasValidDate}`);
        console.log(`   - Título válido: ${hasValidTitle}`);
        console.log(`   - Ubicación válida: ${hasValidLocation}`);
        
        await deleteDoc(doc(db, 'posts', docSnapshot.id));
        deletedCount++;
      } else {
        console.log(`✅ Plan válido: ${data.title} (ID: ${docSnapshot.id})`);
        validCount++;
      }
    }
    
    console.log(`🗑️ Eliminados ${deletedCount} planes inválidos`);
    
    console.log(`📈 Resumen:`);
    console.log(`   - Planes válidos: ${validCount}`);
    console.log(`   - Planes eliminados: ${deletedCount}`);
    console.log(`   - Total procesados: ${activitiesSnapshot.size}`);
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  } finally {
    console.log('🏁 Limpieza completada');
    process.exit(0);
  }
}

// Ejecutar la limpieza
cleanupBadPlans();










