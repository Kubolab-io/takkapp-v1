/**
 * SimpleDateSelector.tsx
 * Selector de fecha simple para el formulario de crear actividad
 */

import { Colors } from '@/src/constants/Colors';
import React, { useMemo, useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface SimpleDateSelectorProps {
  visible: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
}

export const SimpleDateSelector: React.FC<SimpleDateSelectorProps> = ({
  visible,
  onClose,
  onDateSelect
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Generar opciones de fecha para los próximos 30 días
  const dateOptions = useMemo(() => {
    const options = [];
    const today = new Date();
    
    for (let i = 0; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayName = date.toLocaleDateString('es-ES', { weekday: 'long' });
      const dayNumber = date.getDate();
      const monthName = date.toLocaleDateString('es-ES', { month: 'long' });
      const year = date.getFullYear();
      
      const isToday = i === 0;
      const isTomorrow = i === 1;
      
      options.push({
        date,
        label: isToday ? 'Hoy' : isTomorrow ? 'Mañana' : `${dayName} ${dayNumber} de ${monthName}`,
        fullLabel: `${dayName}, ${dayNumber} de ${monthName} de ${year}`,
        isToday,
        isTomorrow
      });
    }

    return options;
  }, []);

  const handleDateSelect = (date: Date) => {
    onDateSelect(date);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelButton}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Seleccionar Fecha</Text>
            <View style={styles.placeholder} />
          </View>
          
          <ScrollView 
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {dateOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dateOption,
                  selectedDate.toDateString() === option.date.toDateString() && styles.dateOptionSelected
                ]}
                onPress={() => handleDateSelect(option.date)}
              >
                <View style={styles.dateOptionContent}>
                  <Text style={[
                    styles.dateOptionText,
                    selectedDate.toDateString() === option.date.toDateString() && styles.dateOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  <Text style={styles.dateOptionSubtext}>
                    {option.fullLabel}
                  </Text>
                  {option.isToday && (
                    <Text style={styles.dateBadge}>HOY</Text>
                  )}
                  {option.isTomorrow && (
                    <Text style={styles.dateBadge}>MAÑANA</Text>
                  )}
                </View>
                {selectedDate.toDateString() === option.date.toDateString() && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
  },
  cancelButton: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  placeholder: {
    width: 60,
  },
  scrollContainer: {
    maxHeight: 400,
  },
  dateOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  dateOptionSelected: {
    backgroundColor: Colors.primary + '10',
  },
  dateOptionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateOptionText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
  dateOptionTextSelected: {
    fontWeight: '600',
    color: Colors.primary,
  },
  dateOptionSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  dateBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
    backgroundColor: Colors.secondary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  checkmark: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: '600',
  },
});









