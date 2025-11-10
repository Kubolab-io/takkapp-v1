/**
 * FeaturedActivities.tsx
 * Componente para mostrar las actividades destacadas en slider horizontal
 */

import { Colors } from '@/src/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

interface FeaturedActivitiesProps {
  featuredPlans: any[];
  selectedCity: string;
  selectedActivityType: string;
  activityTypes: { id: string; label: string; emoji: string }[];
  onOpenActivityDetails: (item: any) => void;
}

// Helper para obtener imagen por defecto según la clave
const getDefaultImage = (imageKey?: string) => {
  const images: { [key: string]: any } = {
    art: require('@/assets/images/planes/art.jpg'),
    cooking: require('@/assets/images/planes/cocina.jpg'),
    concert: require('@/assets/images/planes/concert.jpg'),
    running: require('@/assets/images/planes/Running.jpg'),
    hiking: require('@/assets/images/planes/senderismo.jpg'),
  };
  return images[imageKey || 'art'] || images.art;
};

export const FeaturedActivities: React.FC<FeaturedActivitiesProps> = ({
  featuredPlans,
  selectedCity,
  selectedActivityType,
  activityTypes,
  onOpenActivityDetails
}) => {
  const renderFeaturedCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.featuredCard}
      onPress={() => onOpenActivityDetails(item)}
      activeOpacity={0.9}
    >
      {/* Imagen de fondo */}
      <Image
        source={
          item.image 
            ? { uri: item.image }
            : item.imageUrl
            ? { uri: item.imageUrl }
            : item.defaultImageKey
            ? getDefaultImage(item.defaultImageKey)
            : require('@/assets/images/planes/art.jpg')
        }
        style={styles.featuredCardImage}
        resizeMode="cover"
      />
      
      {/* Overlay con gradiente */}
      <LinearGradient
        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
        style={styles.featuredCardOverlay}
      >
        {/* Badge destacado */}
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredBadgeText}>⭐ Destacado</Text>
        </View>
        
        {/* Contenido */}
        <View style={styles.featuredCardContent}>
          <Text style={styles.featuredCardTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.featuredCardAuthor} numberOfLines={1}>
            Por {item.author || 'Usuario'}
          </Text>
          
          <View style={styles.featuredCardInfoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>📍</Text>
              <Text style={styles.infoText} numberOfLines={1}>{item.location || 'Ubicación'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>👥</Text>
              <Text style={styles.infoText}>
                {item.participants || 0}/{item.maxParticipants || 0}
              </Text>
            </View>
          </View>
          
          {item.activityType && (
            <View style={styles.typeChip}>
              <Text style={styles.typeChipText}>{item.activityType}</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (featuredPlans.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>✨ Planes Destacados</Text>
          <Text style={styles.sectionSubtitle}>
            {featuredPlans.length} {featuredPlans.length === 1 ? 'plan increíble' : 'planes increíbles'}
          </Text>
        </View>
      </View>
      <FlatList
        data={featuredPlans}
        renderItem={renderFeaturedCard}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featuredList}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
        pagingEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  featuredList: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  featuredCard: {
    width: CARD_WIDTH,
    height: 280,
    borderRadius: 24,
    marginRight: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
    shadowColor: '#1E3A8A',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  featuredCardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  featuredCardOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 215, 0, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  featuredBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  featuredCardContent: {
    gap: 8,
  },
  featuredCardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    lineHeight: 28,
  },
  featuredCardAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  featuredCardInfoRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    flex: 1,
  },
  infoIcon: {
    fontSize: 14,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  typeChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(30, 58, 138, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 4,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
