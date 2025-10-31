/**
 * populate-users-from-app.js
 * 
 * Script para poblar usuarios de prueba desde la app
 * Se puede ejecutar desde la consola de la app o como función
 */

import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseconfig';

export const populateTestUsers = async () => {
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
    console.log('🚀 Creando usuarios de prueba desde la app...');
    
    const results = [];
    for (const user of testUsers) {
      try {
        const docRef = await addDoc(collection(db, 'userProfiles'), user);
        console.log(`✅ Usuario creado: ${user.displayName} (ID: ${docRef.id})`);
        results.push({ success: true, name: user.displayName, id: docRef.id });
      } catch (error) {
        console.error(`❌ Error creando usuario ${user.displayName}:`, error);
        results.push({ success: false, name: user.displayName, error: error.message });
      }
    }
    
    console.log('🎉 Proceso completado!');
    return results;
    
  } catch (error) {
    console.error('❌ Error general:', error);
    throw error;
  }
};

