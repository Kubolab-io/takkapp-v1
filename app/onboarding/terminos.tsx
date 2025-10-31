import { Colors } from '@/src/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TerminosScreen() {
  return (
    <LinearGradient
      colors={Colors.gradient.blue}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Términos y Condiciones</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentCard}>
            <Text style={styles.title}>Términos y Condiciones de Uso – TakkApp</Text>
            <Text style={styles.date}>Última actualización: 31 de octubre de 2025</Text>
            
            <Text style={styles.paragraph}>
              Bienvenido a TakkApp ("la App", "nosotros", "nuestro"), una aplicación social diseñada para conectar personas a través de actividades compartidas, matching semanal y comunidades temáticas. Al descargar, acceder o usar TakkApp, usted acepta cumplir con estos Términos y Condiciones. Si no está de acuerdo, debe abstenerse de usar la App.
            </Text>

            <Text style={styles.sectionTitle}>1. Objeto de la Aplicación</Text>
            <Text style={styles.paragraph}>
              TakkApp es una plataforma social que permite a los usuarios crear, organizar y permitir en el sistema de matching semanal mutuo, participar en planes y actividades creadas por otros usuarios, unirse a comunidades temáticas y gestionar su perfil personal. Todos los planes deben realizarse en lugares públicos y la App es exclusivamente para mayores de 18 años.
            </Text>

            <Text style={styles.sectionTitle}>2. Registro y Cuenta de Usuario</Text>
            <Text style={styles.paragraph}>
              Para usar TakkApp, usted debe ser mayor de 18 años, proporcionar información veraz, mantener la confidencialidad de su cuenta y no crear más de una cuenta por usuario.
            </Text>

            <Text style={styles.sectionTitle}>3. Uso Aceptable</Text>
            <Text style={styles.paragraph}>
              Está prohibido publicar contenido ofensivo, acosar a otros usuarios, manipular el sistema, o participar en actividades fuera de lugares públicos.
            </Text>

            <Text style={styles.sectionTitle}>4. Funcionalidades y Servicios</Text>
            <Text style={styles.paragraph}>
              Incluye Matching semanal, creación de planes, comunidades temáticas y perfil personal del usuario. Todos los planes deben realizarse en lugares públicos.
            </Text>

            <Text style={styles.sectionTitle}>5. Propiedad Intelectual</Text>
            <Text style={styles.paragraph}>
              Todo el contenido y diseño de la App pertenece a Takk Technologies S.A.S.
            </Text>

            <Text style={styles.sectionTitle}>6. Privacidad y Protección de Datos</Text>
            <Text style={styles.paragraph}>
              TakkApp cumple con la Ley 1581 de 2012 y el RGPD. Los datos personales se usan solo para mejorar la experiencia del usuario y las funcionalidades de la App.
            </Text>

            <Text style={styles.sectionTitle}>7. Responsabilidad del Usuario</Text>
            <Text style={styles.paragraph}>
              El usuario es responsable de su propio comportamiento, contenido publicado e interacciones. TakkApp no es responsable de conflictos entre usuarios.
            </Text>

            <Text style={styles.sectionTitle}>8. Suspensión o Eliminación de Cuentas</Text>
            <Text style={styles.paragraph}>
              TakkApp puede suspender cuentas que infrinjan estos términos o realicen actividades fuera de lugares públicos.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  contentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a202c',
    marginTop: 20,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 12,
  },
});

