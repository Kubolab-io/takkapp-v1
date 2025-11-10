/**
 * usePosts.js
 * 
 * Hook personalizado que maneja toda la lógica relacionada con posts y comentarios:
 * - Listeners en tiempo real de Firebase para posts y comentarios
 * - Funciones para crear posts simples y actividades
 * - Funciones para manejar comentarios (abrir modal, agregar comentarios)
 * - Estados de carga y modales relacionados con posts
 * - Integración con sistema de participaciones
 * - NUEVO: Filtro por ciudad
 */

import { db, storage } from "@/firebaseconfig";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
    updateDoc,
    where
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useParticipations } from "./useParticipations";
import { usePlanChats } from "./usePlanChats";

// Función para obtener la clave de la imagen predeterminada
const getDefaultImageKey = (activityType) => {
  const typeMap = {
    '🍝': 'cocina',
    '🎨': 'art',
    '🎵': 'concert',
    '🏃': 'running',
    '🥾': 'senderismo',
  };
  return typeMap[activityType] || 'art';
};

// Función para subir imagen de actividad a Firebase Storage
const uploadActivityImage = async (imageUri, userId) => {
  try {
    
    // Convertir URI a blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Crear referencia en Storage
    const imageRef = ref(storage, `activity-images/${userId}/${Date.now()}.jpg`);

    // Subir imagen
    const snapshot = await uploadBytes(imageRef, blob);
    
    // Obtener URL de descarga
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error("❌ Error subiendo imagen de actividad:", error);
    throw error;
  }
};

// Función para extraer la ciudad de una dirección
const extractCityFromAddress = (address) => {
  if (!address) return 'Sin ubicación';
  
  // Lista de ciudades principales de Colombia para validación
  const colombianCities = [
    'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Cúcuta', 
    'Bucaramanga', 'Pereira', 'Santa Marta', 'Ibagué', 'Pasto', 'Manizales',
    'Neiva', 'Villavicencio', 'Armenia', 'Valledupar', 'Montería', 'Sincelejo',
    'Popayán', 'Buenaventura', 'Tunja', 'Florencia', 'Riohacha', 'Quibdó',
    'Arauca', 'Yopal', 'Mocoa', 'Leticia', 'San José del Guaviare', 'Inírida',
    'Mitú', 'Puerto Carreño', 'Bogotá D.C.', 'Bogota', 'Medellin', 'Cali'
  ];
  
  // Intentar extraer la ciudad de diferentes formatos de dirección
  const parts = address.split(',').map(part => part.trim());
  
  // Buscar una ciudad conocida en las partes de la dirección
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    
    // Buscar coincidencia exacta
    const exactMatch = colombianCities.find(city => 
      part.toLowerCase() === city.toLowerCase()
    );
    if (exactMatch) {
      return exactMatch;
    }
    
    // Buscar coincidencia parcial (para casos como "Bogotá D.C.")
    const partialMatch = colombianCities.find(city => 
      part.toLowerCase().includes(city.toLowerCase()) || 
      city.toLowerCase().includes(part.toLowerCase())
    );
    if (partialMatch) {
      return partialMatch;
    }
  }
  
  // Si no encuentra una ciudad conocida, intentar extraer del penúltimo elemento
  if (parts.length >= 2) {
    const cityPart = parts[parts.length - 2];
    // Si el penúltimo elemento parece una ciudad (no contiene números)
    if (!/\d/.test(cityPart) && cityPart.length > 2) {
      return cityPart;
    }
  }
  
  // Si no se puede extraer, devolver 'Sin ubicación'
  return 'Sin ubicación';
};

// Función para extraer ciudad de locationData
const getCityFromLocationData = (locationData, location) => {
  // Lista de ciudades principales de Colombia para validación
  const colombianCities = [
    'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Cúcuta', 
    'Bucaramanga', 'Pereira', 'Santa Marta', 'Ibagué', 'Pasto', 'Manizales',
    'Neiva', 'Villavicencio', 'Armenia', 'Valledupar', 'Montería', 'Sincelejo',
    'Popayán', 'Buenaventura', 'Tunja', 'Florencia', 'Riohacha', 'Quibdó',
    'Arauca', 'Yopal', 'Mocoa', 'Leticia', 'San José del Guaviare', 'Inírida',
    'Mitú', 'Puerto Carreño', 'Bogotá D.C.', 'Bogota', 'Medellin', 'Cali',
    // Ciudades de Cundinamarca y área metropolitana
    'Chía', 'Soacha', 'Zipaquirá', 'Facatativá', 'Girardot', 'Madrid',
    'Mosquera', 'Sibaté', 'Tabio', 'Tenjo', 'Cajicá', 'Cota',
    // Otras ciudades importantes
    'Sabaneta', 'Itagüí', 'Envigado', 'Bello', 'Copacabana', 'Girón',
    'Floridablanca', 'Piedecuesta', 'Soledad', 'Malambo', 'Sabanalarga'
  ];
  
  // Función auxiliar para validar si es una ciudad conocida
  const isValidCity = (cityName) => {
    if (!cityName) return false;
    return colombianCities.some(city => 
      city.toLowerCase() === cityName.toLowerCase() ||
      cityName.toLowerCase().includes(city.toLowerCase())
    );
  };
  
  // 1. Primero intentar con el campo city si existe y es válido
  if (locationData?.city && isValidCity(locationData.city)) {
    return locationData.city;
  }
  
  // 2. Intentar con components de Google Places API (más confiable)
  if (locationData?.components) {
    const components = locationData.components;
    // Buscar en diferentes tipos de componentes
    const cityTypes = ['locality', 'administrative_area_level_2', 'administrative_area_level_1'];
    
    for (const type of cityTypes) {
      if (components[type] && isValidCity(components[type])) {
        return components[type];
      }
    }
  }
  
  // 3. Luego intentar extraer de la dirección completa
  if (locationData?.address) {
    const extractedCity = extractCityFromAddress(locationData.address);
    if (extractedCity !== 'Sin ubicación') {
      return extractedCity;
    }
  }
  
  // 4. Finalmente intentar con el campo location
  if (location) {
    const extractedCity = extractCityFromAddress(location);
    if (extractedCity !== 'Sin ubicación') {
      return extractedCity;
    }
  }
  
  return 'Sin ubicación';
};

export const usePosts = (user) => {

const [post, setPost] = useState("");
const [loading, setLoading] = useState(false);
const [posts, setPosts] = useState([]);
const [featuredPosts, setFeaturedPosts] = useState([]);
const [rawPostsData, setRawPostsData] = useState([]); // Datos sin procesar de Firebase
const [showCreateForm, setShowCreateForm] = useState(false);

// ===== NUEVOS ESTADOS PARA FILTRO POR CIUDAD =====
const [selectedCity, setSelectedCity] = useState('Todas');
const [availableCities, setAvailableCities] = useState(['Todas']);

// Estados para actividades
const [activityTitle, setActivityTitle] = useState("");
const [activityDescription, setActivityDescription] = useState("");
const [activityLocation, setActivityLocation] = useState("");
const [activityLocationData, setActivityLocationData] = useState(null);
const [activityPrice, setActivityPrice] = useState("");
const [activityDate, setActivityDate] = useState("");
const [activityDateObject, setActivityDateObject] = useState(null);
const [activityTime, setActivityTime] = useState("");
const [activityType, setActivityType] = useState("");
const [maxParticipants, setMaxParticipants] = useState("");
const [activityImage, setActivityImage] = useState(null);
const [showImagePicker, setShowImagePicker] = useState(false);
// 🎯 Estados para destacar planes
const [shouldHighlight, setShouldHighlight] = useState(false);
const [userTokens, setUserTokens] = useState(0);

// Estados para comentarios
const [showCommentsModal, setShowCommentsModal] = useState(false);
const [selectedPost, setSelectedPost] = useState(null);
const [comments, setComments] = useState([]);
const [newComment, setNewComment] = useState("");
const [loadingComment, setLoadingComment] = useState(false);

// Hook de participaciones - IMPORTANTE: guardar la referencia completa
const participationsHook = useParticipations(user);
const {
  myParticipations,
  loadingParticipation,
  isUserParticipating,
  getUserParticipation,
  leaveActivity,
  getActivityParticipants,
} = participationsHook;

// Hook para chats de planes
const { createPlanChat } = usePlanChats(user);

// Función auxiliar para obtener el nombre a mostrar
const getDisplayName = (userObj) => {
  if (userObj?.displayName) return userObj.displayName;
  if (userObj?.email) return userObj.email.split('@')[0];
  return "Usuario";
};

// Función auxiliar para verificar si una fecha es futura
const isFutureDate = (dateValue) => {
  if (!dateValue) return false;
  
  try {
    let date;
    
    // Si es un timestamp de Firebase
    if (dateValue.seconds && dateValue.nanoseconds) {
      date = new Date(dateValue.seconds * 1000);
    }
    // Si es un string de fecha
    else if (typeof dateValue === 'string') {
      date = new Date(dateValue);
    }
    // Si es un objeto Date
    else if (dateValue instanceof Date) {
      date = dateValue;
    }
    else {
      return false;
    }
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      return false;
    }
    
    // Comparar con la fecha y hora actual
    const now = new Date();
    
    // Debug: Log para ver qué fechas se están evaluando
    console.log('🔍 Evaluando fecha:', {
      originalValue: dateValue,
      parsedDate: date.toISOString(),
      now: now.toISOString(),
      isFuture: date >= now
    });
    
    return date >= now;
  } catch (error) {
    console.error('Error verificando fecha:', error);
    return false;
  }
};

// 🎯 Cargar tokens del usuario
useEffect(() => {
  if (!user) {
    setUserTokens(0);
    return;
  }

  const loadUserTokens = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'userProfiles', user.uid));
      if (userDoc.exists()) {
        const tokens = userDoc.data().highlightTokens || 0;
        setUserTokens(tokens);
        console.log('🎯 Tokens del usuario:', tokens);
      }
    } catch (error) {
      console.error('Error cargando tokens:', error);
    }
  };

  loadUserTokens();
}, [user]);

// Escuchar posts en tiempo real
useEffect(() => {
  if (!user) {
    // Limpiar posts cuando no hay usuario
    setPosts([]);
    setFeaturedPosts([]);
    setAvailableCities(['Todas']);
    return;
  }
  
  const q = query(
    collection(db, "posts"), 
    where("type", "in", ["simple", "activity"])
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    // Verificar que el usuario sigue autenticado
    if (!user || !user.uid) {
      setFeaturedPosts([]);
      setPosts([]);
      setAvailableCities(['Todas']);
      return;
    }
    
    // Solo extraer los datos básicos del snapshot
    const rawPostsData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt || Timestamp.now()
    }));
    
    // Actualizar el estado con datos sin procesar
    setRawPostsData(rawPostsData);
  }, (error) => {
    console.error("❌ Error en listener de posts:", error);
    // Si hay error de permisos, limpiar el estado
    if (error.code === 'permission-denied') {
      setFeaturedPosts([]);
      setPosts([]);
      setAvailableCities(['Todas']);
      return;
    }
    // Solo mostrar alerta si hay usuario (para evitar errores de permisos al cerrar sesión)
    if (user) {
      Alert.alert("Error", "No se pudieron cargar los posts: " + error.message);
    }
  });

  return () => {
    unsubscribe();
  };
}, [user]);

// ===== PROCESAMIENTO OPTIMIZADO DE POSTS =====
// Mover todo el procesamiento pesado fuera del listener usando useMemo
const processedPostsData = useMemo(() => {
  if (!rawPostsData.length) {
    return {
      featured: [],
      normal: [],
      cities: ['Todas']
    };
  }

  // Ubicaciones de ejemplo en diferentes ciudades para planes sin ubicación
  const sampleLocations = [
    { latitude: 4.6483, longitude: -74.0962, address: 'Parque Simón Bolívar, Bogotá', city: 'Bogotá' },
    { latitude: 4.6015, longitude: -74.0719, address: 'Museo del Oro, Bogotá', city: 'Bogotá' },
    { latitude: 6.2442, longitude: -75.5812, address: 'Parque Lleras, Medellín', city: 'Medellín' },
    { latitude: 6.2476, longitude: -75.5658, address: 'Pueblito Paisa, Medellín', city: 'Medellín' },
    { latitude: 3.4516, longitude: -76.5320, address: 'Centro Comercial Chipichape, Cali', city: 'Cali' },
    { latitude: 3.4516, longitude: -76.5320, address: 'Zoológico de Cali, Cali', city: 'Cali' },
    { latitude: 10.9685, longitude: -74.7813, address: 'Castillo San Felipe, Cartagena', city: 'Cartagena' },
    { latitude: 10.4236, longitude: -75.5350, address: 'Playa Blanca, Cartagena', city: 'Cartagena' },
    { latitude: 7.1193, longitude: -73.1227, address: 'Parque Nacional del Chicamocha, Bucaramanga', city: 'Bucaramanga' },
    { latitude: 4.8133, longitude: -75.6961, address: 'Parque del Café, Armenia', city: 'Armenia' }
  ];

  // Set para almacenar ciudades únicas
  const citiesSet = new Set();

  const postsData = rawPostsData.map((data, index) => {
    // Si es una actividad y no tiene locationData, agregar una ubicación de prueba
    if (data.type === 'activity' && !data.locationData) {
      const randomLocation = sampleLocations[index % sampleLocations.length];
      data.locationData = {
        latitude: randomLocation.latitude,
        longitude: randomLocation.longitude,
        address: randomLocation.address,
        city: randomLocation.city
      };
      data.location = randomLocation.address.split(',')[0];
    }
    
    // Extraer ciudad para el filtro
    if (data.type === 'activity') {
      const city = getCityFromLocationData(data.locationData, data.location);
      data.city = city;
      
      if (city && city !== 'Sin ubicación') {
        citiesSet.add(city);
      }
    }
    
    return data;
  });

  // Filtrar y limpiar ciudades disponibles
  const cleanedCities = Array.from(citiesSet).filter(city => {
    if (city === 'Sin ubicación') return false;
    if (/\d/.test(city)) return false;
    if (city.includes('Cl.') || city.includes('Carr.') || city.includes('Av.')) return false;
    if (city.length < 3) return false;
    
    const colombianCities = [
      'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Cúcuta', 
      'Bucaramanga', 'Pereira', 'Santa Marta', 'Ibagué', 'Pasto', 'Manizales',
      'Neiva', 'Villavicencio', 'Armenia', 'Valledupar', 'Montería', 'Sincelejo',
      'Popayán', 'Buenaventura', 'Tunja', 'Florencia', 'Riohacha', 'Quibdó',
      'Arauca', 'Yopal', 'Mocoa', 'Leticia', 'San José del Guaviare', 'Inírida',
      'Mitú', 'Puerto Carreño', 'Bogotá D.C.', 'Bogota', 'Medellin', 'Cali',
      'Chía', 'Soacha', 'Zipaquirá', 'Facatativá', 'Girardot', 'Madrid',
      'Mosquera', 'Sibaté', 'Tabio', 'Tenjo', 'Cajicá', 'Cota',
      'Sabaneta', 'Itagüí', 'Envigado', 'Bello', 'Copacabana', 'Girón',
      'Floridablanca', 'Piedecuesta', 'Soledad', 'Malambo', 'Sabanalarga'
    ];
    
    return colombianCities.some(knownCity => 
      knownCity.toLowerCase() === city.toLowerCase() ||
      city.toLowerCase().includes(knownCity.toLowerCase())
    );
  });
  
  const citiesList = cleanedCities.sort((a, b) => {
    if (a === 'Todas') return -1;
    if (b === 'Todas') return 1;
    return a.localeCompare(b);
  });
  
  // Separar posts destacados de posts normales
  // 🎯 Filtrar destacados que no hayan expirado (24 horas)
  const now = new Date();
  const featured = postsData.filter(post => {
    if (!post.isFeatured) return false;
    
    // Si tiene fecha de expiración, verificar si ya expiró
    if (post.featuredExpiresAt) {
      const expiresAt = post.featuredExpiresAt.toDate 
        ? post.featuredExpiresAt.toDate() 
        : new Date(post.featuredExpiresAt.seconds * 1000);
      
      if (now >= expiresAt) {
        console.log('⏰ Plan destacado expirado:', post.title, {
          expiresAt: expiresAt.toISOString(),
          now: now.toISOString()
        });
        return false; // Excluir de destacados si ya expiró
      }
    }
    
    return true;
  });
  
  const normal = postsData.filter(post => !post.isFeatured);
  
  // Ordenar posts destacados por fecha de destacado
  const sortedFeatured = featured.sort((a, b) => {
    const timeA = a.featuredAt?.toDate ? a.featuredAt.toDate().getTime() : 0;
    const timeB = b.featuredAt?.toDate ? b.featuredAt.toDate().getTime() : 0;
    return timeB - timeA;
  });
  
  // Ordenar posts normales por fecha de creación
  const sortedNormal = normal.sort((a, b) => {
    const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
    const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
    return timeB - timeA;
  });
  
  return {
    featured: sortedFeatured,
    normal: sortedNormal,
    cities: ['Todas', ...citiesList]
  };
}, [rawPostsData]);

// Actualizar estados cuando cambien los datos procesados
useEffect(() => {
  setFeaturedPosts(processedPostsData.featured);
  setPosts(processedPostsData.normal);
  setAvailableCities(processedPostsData.cities);
}, [processedPostsData]);

// ===== FUNCIÓN PARA FILTRAR ACTIVIDADES POR CIUDAD =====
const getFilteredActivities = useMemo(() => {
  // Función para filtrar actividades por ciudad y fecha
  const filterActivities = (activities) => {
    return activities.filter(post => {
      // Solo actividades
      if (post.type !== 'activity') return false;
      
      // Filtrar por ciudad si no es 'Todas'
      if (selectedCity !== 'Todas' && post.city !== selectedCity) {
        return false;
      }
      
      // TEMPORAL: Mostrar todas las actividades sin filtrar por fecha
      // TODO: Arreglar el sistema de fechas después
      // if (!isFutureDate(post.date)) {
      //   return false;
      // }
      
      return true;
    });
  };
  
  // Debug: Log para ver qué actividades se están cargando
  console.log('📊 Actividades cargadas:', {
    totalFeatured: featuredPosts.length,
    totalNormal: posts.length,
    selectedCity: selectedCity
  });
  
  const filteredFeatured = filterActivities(featuredPosts);
  const filteredNormal = filterActivities(posts);
  
  console.log('✅ Actividades filtradas:', {
    featured: filteredFeatured.length,
    normal: filteredNormal.length
  });
  
  return {
    featured: filteredFeatured,
    normal: filteredNormal
  };
}, [selectedCity, featuredPosts, posts]);

// ===== FUNCIÓN PARA OBTENER ESTADÍSTICAS POR CIUDAD =====
const getCityStatistics = () => {
  const stats = {};
  
  // Combinar todos los posts de tipo activity (sin filtrar por fecha por ahora)
  const allActivities = [...featuredPosts, ...posts].filter(p => 
    p.type === 'activity'
  );
  
  allActivities.forEach(activity => {
    const city = activity.city || 'Sin ubicación';
    if (!stats[city]) {
      stats[city] = {
        count: 0,
        featured: 0,
        availableSlots: 0
      };
    }
    stats[city].count++;
    if (activity.isFeatured) stats[city].featured++;
    stats[city].availableSlots += activity.availableSlots || 0;
  });
  
  return stats;
};

// Escuchar comentarios del post seleccionado
useEffect(() => {
  if (!selectedPost || !user) {
    // Limpiar comentarios cuando no hay post seleccionado o usuario
    setComments([]);
    return;
  }

  const commentsQuery = query(
    collection(db, "posts"),
    where("type", "==", "comment"),
    where("parentId", "==", selectedPost.id),
    orderBy("createdAt", "asc")
  );
  
  const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
    const commentsData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setComments(commentsData);
  }, (error) => {
    console.error("❌ Error en listener de comentarios:", error);
    // Solo mostrar alerta si hay usuario
    if (user) {
      Alert.alert("Error", "No se pudieron cargar los comentarios: " + error.message);
    }
  });

  return () => unsubscribe();
}, [selectedPost, user]);

// Función para crear posts (cuando alguien crea una actividad, se auto-inscribe)
const handlePost = async () => {
  if (!user) {
    Alert.alert("Error", "Debes estar autenticado para publicar");
    return;
  }


  if (!showCreateForm) {
    // Publicar post simple
    if (post.trim() === "") {
      Alert.alert("Error", "El post no puede estar vacío");
      return;
    }
    
    try {
      setLoading(true);
      
      const postData = {
        text: post.trim(),
        createdAt: serverTimestamp(),
        type: "simple",
        author: getDisplayName(user),
        authorEmail: user.email || '',
        authorId: user.uid || ''
      };
      
      const docRef = await addDoc(collection(db, "posts"), postData);
      
      setPost("");
      Alert.alert("✅ Éxito", "Post publicado correctamente");
      
    } catch (error) {
      console.error("❌ Error guardando post:", error);
      Alert.alert("❌ Error", error.message);
    } finally {
      setLoading(false);
    }
  } else {
    // Crear actividad
    if (activityTitle.trim() === "" || activityDate.trim() === "" || activityTime.trim() === "" || activityLocation.trim() === "" || activityDescription.trim() === "" || !activityImage) {
      Alert.alert("Error", "Por favor completa todos los campos obligatorios (incluyendo la descripción, fecha, hora) y selecciona una imagen");
      return;
    }

    const numParticipants = parseInt(maxParticipants);
    if (!maxParticipants || isNaN(numParticipants) || numParticipants < 2 || numParticipants > 100) {
      Alert.alert("Error", "Ingresa un número válido de cupos (entre 2 y 100)");
      return;
    }
    
    try {
      setLoading(true);
      
      let imageUrl = null;
      
      // Si es una imagen subida por el usuario, subirla a Firebase Storage
      if (activityImage?.type === 'uploaded' && activityImage.uri) {
        imageUrl = await uploadActivityImage(activityImage.uri, user.uid);
      }
      
      // Extraer ciudad de los datos de ubicación
      const cityName = getCityFromLocationData(activityLocationData, activityLocation);
      
      // Convertir fecha a timestamp de Firebase
      let dateTimestamp = null;
      if (activityDate.trim()) {
        try {
          let dateObj;
          
          // Si tenemos activityDateObject (objeto Date real), usarlo directamente
          if (activityDateObject && activityDateObject instanceof Date) {
            dateObj = activityDateObject;
            console.log('✅ Usando objeto Date real:', dateObj.toISOString());
          }
          // Si activityDate es un string ISO, parsearlo
          else if (activityDate.includes('T') || activityDate.includes('-')) {
            dateObj = new Date(activityDate.trim());
            console.log('✅ Parseando string ISO:', dateObj.toISOString());
          } 
          // Si es un string formateado en español, intentar parsearlo
          else {
            // Intentar parsear el string formateado
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            
            if (activityDate.toLowerCase().includes('hoy')) {
              dateObj = today;
            } else if (activityDate.toLowerCase().includes('mañana')) {
              dateObj = tomorrow;
            } else {
              // Para otros casos, usar la fecha actual como fallback seguro
              dateObj = today;
            }
            console.log('✅ Parseando string formateado:', dateObj.toISOString());
          }
          
          if (!isNaN(dateObj.getTime())) {
            dateTimestamp = Timestamp.fromDate(dateObj);
            console.log('✅ Fecha convertida a timestamp:', {
              original: activityDate,
              parsed: dateObj.toISOString(),
              timestamp: dateTimestamp
            });
          }
        } catch (error) {
          console.error('Error convirtiendo fecha:', error);
          // Fallback seguro: usar fecha actual
          dateTimestamp = Timestamp.fromDate(new Date());
        }
      }

      // 🎯 Calcular fecha de expiración si se va a destacar (24 horas desde ahora)
      const now = new Date();
      const expirationDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 horas en milisegundos
      
      const activityData = {
        title: activityTitle.trim(),
        content: activityDescription.trim(),
        location: activityLocation.trim(),
        locationData: activityLocationData, // Datos completos de Google Places
        city: cityName, // NUEVO: Agregar campo ciudad
        price: activityPrice.trim() || "Gratis",
        date: dateTimestamp || activityDate.trim(), // Usar timestamp si es posible, sino string
        time: activityTime.trim(),
        emoji: activityType,
        image: imageUrl, // URL de Firebase Storage o null
        imageType: activityImage?.type === 'uploaded' ? 'uploaded' : 'default',
        defaultImageKey: activityImage?.type === 'predefined' ? activityImage.key : getDefaultImageKey(activityType),
        createdAt: serverTimestamp(),
        type: "activity",
        participants: 1, // El creador ya está apuntado
        maxParticipants: numParticipants,
        availableSlots: numParticipants - 1, // Cupos disponibles (excluyendo al creador)
        author: getDisplayName(user),
        authorEmail: user.email || '',
        authorId: user.uid || '',
        // 🎯 Campos de destacado
        isFeatured: shouldHighlight && userTokens > 0, // Solo destacar si tiene tokens
        featuredAt: shouldHighlight && userTokens > 0 ? serverTimestamp() : null,
        featuredBy: shouldHighlight && userTokens > 0 ? user.uid : null,
        featuredExpiresAt: shouldHighlight && userTokens > 0 ? Timestamp.fromDate(expirationDate) : null
      };
      
      const docRef = await addDoc(collection(db, "posts"), activityData);
      
      // 🎯 Si se destacó el plan, consumir un token
      if (shouldHighlight && userTokens > 0) {
        try {
          const userRef = doc(db, 'userProfiles', user.uid);
          await updateDoc(userRef, {
            highlightTokens: userTokens - 1,
            updatedAt: new Date()
          });
          setUserTokens(userTokens - 1); // Actualizar estado local
          console.log('🎯 Token consumido. Tokens restantes:', userTokens - 1);
        } catch (tokenError) {
          console.error('⚠️ Error consumiendo token:', tokenError);
          // No bloquear la creación del plan por esto
        }
      }

      // Auto-inscribir al creador en su propia actividad
      try {
        await addDoc(collection(db, "participations"), {
          userId: user.uid,
          postId: docRef.id,
          userEmail: user.email || '',
          userName: getDisplayName(user),
          createdAt: serverTimestamp(),
          status: "organizer", // Cambiar de "joined" a "organizer"
          role: "organizer", // Agregar campo de rol
          // COPIAR DATOS COMPLETOS DE LA ACTIVIDAD PARA EVITAR "Sin título"
          activityTitle: activityData.title,
          activityLocation: activityData.location,
          activityDate: activityData.date,
          activityPrice: activityData.price,
          activityEmoji: activityData.emoji,
          activityType: activityData.type,
          maxParticipants: activityData.maxParticipants
        });
      } catch (participationError) {
        console.error("⚠️ Error auto-inscribiendo al creador:", participationError);
      }

      // Crear chat automático para el plan
      try {
        const planData = {
          id: docRef.id,
          title: activityData.title || 'Plan sin título',
          description: activityData.description || 'Descripción del plan',
          location: activityData.location || 'Ubicación por confirmar',
          locationData: activityData.locationData || {
            city: 'Ciudad por confirmar',
            address: activityData.location || 'Ubicación por confirmar'
          },
          date: activityData.date || 'Fecha por confirmar',
          time: activityData.time || 'Hora por confirmar',
          price: activityData.price || 'Gratis',
          activityType: activityData.type || '🎯',
          maxParticipants: activityData.maxParticipants || 10
        };
        
        console.log("🔗 Datos del plan para chat:", planData);
        const chatResult = await createPlanChat(planData);
        console.log("✅ Chat de plan creado:", chatResult);
      } catch (chatError) {
        console.error("⚠️ Error creando chat de plan:", chatError);
        console.error("⚠️ Detalles del error:", chatError.message);
        // No mostrar error al usuario, el plan ya se creó exitosamente
      }
      
      // Limpiar formulario
      setActivityTitle("");
      setActivityDescription("");
      setActivityLocation("");
      setActivityLocationData(null);
      setActivityPrice("");
      setActivityDate("");
      setActivityDateObject(null);
      setActivityType("");
      setMaxParticipants("");
      setActivityImage(null);
      setShouldHighlight(false); // 🎯 Resetear checkbox de destacado
      setShowCreateForm(false);
      
      const successMessage = shouldHighlight && userTokens > 0 
        ? "Actividad creada y destacada por 24 horas ⭐" 
        : "Actividad creada correctamente";
      Alert.alert("✅ Éxito", successMessage);
      
    } catch (error) {
      console.error("❌ Error guardando actividad:", error);
      Alert.alert("❌ Error", error.message);
    } finally {
      setLoading(false);
    }
  }
};

// Función para manejar inscripciones
const joinActivity = async (postId) => {
  
  // Buscar la actividad en ambas listas (posts normales y destacados)
  let activity = posts.find(post => post.id === postId);
  if (!activity) {
    activity = featuredPosts.find(post => post.id === postId);
  }
  
  if (!activity) {
    Alert.alert("Error", "No se pudo encontrar la actividad");
    return;
  }

  // Usar el hook de participaciones para inscribirse
  try {
    const success = await participationsHook.joinActivity(postId, activity);
    if (success) {
      Alert.alert("✅ Éxito", "Te has inscrito correctamente en la actividad");
    } else {
      Alert.alert("❌ Error", "No se pudo completar la inscripción");
    }
  } catch (error) {
    console.error("❌ Error en joinActivity:", error);
    Alert.alert("Error", "Error inesperado: " + error.message);
  }
};

// Abrir modal de comentarios
const openComments = (post) => {
  setSelectedPost(post);
  setShowCommentsModal(true);
};

// Cerrar modal de comentarios
const closeComments = () => {
  setShowCommentsModal(false);
  setSelectedPost(null);
  setComments([]);
  setNewComment("");
};

// Agregar comentario
const addComment = async () => {
  if (newComment.trim() === "" || !selectedPost || !user) {
    Alert.alert("Error", "El comentario no puede estar vacío");
    return;
  }

  try {
    setLoadingComment(true);
    await addDoc(collection(db, "posts"), {
      text: newComment.trim(),
      type: "comment",
      parentId: selectedPost.id,
      author: getDisplayName(user),
      authorEmail: user.email || '',
      authorId: user.uid || '',
      createdAt: serverTimestamp(),
    });
    setNewComment("");
  } catch (error) {
    Alert.alert("❌ Error", error.message);
  } finally {
    setLoadingComment(false);
  }
};

// ===== FUNCIONES DE ADMINISTRADOR =====

/**
 * Destacar/Quitar destacado de un post
 */
const toggleFeaturedPost = async (postId, isFeatured) => {
  try {
    setLoading(true);
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      isFeatured: isFeatured,
      featuredAt: isFeatured ? serverTimestamp() : null,
      featuredBy: isFeatured ? user.uid : null
    });
    
    Alert.alert(
      "Éxito", 
      `Post ${isFeatured ? 'destacado' : 'removido de destacados'} correctamente`
    );
  } catch (error) {
    console.error('❌ Error destacando post:', error);
    Alert.alert("Error", "No se pudo destacar el post");
  } finally {
    setLoading(false);
  }
};

/**
 * Destacar un post
 */
const featurePost = async (postId) => {
  await toggleFeaturedPost(postId, true);
};

/**
 * Remover post de destacados
 */
const unfeaturePost = async (postId) => {
  await toggleFeaturedPost(postId, false);
};

/**
 * Limpiar participaciones huérfanas (participaciones sin post padre)
 * Esta función se puede usar para limpiar datos existentes
 */
const cleanupOrphanedParticipations = async () => {
  try {
    
    // Obtener todas las participaciones
    const participationsQuery = query(collection(db, 'participations'));
    const participationsSnapshot = await getDocs(participationsQuery);
    
    
    let orphanedCount = 0;
    const cleanupPromises = participationsSnapshot.docs.map(async (participationDoc) => {
      const participation = participationDoc.data();
      
      // Verificar si el post padre existe
      try {
        const postRef = doc(db, 'posts', participation.postId);
        const postDoc = await getDoc(postRef);
        
        if (!postDoc.exists()) {
          // El post no existe, eliminar la participación huérfana
          await deleteDoc(participationDoc.ref);
          orphanedCount++;
        }
      } catch (error) {
        console.error(`❌ Error verificando post ${participation.postId}:`, error);
        // Si hay error, también eliminar la participación
        await deleteDoc(participationDoc.ref);
        orphanedCount++;
      }
    });
    
    await Promise.all(cleanupPromises);
    
    return orphanedCount;
  } catch (error) {
    console.error('❌ Error en limpieza de participaciones huérfanas:', error);
    throw error;
  }
};

/**
 * Eliminar un post y todas sus participaciones (eliminación en cascada)
 */
const deletePost = async (postId) => {
  try {
    Alert.alert(
      "Confirmar eliminación",
      "¿Estás seguro de que quieres eliminar este post? Esta acción eliminará también todas las participaciones y no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              
              // 1. ELIMINAR TODAS LAS PARTICIPACIONES DEL POST
              const participationsQuery = query(
                collection(db, 'participations'),
                where('postId', '==', postId)
              );
              
              const participationsSnapshot = await getDocs(participationsQuery);
              
              // Eliminar cada participación
              const deletePromises = participationsSnapshot.docs.map(async (participationDoc) => {
                try {
                  await deleteDoc(participationDoc.ref);
                } catch (error) {
                  console.error(`❌ Error eliminando participación ${participationDoc.id}:`, error);
                }
              });
              
              // Esperar a que se eliminen todas las participaciones
              await Promise.all(deletePromises);
              
              // 2. ELIMINAR EL POST PRINCIPAL
              const postRef = doc(db, 'posts', postId);
              await deleteDoc(postRef);
              
              // 3. MOSTRAR MENSAJE DE ÉXITO
              Alert.alert(
                "Éxito", 
                `Post eliminado correctamente.\nSe eliminaron ${participationsSnapshot.size} participaciones.`
              );
              
            } catch (error) {
              console.error('❌ Error en eliminación en cascada:', error);
              Alert.alert("Error", "No se pudo eliminar el post: " + error.message);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  } catch (error) {
    console.error('❌ Error en confirmación de eliminación:', error);
  }
};

return {
  // Estados de posts
  post,
  setPost,
  loading,
  posts,
  featuredPosts,
  showCreateForm,
  setShowCreateForm,
  
  // Estados de actividades
  activityTitle,
  setActivityTitle,
  activityDescription,
  setActivityDescription,
  activityLocation,
  setActivityLocation,
  activityLocationData,
  setActivityLocationData,
  activityPrice,
  setActivityPrice,
    activityDate,
    setActivityDate,
    activityDateObject,
    setActivityDateObject,
    activityTime,
    setActivityTime,
    activityType,
    setActivityType,
  maxParticipants,
  setMaxParticipants,
  activityImage,
  setActivityImage,
  showImagePicker,
  setShowImagePicker,
  // 🎯 Estados de destacado
  shouldHighlight,
  setShouldHighlight,
  userTokens,
  
  // Estados para comentarios
  showCommentsModal,
  setShowCommentsModal,
  selectedPost,
  comments,
  newComment,
  setNewComment,
  loadingComment,
  
  // Estados de filtro por ciudad
  selectedCity,
  setSelectedCity,
  availableCities,
  
  // Funciones
  handlePost,
  joinActivity,
  openComments,
  closeComments,
  addComment,
  getFilteredActivities,
  getCityStatistics,
  
  // Funciones de administrador
  featurePost,
  unfeaturePost,
  deletePost,
  cleanupOrphanedParticipations,
  
  // Hook de participaciones (referencia completa)
  participationsHook,
  myParticipations,
  loadingParticipation,
  isUserParticipating,
  getUserParticipation,
  leaveActivity,
  getActivityParticipants,
  
  // Función para limpiar planes mal creados
  cleanupBadPlans: async () => {
    try {
      
      const allActivities = [...featuredPosts, ...posts].filter(p => p.type === 'activity');
      let deletedCount = 0;
      
      for (const activity of allActivities) {
        // Verificar si tiene fecha válida
        const hasValidDate = isFutureDate(activity.date);
        
        // Verificar si tiene título válido
        const hasValidTitle = activity.title && 
          typeof activity.title === 'string' && 
          activity.title.trim().length > 0;
        
        // Verificar si tiene ubicación válida
        const hasValidLocation = activity.location && 
          typeof activity.location === 'string' && 
          activity.location.trim().length > 0;
        
        if (!hasValidDate || !hasValidTitle || !hasValidLocation) {
          
          await deleteDoc(doc(db, 'posts', activity.id));
          deletedCount++;
        }
      }
      
      return deletedCount;
      
    } catch (error) {
      console.error('❌ Error durante la limpieza:', error);
      throw error;
    }
  }
};

}; // Cierre de la función usePosts