/**
 * create-test-users.js
 * 
 * Script simple para crear usuarios de prueba directamente en Firebase
 * usando la consola de Firebase o ejecutando desde la app.
 */

// Función para crear usuarios de prueba
const createTestUsers = async () => {
  const { db } = require('../firebaseconfig');
  const { collection, addDoc, serverTimestamp } = require('firebase/firestore');

  const testUsers = [
    {
      displayName: "María González",
      email: "maria@test.com",
      photoURL: null,
      age: 25,
      location: "Bogotá, Colombia",
      description: "¡Hola! Me encanta viajar, cocinar y conocer gente nueva.",
      instagram: "maria_gonzalez",
      hobbies: ["Viajes", "Cocina", "Fotografía", "Yoga"],
      isPublic: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      displayName: "Carlos Rodríguez",
      email: "carlos@test.com",
      photoURL: null,
      age: 28,
      location: "Medellín, Colombia",
      description: "Desarrollador apasionado por la tecnología y los deportes.",
      instagram: "carlos_dev",
      hobbies: ["Programación", "Fútbol", "Videojuegos", "Tecnología"],
      isPublic: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      displayName: "Ana Martínez",
      email: "ana@test.com",
      photoURL: null,
      age: 23,
      location: "Cali, Colombia",
      description: "Estudiante de arte y amante de la naturaleza.",
      instagram: "ana_artista",
      hobbies: ["Arte", "Senderismo", "Lectura", "Pintura"],
      isPublic: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      displayName: "Diego Silva",
      email: "diego@test.com",
      photoURL: null,
      age: 30,
      location: "Barranquilla, Colombia",
      description: "Chef profesional y amante de la gastronomía.",
      instagram: "diego_chef",
      hobbies: ["Cocina", "Gastronomía", "Vino", "Viajes"],
      isPublic: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      displayName: "Laura Jiménez",
      email: "laura@test.com",
      photoURL: null,
      age: 26,
      location: "Cartagena, Colombia",
      description: "Psicóloga y amante de la música.",
      instagram: "laura_psicologa",
      hobbies: ["Música", "Guitarra", "Salsa", "Danza"],
      isPublic: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
  ];

  try {
    console.log('🚀 Creando usuarios de prueba...');
    
    for (const user of testUsers) {
      try {
        const docRef = await addDoc(collection(db, 'userProfiles'), user);
        console.log(`✅ Usuario creado: ${user.displayName} (ID: ${docRef.id})`);
      } catch (error) {
        console.error(`❌ Error creando usuario ${user.displayName}:`, error);
      }
    }
    
    console.log('🎉 Usuarios de prueba creados exitosamente!');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
};

// Exportar para uso en la app
module.exports = { createTestUsers };

// Si se ejecuta directamente
if (require.main === module) {
  createTestUsers();
}

