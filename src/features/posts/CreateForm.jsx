/**
 * CreateForm.jsx
 * 
 * Componente formulario para crear nuevas actividades.
 * Incluye selección de tipo de actividad, campos para título, fecha, ubicación, precio y cupos.
 * Se muestra cuando el usuario quiere crear una actividad en lugar de un post simple.
 */

import { ImagePickerModal } from '@/src/components/ImagePickerModal';
import { LocationAutocompleteModal } from '@/src/components/LocationAutocompleteModal';
import { SimpleDateSelector } from '@/src/components/SimpleDateSelector';
import { activityTypes } from '@/src/constants/activityTypes.js';
import { Colors } from '@/src/constants/Colors';
// DateTimePicker eliminado - usando selector personalizado
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { styles } from '../../styles/styles.js';

export const CreateForm = React.memo(({
  activityTitle,
  setActivityTitle,
  activityDescription,
  setActivityDescription,
  activityLocation,
  setActivityLocation,
  activityLocationData,
  setActivityLocationData,
  activityPrice,
  setActivityPrice,
  activityDate,
  setActivityDate,
  activityTime,
  setActivityTime,
  activityType,
  setActivityType,
  maxParticipants,
  setMaxParticipants,
  activityImage,
  setActivityImage,
  showImagePicker,
  setShowImagePicker,
  loading,
  onSubmit,
  onCancel
}) => {
  // Estados para selectores de fecha y hora (simplificados)
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [activityDateObject, setActivityDateObject] = useState(null);

  // Generar opciones de hora (optimizado con useMemo)
  const timeOptions = useMemo(() => {
    const options = [];
    for (let hour = 6; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeString);
      }
    }
    return options;
  }, []);

  // Fecha mínima memoizada para evitar recrear el objeto Date
  const minimumDate = useMemo(() => new Date(), []);

  // Función para formatear fecha (optimizada con useCallback)
  const formatDate = useCallback((date) => {
    if (!date || !(date instanceof Date)) return '';
    
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('es-ES', options);
  }, []);

  // Función simplificada para manejar cambio de fecha
  const handleDateSelect = useCallback((date) => {
    // Guardar tanto el string formateado como el objeto Date
    setActivityDate(formatDate(date));
    // También guardar el objeto Date para uso interno
    setActivityDateObject(date);
    setShowDatePicker(false);
  }, [setActivityDate, formatDate]);

  // Función simplificada para manejar cambio de hora
  const handleTimeChange = useCallback((time) => {
    if (!time || typeof time !== 'string') return;
    
    setActivityTime(time);
  }, [setActivityTime]);

  return (
    <KeyboardAvoidingView 
      style={styles.createForm}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={5}
      >
      <Text style={styles.formTitle}>Crear Nueva Actividad</Text>
      
      <View style={styles.typeSelector}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled={true}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
        >
          {useMemo(() => 
            activityTypes.map((type) => (
              <TouchableOpacity
                key={type.emoji}
                style={[
                  styles.typeOption,
                  activityType === type.emoji && styles.typeOptionSelected
                ]}
                onPress={() => setActivityType(type.emoji)}
              >
                <Text style={styles.typeEmoji}>{type.emoji}</Text>
                <Text style={[
                  styles.typeLabel,
                  activityType === type.emoji && { color: Colors.primary, fontWeight: '700' }
                ]}>{type.label}</Text>
              </TouchableOpacity>
            )), [activityType, setActivityType]
          )}
        </ScrollView>
      </View>

      <TextInput
        style={styles.formInput}
        placeholder="Título de la actividad..."
        value={activityTitle}
        onChangeText={setActivityTitle}
        placeholderTextColor="#888"
      />

      <TextInput
        style={[styles.formInput, styles.formTextArea]}
        placeholder="Descripción de la actividad (opcional)..."
        value={activityDescription}
        onChangeText={setActivityDescription}
        placeholderTextColor="#888"
        multiline={true}
        numberOfLines={3}
        textAlignVertical="top"
      />

      {/* Selección de imagen */}
      <View style={styles.imageSelector}>
        <Text style={styles.imageSelectorLabel}>Imagen del plan *</Text>
        <TouchableOpacity 
          style={styles.imageSelectorButton}
          onPress={() => setShowImagePicker(true)}
        >
          {activityImage ? (
            <>
              {console.log('🖼️ Mostrando imagen seleccionada:', activityImage)}
              <Image 
                source={activityImage.type === 'predefined' ? activityImage.source : activityImage} 
                style={styles.selectedImage} 
              />
            </>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>📷 Seleccionar imagen</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Selector de Fecha */}
      <View style={styles.dateTimeSection}>
        <Text style={styles.dateTimeLabel}>Fecha *</Text>
        <TouchableOpacity
          style={styles.dateTimeButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateTimeButtonText}>
            {activityDate || 'Seleccionar fecha'}
          </Text>
          <Text style={styles.dateTimeArrow}>📅</Text>
        </TouchableOpacity>
      </View>

      {/* Selector de Hora */}
      <View style={styles.dateTimeSection}>
        <Text style={styles.dateTimeLabel}>Hora *</Text>
        <TouchableOpacity
          style={styles.dateTimeButton}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={styles.dateTimeButtonText}>
            {activityTime || 'Seleccionar hora'}
          </Text>
          <Text style={styles.dateTimeArrow}>🕐</Text>
        </TouchableOpacity>
      </View>

      <LocationAutocompleteModal
        value={activityLocation}
        onChangeText={setActivityLocation}
        onLocationSelect={setActivityLocationData}
        placeholder="Ubicación..."
      />

      <TextInput
        style={styles.formInput}
        placeholder="Precio (opcional, deja vacío si es gratis)"
        value={activityPrice}
        onChangeText={setActivityPrice}
        placeholderTextColor="#888"
        keyboardType="numeric"
      />

      <TextInput
        style={styles.formInput}
        placeholder="Cupos disponibles (ej: 5)"
        value={maxParticipants ? maxParticipants.toString() : ""}
        onChangeText={(text) => {
          const num = parseInt(text) || "";
          setMaxParticipants(num);
        }}
        placeholderTextColor="#888"
        keyboardType="numeric"
      />

      <View style={styles.formButtons}>
        <TouchableOpacity 
          style={styles.cancelBtn}
          onPress={onCancel}
        >
          <Text style={styles.cancelBtnText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.createBtn}
          onPress={() => onSubmit(activityDateObject)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.createBtnText}>Crear Actividad</Text>
          )}
        </TouchableOpacity>
      </View>

      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onSelectImage={setActivityImage}
      />

      {/* Selector de Fecha Simple - Sin DateTimePicker */}
      <SimpleDateSelector
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onDateSelect={handleDateSelect}
      />

      {/* Modal del Selector de Hora - Optimizado */}
      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTimePicker(false)}
        hardwareAccelerated={true}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTimePicker(false)}
        >
          <View style={styles.timePickerModal}>
            <View style={styles.timePickerHeader}>
              <Text style={styles.timePickerTitle}>Seleccionar Hora</Text>
              <TouchableOpacity
                style={styles.timePickerCloseButton}
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={styles.timePickerCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView 
              style={styles.timePickerList} 
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              windowSize={10}
              initialNumToRender={20}
            >
              {useMemo(() => 
                timeOptions.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeOption,
                      activityTime === time && styles.timeOptionSelected
                    ]}
                    onPress={() => {
                      handleTimeChange(time);
                      setShowTimePicker(false);
                    }}
                  >
                    <Text style={[
                      styles.timeOptionText,
                      activityTime === time && styles.timeOptionTextSelected
                    ]}>
                      {time}
                    </Text>
                    {activityTime === time && (
                      <Text style={styles.timeOptionCheck}>✓</Text>
                    )}
                  </TouchableOpacity>
                )), [timeOptions, activityTime, handleTimeChange]
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
});