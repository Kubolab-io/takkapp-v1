/**
 * ActivityHeader.tsx
 * Componente para el header de la pantalla de actividades
 */

import { Colors } from '@/src/constants/Colors';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface ActivityHeaderProps {
  onCreateActivity: () => void;
}

export const ActivityHeader: React.FC<ActivityHeaderProps> = ({
  onCreateActivity
}) => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Descubre</Text>
      <TouchableOpacity 
        style={styles.createButton}
        onPress={onCreateActivity}
      >
        <Text style={styles.createButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primary,
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 24,
    color: Colors.textLight,
    fontWeight: '600',
  },
});











