import { useEffect } from 'react';
import { Platform } from 'react-native';

// Hook for managing focus and keyboard navigation
export function useAccessibility() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // Skip to main content functionality
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded';
    
    document.body.insertBefore(skipLink, document.body.firstChild);

    // Announce route changes to screen readers
    const announceElement = document.createElement('div');
    announceElement.setAttribute('aria-live', 'polite');
    announceElement.setAttribute('aria-atomic', 'true');
    announceElement.className = 'sr-only';
    announceElement.id = 'route-announcer';
    document.body.appendChild(announceElement);

    return () => {
      if (skipLink.parentNode) skipLink.parentNode.removeChild(skipLink);
      if (announceElement.parentNode) announceElement.parentNode.removeChild(announceElement);
    };
  }, []);

  const announceRouteChange = (pageName: string) => {
    if (Platform.OS !== 'web') return;
    
    const announcer = document.getElementById('route-announcer');
    if (announcer) {
      announcer.textContent = `Navigated to ${pageName}`;
    }
  };

  return { announceRouteChange };
}

// ARIA patterns for complex UI components
export const ARIA_PATTERNS = {
  navigation: {
    role: 'navigation',
    'aria-label': 'Main navigation',
  },
  banner: {
    role: 'banner',
  },
  main: {
    role: 'main',
    id: 'main-content',
  },
  complementary: {
    role: 'complementary',
  },
  search: {
    role: 'search',
    'aria-label': 'Site search',
  },
} as const;
