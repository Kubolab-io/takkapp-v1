import { usePathname } from 'expo-router';
import { useMemo } from 'react';

export const useActiveTab = () => {
  const pathname = usePathname();
  
  const activeTab = useMemo(() => {
    if (pathname.includes('/index') || pathname === '/(tabs)/' || pathname === '/') {
      return 'index';
    }
    if (pathname.includes('/misplanes')) {
      return 'misplanes';
    }
    if (pathname.includes('/matching')) {
      return 'matching';
    }
    if (pathname.includes('/perfil')) {
      return 'perfil';
    }
  if (pathname.includes('/comunidad')) {
    return 'comunidad';
  }
    return 'index';
  }, [pathname]);

  return activeTab;
};
