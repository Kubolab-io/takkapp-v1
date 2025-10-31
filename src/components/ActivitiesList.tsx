/**
 * ActivitiesList.tsx
 * Componente para mostrar la lista de actividades
 */

import { ActivityCard } from '@/src/components/ActivityCard';
import React from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    View
} from 'react-native';

interface ActivitiesListProps {
  allPlans: any[];
  user: any;
  selectedCity: string;
  selectedActivityType: string;
  activityTypes: { id: string; label: string; emoji: string }[];
  userLocation: { latitude: number; longitude: number } | null;
  onJoinActivity: (postId: string) => void;
  onOpenComments: (post: any) => void;
  onOpenActivityDetails: (item: any) => void;
  getUserDisplayName: (obj: any) => string;
  getUserInitials: (obj: any) => string;
}

export const ActivitiesList: React.FC<ActivitiesListProps> = ({
  allPlans,
  user,
  selectedCity,
  selectedActivityType,
  activityTypes,
  userLocation,
  onJoinActivity,
  onOpenComments,
  onOpenActivityDetails,
  getUserDisplayName,
  getUserInitials
}) => {
  const renderActivityItem = ({ item }: { item: any }) => (
    <ActivityCard
      item={item}
      user={user}
      onJoinActivity={onJoinActivity}
      onOpenComments={onOpenComments}
      onOpenDetails={onOpenActivityDetails}
      getUserDisplayName={getUserDisplayName}
      getUserInitials={getUserInitials}
    />
  );

  const getSectionTitle = () => {
    if (selectedCity === 'Todas' && selectedActivityType === 'Todos') {
      return userLocation ? '📍 Actividades Cerca de Ti' : 'Actividades Recientes';
    }
    
    const cityText = selectedCity !== 'Todas' ? ` en ${selectedCity}` : '';
    const typeText = selectedActivityType !== 'Todos' ? ` - ${activityTypes.find(t => t.id === selectedActivityType)?.label}` : '';
    const cityEmoji = selectedCity !== 'Todas' ? '🏙️' : '🎯';
    
    return `${cityEmoji} Actividades${cityText}${typeText}`;
  };

  const getEmptyStateContent = () => {
    const emoji = selectedCity === 'Todas' ? '🎯' : '🏙️';
    const title = selectedCity === 'Todas' 
      ? 'No hay actividades aún' 
      : `No hay actividades en ${selectedCity}`;
    const text = selectedCity === 'Todas' 
      ? 'Sé el primero en crear un plan increíble'
      : `Cambia de ciudad o crea el primer plan en ${selectedCity}`;

    return { emoji, title, text };
  };

  const emptyStateContent = getEmptyStateContent();

  return (
    <View style={styles.section}>
      <FlatList
        data={allPlans}
        renderItem={renderActivityItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={styles.activitiesList}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>
              {emptyStateContent.emoji}
            </Text>
            <Text style={styles.emptyStateTitle}>
              {emptyStateContent.title}
            </Text>
            <Text style={styles.emptyStateText}>
              {emptyStateContent.text}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  activitiesList: {
    paddingHorizontal: 20,
  },
  separator: {
    height: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
  },
});
