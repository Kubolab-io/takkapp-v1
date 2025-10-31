/**
 * MatchingConsentModal.tsx
 * 
 * Modal de consentimiento para el sistema de matching diario.
 */

import { Colors } from '@/src/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface MatchingConsentModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const MatchingConsentModal: React.FC<MatchingConsentModalProps> = ({
  visible,
  onAccept,
  onDecline
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={[Colors.background, Colors.backgroundAlt]}
            style={styles.gradient}
          >
            <View style={styles.content}>
              <Text style={styles.title}>¿Cómo funciona?</Text>
              
              <View style={styles.instructionsContainer}>
                <View style={styles.instructionItem}>
                  <Text style={styles.instructionEmoji}>🎯</Text>
                  <Text style={styles.instructionText}>
                    Cada 24 horas conoces a una nueva persona al azar
                  </Text>
                </View>
                
                <View style={styles.instructionItem}>
                  <Text style={styles.instructionEmoji}>👋</Text>
                  <Text style={styles.instructionText}>
                    Puedes conectar y chatear directamente con esa persona
                  </Text>
                </View>
                
                <View style={styles.instructionItem}>
                  <Text style={styles.instructionEmoji}>🤝</Text>
                  <Text style={styles.instructionText}>
                    Cada persona es una oportunidad de hacer una nueva amistad
                  </Text>
                </View>
                
                <View style={styles.instructionItem}>
                  <Text style={styles.instructionEmoji}>🔄</Text>
                  <Text style={styles.instructionText}>
                    La próxima conexión estará disponible en 24 horas
                  </Text>
                </View>
              </View>
              
              <Text style={styles.question}>
                ¿Te gustaría participar en este sistema de conexiones diarias?
              </Text>
              
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={styles.declineButton}
                  onPress={onDecline}
                >
                  <Text style={styles.declineButtonText}>No, gracias</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={onAccept}
                >
                  <LinearGradient
                    colors={[Colors.primary, Colors.primary]}
                    style={styles.acceptButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.acceptButtonText}>¡Sí, empezar!</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradient: {
    padding: 0,
  },
  content: {
    padding: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.secondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  instructionsContainer: {
    width: '100%',
    marginBottom: 25,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  instructionEmoji: {
    fontSize: 24,
    marginRight: 15,
    marginTop: 2,
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24,
  },
  buttonsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 15,
  },
  declineButton: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  declineButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  acceptButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  acceptButtonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
