// components/ShareToGroupsModal.tsx
import { Colors } from '@/src/constants/Colors';
import { useGroups } from '@/src/features/groups/useGroups';
import { router } from 'expo-router';
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

interface ShareToGroupsModalProps {
  visible: boolean;
  onClose: () => void;
  plan: any;
  user: User | null;
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

export const ShareToGroupsModal: React.FC<ShareToGroupsModalProps> = ({
  visible,
  onClose,
  plan,
  user
}) => {
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const { groups, loading } = useGroups(user);

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleShareToGroups = async () => {
    if (selectedGroups.length === 0) return;

    try {
      // Solo navegar al primer grupo seleccionado para evitar múltiples navegaciones
      const firstGroupId = selectedGroups[0];
      const group = groups.find(g => g.id === firstGroupId);
      
      if (group) {
        // Crear mensaje de plan compartido
        const shareMessage = `📅 Plan compartido: ${plan.title}\n📍 ${plan.location}\n🕐 ${formatDateForDisplay(plan.date) || 'Fecha por confirmar'}\n💰 ${plan.price || 'Gratis'}`;
        
        // Cerrar el modal primero
        onClose();
        
        // Pequeño delay para asegurar que el modal se cierre antes de navegar
        setTimeout(() => {
          router.push({
            pathname: '/GroupChat' as any,
            params: {
              groupId: group.id,
              groupName: group.name,
              groupEmoji: group.emoji,
              preWrittenMessage: shareMessage
            }
          });
        }, 100);
      }
    } catch (error) {
      console.error('Error compartiendo a grupos:', error);
    }
  };

  const renderGroupItem = ({ item }: { item: any }) => {
    const isSelected = selectedGroups.includes(item.id);
    
    return (
      <TouchableOpacity
        style={[
          styles.groupItem,
          isSelected && styles.selectedGroupItem
        ]}
        onPress={() => handleGroupSelect(item.id)}
      >
        <View style={styles.groupContent}>
          <Text style={styles.groupEmoji}>{item.emoji}</Text>
          <View style={styles.groupInfo}>
            <Text style={styles.groupName}>{item.name}</Text>
            <Text style={styles.groupMembers}>
              {item.memberCount || 0} miembros
            </Text>
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
              selectedGroups.length === 0 && styles.shareButtonDisabled
            ]}
            onPress={handleShareToGroups}
            disabled={selectedGroups.length === 0}
          >
            <Text style={[
              styles.shareButtonText,
              selectedGroups.length === 0 && styles.shareButtonTextDisabled
            ]}>
              Compartir ({selectedGroups.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.subtitle}>
            Selecciona los grupos donde quieres compartir "{plan?.title}"
          </Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Cargando grupos...</Text>
            </View>
          ) : groups.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>👥</Text>
              <Text style={styles.emptyStateTitle}>No tienes grupos</Text>
              <Text style={styles.emptyStateText}>
                Únete a grupos primero para poder compartir planes
              </Text>
            </View>
          ) : (
            <FlatList
              data={groups}
              keyExtractor={(item) => item.id}
              renderItem={renderGroupItem}
              style={styles.groupsList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.groupsListContent}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  groupsList: {
    flex: 1,
  },
  groupsListContent: {
    paddingBottom: 20,
  },
  groupItem: {
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
  selectedGroupItem: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '05',
  },
  groupContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  groupMembers: {
    fontSize: 14,
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
