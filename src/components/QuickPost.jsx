/**
 * QuickPost.jsx
 * 
 * Componente para crear posts simples y rápidos.
 * Incluye un TextInput para escribir el texto y un botón para publicar.
 * Se muestra solo cuando no se está creando una actividad formal.
 */

import React from 'react';
import {
    ActivityIndicator,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Colors } from '@/src/constants/Colors';
import { styles } from '@/src/styles/styles.js';

export const QuickPost = ({
  post,
  setPost,
  loading,
  onSubmit
}) => {
  return (
    <View style={styles.quickPost}>
      <TextInput
        style={styles.quickPostInput}
        placeholder="Comparte algo rápido con la comunidad..."
        placeholderTextColor="#888"
        value={post}
        onChangeText={setPost}
        multiline
      />
      {post.trim() !== "" && (
        <TouchableOpacity
          style={styles.quickPostBtn}
          onPress={onSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Text style={styles.quickPostBtnText}>Publicar</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};