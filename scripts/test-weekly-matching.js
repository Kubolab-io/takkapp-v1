/**
 * test-weekly-matching.js
 * 
 * Script para probar y validar el nuevo sistema de matching semanal
 * - Verificar estructura de datos
 * - Probar funcionalidades
 * - Validar matching mutuo
 */

const admin = require('firebase-admin');

// Inicializar Firebase Admin
const serviceAccount = require('../firebase-admin-config.js');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Función para verificar estructura de datos
const verifyDataStructure = async () => {
  console.log('🔍 Verificando estructura de datos...');
  
  try {
    // Verificar weeklyMatches
    const weeklyMatchesSnapshot = await db.collection('weeklyMatches').get();
    console.log(`📊 weeklyMatches: ${weeklyMatchesSnapshot.docs.length} documentos`);
    
    if (weeklyMatchesSnapshot.docs.length > 0) {
      const sampleMatch = weeklyMatchesSnapshot.docs[0].data();
      console.log('📋 Estructura de weeklyMatches:');
      console.log(`  - ID: ${sampleMatch.id}`);
      console.log(`  - Week ID: ${sampleMatch.weekId}`);
      console.log(`  - User 1: ${sampleMatch.userId1}`);
      console.log(`  - User 2: ${sampleMatch.userId2}`);
      console.log(`  - Status: ${sampleMatch.status}`);
      console.log(`  - User 1 Accepted: ${sampleMatch.user1Accepted || false}`);
      console.log(`  - User 2 Accepted: ${sampleMatch.user2Accepted || false}`);
    }
    
    // Verificar userWeeklyMatches
    const userWeeklyMatchesSnapshot = await db.collection('userWeeklyMatches').get();
    console.log(`📊 userWeeklyMatches: ${userWeeklyMatchesSnapshot.docs.length} documentos`);
    
    if (userWeeklyMatchesSnapshot.docs.length > 0) {
      const sampleUserMatch = userWeeklyMatchesSnapshot.docs[0].data();
      console.log('📋 Estructura de userWeeklyMatches:');
      console.log(`  - User ID: ${sampleUserMatch.userId}`);
      console.log(`  - Week ID: ${sampleUserMatch.weekId}`);
      console.log(`  - Total Matches: ${sampleUserMatch.totalMatches}`);
      console.log(`  - Matches Array Length: ${sampleUserMatch.matches?.length || 0}`);
    }
    
    // Verificar userProfiles
    const userProfilesSnapshot = await db.collection('userProfiles')
      .where('isPublic', '==', true)
      .where('hasMatchingConsent', '==', true)
      .get();
    console.log(`📊 userProfiles (públicos con consentimiento): ${userProfilesSnapshot.docs.length} usuarios`);
    
    return true;
  } catch (error) {
    console.error('❌ Error verificando estructura de datos:', error);
    return false;
  }
};

// Función para verificar matching mutuo
const verifyMutualMatching = async () => {
  console.log('🔄 Verificando matching mutuo...');
  
  try {
    const weeklyMatchesSnapshot = await db.collection('weeklyMatches').get();
    
    if (weeklyMatchesSnapshot.docs.length === 0) {
      console.log('❌ No hay matches para verificar');
      return false;
    }
    
    let mutualMatches = 0;
    let totalMatches = weeklyMatchesSnapshot.docs.length;
    
    for (const doc of weeklyMatchesSnapshot.docs) {
      const matchData = doc.data();
      
      // Verificar que existe el match inverso
      const reverseMatchId = `${matchData.userId2}_${matchData.userId1}_${matchData.weekId}`;
      const reverseMatchDoc = await db.collection('weeklyMatches').doc(reverseMatchId).get();
      
      if (reverseMatchDoc.exists()) {
        mutualMatches++;
        console.log(`✅ Match mutuo encontrado: ${matchData.userId1} ↔ ${matchData.userId2}`);
      } else {
        console.log(`❌ Match no mutuo: ${matchData.userId1} → ${matchData.userId2}`);
      }
    }
    
    console.log(`📊 Matching mutuo: ${mutualMatches}/${totalMatches} (${Math.round(mutualMatches/totalMatches*100)}%)`);
    return mutualMatches === totalMatches;
  } catch (error) {
    console.error('❌ Error verificando matching mutuo:', error);
    return false;
  }
};

// Función para verificar distribución de matches
const verifyMatchDistribution = async () => {
  console.log('📊 Verificando distribución de matches...');
  
  try {
    const userWeeklyMatchesSnapshot = await db.collection('userWeeklyMatches').get();
    
    if (userWeeklyMatchesSnapshot.docs.length === 0) {
      console.log('❌ No hay matches de usuario para verificar');
      return false;
    }
    
    const matchCounts = [];
    
    for (const doc of userWeeklyMatchesSnapshot.docs) {
      const userMatchData = doc.data();
      const matchCount = userMatchData.totalMatches || 0;
      matchCounts.push(matchCount);
      console.log(`👤 ${userMatchData.userId}: ${matchCount} matches`);
    }
    
    const avgMatches = matchCounts.reduce((a, b) => a + b, 0) / matchCounts.length;
    const minMatches = Math.min(...matchCounts);
    const maxMatches = Math.max(...matchCounts);
    
    console.log(`📈 Estadísticas de matches:`);
    console.log(`  - Promedio: ${avgMatches.toFixed(1)} matches por usuario`);
    console.log(`  - Mínimo: ${minMatches} matches`);
    console.log(`  - Máximo: ${maxMatches} matches`);
    console.log(`  - Total usuarios: ${matchCounts.length}`);
    
    // Verificar que todos los usuarios tienen entre 3-5 matches
    const validUsers = matchCounts.filter(count => count >= 3 && count <= 5);
    const validPercentage = (validUsers.length / matchCounts.length) * 100;
    
    console.log(`✅ Usuarios con 3-5 matches: ${validUsers.length}/${matchCounts.length} (${validPercentage.toFixed(1)}%)`);
    
    return validPercentage >= 80; // Al menos 80% de usuarios con 3-5 matches
  } catch (error) {
    console.error('❌ Error verificando distribución de matches:', error);
    return false;
  }
};

// Función para simular aceptación de matches
const simulateMatchAcceptance = async () => {
  console.log('🎯 Simulando aceptación de matches...');
  
  try {
    const weeklyMatchesSnapshot = await db.collection('weeklyMatches').limit(3).get();
    
    if (weeklyMatchesSnapshot.docs.length === 0) {
      console.log('❌ No hay matches para simular');
      return false;
    }
    
    for (const doc of weeklyMatchesSnapshot.docs) {
      const matchData = doc.data();
      const matchId = doc.id;
      
      // Simular aceptación del usuario 1
      await db.collection('weeklyMatches').doc(matchId).update({
        user1Accepted: true,
        user1AcceptedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`✅ Usuario 1 aceptó match: ${matchId}`);
      
      // Simular aceptación del usuario 2
      await db.collection('weeklyMatches').doc(matchId).update({
        user2Accepted: true,
        user2AcceptedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'mutual',
        mutualAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`💕 Match mutuo creado: ${matchId}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error simulando aceptación de matches:', error);
    return false;
  }
};

// Función para verificar estados de match
const verifyMatchStates = async () => {
  console.log('🔍 Verificando estados de match...');
  
  try {
    const weeklyMatchesSnapshot = await db.collection('weeklyMatches').get();
    
    if (weeklyMatchesSnapshot.docs.length === 0) {
      console.log('❌ No hay matches para verificar');
      return false;
    }
    
    const states = {
      pending: 0,
      mutual: 0,
      expired: 0
    };
    
    for (const doc of weeklyMatchesSnapshot.docs) {
      const matchData = doc.data();
      const state = matchData.status || 'pending';
      states[state] = (states[state] || 0) + 1;
    }
    
    console.log('📊 Estados de match:');
    console.log(`  - Pendientes: ${states.pending}`);
    console.log(`  - Mutuos: ${states.mutual}`);
    console.log(`  - Expirados: ${states.expired}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error verificando estados de match:', error);
    return false;
  }
};

// Función principal de prueba
const runTests = async () => {
  console.log('🧪 Iniciando pruebas del sistema de matching semanal...');
  
  try {
    // 1. Verificar estructura de datos
    const structureOk = await verifyDataStructure();
    if (!structureOk) {
      console.log('❌ Falló verificación de estructura de datos');
      return false;
    }
    
    // 2. Verificar matching mutuo
    const mutualOk = await verifyMutualMatching();
    if (!mutualOk) {
      console.log('❌ Falló verificación de matching mutuo');
      return false;
    }
    
    // 3. Verificar distribución de matches
    const distributionOk = await verifyMatchDistribution();
    if (!distributionOk) {
      console.log('❌ Falló verificación de distribución de matches');
      return false;
    }
    
    // 4. Simular aceptación de matches
    const simulationOk = await simulateMatchAcceptance();
    if (!simulationOk) {
      console.log('❌ Falló simulación de aceptación de matches');
      return false;
    }
    
    // 5. Verificar estados de match
    const statesOk = await verifyMatchStates();
    if (!statesOk) {
      console.log('❌ Falló verificación de estados de match');
      return false;
    }
    
    console.log('✅ Todas las pruebas pasaron exitosamente!');
    console.log('🎉 El sistema de matching semanal está funcionando correctamente');
    
    return true;
  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
    return false;
  }
};

// Ejecutar pruebas
runTests().then(success => {
  if (success) {
    console.log('🎯 Sistema de matching semanal validado exitosamente');
  } else {
    console.log('❌ Sistema de matching semanal tiene problemas');
  }
  process.exit(success ? 0 : 1);
});









