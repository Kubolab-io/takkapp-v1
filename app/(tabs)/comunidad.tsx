/**
 * romper-hielo.tsx
 * 
 * Pantalla de grupos y chats grupales con dos filtros:
 * - Mis Chats: Grupos a los que el usuario pertenece
 * - Comunidad: Grupos disponibles para unirse
 */

import { auth } from '@/firebaseconfig';
import { Colors } from '@/src/constants/Colors';
import { Group, useGlobalChatNotifications, useGroups } from '@/src/features/groups/useGroups';
import { useActiveTab } from '@/src/hooks/useActiveTab';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

export default function RomperHieloScreen() {
  const [user, setUser] = useState(auth.currentUser);
  const [selectedFilter, setSelectedFilter] = useState('comunidad');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedCity, setSelectedCity] = useState('Todas');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showSearchGroup, setShowSearchGroup] = useState(false);
  const [searchGroupId, setSearchGroupId] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupLocation, setNewGroupLocation] = useState('');
  const [newGroupCity, setNewGroupCity] = useState('');
  const [newGroupCategory, setNewGroupCategory] = useState('General');
  const [newGroupEmoji, setNewGroupEmoji] = useState('');
  const [showCategoryFilters, setShowCategoryFilters] = useState(true);
  const [showCityFilters, setShowCityFilters] = useState(true);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [searchCity, setSearchCity] = useState('Todas');
  const [searchGroupName, setSearchGroupName] = useState('');
  const [showCommunityView, setShowCommunityView] = useState(false);
  const [chatTypeFilter, setChatTypeFilter] = useState('comunidad'); // 'comunidad' o 'planes'
  const activeTab = useActiveTab();

  // Hook personalizado para grupos
  const {
    myGroups,
    communityGroups,
    loading,
    error,
    createGroup,
    joinGroup,
    findGroupById,
    getGroupsByCity,
    getAvailableCities,
    groups
  } = useGroups(user);

  // 📊 Calcular límites de grupos
  const groupsCreatedByUser = groups.filter(g => g.createdBy === user?.uid && !g.isPlanChat).length;
  const totalUserGroups = groups.filter(g => g.members.includes(user?.uid || '') && !g.isPlanChat).length;

  // Hook para notificaciones globales de chat
  useGlobalChatNotifications(user);

  const categories = [
    { id: 'General', label: 'General', emoji: '' },
    { id: 'Deportes', label: 'Deportes', emoji: '' },
    { id: 'Comida', label: 'Comida', emoji: '' },
    { id: 'Entretenimiento', label: 'Entretenimiento', emoji: '' },
    { id: 'Aventura', label: 'Aventura', emoji: '' },
    { id: 'Trabajo', label: 'Trabajo', emoji: '' },
    { id: 'Estudio', label: 'Estudio', emoji: '' },
  ];

  const emojis = ['💬', '🎯', '🍕', '🎵', '⚽', '🎨', '📚', '🏃', '🎮', '🍳', '🎪', '🏖️'];

  // Obtener ciudades disponibles
  const availableCities = getAvailableCities();

  // Listener para cambios de autenticación
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  // Crear nuevo grupo
  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !newGroupDescription.trim() || !newGroupCity.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios (incluyendo la ciudad)');
      return;
    }

    try {
      const result = await createGroup({
        name: newGroupName.trim(),
        description: newGroupDescription.trim(),
        location: '', // Ya no se usa ubicación específica
        city: newGroupCity.trim(),
        category: newGroupCategory,
        emoji: ''
      });
      
      // Limpiar formulario
      setNewGroupName('');
      setNewGroupDescription('');
      setNewGroupLocation('');
      setNewGroupCity('');
      setNewGroupCategory('General');
      setNewGroupEmoji('');
      setShowCreateGroup(false);
      
      Alert.alert('¡Éxito!', `Grupo creado exitosamente\nID del grupo: ${result.groupId}`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo crear el grupo');
    }
  };

  // Unirse a un grupo
  const handleJoinGroup = async (groupId: string) => {
    try {
      await joinGroup(groupId);
      Alert.alert('¡Bienvenido!', 'Te has unido al grupo exitosamente');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo unir al grupo');
    }
  };

  // Buscar grupo por ID
  const handleSearchGroup = async () => {
    if (!searchGroupId.trim()) {
      Alert.alert('Error', 'Por favor ingresa un ID de grupo');
      return;
    }

    try {
      const group = await findGroupById(searchGroupId.trim().toUpperCase());
      if (group) {
        Alert.alert(
          'Grupo Encontrado',
          `Nombre: ${group.name}\nDescripción: ${group.description}\nCiudad: ${group.city}\nMiembros: ${group.memberCount}`,
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Unirse', 
              onPress: () => handleJoinGroup(group.id)
            }
          ]
        );
      } else {
        Alert.alert('No encontrado', 'No se encontró un grupo con ese ID');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo buscar el grupo');
    }
  };

  // Abrir chat del grupo
  const openGroupChat = (group: Group) => {
    console.log('🚀 Navegando al chat del grupo:', {
      groupId: group.id,
      groupName: group.name,
      groupEmoji: group.emoji
    });
    
    try {
      router.navigate({
        pathname: '../GroupChat' as any,
        params: {
          groupId: group.id,
          groupName: group.name,
          groupEmoji: group.emoji
        }
      } as any);
    } catch (error) {
      console.error('❌ Error navegando al chat:', error);
      Alert.alert('Error', 'No se pudo abrir el chat del grupo');
    }
  };

  const renderCreateGroupForm = () => (
    <View style={styles.createGroupContainer}>
      <Text style={styles.createGroupTitle}>Crear Nuevo Grupo</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nombre del grupo"
        value={newGroupName}
        onChangeText={setNewGroupName}
        maxLength={50}
      />
      
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Descripción del grupo"
        value={newGroupDescription}
        onChangeText={setNewGroupDescription}
        multiline
        numberOfLines={3}
        maxLength={200}
      />
      
      <Text style={styles.sectionLabel}>Ciudad *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.citiesContainer}>
        {['Bogotá', 'Medellín', 'Cali', 'Barranquilla'].map((city) => (
          <TouchableOpacity
            key={city}
            style={[
              styles.cityChip,
              newGroupCity === city && styles.cityChipActive
            ]}
            onPress={() => setNewGroupCity(city)}
          >
            <Text style={[
              styles.cityChipText,
              newGroupCity === city && styles.cityChipTextActive
            ]}>
              {city}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionLabel}>Categoría:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              newGroupCategory === category.id && styles.categoryChipActive
            ]}
            onPress={() => {
              setNewGroupCategory(category.id);
              setNewGroupEmoji(category.emoji);
            }}
          >
            <Text style={[
              styles.categoryChipText,
              newGroupCategory === category.id && styles.categoryChipTextActive
            ]}>
              {category.emoji} {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionLabel}>Emoji:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojisContainer}>
        {emojis.map((emoji, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.emojiChip,
              newGroupEmoji === emoji && styles.emojiChipActive
            ]}
            onPress={() => setNewGroupEmoji(emoji)}
          >
            <Text style={styles.emojiChipText}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.formActions}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => setShowCreateGroup(false)}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.createButton}
          onPress={handleCreateGroup}
        >
          <Text style={styles.createButtonText}>Crear Grupo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderGroup = ({ item }: { item: Group }) => (
    <TouchableOpacity
      style={styles.groupCard}
      onPress={() => openGroupChat(item)}
      activeOpacity={0.9}
    >
      <View style={styles.groupHeader}>
        <View style={styles.groupEmojiContainer}>
          <Text style={styles.groupEmoji}>{item.emoji}</Text>
        </View>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{item.name}</Text>
          <Text style={styles.groupCreator}>por {item.createdByDisplayName}</Text>
        </View>
        <View style={styles.groupMembers}>
          <Text style={styles.memberCount}>{item.memberCount}</Text>
          <Text style={styles.memberLabel}>miembros</Text>
        </View>
      </View>
      
      <Text style={styles.groupDescription} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.groupFooter}>
        <View style={styles.groupDetails}>
          <View style={styles.groupDetailItem}>
            <Text style={styles.groupDetailIcon}>🏷️</Text>
            <Text style={styles.groupDetailText}>{item.category}</Text>
          </View>
          {item.city && (
            <View style={styles.groupDetailItem}>
              <Text style={styles.groupDetailIcon}>🏙️</Text>
              <Text style={styles.groupDetailText}>{item.city}</Text>
            </View>
          )}
        </View>
        {showCommunityView && (
          <TouchableOpacity 
            style={styles.joinButton}
            onPress={() => handleJoinGroup(item.id)}
          >
            <Text style={styles.joinButtonText}>Unirse</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const filterButtons = [
    { key: 'mis-chats', label: 'Mis Chats', emoji: '💬' },
    { key: 'comunidad', label: 'Comunidad', emoji: '🌍' }
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando grupos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Filtrar grupos según el contexto y filtros aplicados
  const getFilteredGroups = () => {
    let groups = showCommunityView ? communityGroups : myGroups;
    
    // Filtrar por tipo de chat (solo cuando no estamos en vista de comunidad)
    if (!showCommunityView) {
      if (chatTypeFilter === 'planes') {
        // Mostrar solo chats de planes (isPlanChat: true)
        groups = groups.filter(group => group.isPlanChat === true);
      } else if (chatTypeFilter === 'comunidad') {
        // Mostrar solo chats grupales normales (isPlanChat: false o undefined)
        groups = groups.filter(group => !group.isPlanChat);
      }
    }
    
    // Si estamos en vista de comunidad, aplicar filtros de búsqueda
    if (showCommunityView) {
      // Filtrar por categoría
      if (searchCategory && searchCategory !== '') {
        groups = groups.filter(group => group.category === searchCategory);
      }
      
      // Filtrar por ciudad
      if (searchCity && searchCity !== 'Todas') {
        groups = groups.filter(group => group.city === searchCity);
      }
      
      // Filtrar por nombre (si hay búsqueda por nombre)
      if (searchGroupName && searchGroupName.trim() !== '') {
        groups = groups.filter(group => 
          group.name.toLowerCase().includes(searchGroupName.toLowerCase())
        );
      }
      
      // Ordenar por popularidad (más miembros primero)
      groups = groups.sort((a, b) => b.memberCount - a.memberCount);
    } else {
      // Ordenar por fecha de creación (más recientes primero)
      groups = groups.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt?.seconds * 1000) || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt?.seconds * 1000) || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
    }
    
    return groups;
  };

  const currentGroups = getFilteredGroups();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {showCommunityView && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setShowCommunityView(false)}
          >
            <FontAwesome name="arrow-left" size={20} color={Colors.primary} />
          </TouchableOpacity>
        )}
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {showCommunityView ? 'Explorar Grupos' : 'Grupos y Chats'}
          </Text>
        </View>
        {!showCommunityView && (
          <TouchableOpacity 
            style={styles.headerDecoration}
            onPress={() => setShowSearchModal(true)}
            activeOpacity={0.7}
          >
            <FontAwesome name="search" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        {showCommunityView && (
          <TouchableOpacity 
            style={styles.headerDecoration}
            onPress={() => {
              setSearchCategory('');
              setSearchCity('Todas');
              setSearchGroupName('');
            }}
            activeOpacity={0.7}
          >
            <FontAwesome name="filter" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Barra de crear chat/grupo */}
      {!showCommunityView && (
        <View>
          <TouchableOpacity 
            style={styles.createChatBar}
            onPress={() => setShowCreateGroup(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.createChatText}>Crear Chat</Text>
          </TouchableOpacity>
          
          {/* 📊 Indicador de límites */}
          <View style={styles.limitsContainer}>
            <View style={styles.limitItem}>
              <Text style={styles.limitLabel}>Grupos creados:</Text>
              <Text style={[
                styles.limitValue,
                groupsCreatedByUser >= 3 && styles.limitValueWarning
              ]}>
                {groupsCreatedByUser}/3
              </Text>
            </View>
            <View style={styles.limitSeparator} />
            <View style={styles.limitItem}>
              <Text style={styles.limitLabel}>Total grupos:</Text>
              <Text style={[
                styles.limitValue,
                totalUserGroups >= 15 && styles.limitValueWarning
              ]}>
                {totalUserGroups}/15
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Botones de filtro de tipo de chat */}
      {!showCommunityView && !showCreateGroup && (
        <View style={styles.chatTypeFilterContainer}>
          <TouchableOpacity
            style={[
              styles.chatTypeFilterButton,
              chatTypeFilter === 'comunidad' && styles.chatTypeFilterButtonActive
            ]}
            onPress={() => setChatTypeFilter('comunidad')}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.chatTypeFilterText,
              chatTypeFilter === 'comunidad' && styles.chatTypeFilterTextActive
            ]}>
              💬 Comunidad
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.chatTypeFilterButton,
              chatTypeFilter === 'planes' && styles.chatTypeFilterButtonActive
            ]}
            onPress={() => setChatTypeFilter('planes')}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.chatTypeFilterText,
              chatTypeFilter === 'planes' && styles.chatTypeFilterTextActive
            ]}>
              📅 Planes
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {showCreateGroup ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderCreateGroupForm()}
        </ScrollView>
      ) : showSearchGroup ? (
        <View style={styles.content}>
          <View style={styles.searchGroupContainer}>
            <Text style={styles.searchGroupTitle}>Buscar Grupo por ID</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Ingresa el ID del grupo (ej: ABC123)"
              value={searchGroupId}
              onChangeText={setSearchGroupId}
              maxLength={6}
              autoCapitalize="characters"
            />
            
            <View style={styles.searchGroupButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowSearchGroup(false);
                  setSearchGroupId('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.searchButton}
                onPress={handleSearchGroup}
              >
                <Text style={styles.searchButtonText}>Buscar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.content}>

          {/* Lista de grupos */}
          <FlatList
            data={currentGroups}
            keyExtractor={(item) => item.id}
            renderItem={renderGroup}
            contentContainerStyle={styles.groupsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => {
              const getEmptyStateContent = () => {
                if (chatTypeFilter === 'planes') {
                  return {
                    emoji: '📅',
                    title: 'No tienes chats de planes aún',
                    text: 'Los chats de planes se crean automáticamente cuando te inscribes a un plan o creas uno nuevo',
                    buttonText: 'Ver Planes Disponibles',
                    onPress: () => router.push('/(tabs)/' as any) // Navegar a la tab de Planes
                  };
                } else {
                  return {
                    emoji: '💬',
                    title: 'No tienes chats de comunidad aún',
                    text: 'Explora grupos disponibles y únete a conversaciones que te interesen',
                    buttonText: 'Explorar Grupos',
                    onPress: () => setShowSearchModal(true)
                  };
                }
              };

              const emptyContent = getEmptyStateContent();

              return (
                <View style={styles.emptyState}>
                  <View style={styles.emptyStateIconContainer}>
                    <Text style={styles.emptyStateEmoji}>
                      {emptyContent.emoji}
                    </Text>
                  </View>
                  <Text style={styles.emptyStateTitle}>
                    {emptyContent.title}
                  </Text>
                  <Text style={styles.emptyStateText}>
                    {emptyContent.text}
                  </Text>
                  <TouchableOpacity 
                    style={styles.emptyStateButton}
                    onPress={emptyContent.onPress}
                  >
                    <Text style={styles.emptyStateButtonText}>{emptyContent.buttonText}</Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        </View>
      )}

      {/* Modal de búsqueda */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showSearchModal}
        onRequestClose={() => setShowSearchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Buscar Grupos</Text>
            
            {/* Campo de búsqueda por ID */}
            <TextInput
              style={styles.modalInput}
              placeholder="Buscar por ID del grupo"
              placeholderTextColor="#999"
              value={searchId}
              onChangeText={setSearchId}
            />
            
            {/* Campo de búsqueda por nombre */}
            <TextInput
              style={styles.modalInput}
              placeholder="Buscar por nombre del grupo"
              placeholderTextColor="#999"
              value={searchGroupName}
              onChangeText={setSearchGroupName}
            />

            {/* Botones de Filtros */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Categoría</Text>
              <View style={styles.filterButtonsContainer}>
                <TouchableOpacity
                  style={[
                    styles.modalFilterButton,
                    searchCategory === '' && styles.modalFilterButtonActive
                  ]}
                  onPress={() => setSearchCategory('')}
                >
                  <Text style={[
                    styles.modalFilterButtonText,
                    searchCategory === '' && styles.modalFilterButtonTextActive
                  ]}>
                    Todas
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalFilterButton,
                    searchCategory === 'Deportes' && styles.modalFilterButtonActive
                  ]}
                  onPress={() => setSearchCategory(searchCategory === 'Deportes' ? '' : 'Deportes')}
                >
                  <Text style={[
                    styles.modalFilterButtonText,
                    searchCategory === 'Deportes' && styles.modalFilterButtonTextActive
                  ]}>
                    Deportes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalFilterButton,
                    searchCategory === 'Comida' && styles.modalFilterButtonActive
                  ]}
                  onPress={() => setSearchCategory(searchCategory === 'Comida' ? '' : 'Comida')}
                >
                  <Text style={[
                    styles.modalFilterButtonText,
                    searchCategory === 'Comida' && styles.modalFilterButtonTextActive
                  ]}>
                    Comida
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Ciudad</Text>
              <View style={styles.filterButtonsContainer}>
                <TouchableOpacity
                  style={[
                    styles.modalFilterButton,
                    searchCity === 'Todas' && styles.modalFilterButtonActive
                  ]}
                  onPress={() => setSearchCity('Todas')}
                >
                  <Text style={[
                    styles.modalFilterButtonText,
                    searchCity === 'Todas' && styles.modalFilterButtonTextActive
                  ]}>
                    Todas
                  </Text>
                </TouchableOpacity>
                {['Bogotá', 'Medellín', 'Cali', 'Barranquilla'].map((city) => (
                  <TouchableOpacity
                    key={city}
                    style={[
                      styles.modalFilterButton,
                      searchCity === city && styles.modalFilterButtonActive
                    ]}
                    onPress={() => setSearchCity(searchCity === city ? 'Todas' : city)}
                  >
                    <Text style={[
                      styles.modalFilterButtonText,
                      searchCity === city && styles.modalFilterButtonTextActive
                    ]}>
                      {city}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Botón Explorar Todos */}
            <TouchableOpacity
              style={styles.exploreAllButton}
              onPress={() => {
                setShowCommunityView(true);
                setShowSearchModal(false);
              }}
            >
              <Text style={styles.exploreAllButtonText}>Explorar Todos</Text>
            </TouchableOpacity>

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowSearchModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalSearchButton}
                onPress={() => {
                  // Aplicar filtros de búsqueda
                  if (searchId.trim()) {
                    handleSearchGroup();
                  } else {
                    // Activar vista de comunidad con filtros aplicados
                    setShowCommunityView(true);
                    setShowSearchModal(false);
                  }
                }}
              >
                <Text style={styles.modalSearchButtonText}>Buscar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 22,
    fontWeight: '500',
  },
  headerDecoration: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerEmoji: {
    fontSize: 28,
    fontWeight: '300',
    color: Colors.primary,
  },
  createChatBar: {
    backgroundColor: '#1E3A8A',
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createChatText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // 📊 Estilos para indicador de límites
  limitsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: -8,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  limitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  limitLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  limitValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  limitValueWarning: {
    color: '#DC2626',
  },
  limitSeparator: {
    width: 1,
    height: 20,
    backgroundColor: '#E2E8F0',
  },
  content: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  filterButtonActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
    shadowColor: '#1E3A8A',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  filterButtonEmoji: {
    fontSize: 18,
  },
  filterButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  // Estilos para filtro de categorías
  categoriesContainer: {
    paddingHorizontal: 20,
  },
  // Estilos para filtro de ciudades
  citiesContainer: {
    paddingHorizontal: 20,
  },
  categoriesContent: {
    gap: 12,
  },
  categoryFilterChip: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    minWidth: 100,
  },
  categoryFilterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  categoryFilterChipEmoji: {
    fontSize: 16,
  },
  categoryFilterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  categoryFilterChipTextActive: {
    color: '#FFFFFF',
  },
  groupsList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupEmoji: {
    fontSize: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  groupCreator: {
    fontSize: 14,
    color: '#000000',
  },
  groupMembers: {
    alignItems: 'flex-end',
    color: '#000000',
  },
  memberCount: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '500',
  },
  groupDescription: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
    marginBottom: 12,
  },
  groupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupDetails: {
    flex: 1,
  },
  groupDetail: {
    fontSize: 12,
    color: '#000000',
    marginBottom: 2,
  },
  joinButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  // Estilos para crear grupo
  createGroupContainer: {
    padding: 20,
  },
  createGroupTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
    marginTop: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.primary,
    marginRight: 12,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  emojisContainer: {
    marginBottom: 20,
  },
  cityChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.primary,
    marginRight: 12,
  },
  cityChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  cityChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  cityChipTextActive: {
    color: '#FFFFFF',
  },
  emojiChip: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  emojiChipText: {
    fontSize: 24,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  createButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Estilos para campos obligatorios
  requiredInput: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  filterSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  filterToggleIcon: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
  },
  // Estilos para búsqueda de grupo
  searchGroupContainer: {
    padding: 20,
  },
  searchGroupTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
  },
  searchGroupButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  searchButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Estilos mejorados para tarjetas de grupos
  groupEmojiContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    flexShrink: 0,
  },
  memberLabel: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '500',
  },
  groupDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  groupDetailIcon: {
    fontSize: 14,
  },
  groupDetailText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  // Estilos mejorados para estado vacío
  emptyStateIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  emptyStateButton: {
    marginTop: 20,
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 25,
    textAlign: 'center',
  },
  modalInput: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#F9F9F9',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
    gap: 15,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  modalSearchButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalSearchButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Estilos para el botón Explorar Todos
  exploreAllButton: {
    width: '100%',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  exploreAllButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  modalFilterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  modalFilterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  modalFilterButtonTextActive: {
    color: '#FFFFFF',
  },
  
  // Estilos para filtro de tipo de chat
  chatTypeFilterContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  chatTypeFilterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  chatTypeFilterButtonActive: {
    backgroundColor: '#1E3A8A',
    shadowColor: '#1E3A8A',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  chatTypeFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  chatTypeFilterTextActive: {
    color: '#FFFFFF',
  },
});