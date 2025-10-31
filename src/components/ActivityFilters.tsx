/**
 * ActivityFilters.tsx
 * Componente para los filtros de actividades (ciudad, fecha, tipo)
 */

import { Colors } from '@/src/constants/Colors';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface ActivityFiltersProps {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  availableCities: string[];
  showCityDropdown: boolean;
  setShowCityDropdown: (show: boolean) => void;
  selectedActivityType: string;
  setSelectedActivityType: (type: string) => void;
  selectedDateFilter: string;
  setSelectedDateFilter: (filter: string) => void;
}

const activityTypes = [
  { id: 'Todos', label: 'Todos', emoji: '✨' },
  { id: '🍝', label: 'Cocina', emoji: '🍝' },
  { id: '🎨', label: 'Arte', emoji: '🎨' },
  { id: '🎵', label: 'Música', emoji: '🎵' },
  { id: '🏃', label: 'Deportes', emoji: '🏃' },
  { id: '🥾', label: 'Aventura', emoji: '🥾' },
];

export const ActivityFilters: React.FC<ActivityFiltersProps> = ({
  selectedCity,
  setSelectedCity,
  availableCities,
  showCityDropdown,
  setShowCityDropdown,
  selectedActivityType,
  setSelectedActivityType,
  selectedDateFilter,
  setSelectedDateFilter
}) => {
  return (
    <View style={styles.filtersContainer}>
      {/* Fila superior: Ciudad (izquierda) y Fecha (derecha) */}
      <View style={styles.topFiltersRow}>
        {/* Dropdown de Ciudades - Mitad izquierda */}
        <View style={styles.cityFilterContainer}>
          <TouchableOpacity
            style={styles.cityDropdownButton}
            onPress={() => setShowCityDropdown(true)}
          >
            <Text style={styles.cityDropdownButtonText}>
              {selectedCity === 'Todas' ? '🌍' : '🏙️'} {selectedCity}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Chips de Fecha - Mitad derecha */}
        <View style={styles.dateFilterContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateChipsList}
          >
            {[
              { id: 'Todas', label: 'Todas', emoji: '📅' },
              { id: 'Hoy', label: 'Hoy', emoji: '🌟' },
              { id: 'Mañana', label: 'Mañana', emoji: '🌅' },
              { id: 'Esta semana', label: 'Esta semana', emoji: '📆' },
              { id: 'Próximos días', label: 'Próximos días', emoji: '🔮' },
            ].map((dateOption) => (
              <TouchableOpacity
                key={dateOption.id}
                style={[
                  styles.dateChip,
                  selectedDateFilter === dateOption.id && styles.dateChipActive
                ]}
                onPress={() => setSelectedDateFilter(dateOption.id)}
              >
                <Text style={styles.dateChipEmoji}>{dateOption.emoji}</Text>
                <Text style={[
                  styles.dateChipText,
                  selectedDateFilter === dateOption.id && styles.dateChipTextActive
                ]}>
                  {dateOption.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Chips de Tipo de Actividad */}
      <View style={styles.filterSection}>
        <Text style={styles.filtersTitle}>🎯 Filtrar por Tipo</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.activityTypesList}
        >
          {activityTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.activityTypeChip,
                selectedActivityType === type.id && styles.activityTypeChipActive
              ]}
              onPress={() => setSelectedActivityType(type.id)}
            >
              <Text style={styles.activityTypeEmoji}>{type.emoji}</Text>
              <Text style={[
                styles.activityTypeText,
                selectedActivityType === type.id && styles.activityTypeTextActive
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  filtersContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
    gap: 16,
  },
  filterSection: {
    gap: 8,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  topFiltersRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  cityFilterContainer: {
    flex: 1,
    gap: 8,
  },
  dateFilterContainer: {
    flex: 1,
    gap: 8,
  },
  cityDropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  cityDropdownButtonText: {
    fontSize: 14,
    color: Colors.primary,
    flex: 1,
  },
  dateChipsList: {
    gap: 8,
    paddingRight: 20,
  },
  dateChip: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    minWidth: 70,
    marginRight: 8,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  dateChipActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  dateChipEmoji: {
    fontSize: 16,
    marginBottom: 2,
  },
  dateChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textLight,
    textAlign: 'center',
  },
  dateChipTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  dropdownArrow: {
    fontSize: 12,
    color: Colors.primary,
    marginLeft: 8,
  },
  activityTypesList: {
    gap: 12,
    paddingRight: 20,
  },
  activityTypeChip: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    minWidth: 80,
    marginRight: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  activityTypeChipActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  activityTypeEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  activityTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textLight,
    textAlign: 'center',
  },
  activityTypeTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
