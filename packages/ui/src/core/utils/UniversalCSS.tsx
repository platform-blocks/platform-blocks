/**
 * Universal CSS styles for React UI Library universal props
 * Optimized for React Native (Expo) with web compatibility
 */

import React, { useEffect, useMemo } from 'react';
import { Platform } from 'react-native';

/**
 * Generates global CSS for universal props functionality
 * This creates the CSS that makes lightHidden/darkHidden work on web
 */
export function generateUniversalCSS(): string {
  const breakpoints = {
    xs: '36em',
    sm: '48em', 
    md: '62em',
    lg: '75em',
    xl: '88em'
  };

  const universalCSS = `
    /* Reset browser default input styles to prevent double borders */
    input, textarea, select {
      outline: none !important;
      -webkit-appearance: none !important;
      -moz-appearance: none !important;
      appearance: none !important;
    }

    input:focus, textarea:focus, select:focus {
      outline: none !important;
    }

    /* Ensure React Native Web focusable elements don't show browser outlines */
    [data-focusable="true"]:focus {
      outline: none !important;
    }

    /* Color scheme based visibility */
    .platform-blocks-light-hidden {
      display: none !important;
    }
    
    [data-platform-blocks-color-scheme="dark"] .platform-blocks-light-hidden {
      display: revert !important;
    }
    
    .platform-blocks-dark-hidden {
      display: revert !important;
    }
    
    [data-platform-blocks-color-scheme="dark"] .platform-blocks-dark-hidden {
      display: none !important;
    }
    
    /* Responsive visibility classes */
    ${Object.entries(breakpoints).map(([breakpoint, size]) => `
      @media (min-width: ${size}) {
        .platform-blocks-hidden-from-${breakpoint} {
          display: none !important;
        }
      }
      
      @media (max-width: calc(${size} - 0.1px)) {
        .platform-blocks-visible-from-${breakpoint} {
          display: none !important;
        }
      }
    `).join('\n')}
  `;

  return universalCSS.replace(/\s+/g, ' ').trim();
}

/**
 * Component that injects global CSS for universal props
 * Web-only component - React Native uses inline styles instead
 */
export function UniversalCSS() {
  const isWeb = Platform.OS === 'web' && typeof document !== 'undefined';
  const css = useMemo(() => (isWeb ? generateUniversalCSS() : ''), [isWeb]);
  
  useEffect(() => {
    if (!isWeb) {
      return;
    }

    // Check if styles are already injected
    let styleElement = document.getElementById('platform-blocks-universal-css') as HTMLStyleElement | null;
    
    if (styleElement) {
      // Update content if it exists (in case CSS changed)
      styleElement.textContent = css;
      return;
    }

    // Create and inject styles
    styleElement = document.createElement('style');
    styleElement.id = 'platform-blocks-universal-css';
    styleElement.textContent = css;
    document.head.appendChild(styleElement);

    // Cleanup function
    return () => {
      const element = document.getElementById('platform-blocks-universal-css');
      if (element) {
        element.remove();
      }
    };
  }, [isWeb, css]);

  if (!isWeb) {
    return null;
  }

  return null;
}