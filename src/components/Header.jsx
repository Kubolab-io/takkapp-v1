import { Colors } from '@/src/constants/Colors';
import { styles } from '@/src/styles/styles.js';
import { router } from 'expo-router';
import React from 'react';
import {
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export const Header = ({ user, onCreatePress, getUserInitials, isAdmin = false, userRole = 'user' }) => {
  return (
    <View
      style={[styles.header, { backgroundColor: Colors.primary }]}
    >
      <View style={styles.headerContent}>
        <View>
          <Text style={styles.appTitle}>takk</Text>
          <Text style={styles.location}>📍 Bogotá, Zona Rosa</Text>
          {isAdmin && (
            <Text style={styles.adminBadge}>👑 Administrador</Text>
          )}
        </View>
        <View style={styles.headerButtons}>
          {user && (
            <>
              <TouchableOpacity 
                style={styles.addBtn}
                onPress={onCreatePress}
              >
                <Text style={styles.addBtnText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.userBtn}
                onPress={() => router.push('/perfil')}
              >
                <View
                  style={[styles.userBtnGradient, { backgroundColor: Colors.accent }]}
                >
                  <Text style={styles.userBtnText}>
                    {getUserInitials(user)}
                  </Text>
                </View>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
};
