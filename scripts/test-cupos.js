/**
 * Script de prueba para el sistema de cupos
 * 
 * Este script simula el flujo completo de inscripciones y cancelaciones
 * para verificar que el sistema de cupos funciona correctamente.
 */

// Simulación de datos de prueba
const testData = {
  activity: {
    id: "test_activity_001",
    title: "🎯 Actividad de Prueba",
    maxParticipants: 5,
    participants: 1, // El creador
    availableSlots: 4
  },
  users: [
    { uid: "user_001", name: "Usuario 1" },
    { uid: "user_002", name: "Usuario 2" },
    { uid: "user_003", name: "Usuario 3" },
    { uid: "user_004", name: "Usuario 4" },
    { uid: "user_005", name: "Usuario 5" }
  ]
};

// Simulación de funciones de Firebase
const mockFirebase = {
  addDoc: async (collection, data) => {
    console.log(`📝 Creando documento en ${collection}:`, data);
    return { id: `doc_${Date.now()}` };
  },
  
  updateDoc: async (docRef, updates) => {
    console.log(`🔄 Actualizando documento:`, updates);
    
    // Simular actualización de cupos
    if (updates.participants !== undefined) {
      testData.activity.participants += updates.participants;
    }
    if (updates.availableSlots !== undefined) {
      testData.activity.availableSlots += updates.availableSlots;
    }
    
    console.log(`📊 Estado actual: ${testData.activity.participants}/${testData.activity.maxParticipants} (${testData.activity.availableSlots} disponibles)`);
  },
  
  deleteDoc: async (docRef) => {
    console.log(`🗑️ Eliminando documento:`, docRef);
  }
};

// Función de prueba para inscripción
async function testJoinActivity(userId, userName) {
  console.log(`\n👤 ${userName} intentando inscribirse...`);
  
  // Verificar cupos disponibles
  if (testData.activity.availableSlots <= 0) {
    console.log(`❌ No hay cupos disponibles. Actividad llena.`);
    return false;
  }
  
  // Verificar si ya está inscrito
  const isAlreadyParticipating = false; // Simulación
  
  if (isAlreadyParticipating) {
    console.log(`⚠️ ${userName} ya está inscrito.`);
    return false;
  }
  
  try {
    // 1. Crear registro de participación
    await mockFirebase.addDoc("participations", {
      userId: userId,
      postId: testData.activity.id,
      userName: userName,
      status: "confirmed"
    });
    
    // 2. Actualizar contadores
    await mockFirebase.updateDoc("posts/" + testData.activity.id, {
      participants: 1,
      availableSlots: -1
    });
    
    console.log(`✅ ${userName} inscrito exitosamente`);
    return true;
    
  } catch (error) {
    console.log(`❌ Error al inscribir a ${userName}:`, error.message);
    return false;
  }
}

// Función de prueba para cancelar inscripción
async function testLeaveActivity(userId, userName) {
  console.log(`\n👤 ${userName} cancelando inscripción...`);
  
  try {
    // 1. Eliminar participación
    await mockFirebase.deleteDoc("participations/user_participation");
    
    // 2. Restaurar cupo
    await mockFirebase.updateDoc("posts/" + testData.activity.id, {
      participants: -1,
      availableSlots: 1
    });
    
    console.log(`✅ Inscripción de ${userName} cancelada`);
    return true;
    
  } catch (error) {
    console.log(`❌ Error al cancelar inscripción de ${userName}:`, error.message);
    return false;
  }
}

// Función principal de prueba
async function runTests() {
  console.log("🧪 INICIANDO PRUEBAS DEL SISTEMA DE CUPOS");
  console.log("=" .repeat(50));
  
  console.log(`🎯 Actividad: ${testData.activity.title}`);
  console.log(`📊 Cupos iniciales: ${testData.activity.maxParticipants}`);
  console.log(`👥 Participantes iniciales: ${testData.activity.participants}`);
  console.log(`🆓 Cupos disponibles: ${testData.activity.availableSlots}`);
  
  // Prueba 1: Inscribir usuarios hasta llenar
  console.log("\n📋 PRUEBA 1: Llenando actividad");
  console.log("-".repeat(30));
  
  for (let i = 0; i < testData.users.length; i++) {
    const user = testData.users[i];
    const success = await testJoinActivity(user.uid, user.name);
    
    if (!success) {
      console.log(`🛑 No se pudo inscribir a ${user.name}. Prueba detenida.`);
      break;
    }
    
    // Verificar estado
    if (testData.activity.availableSlots <= 0) {
      console.log(`🎉 Actividad llena después de inscribir a ${user.name}`);
      break;
    }
  }
  
  // Prueba 2: Intentar inscribir cuando está llena
  console.log("\n📋 PRUEBA 2: Intentando inscribir en actividad llena");
  console.log("-".repeat(30));
  
  const extraUser = { uid: "extra_user", name: "Usuario Extra" };
  await testJoinActivity(extraUser.uid, extraUser.name);
  
  // Prueba 3: Cancelar inscripciones
  console.log("\n📋 PRUEBA 3: Cancelando inscripciones");
  console.log("-".repeat(30));
  
  // Cancelar 2 inscripciones
  await testLeaveActivity(testData.users[3].uid, testData.users[3].name);
  await testLeaveActivity(testData.users[2].uid, testData.users[2].name);
  
  // Prueba 4: Inscribir después de cancelar
  console.log("\n📋 PRUEBA 4: Inscribiendo después de cancelar");
  console.log("-".repeat(30));
  
  await testJoinActivity(extraUser.uid, extraUser.name);
  
  // Estado final
  console.log("\n📊 ESTADO FINAL");
  console.log("=" .repeat(50));
  console.log(`👥 Participantes: ${testData.activity.participants}/${testData.activity.maxParticipants}`);
  console.log(`🆓 Cupos disponibles: ${testData.activity.availableSlots}`);
  console.log(`✅ Pruebas completadas`);
}

// Ejecutar pruebas
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testJoinActivity,
  testLeaveActivity,
  runTests
}; 