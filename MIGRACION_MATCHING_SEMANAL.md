# 🚀 Migración al Sistema de Matching Semanal

## 📋 Instrucciones de Migración

Este documento explica cómo migrar del sistema de matching diario al nuevo sistema semanal mutuo.

## ⚠️ Antes de Empezar

### **Backup de Datos**
```bash
# Hacer backup de la base de datos actual
firebase firestore:export gs://tu-bucket/backup-$(date +%Y%m%d)
```

### **Verificar Dependencias**
```bash
# Asegurar que tienes firebase-admin instalado
npm install firebase-admin
```

## 🔄 Proceso de Migración

### **Paso 1: Ejecutar Script de Migración**
```bash
# Ejecutar el script de migración
npm run migrate-weekly-matching
```

Este script:
- ✅ Limpia datos antiguos (`dailyMatches`, `userWeeklyMatches`, `weeklyMatches`)
- ✅ Crea 8 usuarios de prueba con perfiles completos
- ✅ Genera matches semanales mutuos
- ✅ Configura la nueva estructura de datos

### **Paso 2: Actualizar Reglas de Firestore**
1. Ir a Firebase Console → Firestore Database → Rules
2. Copiar el contenido de `firestore-rules-weekly-matching.js`
3. Pegar en las reglas de Firestore
4. Publicar las reglas

### **Paso 3: Probar el Sistema**
```bash
# Ejecutar pruebas de validación
npm run test-weekly-matching
```

Este script verifica:
- ✅ Estructura de datos correcta
- ✅ Matching mutuo funcionando
- ✅ Distribución de 3-5 matches por usuario
- ✅ Estados de match correctos

### **Paso 4: Actualizar la App**
1. **Navegar a la nueva pantalla**:
   - Ir a `/(tabs)/matching`
   - Verificar que aparecen 3-5 matches

2. **Probar funcionalidades**:
   - Aceptar/rechazar matches
   - Ver estados de match
   - Verificar timer semanal

## 📊 Verificación Post-Migración

### **Estructura de Datos Esperada**
```javascript
// weeklyMatches: ~28 documentos (7 usuarios × 4 matches promedio)
// userWeeklyMatches: ~7 documentos (1 por usuario)
// userProfiles: ~8 documentos (usuarios de prueba)
```

### **Funcionalidades a Verificar**
- ✅ **Lista de matches**: 3-5 matches por usuario
- ✅ **Matching mutuo**: Si A ve a B, B también ve a A
- ✅ **Estados de match**: Pendiente, Aceptado, Mutuo, Rechazado
- ✅ **Timer semanal**: Cuenta regresiva hasta próxima semana
- ✅ **Botones de acción**: Aceptar/Rechazar por match

## 🎯 Nuevas Funcionalidades

### **Sistema Semanal**
- **3-5 matches por semana** en lugar de 1 por día
- **Timer semanal** en lugar de diario
- **Generación automática** cada semana

### **Matching Mutuo**
- **Bidireccional**: Si Juan ve a Camila, Camila ve a Juan
- **Estados sincronizados**: Ambos usuarios ven el mismo estado
- **Match mutuo**: Solo cuando ambos aceptan

### **Interfaz Mejorada**
- **Lista de matches** en lugar de una sola card
- **Cards compactas** con información esencial
- **Estados visuales** claros con iconos
- **Botones de acción** por match individual

## 🔧 Configuración Adicional

### **Variables de Entorno**
```javascript
// En firebaseconfig.ts
export const WEEKLY_MATCHING_CONFIG = {
  MIN_MATCHES: 3,
  MAX_MATCHES: 5,
  WEEK_DURATION: 7 * 24 * 60 * 60 * 1000, // 7 días en ms
  MATCH_EXPIRY: 7 * 24 * 60 * 60 * 1000   // 7 días en ms
};
```

### **Reglas de Firestore**
```javascript
// Asegurar que las reglas incluyen:
// - weeklyMatches: Solo usuarios involucrados
// - userWeeklyMatches: Solo el usuario propietario
// - userProfiles: Solo el usuario propietario
```

## 🚨 Solución de Problemas

### **Error: "No hay usuarios disponibles"**
```bash
# Verificar que los usuarios tienen consentimiento
# Ejecutar script de población nuevamente
npm run migrate-weekly-matching
```

### **Error: "Matches no mutuos"**
```bash
# Verificar algoritmo de matching
# Revisar logs del script de migración
```

### **Error: "Estructura de datos incorrecta"**
```bash
# Limpiar datos y empezar de nuevo
# Ejecutar script de migración
npm run migrate-weekly-matching
```

### **Error: "Reglas de Firestore"**
```bash
# Verificar que las reglas están actualizadas
# Revisar permisos en Firebase Console
```

## 📱 Uso en la App

### **Para Desarrolladores**
1. **Navegar a la nueva pantalla**:
   ```javascript
   router.push('/(tabs)/matching');
   ```

2. **Usar el nuevo hook**:
   ```javascript
   import { useWeeklyMatching } from '@/src/features/matching/useWeeklyMatching';
   
   const {
     weeklyMatches,
     loading,
     acceptMatch,
     rejectMatch
   } = useWeeklyMatching(user);
   ```

### **Para Usuarios**
1. **Ir a "Conectar Semanal"** en la tab bar
2. **Ver lista de 3-5 matches** semanales
3. **Aceptar o rechazar** cada match
4. **Esperar próxima semana** para nuevos matches

## 🎉 Resultado Final

Después de la migración exitosa:
- ✅ **Sistema semanal** funcionando
- ✅ **Matching mutuo** implementado
- ✅ **3-5 matches por semana** por usuario
- ✅ **Interfaz mejorada** con lista de matches
- ✅ **Estados de match** claros y funcionales
- ✅ **Timer semanal** en funcionamiento

## 📞 Soporte

Si encuentras problemas durante la migración:
1. **Revisar logs** del script de migración
2. **Verificar estructura** de datos en Firebase Console
3. **Ejecutar pruebas** de validación
4. **Consultar documentación** en `SISTEMA_MATCHING_SEMANAL.md`

---

**¡El sistema de matching semanal mutuo está listo para conectar usuarios de manera más efectiva!** 💕
