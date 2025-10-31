/**
 * Script para crear usuarios de prueba con consentimiento automático
 * para testing del sistema de matching
 */

import { db } from '../firebaseconfig.js';
import { collection, addDoc, setDoc, doc } from 'firebase/firestore';

const testUsers = [
  {
    displayName: "Sofia Martinez",
    email: "sofia@test.com",
    age: 25,
    location: "Bogotá, Colombia",
    description: "Estudiante de arte que disfruta de las conversaciones profundas y las actividades culturales. Me gusta conocer gente nueva y hacer amistades duraderas.",
    hobbies: ["Tocar instrumentos", "Gimnasio", "Poesía", "Fotografía"],
    instagram: "@sofia_art",
    photoURL: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
    isPublic: true,
    onboardingComplete: true,
    hasMatchingConsent: true,
    matchingEnabled: true,
    onboardingCompletedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 horas atrás
  },
  {
    displayName: "Carlos Rodriguez",
    email: "carlos@test.com",
    age: 28,
    location: "Medellín, Colombia",
    description: "Ingeniero de software apasionado por la tecnología y los deportes. Me encanta conocer personas con intereses similares.",
    hobbies: ["Fútbol", "Programación", "Música", "Viajes"],
    instagram: "@carlos_dev",
    photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    isPublic: true,
    onboardingComplete: true,
    hasMatchingConsent: true,
    matchingEnabled: true,
    onboardingCompletedAt: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 horas atrás
  },
  {
    displayName: "Ana García",
    email: "ana@test.com",
    age: 23,
    location: "Cali, Colombia",
    description: "Estudiante de medicina que ama la naturaleza y los animales. Busco amistades que compartan mi pasión por ayudar a otros.",
    hobbies: ["Voluntariado", "Senderismo", "Lectura", "Cocina"],
    instagram: "@ana_medicina",
    photoURL: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    isPublic: true,
    onboardingComplete: true,
    hasMatchingConsent: true,
    matchingEnabled: true,
    onboardingCompletedAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 horas atrás
  },
  {
    displayName: "Diego López",
    email: "diego@test.com",
    age: 30,
    location: "Barranquilla, Colombia",
    description: "Chef profesional que disfruta de la buena comida y la música. Me gusta conocer gente creativa y con buen sentido del humor.",
    hobbies: ["Cocina", "Música", "Arte", "Deportes"],
    instagram: "@diego_chef",
    photoURL: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    isPublic: true,
    onboardingComplete: true,
    hasMatchingConsent: true,
    matchingEnabled: true,
    onboardingCompletedAt: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 horas atrás
  },
  {
    displayName: "María González",
    email: "maria@test.com",
    age: 26,
    location: "Cartagena, Colombia",
    description: "Diseñadora gráfica creativa que ama el arte y la moda. Busco amistades con las que pueda compartir mi pasión por el diseño.",
    hobbies: ["Diseño", "Moda", "Arte", "Fotografía"],
    instagram: "@maria_design",
    photoURL: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
    isPublic: true,
    onboardingComplete: true,
    hasMatchingConsent: true,
    matchingEnabled: true,
    onboardingCompletedAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 horas atrás
  }
];

export const createTestUsersWithConsent = async () => {
  console.log("🚀 Creando usuarios de prueba con consentimiento...");
  
  const results = [];
  
  for (const userData of testUsers) {
    try {
      // Crear un ID único para el usuario
      const userId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Crear el documento del perfil de usuario
      await setDoc(doc(db, "userProfiles", userId), {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log(`✅ Usuario creado: ${userData.displayName} (${userId})`);
      results.push({ success: true, userId, displayName: userData.displayName });
      
    } catch (error) {
      console.error(`❌ Error creando usuario ${userData.displayName}:`, error);
      results.push({ 
        success: false, 
        displayName: userData.displayName, 
        error: error.message 
      });
    }
  }
  
  console.log(`🎉 Proceso completado. ${results.filter(r => r.success).length}/${results.length} usuarios creados exitosamente.`);
  return results;
};

// Si se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  createTestUsersWithConsent()
    .then(results => {
      console.log("Resultados:", results);
      process.exit(0);
    })
    .catch(error => {
      console.error("Error:", error);
      process.exit(1);
    });
}

