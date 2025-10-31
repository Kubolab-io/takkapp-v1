/**
 * create-test-users-firestore.js
 * 
 * Script para crear usuarios de prueba directamente en Firestore
 * para el sistema de matching.
 */

const admin = require('firebase-admin');

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'superchat-83b3d'
  });
}

const db = admin.firestore();

const testUsers = [
  {
    displayName: "Ana García",
    email: "ana.garcia@test.com",
    age: 25,
    location: "Madrid, España",
    description: "Me encanta viajar y conocer gente nueva. Amo la fotografía y el café ☕",
    hobbies: ["Fotografía", "Viajes", "Café", "Música"],
    isPublic: true,
    photoURL: null
  },
  {
    displayName: "Carlos López",
    email: "carlos.lopez@test.com",
    age: 28,
    location: "Barcelona, España",
    description: "Desarrollador apasionado por la tecnología y los deportes. Siempre dispuesto a ayudar!",
    hobbies: ["Programación", "Fútbol", "Videojuegos", "Cocina"],
    isPublic: true,
    photoURL: null
  },
  {
    displayName: "María Rodríguez",
    email: "maria.rodriguez@test.com",
    age: 23,
    location: "Valencia, España",
    description: "Estudiante de arte que ama la naturaleza y los animales. Busco amigos con intereses similares 🌱",
    hobbies: ["Arte", "Naturaleza", "Animales", "Lectura"],
    isPublic: true,
    photoURL: null
  },
  {
    displayName: "David Martín",
    email: "david.martin@test.com",
    age: 30,
    location: "Sevilla, España",
    description: "Chef profesional que disfruta creando nuevas recetas. Me gusta compartir mi pasión culinaria 👨‍🍳",
    hobbies: ["Cocina", "Música", "Deportes", "Cine"],
    isPublic: true,
    photoURL: null
  },
  {
    displayName: "Laura Sánchez",
    email: "laura.sanchez@test.com",
    age: 26,
    location: "Bilbao, España",
    description: "Psicóloga que ama ayudar a otros. Me gusta el yoga, la meditación y las charlas profundas 🧘‍♀️",
    hobbies: ["Yoga", "Meditación", "Psicología", "Libros"],
    isPublic: true,
    photoURL: null
  }
];

async function createTestUsers() {
  try {
    console.log("🚀 Iniciando creación de usuarios de prueba...");
    
    const batch = db.batch();
    const userProfilesRef = db.collection('userProfiles');
    
    for (const user of testUsers) {
      const userRef = userProfilesRef.doc();
      batch.set(userRef, {
        ...user,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    await batch.commit();
    
    console.log("✅ Usuarios de prueba creados exitosamente!");
    console.log(`📊 Se crearon ${testUsers.length} usuarios en la colección userProfiles`);
    
    // Verificar que se crearon correctamente
    const snapshot = await userProfilesRef.where('isPublic', '==', true).get();
    console.log(`🔍 Verificación: ${snapshot.size} usuarios públicos encontrados`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creando usuarios de prueba:", error);
    process.exit(1);
  }
}

// Ejecutar el script
createTestUsers();

