// components/SharedActivityCard.tsx
import { Colors } from '@/src/constants/Colors';
import { router } from 'expo-router';
import { User } from 'firebase/auth';
import React from 'react';
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75; // 75% del ancho de pantalla para el chat

// Importar todas las imágenes predeterminadas
const defaultImages = {
  cocina: require('@/assets/images/planes/cocina.jpg'),
  art: require('@/assets/images/planes/art.jpg'),
  concert: require('@/assets/images/planes/concert.jpg'),
  running: require('@/assets/images/planes/Running.jpg'),
  senderismo: require('@/assets/images/planes/senderismo.jpg'),
};

interface SharedActivityCardProps {
  item: any;
  user: User | null;
  onJoinActivity: (postId: string) => void;
  getUserDisplayName: (userObj?: any) => string;
  getUserInitials: (userObj?: any) => string;
}

// Función para obtener la clave de imagen por defecto
const getDefaultImageKey = (activityType: string) => {
  const typeMap: { [key: string]: string } = {
    '🍝': 'cocina',
    '🎨': 'art',
    '🎵': 'concert',
    '🏃': 'running',
    '🥾': 'senderismo',
  };
  return typeMap[activityType] || 'art';
};

// Función para formatear fechas para mostrar
const formatDateForDisplay = (dateValue: any) => {
  if (!dateValue) return '';
  
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
      return String(dateValue); // Fallback a string
    }
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      return String(dateValue); // Fallback a string original
    }
    
    // Formatear fecha en español
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return String(dateValue); // Fallback a string original
  }
};

export const SharedActivityCard: React.FC<SharedActivityCardProps> = ({
  item,
  user,
  onJoinActivity,
  getUserDisplayName,
  getUserInitials
}) => {
  // Función para obtener la imagen de fondo
  const getBackgroundImage = () => {
    if (item.imageType === 'uploaded' && item.image) {
      return { uri: item.image };
    } else if ((item.imageType === 'predefined' || item.imageType === 'default') && item.defaultImageKey) {
      return defaultImages[item.defaultImageKey as keyof typeof defaultImages] || defaultImages.art;
    } else {
      const defaultKey = getDefaultImageKey(item.emoji);
      return defaultImages[defaultKey as keyof typeof defaultImages] || defaultImages.art;
    }
  };

  const handleJoinActivity = () => {
    if (user) {
      onJoinActivity(item.id);
    } else {
      router.push('/' as any);
    }
  };

  const handleCardPress = () => {
    // Navegar a los detalles de la actividad
    router.push({
      pathname: '/ActividadDetalle' as any,
      params: {
        postId: item.id,
        title: item.title,
        description: item.content || item.description,
        location: item.location,
        date: item.date,
        time: item.time,
        emoji: item.emoji,
        price: item.price,
        maxParticipants: item.maxParticipants,
        authorId: item.authorId,
        authorName: getUserDisplayName(item.author),
        image: item.image,
        imageType: item.imageType,
        defaultImageKey: item.defaultImageKey
      }
    } as any);
  };

  // Verificar si es mi post
  const isMyPost = user && item.authorId === user.uid;

  // Formatear descripción para el chat
  const formatDescription = () => {
    if (item.description && item.description.length > 80) {
      return item.description.substring(0, 80) + '...';
    }
    return item.description || `Únete a ${item.title}`;
  };

  return (
    <TouchableOpacity 
      style={styles.sharedCard}
      activeOpacity={0.95}
      onPress={handleCardPress}
    >
      {/* Imagen principal */}
      <View style={styles.imageContainer}>
        <Image
          source={getBackgroundImage()}
          style={styles.mainImage}
          resizeMode="cover"
        />
        
        {/* Badge de tipo de actividad */}
        <View style={styles.activityBadge}>
          <Text style={styles.activityEmoji}>{item.emoji}</Text>
        </View>
      </View>

      {/* Contenido de la tarjeta */}
      <View style={styles.contentSection}>
        {/* Título */}
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        
        {/* Ubicación */}
        {item.location && (
          <Text style={styles.location} numberOfLines={1}>
            📍 {item.location}
          </Text>
        )}
        
        {/* Descripción */}
        <Text style={styles.description} numberOfLines={2}>
          {formatDescription()}
        </Text>
        
        {/* Footer con fecha y botón */}
        <View style={styles.footer}>
          <View style={styles.dateInfo}>
            {item.date && (
              <Text style={styles.dateText}>
                🕐 {formatDateForDisplay(item.date)}
              </Text>
            )}
            {item.price && (
              <Text style={styles.priceText}>
                💰 {item.price}
              </Text>
            )}
          </View>
          
          {/* Botón de acción */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              isMyPost && styles.myPostButton
            ]}
            onPress={handleJoinActivity}
          >
            <Text style={styles.actionButtonText}>
              {isMyPost ? 'Ver Plan' : 'Unirse'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  sharedCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  imageContainer: {
    width: '100%',
    height: 100,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  activityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityEmoji: {
    fontSize: 16,
  },
  contentSection: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  location: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  dateInfo: {
    flex: 1,
    marginRight: 8,
  },
  dateText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  priceText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  myPostButton: {
    backgroundColor: Colors.secondary,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
