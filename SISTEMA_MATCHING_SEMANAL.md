# 💕 Sistema de Matching Semanal Mutuo - Takkapp

## 📋 Descripción

Sistema completamente reestructurado de matching que reemplaza el sistema diario por uno **semanal y mutuo**:
- **3-5 matches por semana** en lugar de 1 por día
- **Matching mutuo**: Si Juan ve a Camila, Camila también ve a Juan
- **Sistema semanal**: Nuevos matches cada semana
- **Bidireccional**: Ambos usuarios deben estar disponibles

## 🎯 Características Principales

### **Matching Semanal Mutuo**
- ✅ **3-5 matches por semana**: Más oportunidades de conexión
- ✅ **Algoritmo mutuo**: Si A ve a B, B también ve a A
- ✅ **Timer semanal**: Cuenta regresiva hasta la próxima semana
- ✅ **Estados de match**: Pendiente, Aceptado, Mutuo, Rechazado

### **Interfaz Rediseñada**
- ✅ **Lista de matches**: Muestra 3-5 personas simultáneamente
- ✅ **Cards compactas**: Diseño optimizado para múltiples matches
- ✅ **Estados visuales**: Indicadores claros del estado de cada match
- ✅ **Información completa**: Nombre, edad, ubicación, descripción, hobbies

### **Sistema de Tiempo**
- ✅ **Verificación semanal**: Previene múltiples matches en la misma semana
- ✅ **Timer semanal**: Cuenta regresiva visual hasta la próxima semana
- ✅ **Expiración automática**: Los matches expiran al final de la semana

## 🗄️ Nueva Estructura de Datos

### **Colección: `weeklyMatches`**
```javascript
{
  id: "user1_user2_2024-W01",     // ID único del match
  weekId: "2024-W01",              // Identificador de la semana
  userId1: "user_uid_1",           // Usuario 1
  userId2: "user_uid_2",           // Usuario 2
  user1Data: {                     // Datos del usuario 1
    displayName: "Juan Pérez",
    photoURL: "https://...",
    email: "juan@email.com"
  },
  user2Data: {                     // Datos del usuario 2
    displayName: "María García",
    photoURL: "https://...",
    age: 25,
    location: "Bogotá, Colombia",
    description: "Descripción personal",
    hobbies: ["Música", "Arte"],
    email: "maria@email.com"
  },
  status: "pending" | "mutual",    // Estado del match
  user1Accepted: boolean,          // Si usuario 1 aceptó
  user2Accepted: boolean,          // Si usuario 2 aceptó
  user1AcceptedAt: timestamp,      // Cuándo aceptó usuario 1
  user2AcceptedAt: timestamp,      // Cuándo aceptó usuario 2
  createdAt: timestamp,            // Cuándo se creó el match
  expiresAt: timestamp,            // Expira al final de la semana
  mutualAt: timestamp              // Cuándo se hizo mutuo
}
```

### **Colección: `userWeeklyMatches`**
```javascript
{
  id: "user_uid_2024-W01",         // ID del usuario + semana
  userId: "user_uid",               // ID del usuario
  weekId: "2024-W01",              // Identificador de la semana
  matches: [                        // Array de matches del usuario
    {
      matchId: "user1_user2_2024-W01",
      matchedUserId: "matched_user_uid",
      matchedUserData: {            // Datos del usuario matcheado
        displayName: "Nombre del Usuario",
        photoURL: "https://...",
        age: 25,
        location: "Ciudad, País",
        description: "Descripción personal",
        hobbies: ["Hobby1", "Hobby2"],
        email: "usuario@email.com"
      },
      status: "pending" | "accepted" | "rejected" | "mutual"
    }
  ],
  totalMatches: 3-5,               // Número total de matches
  createdAt: timestamp,             // Cuándo se crearon los matches
  updatedAt: timestamp              // Última actualización
}
```

## 🔧 Componentes Implementados

### **1. `matching.tsx` - Pantalla Principal**
- **Ubicación**: `app/(tabs)/matching.tsx`
- **Funcionalidades**:
  - Mostrar 3-5 matches semanales
  - Estados de matching (pendiente, aceptado, mutuo, rechazado)
  - Timer de próxima semana
  - Botones de acción por match
  - Control de pausa/reanudación

### **2. `useWeeklyMatching.js` - Hook Personalizado**
- **Ubicación**: `src/features/matching/useWeeklyMatching.js`
- **Funcionalidades**:
  - Gestión de matches semanales
  - Algoritmo de matching mutuo
  - Verificación de tiempo (semanal)
  - Estados de match bidireccional
  - Timer semanal en tiempo real

### **3. Script de Migración**
- **Ubicación**: `scripts/migrate-to-weekly-matching.js`
- **Funcionalidades**:
  - Limpiar datos antiguos
  - Crear nueva estructura
  - Poblar usuarios de prueba
  - Generar matches semanales

## 🚀 Flujo del Nuevo Sistema

### **1. Generación Semanal**
1. Sistema verifica si es nueva semana
2. Obtiene todos los usuarios disponibles
3. Crea pares mutuos aleatorios
4. Asigna 3-5 matches por usuario
5. Guarda en Firebase con estructura mutua

### **2. Interfaz de Usuario**
1. Usuario ve lista de 3-5 matches
2. Cada match muestra información completa
3. Estados visuales claros (pendiente, aceptado, mutuo)
4. Botones de acción por match
5. Timer semanal para próximos matches

### **3. Estados de Match**
1. **Pendiente**: Usuario ve el match pero no ha respondido
2. **Aceptado**: Usuario aceptó pero el otro no
3. **Mutuo**: Ambos usuarios se aceptaron (💕)
4. **Rechazado**: Usuario rechazó el match

## 🎨 Diseño y UX

### **Nueva Interfaz**
- **Lista vertical** de matches en lugar de una sola card
- **Cards compactas** con información esencial
- **Estados visuales** claros con iconos y colores
- **Botones de acción** por match individual
- **Timer semanal** en lugar de diario

### **Estados Visuales**
- **Pendiente**: ⏳ "Esperando tu respuesta"
- **Aceptado**: ✅ "Aceptado - Esperando respuesta"
- **Mutuo**: 💕 "¡Match Mutuo! Pueden chatear"
- **Rechazado**: ❌ "Rechazado"

### **Colores y Estilos**
- **Primario**: #E9631A (naranja de la app)
- **Éxito**: #4CAF50 (verde para aceptar)
- **Mutuo**: #FF6B6B (rosa para match mutuo)
- **Error**: #F44336 (rojo para rechazar)
- **Fondo**: #f8fafc (gris claro)

## 🔒 Seguridad y Privacidad

### **Reglas de Firestore Actualizadas**
```javascript
// weeklyMatches - Solo usuarios involucrados
match /weeklyMatches/{matchId} {
  allow read: if request.auth != null && 
    (request.auth.uid == resource.data.userId1 || 
     request.auth.uid == resource.data.userId2);
}

// userWeeklyMatches - Solo el usuario propietario
match /userWeeklyMatches/{userWeekId} {
  allow read: if request.auth != null && 
    request.auth.uid == resource.data.userId;
}
```

### **Protección de Datos**
- ✅ **Matching mutuo**: Solo usuarios que se ven entre sí
- ✅ **Datos limitados**: Solo información pública del perfil
- ✅ **Privacidad garantizada**: Cada usuario solo ve sus matches
- ✅ **Expiración semanal**: Los matches expiran al final de la semana

## 🧪 Testing y Migración

### **Script de Migración**
```bash
npm run migrate-weekly-matching
```

### **Usuarios de Prueba Incluidos**
- 8 usuarios con perfiles completos
- Datos realistas (nombres, edades, hobbies, ubicaciones)
- Perfiles públicos para aparecer en matching
- Diversidad de intereses y edades

### **Casos de Prueba**
1. **Generación semanal**: Verificar que se crean 3-5 matches
2. **Matching mutuo**: Verificar que ambos usuarios se ven
3. **Estados de match**: Probar aceptar/rechazar matches
4. **Timer semanal**: Verificar cuenta regresiva
5. **Expiración**: Verificar que los matches expiran

## 🔮 Ventajas del Nuevo Sistema

### **Para Usuarios**
- **Más oportunidades**: 3-5 matches por semana vs 1 por día
- **Matching mutuo**: Mayor probabilidad de conexión real
- **Mejor experiencia**: Lista clara de opciones
- **Control total**: Pausar/reanudar cuando quiera

### **Para la App**
- **Mayor engagement**: Más interacciones por usuario
- **Mejor retención**: Sistema más atractivo
- **Datos más ricos**: Mejor comprensión de preferencias
- **Escalabilidad**: Fácil ajustar número de matches

## 📱 Cómo Usar

### **Para Desarrolladores**
1. **Ejecutar migración**:
   ```bash
   npm run migrate-weekly-matching
   ```

2. **Actualizar reglas de Firestore**:
   - Copiar reglas de `firestore-rules-weekly-matching.js`
   - Aplicar en Firebase Console

3. **Probar funcionalidad**:
   - Navegar a `/(tabs)/matching`
   - Verificar que aparecen 3-5 matches
   - Probar aceptar/rechazar matches

### **Para Usuarios**
1. **Configurar perfil público**:
   - Ir a Perfil → Editar
   - Asegurar que `isPublic: true`
   - Completar información (edad, ubicación, hobbies)

2. **Usar el nuevo sistema**:
   - Ir a la pestaña "Conectar Semanal"
   - Ver lista de 3-5 matches semanales
   - Aceptar o rechazar cada match
   - Esperar próxima semana para nuevos matches

## 🎉 Conclusión

El nuevo sistema de matching semanal mutuo está **completamente implementado** y ofrece:
- **Mejor experiencia de usuario** con más opciones
- **Mayor probabilidad de conexión** con matching mutuo
- **Sistema más atractivo** con 3-5 matches por semana
- **Arquitectura escalable** para futuras mejoras

---

**¡El sistema de matching semanal mutuo está listo para conectar usuarios de manera más efectiva!** 💕
