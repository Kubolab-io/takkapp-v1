/**
 * FeaturedActivities.tsx
 * Componente para mostrar las actividades destacadas
 */

import { Colors } from '@/src/constants/Colors';
import React from 'react';
import {
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

interface FeaturedActivitiesProps {
  featuredPlans: any[];
  selectedCity: string;
  selectedActivityType: string;
  activityTypes: { id: string; label: string; emoji: string }[];
  onOpenActivityDetails: (item: any) => void;
}

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
      <View style={styles.featuredCardBadge}>
        <Text style={styles.featuredCardEmoji}>{item.emoji || '🎯'}</Text>
      </View>
      <View style={styles.featuredCardContent}>
        <Text style={styles.featuredCardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.featuredCardSubtitle}>{item.author}</Text>
        <View style={styles.featuredCardInfo}>
          <Text style={styles.featuredCardInfoText}>📍 {item.location}</Text>
          <Text style={styles.featuredCardInfoText}>{item.participants}/{item.maxParticipants} personas</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (featuredPlans.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {selectedCity === 'Todas' && selectedActivityType === 'Todos' 
            ? 'Planes Destacados' 
            : `Planes Destacados${selectedCity !== 'Todas' ? ` en ${selectedCity}` : ''}${selectedActivityType !== 'Todos' ? ` - ${activityTypes.find(t => t.id === selectedActivityType)?.label}` : ''}`
          }
        </Text>
        <TouchableOpacity>
          <Text style={styles.sectionLink}>Ver todos</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={featuredPlans.slice(0, 3)}
        renderItem={renderFeaturedCard}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featuredList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  featuredList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  featuredCard: {
    width: width * 0.65,
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: 20,
    marginRight: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  featuredCardBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.secondary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featuredCardEmoji: {
    fontSize: 24,
  },
  featuredCardContent: {
    flex: 1,
  },
  featuredCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  featuredCardSubtitle: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 12,
  },
  featuredCardInfo: {
    gap: 4,
  },
  featuredCardInfoText: {
    fontSize: 13,
    color: '#000000',
  },
});
