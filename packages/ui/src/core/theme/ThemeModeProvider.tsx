import React, { createContext, useContext, useMemo, useEffect, useSyncExternalStore } from 'react';
import { Platform } from 'react-native';
import { PlatformBlocksTheme, PlatformBlocksThemeOverride } from './types';
import { useColorScheme as useSystemColorScheme } from './useColorScheme';

// Enhanced theme mode types
export type ColorSchemeMode = 'light' | 'dark' | 'auto';

export interface ThemeModeConfig {
  /** Initial color scheme mode */
  initialMode?: ColorSchemeMode;
  /** Custom persistence functions (optional) */
  persistence?: {
    get: () => ColorSchemeMode | null;
    set: (mode: ColorSchemeMode) => void;
  };
  /** Custom DOM manipulation (web only, optional) */
  domConfig?: {
    selector: string;
    lightClass: string;
    darkClass: string;
    attribute: string;
  };
}

interface ThemeModeContextValue {
  mode: ColorSchemeMode;
  setMode: (mode: ColorSchemeMode) => void;
  cycleMode: () => void;
  actualColorScheme: 'light' | 'dark'; // resolved value (no 'auto')
}

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

// Default persistence using localStorage (web only)
const defaultPersistence = {
  get: (): ColorSchemeMode | null => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('platform-blocks-theme-mode');
      if (stored === 'light' || stored === 'dark' || stored === 'auto') return stored;
    } catch {
      console.warn('Failed to access localStorage for theme mode');
    }
    return null;
  },
  set: (mode: ColorSchemeMode) => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    try {
      localStorage.setItem('platform-blocks-theme-mode', mode);
    } catch {
      console.warn('Failed to access localStorage for theme mode');
    }
  }
};

// Default DOM configuration
const defaultDomConfig = {
  selector: 'html',
  lightClass: 'platform-blocks-light',
  darkClass: 'platform-blocks-dark',
  attribute: 'data-platform-blocks-manual'
};

const noopSubscribe = () => () => {};

/* False during static rendering AND the hydration render pass, true from then
   on (and immediately in client-only rendering). Persisted values that the
   server could not know about (localStorage) must not influence the hydration
   pass — React may keep the server's attributes where the passes disagree,
   stranding stale styles. Gating on this flag keeps hydration clean; React
   then re-renders synchronously, before first paint, with the real value. */
function useIsHydrated(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

/**
 * Enhanced theme mode provider that manages color scheme with persistence
 */
export function ThemeModeProvider({ 
  children, 
  config = {} 
}: { 
  children: React.ReactNode;
  config?: ThemeModeConfig;
}) {
  const { 
    initialMode = 'auto', 
    persistence = defaultPersistence,
    domConfig = defaultDomConfig
  } = config;

  // System color scheme, resolved synchronously on the first client render
  // (useSyncExternalStore inside) so an 'auto' app never paints a light frame
  // before flipping dark. During static rendering it reads as 'light'.
  const systemColorScheme = useSystemColorScheme();

  // Persisted mode state. The initializer reads persistence synchronously so
  // client-only renders (dev server, native) start on the right mode with no
  // flash; `isHydrated` below keeps that read out of the hydration pass.
  const isHydrated = useIsHydrated();
  const [persistedMode, setModeState] = React.useState<ColorSchemeMode>(() => {
    const persisted = persistence?.get?.();
    return persisted || initialMode;
  });
  const mode = isHydrated ? persistedMode : initialMode;

  // Resolve actual color scheme
  const actualColorScheme = useMemo((): 'light' | 'dark' => {
    return mode === 'auto' ? systemColorScheme : mode;
  }, [mode, systemColorScheme]);

  // Apply DOM changes (web only)
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    
    const element = document.querySelector(domConfig.selector) as HTMLElement;
    if (!element) return;

    // Clear previous classes and attributes
    element.classList.remove(domConfig.lightClass, domConfig.darkClass);
    if (mode === 'auto') {
      element.removeAttribute(domConfig.attribute);
    } else {
      element.setAttribute(domConfig.attribute, mode);
      element.classList.add(
        actualColorScheme === 'dark' ? domConfig.darkClass : domConfig.lightClass
      );
    }
  }, [mode, actualColorScheme, domConfig]);

  const setMode = React.useCallback((newMode: ColorSchemeMode) => {
    setModeState(newMode);
    persistence?.set?.(newMode);
  }, [persistence]);

  const cycleMode = React.useCallback(() => {
    const nextMode: ColorSchemeMode = 
      mode === 'light' ? 'dark' : 
      mode === 'dark' ? 'auto' : 
      'light';
    setMode(nextMode);
  }, [mode, setMode]);

  const value = useMemo((): ThemeModeContextValue => ({
    mode,
    setMode,
    cycleMode,
    actualColorScheme
  }), [mode, setMode, cycleMode, actualColorScheme]);

  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  );
}

/**
 * Hook to access theme mode context
 */
export function useThemeMode(): ThemeModeContextValue {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within ThemeModeProvider');
  }
  return context;
}

/**
 * Hook to get only the resolved color scheme for theming
 */
export function useColorScheme(): 'light' | 'dark' {
  const { actualColorScheme } = useThemeMode();
  return actualColorScheme;
}

export function useOptionalThemeMode(): ThemeModeContextValue | null {
  return useContext(ThemeModeContext);
}

export function useOptionalColorScheme(): 'light' | 'dark' | null {
  return useOptionalThemeMode()?.actualColorScheme ?? null;
}