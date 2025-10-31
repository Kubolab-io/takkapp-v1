/**
 * TabFourScreen - index.tsx
 * Versión con nuevo diseño UI
 */

import { ActivitiesList } from '@/src/components/ActivitiesList';
import { ActivityModals } from '@/src/components/ActivityModals';
import { Card } from '@/src/components/Card';
import { FeaturedActivities } from '@/src/components/FeaturedActivities';
import { ImagePickerModal } from '@/src/components/ImagePickerModal';
import { Input } from '@/src/components/Input';
import { LocationAutocompleteModal } from '@/src/components/LocationAutocompleteModal';
import { SimpleDateSelector } from '@/src/components/SimpleDateSelector';
import { ThemedText } from '@/src/components/ThemedText';
import { ThemedView } from '@/src/components/ThemedView';
import { BorderRadius, Colors, Spacing } from '@/src/constants/Colors';
import { activityTypes } from '@/src/constants/activityTypes';
import { AuthModal } from '@/src/features/auth/AuthModal';
import { useAuth } from '@/src/features/auth/useAuth';
import { CommentsModal } from '@/src/features/comments/CommentsModal';
import { usePosts } from '@/src/features/posts/usePosts';
import { useActiveTab } from '@/src/hooks/useActiveTab';
import { useLocation } from '@/src/hooks/useLocation';
import { useResponsive } from '@/src/hooks/useResponsive';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

export default function TabFourScreen() {
  const authData = useAuth();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  const postsData = usePosts(authData.user);
  const { 
    selectedCity, 
    setSelectedCity, 
    availableCities, 
    getFilteredActivities,
    activityTime,
    setActivityTime
  } = postsData;
  const activeTab = useActiveTab();
  
  // Estados locales
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState('Todos');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('Todos');
  
  // Estados para el formulario de creación
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Hook para ubicación del usuario
  const { getSimpleCurrentLocation } = useLocation();
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);

  // Función para parsear fechas de Firebase
  const parseActivityDate = useCallback((dateValue: any): Date | null => {
    if (!dateValue) return null;
    
    try {
      let date: Date;
      
      // Si es un timestamp de Firebase
      if (dateValue?.seconds && dateValue?.nanoseconds) {
        date = new Date(dateValue.seconds * 1000);
      }
      // Si es un objeto Timestamp de Firebase
      else if (dateValue?.toDate && typeof dateValue.toDate === 'function') {
        date = dateValue.toDate();
      }
      // Si es un string de fecha
      else if (typeof dateValue === 'string') {
        // Intentar parsear el string
        date = new Date(dateValue);
        
        // Si el parsing falló, intentar con formato español
        if (isNaN(date.getTime())) {
          // Parsear formato español: "miércoles, 27 de noviembre de 2024"
          const months: { [key: string]: number } = {
            'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3,
            'mayo': 4, 'junio': 5, 'julio': 6, 'agosto': 7,
            'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
          };
          
          const regex = /(\d{1,2}) de (\w+) de (\d{4})/;
          const match = dateValue.match(regex);
          
          if (match) {
            const day = parseInt(match[1]);
            const monthName = match[2].toLowerCase();
            const year = parseInt(match[3]);
            const month = months[monthName];
            
            if (month !== undefined) {
              date = new Date(year, month, day);
            }
          }
        }
      }
      // Si es un objeto Date
      else if (dateValue instanceof Date) {
        date = dateValue;
      }
      else {
        return null;
      }
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        return null;
      }
      
      return date;
    } catch (error) {
      console.error('Error parseando fecha:', error);
      return null;
    }
  }, []);

  // Función mejorada para comparar fechas (solo comparar días, no horas)
  const isSameDay = useCallback((date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }, []);

  // Función mejorada para filtrar por fecha
  const filterByDate = useCallback((activity: any): boolean => {
    // Parsear la fecha de la actividad
    const activityDate = parseActivityDate(activity.date);
    
    // Si no hay fecha válida, no mostrar la actividad
    if (!activityDate) {
      console.log('❌ Actividad sin fecha válida:', activity.title);
      return false;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Resetear a medianoche para comparaciones precisas
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    // Resetear la hora de la fecha de actividad para comparaciones
    const activityDateReset = new Date(activityDate);
    activityDateReset.setHours(0, 0, 0, 0);
    
    // IMPORTANTE: Filtrar actividades pasadas (solo mostrar de hoy en adelante)
    if (activityDateReset < today) {
      console.log('❌ Actividad pasada filtrada:', activity.title, activityDateReset);
      return false;
    }
    
    // Aplicar filtro según la selección
    switch (selectedDateFilter) {
      case 'Todos':
        return true;
      case 'Hoy':
        return isSameDay(activityDateReset, today);
      case 'Mañana':
        return isSameDay(activityDateReset, tomorrow);
      case 'Esta semana':
        const weekStart = new Date(today);
        const dayOfWeek = today.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        weekStart.setDate(today.getDate() + diff);
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        return activityDateReset >= weekStart && activityDateReset <= weekEnd;
      default:
        return true;
    }
  }, [selectedDateFilter, parseActivityDate, isSameDay]);

  const openActivityDetails = useCallback((item: any) => {
    router.push({
      pathname: '/ActividadDetalle',
      params: { 
        actividadId: item.id,
        actividadData: JSON.stringify(item)
      }
    });
  }, []);

  const getDisplayName = useCallback((obj: any) => {
    if (obj?.author) return obj.author;
    if (obj?.displayName) return obj.displayName;
    if (obj?.email) return obj.email.split('@')[0];
    return "Usuario";
  }, []);

  const getInitials = useCallback((obj: any) => {
    const name = getDisplayName(obj);
    if (name.includes('@')) {
      return name.split('@')[0].substring(0, 2).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }, [getDisplayName]);

  // Función para calcular distancia entre dos puntos (fórmula de Haversine)
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distancia en kilómetros
  }, []);

  // Función para obtener ubicación del usuario al cargar la pantalla
  const getUserLocation = useCallback(async () => {
    try {
      const locationData = await getSimpleCurrentLocation();
      if (locationData) {
        setUserLocation(locationData.coordinates);
      }
    } catch (error) {
      console.error('⚠️ Error al obtener ubicación del usuario:', error);
    }
  }, [getSimpleCurrentLocation]);




  // Obtener datos de posts
  const {
    user,
    showAuthModal,
    isLogin,
    setIsLogin,
    email,
    setEmail,
    password,
    setPassword,
    displayName,
    setDisplayName,
    authLoading,
    initialLoading,
    handleAuth
  } = authData;

  const {
    loading,
    showCreateForm,
    setShowCreateForm,
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
    activityDateObject,
    setActivityDateObject,
    activityType,
    setActivityType,
    maxParticipants,
    setMaxParticipants,
    activityImage,
    setActivityImage,
    showImagePicker,
    setShowImagePicker,
    showCommentsModal,
    selectedPost,
    comments,
    newComment,
    setNewComment,
    loadingComment,
    handlePost,
    joinActivity,
    openComments,
    closeComments,
    addComment
  } = postsData;

  // Obtener planes con filtros aplicados
  const filteredPlans = useMemo(() => {
    const filteredData = getFilteredActivities;
    let featuredPlans = filteredData.featured || [];
    let allPlans = filteredData.normal || [];

    // Aplicar filtro por fecha (incluyendo filtrar actividades pasadas)
    featuredPlans = featuredPlans.filter(filterByDate);
    allPlans = allPlans.filter(filterByDate);

    // Aplicar filtro por tipo de actividad
    if (selectedTypeFilter && selectedTypeFilter !== 'Todos') {
      featuredPlans = featuredPlans.filter((activity: any) => 
        activity.activityType === selectedTypeFilter
      );
      allPlans = allPlans.filter((activity: any) => 
        activity.activityType === selectedTypeFilter
      );
    }

    console.log('✅ Planes cargados después de filtros:', {
      featured: featuredPlans.length,
      normal: allPlans.length,
      filtros: { fecha: selectedDateFilter, tipo: selectedTypeFilter }
    });

    return { featuredPlans, allPlans };
  }, [getFilteredActivities, filterByDate, selectedTypeFilter, selectedDateFilter]);

  const { featuredPlans, allPlans } = filteredPlans;

  // Obtener ubicación del usuario al cargar la pantalla
  useEffect(() => {
    if (user && !userLocation) {
      getUserLocation();
    }
  }, [user, getUserLocation, userLocation]);



  const handleCreateActivity = useCallback(() => {
    setShowCreateForm(!showCreateForm);
  }, [showCreateForm, setShowCreateForm]);

  // Función para manejar la selección de fecha
  const handleDateSelect = useCallback((date: Date) => {
    console.log('📅 Fecha seleccionada:', date);
    const formattedDate = date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    console.log('📅 Fecha formateada:', formattedDate);
    setActivityDate(formattedDate);
    (setActivityDateObject as any)(date); // Guardar el objeto Date
    setShowDatePicker(false);
  }, [setActivityDate, setActivityDateObject]);

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView variant="container" style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.dark} />
          <ThemedText variant="body" color="textSecondary" style={styles.loadingText}>
            Cargando...
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient
      colors={['#87CEEB', '#4A90E2', '#1E3A8A']}
      style={styles.mainContainer}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
        {/* Header con saludo y perfil */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <ThemedText variant="h2" color="white">
              ¡Hola de nuevo! 👋
            </ThemedText>
          </View>
          
          {/* Barra de búsqueda */}
          <TouchableOpacity 
            style={styles.searchBar}
            onPress={() => setShowSearchModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
            <ThemedText variant="body" color="textSecondary" style={styles.searchPlaceholder}>
              ¿Qué quieres hacer hoy?
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Contenido principal */}
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {user && (
            <>
              {showCreateForm ? (
                <Card variant="elevated" style={styles.createFormCard}>
                  <ThemedText variant="h3" color="textPrimary" style={styles.createFormTitle}>
                    Crear Nueva Actividad
                  </ThemedText>
                  
                  {/* Título */}
                  <Input
                    placeholder="Título de la actividad *"
                    value={activityTitle}
                    onChangeText={setActivityTitle}
                    maxLength={100}
                  />
                
                  {/* Selector de Imagen */}
                  <View style={styles.imageSelectorContainer}>
                    <ThemedText variant="caption" color="textPrimary" style={styles.imageSelectorLabel}>
                      Imagen del plan *
                    </ThemedText>
                    <TouchableOpacity 
                      style={styles.imageSelectorButton}
                      onPress={() => setShowImagePicker(true)}
                    >
                      {activityImage ? (
                        <Image 
                          source={(activityImage as any).type === 'predefined' ? (activityImage as any).source : activityImage} 
                          style={styles.selectedImage} 
                        />
                      ) : (
                        <View style={styles.imagePlaceholder}>
                          <Ionicons name="camera-outline" size={32} color={Colors.textSecondary} />
                          <ThemedText variant="caption" color="textSecondary">
                            Seleccionar imagen
                          </ThemedText>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                  
                  {/* Descripción */}
                  <Input
                    placeholder="Descripción de la actividad *"
                    value={activityDescription}
                    onChangeText={setActivityDescription}
                    multiline
                    numberOfLines={4}
                    maxLength={500}
                    style={styles.textArea}
                  />
                
                  {/* Ubicación */}
                  <LocationAutocompleteModal
                    value={activityLocation}
                    onChangeText={setActivityLocation}
                    onLocationSelect={setActivityLocationData}
                    placeholder="Ubicación *"
                  />
                  
                  {/* Selector de Fecha */}
                  <View style={styles.dateTimeContainer}>
                    <ThemedText variant="caption" color="textPrimary" style={styles.dateTimeLabel}>
                      Fecha *
                    </ThemedText>
                    <TouchableOpacity
                      style={styles.dateTimeButton}
                      onPress={() => setShowDatePicker(true)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.dateTimeButtonText,
                        !activityDate && styles.dateTimePlaceholder
                      ]}>
                        {activityDate || 'Seleccionar fecha'}
                      </Text>
                      <Ionicons name="calendar-outline" size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Hora */}
                  <Input
                    placeholder="Hora (ej: 19:00) *"
                    value={activityTime}
                    onChangeText={setActivityTime}
                    maxLength={10}
                  />
                
                  {/* Precio */}
                  <Input
                    label="Precio"
                    placeholder="Ej: Gratis, $50.000"
                    value={activityPrice}
                    onChangeText={setActivityPrice}
                    maxLength={50}
                  />
                  
                  {/* Participantes */}
                  <Input
                    label="Máximo de participantes *"
                    placeholder="Número de cupos"
                    value={maxParticipants}
                    onChangeText={setMaxParticipants}
                    keyboardType="numeric"
                    maxLength={3}
                  />
                  
                  {/* Tipo de Actividad */}
                  <View style={styles.activityTypeContainer}>
                    <ThemedText variant="caption" color="textPrimary" style={styles.activityTypeLabel}>
                      Tipo de Actividad *
                    </ThemedText>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      style={styles.activityTypeScroll}
                    >
                      {activityTypes.map((type) => (
                        <TouchableOpacity
                          key={type.label}
                          style={[
                            styles.activityTypeChip,
                            activityType === type.label && styles.activityTypeChipActive
                          ]}
                          onPress={() => setActivityType(type.label)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.activityTypeEmoji}>{type.emoji}</Text>
                          <Text style={[
                            styles.activityTypeText,
                            activityType === type.label && styles.activityTypeTextActive
                          ]}>
                            {type.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                  
                  {/* Botones */}
                  <View style={styles.formActions}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => setShowCreateForm(false)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.cancelButtonText}>
                        Cancelar
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.createButton,
                        loading && styles.createButtonDisabled
                      ]}
                      onPress={() => handlePost()}
                      disabled={loading}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.createButtonText}>
                        {loading ? "Creando..." : "Crear Actividad"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ) : (
                <>
                  {/* Sección de Actividades Destacadas */}
                  {featuredPlans.length > 0 && (
                    <View style={styles.featuredSection}>
                      <View style={styles.sectionHeader}>
                        <ThemedText variant="h3" color="textPrimary">
                          Actividades Destacadas
                        </ThemedText>
                        <ThemedText variant="caption" color="textSecondary">
                          {featuredPlans.length} actividades
                        </ThemedText>
                      </View>
                      <FeaturedActivities
                        featuredPlans={featuredPlans}
                        selectedCity={selectedCity}
                        selectedActivityType="Todos"
                        activityTypes={[]}
                        onOpenActivityDetails={openActivityDetails}
                      />
                    </View>
                  )}

                  {/* Lista de Actividades */}
                  <ActivitiesList
                    allPlans={allPlans}
                    user={user}
                    selectedCity={selectedCity}
                    selectedActivityType="Todos"
                    activityTypes={[]}
                    userLocation={userLocation}
                    onJoinActivity={joinActivity}
                    onOpenComments={openComments}
                    onOpenActivityDetails={openActivityDetails}
                    getUserDisplayName={getDisplayName}
                    getUserInitials={getInitials}
                  />

                  {/* Mensaje cuando no hay planes */}
                  {allPlans.length === 0 && featuredPlans.length === 0 && (
                    <Card variant="elevated" style={styles.emptyState}>
                      <View style={styles.emptyStateIcon}>
                        <Ionicons name="calendar-outline" size={64} color={Colors.dark} />
                      </View>
                      <ThemedText variant="h3" color="textPrimary" style={styles.emptyStateTitle}>
                        No hay actividades aún
                      </ThemedText>
                      <ThemedText variant="body" color="textSecondary" style={styles.emptyStateText}>
                        Sé el primero en crear un plan increíble
                      </ThemedText>
                      <TouchableOpacity
                        style={styles.emptyStateButton}
                        onPress={handleCreateActivity}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="add-circle" size={24} color={Colors.white} style={styles.emptyStateButtonIcon} />
                        <Text style={styles.emptyStateButtonText}>
                          Crear Actividad
                        </Text>
                      </TouchableOpacity>
                    </Card>
                  )}
                </>
              )}
            </>
          )}

          {/* Botón flotante para crear actividad */}
          {!showCreateForm && (
            <TouchableOpacity 
              style={styles.floatingButton}
              onPress={handleCreateActivity}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={24} color={Colors.white} />
            </TouchableOpacity>
          )}

          {/* Modales */}
          <ActivityModals
            showCityDropdown={false}
            setShowCityDropdown={() => {}}
            availableCities={availableCities}
            selectedCity={selectedCity}
            onCitySelect={() => {}}
          />

          {/* Modal de Comentarios */}
          <CommentsModal
            visible={showCommentsModal}
            selectedPost={selectedPost}
            comments={comments}
            newComment={newComment}
            setNewComment={setNewComment}
            loadingComment={loadingComment}
            onClose={closeComments}
            onAddComment={addComment}
            getUserDisplayName={getDisplayName}
            getUserInitials={getInitials}
          />
        </ScrollView>

      {/* Modal de Autenticación */}
      <AuthModal
        visible={showAuthModal && !initialLoading}
        isLogin={isLogin}
        setIsLogin={setIsLogin}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        displayName={displayName}
        setDisplayName={setDisplayName}
        authLoading={authLoading}
        handleAuth={handleAuth}
      />

      {/* Modal de búsqueda con filtros */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showSearchModal}
        onRequestClose={() => setShowSearchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText variant="h3" color="textPrimary" style={styles.modalTitle}>
              Filtros de Búsqueda
            </ThemedText>
            
            {/* Filtro de Ciudad */}
            <View style={styles.filterSection}>
              <ThemedText variant="caption" color="textPrimary" style={styles.filterLabel}>
                Ciudad
              </ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterOptions}>
                {['Todas', 'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena'].map((city) => (
                  <TouchableOpacity
                    key={city}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor: selectedCity === city ? '#333' : '#fff',
                      borderWidth: 1,
                      borderColor: '#ddd',
                      marginRight: 8,
                    }}
                    onPress={() => setSelectedCity(city)}
                  >
                    <Text style={{
                      color: selectedCity === city ? '#fff' : '#333',
                      fontSize: 14,
                      fontWeight: '500',
                    }}>
                      {city}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Filtro de Fecha */}
            <View style={styles.filterSection}>
              <ThemedText variant="caption" color="textPrimary" style={styles.filterLabel}>
                Fecha
              </ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterOptions}>
                {['Todos', 'Hoy', 'Mañana', 'Esta semana', 'Próximos 7 días'].map((date) => (
                  <TouchableOpacity
                    key={date}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor: selectedDateFilter === date ? '#333' : '#fff',
                      borderWidth: 1,
                      borderColor: '#ddd',
                      marginRight: 8,
                    }}
                    onPress={() => setSelectedDateFilter(date)}
                  >
                    <Text style={{
                      color: selectedDateFilter === date ? '#fff' : '#333',
                      fontSize: 14,
                      fontWeight: '500',
                    }}>
                      {date}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Filtro de Tipo de Actividad */}
            <View style={styles.filterSection}>
              <ThemedText variant="caption" color="textPrimary" style={styles.filterLabel}>
                Tipo de Actividad
              </ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterOptions}>
                {['Todos', ...activityTypes.map(t => t.label)].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.filterTypeChip,
                      selectedTypeFilter === type && styles.filterTypeChipActive
                    ]}
                    onPress={() => setSelectedTypeFilter(type)}
                  >
                    <Text style={[
                      styles.filterTypeChipText,
                      selectedTypeFilter === type && styles.filterTypeChipTextActive
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>


            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#ddd',
                  backgroundColor: '#fff',
                  marginRight: 8,
                }}
                onPress={() => {
                  // Resetear filtros
                  setSelectedDateFilter('Todos');
                  setSelectedTypeFilter('Todos');
                  setSelectedCity('Todas');
                  setShowSearchModal(false);
                }}
              >
                <Text style={{
                  color: '#333',
                  fontSize: 16,
                  fontWeight: '500',
                  textAlign: 'center',
                }}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  borderRadius: 8,
                  backgroundColor: '#333',
                  marginLeft: 8,
                }}
                onPress={() => {
                  console.log('🔍 Aplicando filtros:', {
                    ciudad: selectedCity,
                    fecha: selectedDateFilter,
                    tipo: selectedTypeFilter
                  });
                  setShowSearchModal(false);
                }}
              >
                <Text style={{
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: '500',
                  textAlign: 'center',
                }}>
                  Aplicar Filtros
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Selector de Imagen */}
      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onSelectImage={setActivityImage}
      />

      {/* Modal de Selector de Fecha */}
      <SimpleDateSelector
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onDateSelect={handleDateSelect}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  mainContainer: {
    flex: 1,
    paddingTop: 50, // Espacio para el status bar
    minHeight: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
    paddingHorizontal: Spacing.md,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: 'transparent',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  searchPlaceholder: {
    flex: 1,
  },
  featuredSection: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  simpleContent: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
    paddingHorizontal: Spacing.lg,
  },
  welcomeTitle: {
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  welcomeText: {
    textAlign: 'center',
    opacity: 0.9,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
    paddingHorizontal: Spacing.xl,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.xl,
  },
  emptyStateIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    shadowColor: Colors.shadow.medium,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyStateTitle: {
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  emptyStateText: {
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    shadowColor: Colors.dark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyStateButtonIcon: {
    marginRight: Spacing.sm,
  },
  emptyStateButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.dark,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow.medium,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
  },
  // Estilos para el formulario de creación
  createFormCard: {
    margin: Spacing.lg,
    padding: Spacing.lg,
  },
  createFormTitle: {
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateTimeContainer: {
    marginBottom: Spacing.md,
  },
  dateTimeLabel: {
    marginBottom: Spacing.sm,
  },
  dateTimeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  dateTimeButtonText: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  dateTimePlaceholder: {
    color: Colors.textSecondary,
  },
  // Estilos para selector de imagen
  imageSelectorContainer: {
    marginBottom: Spacing.md,
  },
  imageSelectorLabel: {
    marginBottom: Spacing.sm,
  },
  imageSelectorButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  selectedImage: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.md,
    resizeMode: 'cover',
  },
  activityTypeContainer: {
    marginBottom: Spacing.lg,
  },
  activityTypeLabel: {
    marginBottom: Spacing.sm,
  },
  activityTypeScroll: {
    flexGrow: 0,
  },
  activityTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
    gap: Spacing.xs,
  },
  activityTypeChipActive: {
    backgroundColor: Colors.dark,
    borderColor: Colors.dark,
  },
  activityTypeEmoji: {
    fontSize: 18,
  },
  activityTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  activityTypeTextActive: {
    color: Colors.white,
  },
  formActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonDisabled: {
    backgroundColor: Colors.textSecondary,
    opacity: 0.6,
  },
  createButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  // Estilos para modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    maxHeight: '80%',
    shadowColor: Colors.shadow.medium,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  filterSection: {
    marginBottom: Spacing.lg,
  },
  filterOptions: {
    flexDirection: 'row',
  },
  filterLabel: {
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  modalCancelButton: {
    flex: 1,
  },
  modalApplyButton: {
    flex: 1,
  },
  filterTypeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  filterTypeChipActive: {
    backgroundColor: Colors.dark,
    borderColor: Colors.dark,
  },
  filterTypeChipText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  filterTypeChipTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
});