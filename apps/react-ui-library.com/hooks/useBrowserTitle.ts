import { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * Hook to update the browser title on web platform
 */
export function useBrowserTitle(title: string) {
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const previousTitle = document.title;
      document.title = title;
      
      // Cleanup: restore previous title on unmount
      return () => {
        document.title = previousTitle;
      };
    }
  }, [title]);
}

/**
 * Format a page title with the app name
 */
export function formatPageTitle(pageTitle: string): string {
  return pageTitle ? `${pageTitle} | React UI Library` : 'React UI Library';
}
