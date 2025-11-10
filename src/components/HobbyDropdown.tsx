import { Colors } from '@/src/constants/Colors';
import React, { useEffect, useRef, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const HOBBY_CATEGORIES = {
  'Deportes': ['Fútbol', 'Básquetbol', 'Tenis', 'Natación', 'Ciclismo', 'Running', 'Gimnasio', 'Yoga', 'Pilates', 'Boxeo', 'Artes marciales', 'Escalada'],
  'Música': ['Tocar instrumentos', 'Cantar', 'Conciertos', 'DJ', 'Producción musical', 'Rock', 'Pop', 'Reggaetón', 'Salsa', 'Jazz', 'Clásica', 'Electrónica'],
  'Arte y Cultura': ['Pintura', 'Dibujo', 'Fotografía', 'Escultura', 'Teatro', 'Danza', 'Museos', 'Galerías', 'Literatura', 'Poesía', 'Cine', 'Series'],
  'Tecnología': ['Programación', 'Videojuegos', 'Realidad virtual', 'Inteligencia artificial', 'Robótica', 'Criptomonedas', 'Streaming', 'Podcasts', 'YouTube', 'TikTok', 'Redes sociales', 'Blogging'],
  'Gastronomía': ['Cocinar', 'Repostería', 'Vinos', 'Cerveza artesanal', 'Café', 'Restaurantes', 'Comida internacional', 'Vegetariano', 'Vegano', 'Food trucks', 'Chef', 'Mixología'],
  'Naturaleza': ['Senderismo', 'Camping', 'Montañismo', 'Surf', 'Buceo', 'Pesca', 'Jardinería', 'Observación de aves', 'Astronomía', 'Sostenibilidad', 'Meditación', 'Mindfulness'],
  'Viajes': ['Turismo', 'Backpacking', 'Lujo', 'Aventura', 'Cultural', 'Gastronómico', 'Fotografía de viajes', 'Idiomas', 'Intercambios', 'Voluntariado', 'Cruceros', 'Road trips'],
  'Social': ['Networking', 'Eventos', 'Fiestas', 'Bares', 'Clubes', 'Meetups', 'Voluntariado', 'Comunidad', 'Amistades', 'Relaciones', 'Mentoring', 'Coaching']
};

// Crear una lista plana de todos los hobbies
const ALL_HOBBIES = Object.values(HOBBY_CATEGORIES).flat();

interface HobbyDropdownProps {
  onSelectHobby: (hobby: string) => void;
  placeholder?: string;
  existingHobbies?: string[];
}

export default function HobbyDropdown({ 
  onSelectHobby, 
  placeholder = "Buscar hobby...",
  existingHobbies = []
}: HobbyDropdownProps) {
  const [searchText, setSearchText] = useState('');
  const [filteredHobbies, setFilteredHobbies] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  // Filtrar hobbies basado en el texto de búsqueda
  useEffect(() => {
    if (searchText.trim()) {
      const filtered = ALL_HOBBIES.filter(hobby =>
        hobby.toLowerCase().includes(searchText.toLowerCase()) &&
        !existingHobbies.includes(hobby)
      );
      setFilteredHobbies(filtered);
    } else {
      setFilteredHobbies([]);
    }
  }, [searchText, existingHobbies]);

  const handleInputFocus = () => {
    setShowDropdown(true);
    if (searchText.trim()) {
      const filtered = ALL_HOBBIES.filter(hobby =>
        hobby.toLowerCase().includes(searchText.toLowerCase()) &&
        !existingHobbies.includes(hobby)
      );
      setFilteredHobbies(filtered);
    }
  };

  const handleInputBlur = () => {
    // Delay para permitir que el usuario haga clic en una opción
    setTimeout(() => setShowDropdown(false), 150);
  };

  const handleSelectHobby = (hobby: string) => {
    onSelectHobby(hobby);
    setSearchText('');
    setShowDropdown(false);
    inputRef.current?.blur();
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSearchText('');
  };

  const renderHobbyItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.hobbyItem}
      onPress={() => handleSelectHobby(item)}
    >
      <Text style={styles.hobbyItemText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => handleCategorySelect(item)}
    >
      <Text style={styles.categoryItemText}>{item}</Text>
      <Text style={styles.categoryCount}>
        {HOBBY_CATEGORIES[item as keyof typeof HOBBY_CATEGORIES].length} hobbies
      </Text>
    </TouchableOpacity>
  );

  const getHobbiesForCategory = (category: string) => {
    return HOBBY_CATEGORIES[category as keyof typeof HOBBY_CATEGORIES].filter(
      hobby => !existingHobbies.includes(hobby)
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={searchText}
        onChangeText={setSearchText}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        placeholderTextColor="#888"
      />
      
      {showDropdown && (
        <View style={styles.dropdown}>
          {searchText.trim() ? (
            // Mostrar resultados de búsqueda
            filteredHobbies.length > 0 ? (
              <FlatList
                data={filteredHobbies}
                renderItem={renderHobbyItem}
                keyExtractor={(item) => item}
                style={styles.hobbyList}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              />
            ) : (
              <View style={styles.noResults}>
                <Text style={styles.noResultsText}>No se encontraron hobbies</Text>
              </View>
            )
          ) : selectedCategory ? (
            // Mostrar hobbies de la categoría seleccionada
            <View>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setSelectedCategory(null)}
              >
                <Text style={styles.backButtonText}>← Volver a categorías</Text>
              </TouchableOpacity>
              <FlatList
                data={getHobbiesForCategory(selectedCategory)}
                renderItem={renderHobbyItem}
                keyExtractor={(item) => item}
                style={styles.hobbyList}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              />
            </View>
          ) : (
            // Mostrar categorías
            <FlatList
              data={Object.keys(HOBBY_CATEGORIES)}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item}
              style={styles.categoryList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    color: '#1a202c',
    backgroundColor: '#fff',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxHeight: 200,
    zIndex: 1001,
  },
  hobbyList: {
    maxHeight: 200,
  },
  hobbyItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  hobbyItemText: {
    fontSize: 14,
    color: '#1a202c',
  },
  categoryList: {
    maxHeight: 200,
  },
  categoryItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  categoryItemText: {
    fontSize: 14,
    color: '#1a202c',
    fontWeight: '600',
  },
  categoryCount: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  backButton: {
    padding: 12,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  noResults: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
  },
});















