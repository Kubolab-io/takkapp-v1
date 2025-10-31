# Sistema de Cupos para Actividades - Takkapp

## Descripción General

Este sistema permite a los usuarios inscribirse en actividades y maneja automáticamente la disponibilidad de cupos. Cuando una persona se inscribe, se bloquea un cupo y se actualiza el perfil del usuario.

## Funcionalidades Implementadas

### 1. Gestión de Cupos
- **Cupos totales**: Se define al crear la actividad (`maxParticipants`)
- **Cupos ocupados**: Contador de participantes inscritos (`participants`)
- **Cupos disponibles**: Campo calculado (`availableSlots`)

### 2. Inscripción a Actividades
- Verificación de cupos disponibles antes de inscribir
- Bloqueo automático de cupo al inscribirse
- Liberación de cupo al cancelar inscripción
- Prevención de inscripciones duplicadas

### 3. Perfil del Usuario
- Estadísticas reales de posts, actividades y comentarios
- Lista de actividades inscritas
- Estado de cada inscripción (confirmada, pendiente)

## Estructura de Datos

### Colección: `posts` (Actividades)
```javascript
{
  id: "post_id",
  type: "activity",
  title: "Título de la actividad",
  maxParticipants: 10,        // Cupos totales
  participants: 3,            // Personas inscritas
  availableSlots: 7,          // Cupos disponibles
  // ... otros campos
}
```

### Colección: `participations` (Inscripciones)
```javascript
{
  id: "participation_id",
  userId: "user_uid",
  postId: "post_id",
  activityTitle: "Título de la actividad",
  activityDate: "Fecha",
  activityLocation: "Ubicación",
  activityEmoji: "🎯",
  status: "confirmed",        // confirmed, pending, cancelled
  createdAt: timestamp
}
```

## Flujo de Inscripción

### 1. Usuario se inscribe
```javascript
// 1. Verificar cupos disponibles
const availableSlots = activityData.maxParticipants - activityData.participants;
if (availableSlots <= 0) {
  // Actividad llena
  return false;
}

// 2. Crear registro de participación
await addDoc(collection(db, "participations"), {
  userId: user.uid,
  postId: postId,
  // ... otros datos
});

// 3. Actualizar contadores
await updateDoc(postRef, {
  participants: increment(1),      // +1 participante
  availableSlots: increment(-1)    // -1 cupo disponible
});
```

### 2. Usuario cancela inscripción
```javascript
// 1. Eliminar participación
await deleteDoc(doc(db, "participations", participation.id));

// 2. Restaurar cupo
await updateDoc(postRef, {
  participants: increment(-1),     // -1 participante
  availableSlots: increment(1)     // +1 cupo disponible
});
```

## Componentes Principales

### useParticipations.js
- Hook principal para manejar participaciones
- Funciones: `joinActivity`, `leaveActivity`, `isUserParticipating`
- Validaciones de cupos y duplicados

### useUserStats.js
- Hook para estadísticas del usuario
- Contadores de posts, actividades, comentarios
- Lista de actividades inscritas

### ActivityCard.tsx
- Muestra información de cupos disponibles
- Botón de inscripción con estado visual
- Indicadores de actividad llena

### perfil.tsx
- Estadísticas reales del usuario
- Lista de actividades inscritas
- Estado de cada inscripción

## Validaciones Implementadas

### Al inscribirse
- ✅ Usuario autenticado
- ✅ No es el creador de la actividad
- ✅ No está ya inscrito
- ✅ Hay cupos disponibles
- ✅ Actividad no está llena

### Al cancelar
- ✅ Usuario autenticado
- ✅ Está inscrito en la actividad
- ✅ Confirmación del usuario

## Estados Visuales

### Botón de Inscripción
- **"¡Me apunto!"** - Verde, cupos disponibles
- **"Actividad llena"** - Gris, sin cupos
- **"Mi actividad"** - Naranja, es el creador

### Indicadores de Cupos
- **Cupos disponibles**: Verde, con número
- **Actividad llena**: Rojo, sin cupos
- **Contador**: "X/Y personas apuntadas"

## Mejoras Futuras

1. **Notificaciones**: Alertas cuando se llenen cupos
2. **Lista de espera**: Para actividades populares
3. **Confirmación automática**: Después de cierta fecha
4. **Estadísticas avanzadas**: Gráficos de participación
5. **Exportación**: Lista de participantes para organizadores

## Archivos Modificados

- `app/(tabs)/features/posts/useParticipations.js` - Lógica de cupos
- `app/(tabs)/features/posts/usePosts.js` - Creación con cupos
- `app/(tabs)/features/auth/useUserStats.js` - Estadísticas del usuario
- `app/(tabs)/perfil.tsx` - Perfil con actividades inscritas
- `app/(tabs)/components/ActivityCard.tsx` - Visualización de cupos

## Testing

Para probar el sistema:

1. **Crear actividad** con cupos limitados
2. **Inscribir usuarios** hasta llenar cupos
3. **Verificar bloqueo** de inscripciones adicionales
4. **Cancelar inscripción** y verificar liberación de cupo
5. **Revisar perfil** para ver actividades inscritas 