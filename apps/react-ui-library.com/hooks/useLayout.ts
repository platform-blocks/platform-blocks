import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform, Dimensions } from 'react-native';
import { usePathname } from 'expo-router';
import { NAV_SECTIONS } from '../config/navigationConfig';

// Utility to read current mobile status without state churn on every resize
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return Platform.OS !== 'web';
  });

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}

// Hook to track orientation changes on mobile
export function useOrientation() {
  const [isLandscape, setIsLandscape] = useState(() => {
    if (Platform.OS === 'web') return false;
    const { width, height } = Dimensions.get('window');
    return width > height;
  });

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setIsLandscape(window.width > window.height);
    });

    return () => subscription?.remove();
  }, []);

  return isLandscape;
}

// Hook to get page title from current route
export function usePageTitle() {
  const pathname = usePathname();

  return useCallback(() => {
    for (const section of NAV_SECTIONS) {
      const item = section.items.find(item => item.route === pathname);
      if (item) return item.label;
    }
    return 'React UI Library';
  }, [pathname]);
}

// Hook for managing mobile navigation dialog
export function useMobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return { isOpen, open, close, toggle };
}

// Hook for optimized theme mode persistence
export function useThemePersistence() {
  const getInitialMode = useCallback((): 'auto' | 'light' | 'dark' => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('react-ui-library-theme-mode');
        if (stored === 'light' || stored === 'dark' || stored === 'auto') {
          return stored as 'auto' | 'light' | 'dark';
        }
      } catch (error) {
        console.warn('localStorage not available');
      }
    }
    return 'auto';
  }, []);

  const persistMode = useCallback((mode: 'auto' | 'light' | 'dark') => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        localStorage.setItem('react-ui-library-theme-mode', mode);
      } catch (error) {
        console.warn('Could not persist theme mode');
      }
    }
  }, []);

  return { getInitialMode, persistMode };
}
