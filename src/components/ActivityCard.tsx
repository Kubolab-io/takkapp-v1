// components/ActivityCard.tsx
import { Colors } from '@/src/constants/Colors';
import { useParticipations } from '@/src/features/posts/useParticipations';
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
const CARD_WIDTH = width * 0.9; // 90% del ancho de pantalla
const CARD_HEIGHT = 320; // Altura fija para el nuevo diseño

// Importar todas las imágenes predeterminadas
const defaultImages = {
  cocina: require('@/assets/images/planes/cocina.jpg'),
  art: require('@/assets/images/planes/art.jpg'),
  concert: require('@/assets/images/planes/concert.jpg'),
  running: require('@/assets/images/planes/Running.jpg'),
  senderismo: require('@/assets/images/planes/senderismo.jpg'),
};

interface ActivityCardProps {
  item: any;
  user: User | null;
  onJoinActivity: (postId: string) => void;
  onOpenComments: (post: any) => void;
  onOpenDetails?: (item: any) => void;
  getUserDisplayName: (userObj?: any) => string;
  getUserInitials: (userObj?: any) => string;
  // Nuevas props para administrador
  isAdmin?: boolean;
  onFeaturePost?: (postId: string) => void;
  onUnfeaturePost?: (postId: string) => void;
  onDeletePost?: (postId: string) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = React.memo(({
  item,
  user,
  onJoinActivity,
  onOpenComments,
  onOpenDetails,
  getUserDisplayName,
  getUserInitials,
  isAdmin = false,
  onFeaturePost,
  onUnfeaturePost,
  onDeletePost
}) => {
  // Función para obtener la imagen de fondo
  const getBackgroundImage = () => {

    if (item.imageType === 'uploaded' && item.image) {
      // Imagen subida por el usuario desde Firebase
      return { uri: item.image };
    } else if ((item.imageType === 'predefined' || item.imageType === 'default') && item.defaultImageKey) {
      // Imagen predeterminada de la app (tanto 'predefined' como 'default' con defaultImageKey)
      return defaultImages[item.defaultImageKey as keyof typeof defaultImages] || defaultImages.art;
    } else {
      // Imagen por defecto basada en el emoji
      const defaultKey = getDefaultImageKey(item.emoji);
      return defaultImages[defaultKey as keyof typeof defaultImages] || defaultImages.art;
    }
  };

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

  // Función para convertir cualquier valor a string seguro para renderizar
  const safeStringify = (value: any): string => {
    if (value === null || value === undefined) return '';
    
    // Si es un objeto (incluyendo Timestamps de Firebase)
    if (typeof value === 'object') {
      // Si es un timestamp de Firebase
      if (value.seconds && value.nanoseconds) {
        return formatDateForDisplay(value);
      }
      // Si es un objeto Date
      else if (value instanceof Date) {
        return value.toLocaleDateString('es-ES');
      }
      // Para otros objetos, convertir a string
      else {
        try {
          return JSON.stringify(value);
        } catch {
          return '[Objeto]';
        }
      }
    }
    
    // Para primitivos, convertir a string
    return String(value);
  };
  const participationsHook = useParticipations(user);
  const { isUserParticipating, getUserParticipation } = participationsHook;

  const handleJoinActivity = () => {
    if (user) {
      // Si hay función onOpenDetails, abrir detalles en lugar de inscribir directamente
      if (onOpenDetails) {
        onOpenDetails(item);
      } else {
        // Fallback al comportamiento original si no hay onOpenDetails
        onJoinActivity(item.id);
      }
    } else {
      router.push('/' as any);
    }
  };

  const handleOpenComments = () => {
    onOpenComments(item);
  };

  const handleFeaturePost = () => {
    if (onFeaturePost) {
      onFeaturePost(item.id);
    }
  };

  const handleUnfeaturePost = () => {
    if (onUnfeaturePost) {
      onUnfeaturePost(item.id);
    }
  };

  const handleDeletePost = () => {
    if (onDeletePost) {
      onDeletePost(item.id);
    }
  };

  const handleCardPress = () => {
    if (onOpenDetails) {
      onOpenDetails(item);
    }
  };

  // Verificar si es mi post
  const isMyPost = user && item.authorId === user.uid;
  
  // Verificar si el usuario está participando
  const isPostParticipating = isUserParticipating(item.id);
  
  // Obtener información de participación
  const participation = getUserParticipation(item.id);
  // El conteo base es el número de participantes del post (que ya incluye al creador)
  // Si hay participaciones adicionales, se suman
  const baseParticipants = item.participants || 1; // Siempre mínimo 1 (el creador)
  const additionalParticipations = (participation as any)?.currentCount || 0;
  const currentParticipationCount = Math.max(baseParticipants, additionalParticipations + 1);

  // Contenido del botón de unirse
  const joinButtonContent = (() => {
    if (isMyPost) {
      return { text: 'Mi Plan', style: 'primary' };
    }
    if (isPostParticipating) {
      return { text: 'Participando', style: 'secondary' };
    }
    return { text: 'Unirse', style: 'primary' };
  })();

  // Formatear descripción
  const formatDescription = () => {
    if (item.description && item.description.length > 120) {
      return item.description.substring(0, 120) + '...';
    }
    return item.description || `Únete a ${item.title} - Una experiencia increíble te espera.`;
  };

  return (
    <TouchableOpacity 
      style={[
        styles.activityCard,
        isMyPost && styles.myPostCard
      ]}
      activeOpacity={0.95}
      onPress={handleCardPress}
    >
      {/* Imagen principal con bordes redondeados */}
      <View style={styles.imageContainer}>
        <Image
          source={getBackgroundImage()}
          style={styles.mainImage}
          resizeMode="cover"
          loadingIndicatorSource={require('@/assets/images/profilepicturetemplate.png')}
          onError={(error) => console.error("❌ Error cargando imagen:", error)}
        />
        
        {/* Badges en la imagen */}
        <View style={styles.imageBadges}>
          {isMyPost && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>MI PLAN</Text>
            </View>
          )}
          {item.isFeatured && (
            <View style={[styles.badge, styles.featuredBadge]}>
              <Text style={styles.badgeText}>⭐ DESTACADO</Text>
            </View>
          )}
          {item.maxParticipants && (item.maxParticipants - currentParticipationCount) <= 0 && (
            <View style={[styles.badge, styles.fullBadge]}>
              <Text style={styles.badgeText}>LLENO</Text>
            </View>
          )}
        </View>
      </View>

      {/* Contenido de la tarjeta */}
      <View style={styles.contentSection}>
        {/* Título principal */}
        <Text style={styles.title} numberOfLines={1}>
          {safeStringify(item.title)}
        </Text>
        
        {/* Subtítulo con ubicación */}
        {item.location && (
          <Text style={styles.subtitle} numberOfLines={1}>
            📍 {safeStringify(item.location)}
          </Text>
        )}
        
        {/* Descripción */}
        <Text style={styles.description} numberOfLines={2}>
          {safeStringify(formatDescription())}
        </Text>
        
        {/* Footer con fecha y botón */}
        <View style={styles.footer}>
          <View style={styles.dateInfo}>
            {item.date && (
              <Text style={styles.dateText}>
                🕐 {formatDateForDisplay(item.date)}
              </Text>
            )}
            {item.maxParticipants && (
              <Text style={styles.participantsText}>
                👥 {currentParticipationCount}/{safeStringify(item.maxParticipants)} participantes
              </Text>
            )}
          </View>
          
          {/* Botón de acción */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              joinButtonContent.style === 'secondary' && styles.secondaryButton,
              isMyPost && styles.myPostActionButton
            ]}
            onPress={handleJoinActivity}
          >
            <Text style={[
              styles.actionButtonText,
              joinButtonContent.style === 'secondary' && styles.secondaryButtonText
            ]}>
              {joinButtonContent.text}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Acciones de administrador */}
      {isAdmin && (
        <View style={styles.adminActions}>
          <View style={styles.adminButtons}>
            {item.isFeatured ? (
              <TouchableOpacity
                style={[styles.adminBtn, styles.unfeatureBtn]}
                onPress={handleUnfeaturePost}
              >
                <Text style={styles.adminBtnText}>Quitar Destacado</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.adminBtn, styles.featureBtn]}
                onPress={handleFeaturePost}
              >
                <Text style={styles.adminBtnText}>Destacar</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.adminBtn, styles.deleteBtn]}
              onPress={handleDeletePost}
            >
              <Text style={styles.adminBtnText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  activityCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  myPostCard: {
    borderWidth: 2,
    borderColor: Colors.dark,
  },
  imageContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  imageBadges: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  featuredBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
  },
  fullBadge: {
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  contentSection: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  dateInfo: {
    flex: 1,
    marginRight: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#000000',
    marginBottom: 4,
  },
  participantsText: {
    fontSize: 12,
    color: '#000000',
  },
  actionButton: {
    backgroundColor: '#333',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#e0e0e0',
  },
  myPostActionButton: {
    backgroundColor: Colors.dark,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#333',
  },
  adminActions: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    padding: 12,
    backgroundColor: '#fafafa',
  },
  adminButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  adminBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  featureBtn: {
    backgroundColor: Colors.dark,
  },
  unfeatureBtn: {
    backgroundColor: Colors.accent,
  },
  deleteBtn: {
    backgroundColor: '#f44336',
  },
  adminBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});