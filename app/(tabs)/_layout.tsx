import { CustomTabBar } from '@/src/components/CustomTabBar';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarStyle: { display: 'none' }, // Ocultar la tab bar nativa
          headerShown: false,
        }}>
        <Tabs.Screen
          name="comunidad"
          options={{
            title: 'Comunidad',
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: 'Planes',
          }}
        />
        <Tabs.Screen
          name="matching"
          options={{
            title: 'Conectar',
          }}
        />
        <Tabs.Screen
          name="perfil"
          options={{
            title: 'Perfil',
          }}
        />
        <Tabs.Screen
          name="misplanes"
          options={{
            title: 'Mis Planes',
          }}
        />
      </Tabs>
      <CustomTabBar />
    </>
  );
}
