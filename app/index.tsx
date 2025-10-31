import { Button } from '@/src/components/Button';
import { Colors, Spacing } from '@/src/constants/Colors';
import { AuthModal } from '@/src/features/auth/AuthModal';
import { useAuth } from '@/src/features/auth/useAuth';
import { Redirect } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
  const {
    user,
    showAuthModal,
    setShowAuthModal,
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
  } = useAuth();

  // Si el usuario ya está autenticado, redirigir a la pantalla principal
  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: Colors.dark }]}>
            Cargando...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContainer}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: Colors.dark }]}>
            takk
          </Text>
          <Text style={[styles.subtitle, { color: Colors.textPrimary }]}>
            Conecta con amigos a través de actividades compartidas
          </Text>
          
          <View style={styles.buttonContainer}>
            <Button
              title="Iniciar Sesión"
              variant="primary"
              onPress={() => {
                setIsLogin(true);
                setShowAuthModal(true);
              }}
              style={styles.button}
            />
            
            <Button
              title="Crear Cuenta"
              variant="outline"
              onPress={() => {
                setIsLogin(false);
                setShowAuthModal(true);
              }}
              style={styles.button}
            />
          </View>
        </View>
      </View>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 24,
    fontWeight: '600',
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 64,
    fontWeight: '700',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: Spacing['2xl'],
    lineHeight: 24,
    fontSize: 18,
  },
  buttonContainer: {
    width: '100%',
    gap: Spacing.md,
  },
  button: {
    width: '100%',
  },
});