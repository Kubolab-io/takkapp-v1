# Configuración de Google Places API

## Pasos para configurar Google Places API

### 1. Crear proyecto en Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Anota el ID del proyecto

### 2. Habilitar Google Places API
1. En el menú lateral, ve a "APIs y servicios" > "Biblioteca"
2. Busca "Places API"
3. Haz clic en "Places API (New)" y luego en "HABILITAR" - ¡IMPORTANTE: Usa la nueva versión!
4. También habilita "Places API" (versión legacy) para compatibilidad

### 3. Crear credenciales
1. Ve a "APIs y servicios" > "Credenciales"
2. Haz clic en "CREAR CREDENCIALES" > "Clave de API"
3. Copia la API key generada

### 4. Configurar la API key en la app
1. Abre el archivo `src/config/googlePlaces.js`
2. Reemplaza `YOUR_GOOGLE_PLACES_API_KEY` con tu API key real
3. Guarda el archivo

### 5. Restringir la API key (Recomendado)
1. En Google Cloud Console, ve a "Credenciales"
2. Haz clic en tu API key
3. En "Restricciones de aplicación", selecciona "Aplicaciones Android" o "Aplicaciones iOS"
4. Agrega el nombre del paquete de tu app

### 6. Configurar facturación
- Google Places API requiere facturación habilitada
- Tienes $200 USD de crédito gratuito por mes
- Después del crédito gratuito, se cobra por uso

## Costos aproximados
- **Autocomplete (por sesión)**: $0.017 USD
- **Place Details (por solicitud)**: $0.017 USD
- **Límite gratuito**: $200 USD/mes

## Funcionalidades implementadas
- ✅ Autocompletado de ubicaciones
- ✅ Restricción a Colombia
- ✅ Idioma en español
- ✅ Detalles completos de ubicación (coordenadas, place_id)
- ✅ Almacenamiento de datos de ubicación en Firebase

## Próximos pasos
- Implementar mapa con marcadores de ubicaciones
- Agregar filtros por proximidad
- Mostrar distancia desde la ubicación del usuario
