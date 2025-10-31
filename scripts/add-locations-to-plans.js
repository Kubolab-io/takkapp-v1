const admin = require('firebase-admin');
const serviceAccount = require('../firebaseconfig.ts');

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// Ubicaciones de ejemplo en Bogotá
const sampleLocations = [
  {
    name: 'Parque Simón Bolívar',
    latitude: 4.6483,
    longitude: -74.0962,
    address: 'Parque Simón Bolívar, Bogotá'
  },
  {
    name: 'Museo del Oro',
    latitude: 4.6015,
    longitude: -74.0719,
    address: 'Museo del Oro, Bogotá'
  },
  {
    name: 'Ciclovía de la 26',
    latitude: 4.6561,
    longitude: -74.0597,
    address: 'Ciclovía de la 26, Bogotá'
  },
  {
    name: 'Zona Rosa',
    latitude: 4.6614,
    longitude: -74.0522,
    address: 'Zona Rosa, Bogotá'
  },
  {
    name: 'Usaquén',
    latitude: 4.6974,
    longitude: -74.0331,
    address: 'Usaquén, Bogotá'
  },
  {
    name: 'La Candelaria',
    latitude: 4.5981,
    longitude: -74.0758,
    address: 'La Candelaria, Bogotá'
  }
];

async function addLocationsToPlans() {
  try {
    console.log('🔍 Buscando planes sin ubicación...');
    
    // Obtener todos los posts de tipo 'activity'
    const postsSnapshot = await db.collection('posts')
      .where('type', '==', 'activity')
      .get();
    
    if (postsSnapshot.empty) {
      console.log('❌ No se encontraron planes');
      return;
    }
    
    console.log(`📄 Encontrados ${postsSnapshot.size} planes`);
    
    const batch = db.batch();
    let updatedCount = 0;
    
    postsSnapshot.forEach((doc, index) => {
      const postData = doc.data();
      
      // Solo actualizar si no tiene locationData
      if (!postData.locationData) {
        const randomLocation = sampleLocations[index % sampleLocations.length];
        
        batch.update(doc.ref, {
          locationData: {
            latitude: randomLocation.latitude,
            longitude: randomLocation.longitude,
            address: randomLocation.address
          },
          location: randomLocation.name // También actualizar el campo location
        });
        
        console.log(`📍 Agregando ubicación a "${postData.title}": ${randomLocation.name}`);
        updatedCount++;
      }
    });
    
    if (updatedCount > 0) {
      await batch.commit();
      console.log(`✅ Se actualizaron ${updatedCount} planes con ubicaciones`);
    } else {
      console.log('ℹ️ Todos los planes ya tienen ubicación');
    }
    
  } catch (error) {
    console.error('❌ Error agregando ubicaciones:', error);
  }
}

// Ejecutar el script
addLocationsToPlans()
  .then(() => {
    console.log('🎉 Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });














