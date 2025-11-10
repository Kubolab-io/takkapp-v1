/**
 * migrate-to-weekly-matching.js
 * 
 * Script para migrar del sistema de matching diario al semanal
 * - Limpia datos antiguos
 * - Crea nueva estructura de datos
 * - Pobla usuarios de prueba para el nuevo sistema
 */

const admin = require('firebase-admin');

// Inicializar Firebase Admin
const serviceAccount = require('../firebase-admin-config.js');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Función para obtener el ID de la semana actual
const getCurrentWeekId = () => {
  const now = new Date();
  const year = now.getFullYear();
  const weekNumber = getWeekNumber(now);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
};

// Función para obtener el número de semana
const getWeekNumber = (date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

// Función para obtener el final de la semana
const getWeekEnd = (date) => {
  const endOfWeek = new Date(date);
  endOfWeek.setDate(date.getDate() + (7 - date.getDay()));
  endOfWeek.setHours(23, 59, 59, 999);
  return endOfWeek;
};

// Función para limpiar datos antiguos
const cleanupOldMatchingData = async () => {
  console.log('🧹 Limpiando datos antiguos de matching...');
  
  try {
    // Eliminar colección dailyMatches
    const dailyMatchesSnapshot = await db.collection('dailyMatches').get();
    const batch = db.batch();
    
    dailyMatchesSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`✅ Eliminados ${dailyMatchesSnapshot.docs.length} documentos de dailyMatches`);
    
    // Eliminar colección userWeeklyMatches (si existe)
    const userWeeklyMatchesSnapshot = await db.collection('userWeeklyMatches').get();
    const batch2 = db.batch();
    
    userWeeklyMatchesSnapshot.docs.forEach((doc) => {
      batch2.delete(doc.ref);
    });
    
    await batch2.commit();
    console.log(`✅ Eliminados ${userWeeklyMatchesSnapshot.docs.length} documentos de userWeeklyMatches`);
    
    // Eliminar colección weeklyMatches (si existe)
    const weeklyMatchesSnapshot = await db.collection('weeklyMatches').get();
    const batch3 = db.batch();
    
    weeklyMatchesSnapshot.docs.forEach((doc) => {
      batch3.delete(doc.ref);
    });
    
    await batch3.commit();
    console.log(`✅ Eliminados ${weeklyMatchesSnapshot.docs.length} documentos de weeklyMatches`);
    
  } catch (error) {
    console.error('❌ Error limpiando datos antiguos:', error);
  }
};

// Función para crear usuarios de prueba
const createTestUsers = async () => {
  console.log('👥 Creando usuarios de prueba...');
  
  const testUsers = [
    {
      id: 'test_user_1',
      displayName: 'Ana García',
      email: 'ana@test.com',
      age: 25,
      location: 'Bogotá, Colombia',
      description: 'Me encanta la música y el arte. Busco nuevas amistades para compartir experiencias.',
      hobbies: ['Música', 'Arte', 'Fotografía', 'Cine'],
      photoURL: null,
      instagram: '@ana_garcia',
      isPublic: true,
      hasMatchingConsent: true,
      matchingEnabled: true,
      onboardingComplete: true
    },
    {
      id: 'test_user_2',
      displayName: 'Carlos López',
      email: 'carlos@test.com',
      age: 28,
      location: 'Medellín, Colombia',
      description: 'Deportista y aventurero. Me gusta conocer gente nueva y hacer actividades al aire libre.',
      hobbies: ['Fútbol', 'Senderismo', 'Ciclismo', 'Cocina'],
      photoURL: null,
      instagram: '@carlos_lopez',
      isPublic: true,
      hasMatchingConsent: true,
      matchingEnabled: true,
      onboardingComplete: true
    },
    {
      id: 'test_user_3',
      displayName: 'María Rodríguez',
      email: 'maria@test.com',
      age: 23,
      location: 'Cali, Colombia',
      description: 'Estudiante de arte. Me gusta la pintura, la lectura y conocer gente creativa.',
      hobbies: ['Pintura', 'Lectura', 'Teatro', 'Danza'],
      photoURL: null,
      instagram: '@maria_rodriguez',
      isPublic: true,
      hasMatchingConsent: true,
      matchingEnabled: true,
      onboardingComplete: true
    },
    {
      id: 'test_user_4',
      displayName: 'Diego Martínez',
      email: 'diego@test.com',
      age: 30,
      location: 'Barranquilla, Colombia',
      description: 'Ingeniero que ama la tecnología y los videojuegos. Busco amigos con intereses similares.',
      hobbies: ['Programación', 'Videojuegos', 'Tecnología', 'Ciencia'],
      photoURL: null,
      instagram: '@diego_martinez',
      isPublic: true,
      hasMatchingConsent: true,
      matchingEnabled: true,
      onboardingComplete: true
    },
    {
      id: 'test_user_5',
      displayName: 'Sofia Herrera',
      email: 'sofia@test.com',
      age: 26,
      location: 'Cartagena, Colombia',
      description: 'Chef apasionada por la gastronomía. Me encanta cocinar y probar nuevos sabores.',
      hobbies: ['Cocina', 'Gastronomía', 'Viajes', 'Fotografía'],
      photoURL: null,
      instagram: '@sofia_herrera',
      isPublic: true,
      hasMatchingConsent: true,
      matchingEnabled: true,
      onboardingComplete: true
    },
    {
      id: 'test_user_6',
      displayName: 'Andrés Vargas',
      email: 'andres@test.com',
      age: 27,
      location: 'Bucaramanga, Colombia',
      description: 'Músico y compositor. Me gusta crear música y colaborar con otros artistas.',
      hobbies: ['Música', 'Composición', 'Guitarra', 'Producción'],
      photoURL: null,
      instagram: '@andres_vargas',
      isPublic: true,
      hasMatchingConsent: true,
      matchingEnabled: true,
      onboardingComplete: true
    },
    {
      id: 'test_user_7',
      displayName: 'Valentina Castro',
      email: 'valentina@test.com',
      age: 24,
      location: 'Pereira, Colombia',
      description: 'Bailarina y coreógrafa. Me apasiona el movimiento y la expresión corporal.',
      hobbies: ['Danza', 'Coreografía', 'Yoga', 'Fitness'],
      photoURL: null,
      instagram: '@valentina_castro',
      isPublic: true,
      hasMatchingConsent: true,
      matchingEnabled: true,
      onboardingComplete: true
    },
    {
      id: 'test_user_8',
      displayName: 'Roberto Silva',
      email: 'roberto@test.com',
      age: 29,
      location: 'Manizales, Colombia',
      description: 'Escritor y periodista. Me gusta contar historias y conocer diferentes perspectivas.',
      hobbies: ['Escritura', 'Periodismo', 'Lectura', 'Historia'],
      photoURL: null,
      instagram: '@roberto_silva',
      isPublic: true,
      hasMatchingConsent: true,
      matchingEnabled: true,
      onboardingComplete: true
    }
  ];

  try {
    const batch = db.batch();
    
    testUsers.forEach(user => {
      const userRef = db.collection('userProfiles').doc(user.id);
      batch.set(userRef, {
        ...user,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    await batch.commit();
    console.log(`✅ Creados ${testUsers.length} usuarios de prueba`);
    
  } catch (error) {
    console.error('❌ Error creando usuarios de prueba:', error);
  }
};

// Función para generar matches semanales de prueba
const generateWeeklyMatches = async () => {
  console.log('🎯 Generando matches semanales de prueba...');
  
  try {
    const weekId = getCurrentWeekId();
    const weekEnd = getWeekEnd(new Date());
    
    // Obtener usuarios de prueba
    const usersSnapshot = await db.collection('userProfiles')
      .where('isPublic', '==', true)
      .where('hasMatchingConsent', '==', true)
      .get();
    
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`👥 Encontrados ${users.length} usuarios para matching`);
    
    if (users.length < 2) {
      console.log('❌ No hay suficientes usuarios para generar matches');
      return;
    }
    
    // Generar matches para cada usuario (3-5 matches por usuario)
    const batch = db.batch();
    const weeklyMatches = [];
    const userWeeklyMatches = {};
    
    for (const user of users) {
      // Seleccionar 3-5 usuarios aleatorios diferentes
      const otherUsers = users.filter(u => u.id !== user.id);
      const numberOfMatches = Math.min(Math.floor(Math.random() * 3) + 3, otherUsers.length);
      const shuffledUsers = [...otherUsers].sort(() => Math.random() - 0.5);
      const selectedUsers = shuffledUsers.slice(0, numberOfMatches);
      
      console.log(`🎯 Generando ${numberOfMatches} matches para ${user.displayName}`);
      
      const userMatches = [];
      
      for (const matchedUser of selectedUsers) {
        const matchId = `${user.id}_${matchedUser.id}_${weekId}`;
        
        // Crear el match mutuo
        const weeklyMatchData = {
          id: matchId,
          weekId: weekId,
          userId1: user.id,
          userId2: matchedUser.id,
          user1Data: {
            displayName: user.displayName,
            photoURL: user.photoURL,
            email: user.email
          },
          user2Data: {
            displayName: matchedUser.displayName,
            photoURL: matchedUser.photoURL,
            age: matchedUser.age,
            location: matchedUser.location,
            description: matchedUser.description,
            hobbies: matchedUser.hobbies || [],
            email: matchedUser.email
          },
          status: "pending",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          expiresAt: weekEnd,
          mutualAt: null
        };
        
        weeklyMatches.push(weeklyMatchData);
        
        // Crear entrada para el usuario actual
        userMatches.push({
          matchId: matchId,
          matchedUserId: matchedUser.id,
          matchedUserData: {
            displayName: matchedUser.displayName,
            photoURL: matchedUser.photoURL,
            age: matchedUser.age,
            location: matchedUser.location,
            description: matchedUser.description,
            hobbies: matchedUser.hobbies || [],
            email: matchedUser.email
          },
          status: "pending"
        });
      }
      
      // Guardar matches del usuario
      const userMatchesRef = db.collection('userWeeklyMatches').doc(`${user.id}_${weekId}`);
      userWeeklyMatches[user.id] = {
        userId: user.id,
        weekId: weekId,
        matches: userMatches,
        totalMatches: userMatches.length,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };
    }
    
    // Guardar todos los weeklyMatches
    for (const match of weeklyMatches) {
      const matchRef = db.collection('weeklyMatches').doc(match.id);
      batch.set(matchRef, match);
    }
    
    // Guardar todos los userWeeklyMatches
    for (const [userId, userMatches] of Object.entries(userWeeklyMatches)) {
      const userMatchesRef = db.collection('userWeeklyMatches').doc(`${userId}_${weekId}`);
      batch.set(userMatchesRef, userMatches);
    }
    
    await batch.commit();
    
    console.log(`✅ Generados ${weeklyMatches.length} matches semanales`);
    console.log(`✅ Creados ${Object.keys(userWeeklyMatches).length} registros de usuario`);
    
  } catch (error) {
    console.error('❌ Error generando matches semanales:', error);
  }
};

// Función principal
const main = async () => {
  console.log('🚀 Iniciando migración al sistema de matching semanal...');
  
  try {
    // 1. Limpiar datos antiguos
    await cleanupOldMatchingData();
    
    // 2. Crear usuarios de prueba
    await createTestUsers();
    
    // 3. Generar matches semanales
    await generateWeeklyMatches();
    
    console.log('✅ Migración completada exitosamente!');
    console.log('📱 Ahora puedes probar el nuevo sistema de matching semanal');
    
  } catch (error) {
    console.error('❌ Error en la migración:', error);
  } finally {
    process.exit(0);
  }
};

// Ejecutar migración
main();









