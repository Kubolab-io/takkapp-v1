/**
 * populate-matching-users.js
 * 
 * Script para poblar la base de datos con usuarios de prueba
 * para el sistema de matching. Esto es útil para testing.
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAaNknqCxQ7QZj27belrcWVIFtCyMeCuzE",
  authDomain: "superchat-83b3d.firebaseapp.com",
  projectId: "superchat-83b3d",
  storageBucket: "superchat-83b3d.firebasestorage.app",
  messagingSenderId: "498226680288",
  appId: "1:498226680288:web:9a89f79ffc821c62679b85"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Usuarios de prueba para el sistema de matching
const testUsers = [
  {
    id: "test_user_1",
    displayName: "María González",
    email: "maria@test.com",
    photoURL: null,
    age: 25,
    location: "Bogotá, Colombia",
    description: "¡Hola! Me encanta viajar, cocinar y conocer gente nueva. Siempre estoy buscando nuevas aventuras y experiencias.",
    instagram: "maria_gonzalez",
    hobbies: ["Viajes", "Cocina", "Fotografía", "Yoga", "Música"],
    isPublic: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    id: "test_user_2",
    displayName: "Carlos Rodríguez",
    email: "carlos@test.com",
    photoURL: null,
    age: 28,
    location: "Medellín, Colombia",
    description: "Desarrollador de software apasionado por la tecnología y los deportes. Me gusta el fútbol y los videojuegos.",
    instagram: "carlos_dev",
    hobbies: ["Programación", "Fútbol", "Videojuegos", "Cine", "Tecnología"],
    isPublic: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    id: "test_user_3",
    displayName: "Ana Martínez",
    email: "ana@test.com",
    photoURL: null,
    age: 23,
    location: "Cali, Colombia",
    description: "Estudiante de arte y amante de la naturaleza. Me gusta pintar, hacer senderismo y leer libros.",
    instagram: "ana_artista",
    hobbies: ["Arte", "Senderismo", "Lectura", "Pintura", "Naturaleza"],
    isPublic: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    id: "test_user_4",
    displayName: "Diego Silva",
    email: "diego@test.com",
    photoURL: null,
    age: 30,
    location: "Barranquilla, Colombia",
    description: "Chef profesional y amante de la gastronomía. Me gusta experimentar con nuevos sabores y técnicas culinarias.",
    instagram: "diego_chef",
    hobbies: ["Cocina", "Gastronomía", "Vino", "Restaurantes", "Viajes"],
    isPublic: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    id: "test_user_5",
    displayName: "Laura Jiménez",
    email: "laura@test.com",
    photoURL: null,
    age: 26,
    location: "Cartagena, Colombia",
    description: "Psicóloga y amante de la música. Me gusta tocar guitarra, bailar salsa y ayudar a las personas.",
    instagram: "laura_psicologa",
    hobbies: ["Música", "Guitarra", "Salsa", "Psicología", "Danza"],
    isPublic: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    id: "test_user_6",
    displayName: "Andrés López",
    email: "andres@test.com",
    photoURL: null,
    age: 32,
    location: "Bucaramanga, Colombia",
    description: "Ingeniero civil y deportista. Me gusta correr, hacer ciclismo y construir cosas con mis manos.",
    instagram: "andres_ingeniero",
    hobbies: ["Ciclismo", "Correr", "Construcción", "Ingeniería", "Deportes"],
    isPublic: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    id: "test_user_7",
    displayName: "Sofia Herrera",
    email: "sofia@test.com",
    photoURL: null,
    age: 24,
    location: "Pereira, Colombia",
    description: "Diseñadora gráfica creativa y amante del arte digital. Me gusta crear cosas hermosas y inspirar a otros.",
    instagram: "sofia_designer",
    hobbies: ["Diseño", "Arte Digital", "Creatividad", "Fotografía", "Ilustración"],
    isPublic: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    id: "test_user_8",
    displayName: "Miguel Torres",
    email: "miguel@test.com",
    photoURL: null,
    age: 29,
    location: "Manizales, Colombia",
    description: "Músico y compositor. Me gusta tocar piano, componer canciones y compartir mi pasión por la música.",
    instagram: "miguel_musico",
    hobbies: ["Música", "Piano", "Composición", "Conciertos", "Instrumentos"],
    isPublic: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
];

async function populateTestUsers() {
  try {
    console.log('🚀 Iniciando población de usuarios de prueba...');
    
    for (const user of testUsers) {
      try {
        // Verificar si el usuario ya existe
        const userRef = collection(db, 'userProfiles');
        const docRef = await addDoc(userRef, user);
        console.log(`✅ Usuario creado: ${user.displayName} (ID: ${docRef.id})`);
      } catch (error) {
        console.error(`❌ Error creando usuario ${user.displayName}:`, error);
      }
    }
    
    console.log('🎉 Población de usuarios completada!');
    console.log(`📊 Total de usuarios creados: ${testUsers.length}`);
    
  } catch (error) {
    console.error('❌ Error en la población de usuarios:', error);
  }
}

// Ejecutar el script
populateTestUsers();
