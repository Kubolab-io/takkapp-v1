import { Colors, Spacing } from '@/src/constants/Colors';
import { useResponsive } from '@/src/hooks/useResponsive';
import { usePathname, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Image, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';

interface TabItem {
  name: string;
  label: string;
  icon: any;
  route: string;
}

const tabs: TabItem[] = [
  {
    name: 'comunidad',
    label: 'Comunidad',
    icon: require('@/assets/images/icons/chats.png'),
    route: '/(tabs)/comunidad',
  },
  {
    name: 'index',
    label: 'Planes',
    icon: require('@/assets/images/icons/planes.png'),
    route: '/(tabs)/',
  },
  {
    name: 'matching',
    label: 'Conectar',
    icon: require('@/assets/images/icons/amigos.png'),
    route: '/(tabs)/matching',
  },
  {
    name: 'perfil',
    label: 'Perfil',
    icon: require('@/assets/images/icons/perfil.png'),
    route: '/(tabs)/perfil',
  },
];

// Componente individual de Tab con animación
function AnimatedTab({ tab, active, isTablet, isDesktop, onPress }: any) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active) {
      // Animación de rebote cuando se activa
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.15,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Animación de bounce del ícono
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(1);
      bounceAnim.setValue(0);
    }
  }, [active]);

  const handlePress = () => {
    // Animación de tap
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.tab,
        isTablet && styles.tabletTab,
        isDesktop && styles.desktopTab,
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Animated.View
        style={{
          transform: [
            { scale: scaleAnim },
            {
              translateY: bounceAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -4],
              }),
            },
          ],
        }}
      >
        {active ? (
          <View
            style={[
              styles.activeTabCircle,
              isTablet && styles.tabletActiveTabCircle,
              isDesktop && styles.desktopActiveTabCircle,
            ]}
          >
            <Image
              source={tab.icon}
              style={[
                styles.iconImage,
                styles.activeIconImage,
                isTablet && styles.tabletIconImage,
                isDesktop && styles.desktopIconImage,
              ]}
              resizeMode="contain"
            />
          </View>
        ) : (
          <View
            style={[
              styles.inactiveTabCircle,
              isTablet && styles.tabletInactiveTabCircle,
              isDesktop && styles.desktopInactiveTabCircle,
            ]}
          >
            <Image
              source={tab.icon}
              style={[
                styles.iconImage,
                styles.inactiveIconImage,
                isTablet && styles.tabletIconImage,
                isDesktop && styles.desktopIconImage,
              ]}
              resizeMode="contain"
            />
          </View>
        )}
      </Animated.View>
      <ThemedText
        variant="caption"
        color={active ? 'primary' : 'textSecondary'}
        style={[
          styles.tabLabel,
          active && styles.activeTabLabel,
          isTablet && styles.tabletTabLabel,
          isDesktop && styles.desktopTabLabel,
        ]}
      >
        {tab.label}
      </ThemedText>
    </TouchableOpacity>
  );
}

export function CustomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isTablet, isDesktop } = useResponsive();

  const handleTabPress = (route: string) => {
    router.push(route as any);
  };

  const isActive = (route: string) => {
    if (route === '/(tabs)/' && pathname === '/(tabs)') return true;
    return pathname === route;
  };

  return (
    <View style={[
      styles.containerWrapper,
      isTablet && styles.tabletContainerWrapper,
      isDesktop && styles.desktopContainerWrapper,
    ]}>
      <View style={[
        styles.container,
        isTablet && styles.tabletContainer,
        isDesktop && styles.desktopContainer,
      ]}>
        {tabs.map((tab) => {
          const active = isActive(tab.route);
          return (
            <AnimatedTab
              key={tab.name}
              tab={tab}
              active={active}
              isTablet={isTablet}
              isDesktop={isDesktop}
              onPress={() => handleTabPress(tab.route)}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  containerWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
    paddingTop: 0,
  },
  tabletContainerWrapper: {
    paddingHorizontal: 40,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  desktopContainerWrapper: {
    paddingHorizontal: 80,
    paddingBottom: 32,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 32,
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  tabletContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 32,
  },
  desktopContainer: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 36,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  tabletTab: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  desktopTab: {
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  activeTabCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(74, 144, 226, 0.2)',
  },
  tabletActiveTabCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  desktopActiveTabCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  inactiveTabCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  tabletInactiveTabCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  desktopInactiveTabCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  tabLabel: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 10,
  },
  activeTabLabel: {
    fontWeight: '600',
  },
  tabletTabLabel: {
    marginTop: 6,
    fontSize: 12,
  },
  desktopTabLabel: {
    marginTop: 8,
    fontSize: 14,
  },
  iconImage: {
    width: 32,
    height: 32,
  },
  activeIconImage: {
    tintColor: '#4A90E2',
  },
  inactiveIconImage: {
    tintColor: '#9CA3AF',
  },
  tabletIconImage: {
    width: 38,
    height: 38,
  },
  desktopIconImage: {
    width: 44,
    height: 44,
  },
});