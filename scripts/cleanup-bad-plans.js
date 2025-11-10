/**
 * cleanup-bad-plans.js
 * 
 * Script para limpiar planes mal creados sin datos de fecha válidos
 */

const admin = require('firebase-admin');
const serviceAccount = require('../firebase-admin-config.js');

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'superchat-83b3d'
});

const db = admin.firestore();

async function cleanupBadPlans() {
  try {
    console.log('🧹 Iniciando limpieza de planes mal creados...');
    
    // Obtener todos los posts de tipo 'activity'
    const activitiesSnapshot = await db.collection('posts')
      .where('type', '==', 'activity')
      .get();
    
    console.log(`📊 Total de actividades encontradas: ${activitiesSnapshot.size}`);
    
    let deletedCount = 0;
    let validCount = 0;
    const batch = db.batch();
    
    activitiesSnapshot.forEach((doc) => {
      const data = doc.data();
      
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
        console.log(`❌ Eliminando plan inválido: ${data.title || 'Sin título'} (ID: ${doc.id})`);
        console.log(`   - Fecha válida: ${hasValidDate}`);
        console.log(`   - Título válido: ${hasValidTitle}`);
        console.log(`   - Ubicación válida: ${hasValidLocation}`);
        
        batch.delete(doc.ref);
        deletedCount++;
      } else {
        console.log(`✅ Plan válido: ${data.title} (ID: ${doc.id})`);
        validCount++;
      }
    });
    
    // Ejecutar el batch de eliminaciones
    if (deletedCount > 0) {
      await batch.commit();
      console.log(`🗑️ Eliminados ${deletedCount} planes inválidos`);
    } else {
      console.log('✨ No se encontraron planes inválidos para eliminar');
    }
    
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












