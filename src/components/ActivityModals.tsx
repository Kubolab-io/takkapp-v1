/**
 * ActivityModals.tsx
 * Componente para los modales de filtros (ciudad y calendario)
 */

// Eliminado CustomDateSelector - usando chips simples en su lugar
import { Colors } from '@/src/constants/Colors';
import React from 'react';
import {
    Dimensions,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

interface ActivityModalsProps {
  showCityDropdown: boolean;
  setShowCityDropdown: (show: boolean) => void;
  availableCities: string[];
  selectedCity: string;
  onCitySelect: (city: string) => void;
}

export const ActivityModals: React.FC<ActivityModalsProps> = ({
  showCityDropdown,
  setShowCityDropdown,
  availableCities,
  selectedCity,
  onCitySelect
}) => {
  // Función para renderizar item del dropdown de ciudades
  const renderCityDropdownItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.dropdownItem,
        selectedCity === item && styles.dropdownItemSelected
      ]}
      onPress={() => onCitySelect(item)}
    >
      <Text style={[
        styles.dropdownItemText,
        selectedCity === item && styles.dropdownItemTextSelected
      ]}>
        {item === 'Todas' ? '🌍' : '🏙️'} {item}
      </Text>
      {selectedCity === item && (
        <Text style={styles.dropdownItemCheck}>✓</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <>
      {/* Modal del Dropdown de Ciudades */}
      <Modal
        visible={showCityDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCityDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCityDropdown(false)}
        >
          <View style={styles.dropdownModal}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownHeaderTitle}>Seleccionar Ciudad</Text>
              <TouchableOpacity
                style={styles.dropdownCloseButton}
                onPress={() => setShowCityDropdown(false)}
              >
                <Text style={styles.dropdownCloseButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={availableCities}
              renderItem={renderCityDropdownItem}
              keyExtractor={(item) => item}
              style={styles.dropdownList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Selector de fecha eliminado - usando chips simples en su lugar */}
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    margin: 20,
    maxHeight: '70%',
    minWidth: width * 0.8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  dropdownHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  dropdownCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownCloseButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  dropdownList: {
    maxHeight: 300,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  dropdownItemSelected: {
    backgroundColor: Colors.primary + '10',
  },
  dropdownItemText: {
    fontSize: 16,
    color: Colors.primary,
    flex: 1,
  },
  dropdownItemTextSelected: {
    fontWeight: '600',
    color: Colors.primary,
  },
  dropdownItemCheck: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  calendarModal: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    margin: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  calendarModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarModalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clearFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.primary + '20',
    borderRadius: 8,
  },
  clearFilterText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  calendarModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  calendarModalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarModalCloseText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
});
