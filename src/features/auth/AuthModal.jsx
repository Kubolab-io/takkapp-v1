/**
 * AuthModal.jsx
 * 
 * Componente que maneja el modal de autenticación (login y registro).
 * Se muestra cuando el usuario no está autenticado y permite iniciar sesión o crear cuenta.
 * Incluye validación de campos y manejo de errores de Firebase Auth.
 */

import { Colors } from '@/src/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ActivityIndicator,
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { styles } from '../../styles/styles.js';

export const AuthModal = ({
  visible,
  isLogin,
  setIsLogin,
  email,
  setEmail,
  password,
  setPassword,
  displayName,
  setDisplayName,
  authLoading,
  handleAuth
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View style={styles.authContainer}>
        <LinearGradient
          colors={Colors.gradient.blueLight}
          style={styles.authGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.authContent}>
            <Text style={styles.authTitle}>takk</Text>
            <Text style={styles.authSubtitle}>
              {isLogin ? "¡Bienvenido de vuelta!" : "¡Únete a la comunidad!"}
            </Text>
            <View style={styles.authForm}>
              {!isLogin && (
                <TextInput
                  style={styles.authInput}
                  placeholder="Tu nombre"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={displayName}
                  onChangeText={setDisplayName}
                />
              )}
              <TextInput
                style={styles.authInput}
                placeholder="Email"
                placeholderTextColor="rgba(255,255,255,0.7)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.authInput}
                placeholder="Contraseña"
                placeholderTextColor="rgba(255,255,255,0.7)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <TouchableOpacity
                style={styles.authButton}
                onPress={handleAuth}
                disabled={authLoading}
              >
                {authLoading ? (
                  <ActivityIndicator color={Colors.primary} />
                ) : (
                  <Text style={styles.authButtonText}>
                    {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.authToggle}
                onPress={() => setIsLogin(!isLogin)}
              >
                <Text style={styles.authToggleText}>
                  {isLogin 
                    ? "¿No tienes cuenta? Regístrate" 
                    : "¿Ya tienes cuenta? Inicia sesión"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};