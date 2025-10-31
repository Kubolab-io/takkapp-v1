// components/SharePlanModal.tsx
import { Colors } from '@/src/constants/Colors';
import { User } from 'firebase/auth';
import React, { useState } from 'react';
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface SharePlanModalProps {
  visible: boolean;
  onClose: () => void;
  onSharePlan: (plan: any) => void;
  user: User | null;
  getUserDisplayName: (userObj?: any) => string;
  getUserInitials: (userObj?: any) => string;
  plans?: any[];
}

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

export const SharePlanModal: React.FC<SharePlanModalProps> = ({
  visible,
  onClose,
  onSharePlan,
  user,
  getUserDisplayName,
  getUserInitials,
  plans = []
}) => {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  // Usar los planes pasados como prop
  const allPlans = plans;

  console.log('📋 SharePlanModal renderizado:', { visible, plansCount: allPlans.length });

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
  };

  const handleSharePlan = () => {
    if (selectedPlan) {
      onSharePlan(selectedPlan);
      setSelectedPlan(null);
      onClose();
    }
  };

  const renderPlanItem = ({ item }: { item: any }) => {
    const isSelected = selectedPlan?.id === item.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.planItem,
          isSelected && styles.selectedPlanItem
        ]}
        onPress={() => handleSelectPlan(item)}
      >
        <View style={styles.planContent}>
          <Text style={styles.planEmoji}>{item.emoji}</Text>
          <View style={styles.planInfo}>
            <Text style={styles.planTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.planLocation} numberOfLines={1}>
              📍 {item.location}
            </Text>
            {item.date && (
              <Text style={styles.planDate} numberOfLines={1}>
                🕐 {formatDateForDisplay(item.date)}
              </Text>
            )}
          </View>
        </View>
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Text style={styles.selectedText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Compartir Plan</Text>
          <TouchableOpacity
            style={[
              styles.shareButton,
              !selectedPlan && styles.shareButtonDisabled
            ]}
            onPress={handleSharePlan}
            disabled={!selectedPlan}
          >
            <Text style={[
              styles.shareButtonText,
              !selectedPlan && styles.shareButtonTextDisabled
            ]}>
              Compartir
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.subtitle}>
            Selecciona un plan para compartir en el chat
          </Text>
          
          {allPlans.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>📅</Text>
              <Text style={styles.emptyStateTitle}>No hay planes disponibles</Text>
              <Text style={styles.emptyStateText}>
                Crea un plan primero para poder compartirlo
              </Text>
            </View>
          ) : (
            <FlatList
              data={allPlans}
              keyExtractor={(item) => item.id}
              renderItem={renderPlanItem}
              style={styles.plansList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.plansListContent}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  shareButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  shareButtonDisabled: {
    backgroundColor: Colors.textSecondary,
    opacity: 0.5,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  shareButtonTextDisabled: {
    color: '#999',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  plansList: {
    flex: 1,
  },
  plansListContent: {
    paddingBottom: 20,
  },
  planItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedPlanItem: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '05',
  },
  planContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  planLocation: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  planDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
