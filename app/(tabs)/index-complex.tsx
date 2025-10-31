/**
 * TabFourScreen - index.tsx
 * Este archivo actúa como contenedor principal y delega la lógica específica a hooks y componentes.
 */

import { ActivityCard } from '@/src/components/ActivityCard';
import CustomTabBar from '@/src/components/CustomTabBar';
import { Header } from '@/src/components/Header';
import { QuickPost } from '@/src/components/QuickPost';
import { Colors } from '@/src/constants/Colors';
import { AuthModal } from '@/src/features/auth/AuthModal';
import { useAuth } from '@/src/features/auth/useAuth';
import { CommentsModal } from '@/src/features/comments/CommentsModal';
import { CreateForm } from '@/src/features/posts/CreateForm';
import { usePosts } from '@/src/features/posts/usePosts';
import { useActiveTab } from '@/src/hooks/useActiveTab';
import { styles } from '@/src/styles/styles.js';
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";

const { width } = Dimensions.get('window');

export default function TabFourScreen() {
  console.log('🏠 TabFourScreen - Iniciando componente');
  
  // Función para formatear fechas de Firebase
  const formatFirebaseDate = (dateValue: any) => {
    if (!dateValue) return 'Fecha no especificada';
    
    try {
      // Si es un timestamp de Firebase (tiene seconds y nanoseconds)
      if (dateValue.seconds && dateValue.nanoseconds) {
        return new Date(dateValue.seconds * 1000).toLocaleDateString('es-ES');
      }
      
      // Si es un string de fecha ISO
      if (typeof dateValue === 'string') {
        return new Date(dateValue).toLocaleDateString('es-ES');
      }
      
      // Si es un timestamp en milisegundos
      if (typeof dateValue === 'number') {
        return new Date(dateValue).toLocaleDateString('es-ES');
      }
      
      return 'Formato no válido';
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return 'Error en fecha';
    }
  };
  
  // Hooks personalizados
  const authData = useAuth();
  console.log('🔐 TabFourScreen - Auth data:', {
    user: authData.user ? 'presente' : 'ausente',
    initialLoading: authData.initialLoading,
    showAuthModal: authData.showAuthModal
  });
  
  const postsData = usePosts(authData.user);
  const { featuredPosts } = postsData;
  const activeTab = useActiveTab();
  
  console.log('📊 TabFourScreen - Posts data:', {
    postsCount: postsData.posts?.length || 0,
    featuredPostsCount: featuredPosts?.length || 0,
    activeTab
  });

  // Estados para filtros
  const [selectedFilter, setSelectedFilter] = useState('Todos');

  // Función para abrir detalles de actividad
  const openActivityDetails = (item: any) => {
    router.push({
      pathname: '/ActividadDetalle',
      params: { 
        actividadId: item.id,
        actividadData: JSON.stringify(item)
      }
    });
  };

  // Función para obtener el nombre a mostrar
  // Maneja tanto objetos de usuario de Firebase Auth como posts de Firestore
  const getDisplayName = (obj: any) => {
    // Si es un post/comentario de Firestore
    if (obj?.author) {
      return obj.author;
    }
    // Si es un objeto de usuario de Firebase Auth
    if (obj?.displayName) {
      return obj.displayName;
    }
    if (obj?.email) {
      return obj.email.split('@')[0];
    }
    // Fallback
    return "Usuario";
  };

  // Función para obtener las iniciales
  const getInitials = (obj: any) => {
    const name = getDisplayName(obj);
    // Si el nombre es un email, usar las primeras 2 letras del usuario
    if (name.includes('@')) {
      return name.split('@')[0].substring(0, 2).toUpperCase();
    }
    // Si es un nombre normal, tomar las primeras 2 letras
    return name.substring(0, 2).toUpperCase();
  };

  // Destructuring de datos de auth
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
    handleAuth,
    isAdmin,
    userRole
  } = authData;

  // Destructuring de datos de posts
  const {
    post,
    setPost,
    loading,
    posts,
    showCreateForm,
    setShowCreateForm,
    activityTitle,
    setActivityTitle,
    activityLocation,
    setActivityLocation,
    activityPrice,
    setActivityPrice,
    activityDate,
    setActivityDate,
    activityType,
    setActivityType,
    maxParticipants,
    setMaxParticipants,
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
    addComment,
    featurePost,
    unfeaturePost,
    deletePost
  } = postsData;

  // Filtros hardcoded
  const filters = [
    { id: 'Todos', label: 'Todos', emoji: '🌟' },
    { id: 'Deportes', label: 'Deportes', emoji: '⚽' },
    { id: 'Comida', label: 'Comida', emoji: '🍽️' },
    { id: 'Entretenimiento', label: 'Entretenimiento', emoji: '🎬' },
    { id: 'Aventura', label: 'Aventura', emoji: '🏔️' },
    { id: 'Cultura', label: 'Cultura', emoji: '🎭' },
  ];

  // Usar posts destacados dinámicos de la base de datos
  const featuredPlans = featuredPosts || [];
  // Renderizar tarjeta de actividad
  const renderActivityCard = ({ item }: { item: any }) => (
    <ActivityCard
      item={item}
      user={user}
      onJoinActivity={joinActivity}
      onOpenComments={openComments}
      getUserDisplayName={getDisplayName}
      getUserInitials={getInitials}
      isAdmin={isAdmin}
      onFeaturePost={featurePost}
      onUnfeaturePost={unfeaturePost}
      onDeletePost={deletePost}
    />
  );

  // Renderizar filtro
  const renderFilter = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === item.id && styles.filterButtonSelected
      ]}
      onPress={() => setSelectedFilter(item.id)}
    >
      <Text style={styles.filterEmoji}>{item.emoji}</Text>
      <Text style={[
        styles.filterText,
        selectedFilter === item.id && styles.filterTextSelected
      ]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  // Renderizar plan destacado
  const renderFeaturedPlan = ({ item }: { item: any }) => (
                <View style={[styles.featuredPlanCard, { backgroundColor: '#F5F5F5' }]}>
      <View style={styles.featuredPlanHeader}>
        <Text style={styles.featuredPlanEmoji}>{item.emoji}</Text>
        <View style={styles.featuredPlanInfo}>
          <Text style={styles.featuredPlanTitle}>{item.title}</Text>
          <Text style={styles.featuredPlanAuthor}>por {item.author}</Text>
        </View>
        <View style={styles.featuredPlanBadge}>
          <Text style={styles.featuredPlanBadgeText}>DESTACADO</Text>
        </View>
      </View>
      <View style={styles.featuredPlanDetails}>
        <Text style={styles.featuredPlanDetail}>📍 {item.location}</Text>
        <Text style={styles.featuredPlanDetail}>📅 {formatFirebaseDate(item.date)}</Text>
        <Text style={styles.featuredPlanDetail}>💰 {item.price}</Text>
      </View>
      <View style={styles.featuredPlanParticipants}>
        <Text style={styles.featuredPlanParticipantsText}>
          {item.participants}/{item.maxParticipants} participantes
        </Text>
      </View>
    </View>
  );

  // Mostrar loading inicial
  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Log de debug mejorado - Comentado para mejorar rendimiento
  // console.log("🎯 Estado actual:", {
  //   userEmail: (user as any)?.email,
  //   userDisplayName: (user as any)?.displayName,
  //   userId: (user as any)?.uid,
  //   postsCount: posts.length,
  //   primerPost: posts[0] ? {
  //     author: (posts[0] as any).author,
  //     authorEmail: (posts[0] as any).authorEmail,
  //     authorId: (posts[0] as any).authorId
  //   } : null
  // });

  // console.log('🎯 TabFourScreen - Llegando al return principal');
  
  return (
    <SafeAreaView style={styles.container}>
      <Header 
        user={user} 
        onCreatePress={() => setShowCreateForm(!showCreateForm)}
        getUserInitials={getInitials}
        isAdmin={isAdmin}
        userRole={userRole}
      />

      {user && (
        <>
          {showCreateForm ? (
            <CreateForm
              activityTitle={activityTitle}
              setActivityTitle={setActivityTitle}
              activityLocation={activityLocation}
              setActivityLocation={setActivityLocation}
              activityPrice={activityPrice}
              setActivityPrice={setActivityPrice}
              activityDate={activityDate}
              setActivityDate={setActivityDate}
              activityType={activityType}
              setActivityType={setActivityType}
              maxParticipants={maxParticipants}
              setMaxParticipants={setMaxParticipants}
              loading={loading}
              onSubmit={handlePost}
              onCancel={() => setShowCreateForm(false)}
            />
          ) : (
            <>
              <QuickPost
                post={post}
                setPost={setPost}
                loading={loading}
                onSubmit={handlePost}
              />

              {/* Sección de Filtros - Fija */}
              <View style={styles.filtersSection}>
                <Text style={styles.sectionTitle}>Filtrar por categoría</Text>
                <FlatList
                  data={filters}
                  renderItem={renderFilter}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filtersList}
                />
              </View>

              {/* Contenido scrolleable */}
              <ScrollView 
                style={styles.scrollableContent}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContentContainer}
              >
                {/* Sección de Planes Destacados */}
                <View style={styles.featuredSection}>
                  <Text style={styles.sectionTitle}>Planes Destacados</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.featuredList}
                  >
                    {featuredPlans.map((item: any) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.featuredPlanCard}
                        onPress={() => openActivityDetails(item)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.featuredPlanHeader}>
                          <Text style={styles.featuredPlanEmoji}>{item.emoji}</Text>
                          <View style={styles.featuredPlanInfo}>
                            <Text style={styles.featuredPlanTitle}>{item.title}</Text>
                            <Text style={styles.featuredPlanAuthor}>por {item.author}</Text>
                          </View>
                          <View style={styles.featuredPlanBadge}>
                            <Text style={styles.featuredPlanBadgeText}>DESTACADO</Text>
                          </View>
                        </View>
                        <View style={styles.featuredPlanDetails}>
                          <Text style={styles.featuredPlanDetail}>📍 {item.location}</Text>
                          <Text style={styles.featuredPlanDetail}>📅 {formatFirebaseDate(item.date)}</Text>
                          <Text style={styles.featuredPlanDetail}>💰 {item.price}</Text>
                        </View>
                        <View style={styles.featuredPlanParticipants}>
                          <Text style={styles.featuredPlanParticipantsText}>
                            {item.participants}/{item.maxParticipants} participantes
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Sección de Todos los Planes */}
                <View style={styles.allPlansSection}>
                  <Text style={styles.sectionTitle}>Todos los Planes</Text>
                  {posts.map((item: any) => (
                    <View key={item.id} style={styles.activityCardWrapper}>
                      <TouchableOpacity
                        onPress={() => openActivityDetails(item)}
                        activeOpacity={0.7}
                      >
                        <ActivityCard
                          item={item}
                          user={user}
                          onJoinActivity={joinActivity}
                          onOpenComments={openComments}
                          getUserDisplayName={getDisplayName}
                          getUserInitials={getInitials}
                          isAdmin={isAdmin}
                          onFeaturePost={featurePost}
                          onUnfeaturePost={unfeaturePost}
                          onDeletePost={deletePost}
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                  {posts.length === 0 && (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>No hay posts aún</Text>
                      <Text style={styles.emptySubtext}>¡Sé el primero en compartir algo!</Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            </>
          )}

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
        </>
      )}

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

      {/* Custom Tab Bar */}
      <CustomTabBar activeTab={activeTab} />
    </SafeAreaView>
  );
}
