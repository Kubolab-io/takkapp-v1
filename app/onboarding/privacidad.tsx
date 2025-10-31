import { Colors } from '@/src/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PrivacidadScreen() {
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
          <Text style={styles.headerTitle}>Política de Privacidad</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentCard}>
            <Text style={styles.title}>Política de Privacidad – TakkApp</Text>
            <Text style={styles.date}>Última actualización: 31 de octubre de 2025</Text>
            
            <Text style={styles.paragraph}>
              En TakkApp, respetamos su privacidad y estamos comprometidos con la protección de sus datos personales. Esta política explica cómo recopilamos, usamos y protegemos su información.
            </Text>

            <Text style={styles.sectionTitle}>1. Información que Recopilamos</Text>
            <Text style={styles.paragraph}>
              Recopilamos datos personales como nombre, correo electrónico, edad, ubicación y fotos, así como datos de uso para mejorar la experiencia en la App.
            </Text>

            <Text style={styles.sectionTitle}>2. Uso de la Información</Text>
            <Text style={styles.paragraph}>
              Usamos sus datos para ofrecer coincidencias, personalizar recomendaciones, facilitar la comunicación en planes y comunidades, y mejorar el servicio.
            </Text>

            <Text style={styles.sectionTitle}>3. Compartición de Datos</Text>
            <Text style={styles.paragraph}>
              No compartimos su información personal con terceros, salvo cuando sea necesario para cumplir la ley o mejorar el servicio (por ejemplo, Google Places).
            </Text>

            <Text style={styles.sectionTitle}>4. Seguridad de la Información</Text>
            <Text style={styles.paragraph}>
              Implementamos medidas técnicas y organizativas para proteger su información contra accesos no autorizados, pérdida o alteración.
            </Text>

            <Text style={styles.sectionTitle}>5. Derechos del Usuario</Text>
            <Text style={styles.paragraph}>
              Usted puede acceder, corregir o eliminar sus datos personales en cualquier momento a través de la App o contactando a soporte@takkapp.com.
            </Text>

            <Text style={styles.sectionTitle}>6. Conservación de Datos</Text>
            <Text style={styles.paragraph}>
              Sus datos se conservarán mientras su cuenta esté activa o sea necesario para los fines establecidos en esta política.
            </Text>

            <Text style={styles.sectionTitle}>7. Cookies y Tecnologías Similares</Text>
            <Text style={styles.paragraph}>
              TakkApp puede utilizar cookies o tecnologías similares para mejorar la experiencia del usuario y analizar el rendimiento.
            </Text>

            <Text style={styles.sectionTitle}>8. Cambios en esta Política</Text>
            <Text style={styles.paragraph}>
              Podemos actualizar esta política en cualquier momento. Se notificará a los usuarios cuando se realicen cambios significativos.
            </Text>

            <Text style={styles.sectionTitle}>9. Contacto</Text>
            <Text style={styles.paragraph}>
              Para dudas o solicitudes relacionadas con la privacidad: soporte@takkapp.com
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

