import { hasDOM } from '@plocks/ui';
import { useEffect } from 'react';

/**
 * Hook to update the browser title on web platform
 */
export function useBrowserTitle(title: string) {
  useEffect(() => {
    if (hasDOM) {
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
  return pageTitle ? `${pageTitle} | plocks` : 'plocks';
}
