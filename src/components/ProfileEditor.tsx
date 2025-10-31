import { Colors } from '@/src/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface ProfileEditorProps {
  profile: any;
  onSave: (updates: any) => Promise<boolean>;
  onCancel: () => void;
  updating: boolean;
}

export default function ProfileEditor({ profile, onSave, onCancel, updating }: ProfileEditorProps) {
  const [formData, setFormData] = useState({
    displayName: profile.displayName || '',
    description: profile.description || '',
    instagram: profile.instagram || '',
    newHobby: ''
  });

  const handleSave = async () => {
    try {
      const updates = {
        displayName: formData.displayName.trim(),
        description: formData.description.trim(),
        instagram: formData.instagram.trim()
      };

      const success = await onSave(updates);
      if (success) {
        Alert.alert('¡Éxito!', 'Perfil actualizado correctamente');
      } else {
        Alert.alert('Error', 'No se pudo actualizar el perfil');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al guardar');
    }
  };

  const handleAddHobby = async () => {
    if (!formData.newHobby.trim()) {
      Alert.alert('Error', 'Por favor ingresa un hobby');
      return;
    }

    if (profile.hobbies.includes(formData.newHobby.trim())) {
      Alert.alert('Error', 'Este hobby ya existe');
      return;
    }

    const success = await onSave({ hobbies: [...profile.hobbies, formData.newHobby.trim()] });
    if (success) {
      setFormData(prev => ({ ...prev, newHobby: '' }));
    }
  };

  const handleRemoveHobby = async (hobby: string) => {
    Alert.alert(
      'Eliminar hobby',
      `¿Estás seguro de que quieres eliminar "${hobby}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const newHobbies = profile.hobbies.filter((h: string) => h !== hobby);
            await onSave({ hobbies: newHobbies });
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.background, Colors.backgroundAlt]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Editar Perfil</Text>
          <Text style={styles.headerSubtitle}>
            Personaliza tu información
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Información Básica */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Información Básica</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre</Text>
            <TextInput
              style={styles.textInput}
              value={formData.displayName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, displayName: text }))}
              placeholder="Tu nombre completo"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.textInput}
              value={profile.email}
              editable={false}
              placeholder="Tu email"
              placeholderTextColor="#9ca3af"
            />
            <Text style={styles.helperText}>El email no se puede cambiar</Text>
          </View>
        </View>

        {/* Descripción */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Sobre ti</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Descripción</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              placeholder="Cuéntanos un poco sobre ti..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Instagram */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 Redes Sociales</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Usuario de Instagram</Text>
            <View style={styles.instagramInput}>
              <Text style={styles.instagramPrefix}>@</Text>
              <TextInput
                style={[styles.textInput, styles.instagramTextInput]}
                value={formData.instagram}
                onChangeText={(text) => setFormData(prev => ({ ...prev, instagram: text.replace('@', '') }))}
                placeholder="usuario"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>
        </View>

        {/* Hobbies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Hobbies e Intereses</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Agregar hobby</Text>
            <View style={styles.hobbyInput}>
              <TextInput
                style={[styles.textInput, styles.hobbyTextInput]}
                value={formData.newHobby}
                onChangeText={(text) => setFormData(prev => ({ ...prev, newHobby: text }))}
                placeholder="Ej: Fútbol, Música, Cocina..."
                placeholderTextColor="#9ca3af"
              />
              <TouchableOpacity
                style={styles.addHobbyButton}
                onPress={handleAddHobby}
                disabled={updating}
              >
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Lista de hobbies */}
          {profile.hobbies.length > 0 && (
            <View style={styles.hobbiesList}>
              <Text style={styles.hobbiesTitle}>Tus hobbies:</Text>
              <View style={styles.hobbiesContainer}>
                {profile.hobbies.map((hobby: string, index: number) => (
                  <View key={index} style={styles.hobbyTag}>
                    <Text style={styles.hobbyText}>{hobby}</Text>
                    <TouchableOpacity
                      style={styles.removeHobbyButton}
                      onPress={() => handleRemoveHobby(hobby)}
                    >
                      <Ionicons name="close-circle" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Botones de Acción */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            disabled={updating}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Guardar Cambios</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a202c',
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  instagramInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instagramPrefix: {
    fontSize: 18,
    color: '#374151',
    marginRight: 8,
    fontWeight: '500',
  },
  instagramTextInput: {
    flex: 1,
  },
  hobbyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hobbyTextInput: {
    flex: 1,
  },
  addHobbyButton: {
    backgroundColor: Colors.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hobbiesList: {
    marginTop: 16,
  },
  hobbiesTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  hobbiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hobbyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  hobbyText: {
    fontSize: 14,
    color: '#374151',
  },
  removeHobbyButton: {
    padding: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 30,
    marginBottom: 40,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 