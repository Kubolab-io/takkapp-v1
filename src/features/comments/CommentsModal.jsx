/**
 * CommentsModal.jsx
 * 
 * Componente modal que muestra los comentarios de un post o actividad.
 * Permite ver comentarios existentes y agregar nuevos comentarios.
 * Incluye el post original para contexto y un input para escribir comentarios.
 */

import { Colors } from '@/src/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { styles } from '../../styles/styles.js';

export const CommentsModal = ({
  visible,
  selectedPost,
  comments,
  newComment,
  setNewComment,
  loadingComment,
  onClose,
  onAddComment,
  getUserDisplayName,
  getUserInitials
}) => {
  // Renderizar comentario individual
  const renderComment = ({ item }) => (
    <View style={styles.commentItem}>
      <View style={styles.commentHeader}>
        <LinearGradient
          colors={[Colors.background, Colors.backgroundAlt]}
          style={styles.commentAvatar}
        >
          <Text style={styles.commentAvatarText}>
            {getUserInitials(item)}
          </Text>
        </LinearGradient>
        <View style={styles.commentInfo}>
          <Text style={styles.commentAuthor}>{getUserDisplayName(item)}</Text>
          <Text style={styles.commentTime}>
            {item.createdAt?.toDate
              ? item.createdAt.toDate().toLocaleString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: 'numeric',
                  month: 'short'
                })
              : "Hace un momento"}
          </Text>
        </View>
      </View>
      <Text style={styles.commentText}>{item.text}</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCloseBtn}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Comentarios</Text>
          <View style={{ width: 24 }} />
        </View>
        {selectedPost && (
          <View style={styles.originalPost}>
            <View style={styles.originalPostHeader}>
              <LinearGradient
                colors={[Colors.background, Colors.backgroundAlt]}
                style={styles.originalPostAvatar}
              >
                <Text style={styles.originalPostAvatarText}>
                  {getUserInitials(selectedPost)}
                </Text>
              </LinearGradient>
              <View>
                <Text style={styles.originalPostAuthor}>{getUserDisplayName(selectedPost)}</Text>
                <Text style={styles.originalPostTime}>
                  {selectedPost.createdAt?.toDate
                    ? selectedPost.createdAt.toDate().toLocaleString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: 'numeric',
                        month: 'short'
                      })
                    : "Hace un momento"}
                </Text>
              </View>
            </View>
            {selectedPost.type === 'activity' ? (
              <View style={styles.originalActivityTitle}>
                <Text style={styles.originalActivityEmoji}>{selectedPost.emoji}</Text>
                <Text style={styles.originalActivityTitleText}>{selectedPost.title}</Text>
              </View>
            ) : (
              <Text style={styles.originalPostText}>{selectedPost.text}</Text>
            )}
          </View>
        )}
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={renderComment}
          style={styles.commentsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.noCommentsContainer}>
              <Text style={styles.noCommentsText}>No hay comentarios aún</Text>
              <Text style={styles.noCommentsSubtext}>¡Sé el primero en comentar!</Text>
            </View>
          }
        />
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.commentInputContainer}
        >
          <TextInput
            style={styles.commentInput}
            placeholder="Escribe un comentario..."
            placeholderTextColor="#888"
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendCommentBtn,
              { opacity: newComment.trim() === "" ? 0.5 : 1 }
            ]}
            onPress={onAddComment}
            disabled={loadingComment || newComment.trim() === ""}
          >
            {loadingComment ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.sendCommentBtnText}>➤</Text>
            )}
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};