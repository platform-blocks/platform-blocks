import React, { createContext, useContext, useMemo, useSyncExternalStore } from 'react';
import { Platform } from 'react-native';
import { applyColorSchemeMarker, COLOR_SCHEME_STORAGE_KEY, type ColorSchemeMode } from './colorSchemeMarker';
import { useColorScheme as useSystemColorScheme } from './useColorScheme';
import { readStored, writeStored } from '../storage/localStorage';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';

// Enhanced theme mode types
export type { ColorSchemeMode } from './colorSchemeMarker';

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

// Default persistence: localStorage on web (guarded; a no-op on native).
const defaultPersistence = {
  get: (): ColorSchemeMode | null => {
    const stored = readStored(COLOR_SCHEME_STORAGE_KEY);
    return stored === 'light' || stored === 'dark' || stored === 'auto' ? stored : null;
  },
  set: (mode: ColorSchemeMode) => {
    writeStored(COLOR_SCHEME_STORAGE_KEY, mode);
  }
};

// Default DOM configuration
const defaultDomConfig = {
  selector: 'html',
  lightClass: 'plocks-light',
  darkClass: 'plocks-dark',
  attribute: 'data-plocks-manual'
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

  // Stamp the color-scheme marker on the document (web only) — the same code
  // path PlocksProvider and `getColorSchemeScript` use, so the
  // attribute and the explicit-choice class never disagree. Layout effect:
  // it lands before the browser paints.
  useIsomorphicLayoutEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    applyColorSchemeMarker(actualColorScheme, mode, {
      selector: domConfig.selector,
      lightClass: domConfig.lightClass,
      darkClass: domConfig.darkClass,
      modeAttribute: domConfig.attribute,
    });
  }, [mode, actualColorScheme, domConfig.selector, domConfig.lightClass, domConfig.darkClass, domConfig.attribute]);

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