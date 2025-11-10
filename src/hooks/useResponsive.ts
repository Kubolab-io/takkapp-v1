import { useEffect, useState } from 'react';
import { Dimensions, Platform } from 'react-native';

interface ResponsiveBreakpoints {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
  isWeb: boolean;
}

export function useResponsive(): ResponsiveBreakpoints {
  const [dimensions, setDimensions] = useState(() => {
    const { width, height } = Dimensions.get('window');
    return { width, height };
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });

    return () => subscription?.remove();
  }, []);

  const { width, height } = dimensions;
  const isWeb = Platform.OS === 'web';
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  return {
    isMobile,
    isTablet,
    isDesktop,
    width,
    height,
    isWeb,
  };
}

export function useResponsiveValue<T>(
  mobile: T,
  tablet?: T,
  desktop?: T
): T {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  if (isMobile) return mobile;
  if (isTablet && tablet !== undefined) return tablet;
  if (isDesktop && desktop !== undefined) return desktop;
  
  return mobile;
}





