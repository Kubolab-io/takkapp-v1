/**
 * ImagePickerModal.jsx
 * 
 * Modal para seleccionar imagen del plan
 * Permite elegir entre fotos predeterminadas o subir una nueva
 */

import { Colors } from '@/src/constants/Colors';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import {
    Alert,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const predefinedImages = [
  { id: 'art', name: 'Arte', source: require('@/assets/images/planes/art.jpg') },
  { id: 'cocina', name: 'Cocina', source: require('@/assets/images/planes/cocina.jpg') },
  { id: 'concert', name: 'Concierto', source: require('@/assets/images/planes/concert.jpg') },
  { id: 'running', name: 'Running', source: require('@/assets/images/planes/Running.jpg') },
  { id: 'senderismo', name: 'Senderismo', source: require('@/assets/images/planes/senderismo.jpg') },
];

export const ImagePickerModal = ({ visible, onClose, onSelectImage }) => {
  const handleSelectPredefined = (image) => {
    onSelectImage({ 
      type: 'predefined', 
      key: image.id, 
      source: image.source 
    });
    onClose();
  };

  const handlePickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onSelectImage({ 
          type: 'uploaded', 
          uri: result.assets[0].uri 
        });
        onClose();
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const renderImageItem = ({ item }) => (
    <TouchableOpacity
      style={styles.imageItem}
      onPress={() => handleSelectPredefined(item)}
    >
      <Image source={item.source} style={styles.predefinedImage} />
      <Text style={styles.imageName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Seleccionar Imagen</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>Imágenes predeterminadas:</Text>
          <FlatList
            data={predefinedImages}
            renderItem={renderImageItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.imageGrid}
            removeClippedSubviews={true}
            maxToRenderPerBatch={4}
            windowSize={4}
            initialNumToRender={4}
          />

          <TouchableOpacity
            style={styles.galleryButton}
            onPress={handlePickFromGallery}
          >
            <Text style={styles.galleryButtonText}>📷 Subir desde galería</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textLight,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: Colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textLight,
    marginBottom: 15,
  },
  imageGrid: {
    paddingBottom: 20,
  },
  imageItem: {
    flex: 1,
    margin: 5,
    alignItems: 'center',
  },
  predefinedImage: {
    width: 120,
    height: 80,
    borderRadius: 10,
    marginBottom: 8,
  },
  imageName: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
  },
  galleryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  galleryButtonText: {
    color: Colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
});
