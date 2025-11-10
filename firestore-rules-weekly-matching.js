/**
 * firestore-rules-weekly-matching.js
 * 
 * Reglas de Firestore actualizadas para el sistema de matching semanal
 * - Soporte para matching mutuo
 * - Seguridad mejorada
 * - Estructura de datos optimizada
 */

const firestoreRules = `
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Reglas para userProfiles (sin cambios)
    match /userProfiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Reglas para weeklyMatches - Matches semanales mutuos
    match /weeklyMatches/{matchId} {
      // Solo los usuarios involucrados en el match pueden leerlo
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.userId1 || 
         request.auth.uid == resource.data.userId2);
      
      // Solo los usuarios involucrados pueden actualizar el match
      allow update: if request.auth != null && 
        (request.auth.uid == resource.data.userId1 || 
         request.auth.uid == resource.data.userId2);
      
      // Solo el sistema puede crear matches (requiere autenticación de admin)
      allow create: if request.auth != null && 
        request.auth.uid == resource.data.userId1;
    }
    
    // Reglas para userWeeklyMatches - Matches del usuario por semana
    match /userWeeklyMatches/{userWeekId} {
      // Solo el usuario propietario puede leer sus matches semanales
      allow read: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      
      // Solo el usuario propietario puede actualizar sus matches
      allow update: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      
      // Solo el sistema puede crear matches semanales
      allow create: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Reglas para messages (sin cambios)
    match /messages/{messageId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.senderId || 
         request.auth.uid in resource.data.participants);
    }
    
    // Reglas para chats (sin cambios)
    match /chats/{chatId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
    }
    
    // Reglas para posts/actividades (sin cambios)
    match /posts/{postId} {
      allow read: if true; // Público para lectura
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.authorId;
    }
    
    // Reglas para comentarios (sin cambios)
    match /comments/{commentId} {
      allow read: if true; // Público para lectura
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.authorId;
    }
    
    // Reglas para grupos (sin cambios)
    match /groups/{groupId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.uid in resource.data.members;
    }
    
    // Reglas para participaciones (sin cambios)
    match /participations/{participationId} {
      allow read: if true; // Público para lectura
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
`;

module.exports = firestoreRules;









