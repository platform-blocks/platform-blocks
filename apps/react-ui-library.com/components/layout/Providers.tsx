import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { 
  HapticsProvider, 
  PlatformBlocksProvider, 
  DialogProvider, 
  SpotlightProvider, 
  ToastProvider, 
  DialogRenderer, 
  onDialogsRequested, 
  onToastsRequested, 
  useTheme,
  AccessibilityProvider,
  KeyboardManagerProvider,
  SoundProvider,
  getAllSounds,
  DirectionProvider,
  useThemeMode,
  literalText,
  literalBackgrounds,
  type ColorSchemeMode,
  type ThemeModeConfig
} from '@platform-blocks/react-ui-library';
import { docsI18nResources } from '../../i18n/resources';
import { ChartThemeProvider } from '@platform-blocks/charts';
import { getAllAppSounds } from '../../config/sounds';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
  children: React.ReactNode;
}

const getSafeBrowserStorage = (): Storage | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const storage = window.localStorage;
    if (!storage) {
      return null;
    }

    return storage;
  } catch {
    return null;
  }
};

const ConditionalDialogProvider = React.memo<{ enabled: boolean; children: React.ReactNode }>(({ enabled, children }) => {
  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <DialogProvider>
      {children}
      <DialogRenderer />
    </DialogProvider>
  );
});

ConditionalDialogProvider.displayName = 'ConditionalDialogProvider';

const ConditionalToastProvider = React.memo<{ enabled: boolean; children: React.ReactNode }>(({ enabled, children }) => {
  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
});

ConditionalToastProvider.displayName = 'ConditionalToastProvider';

export const AppProviders: React.FC<Props> = React.memo(({ children }) => {
  const isDev = process.env.NODE_ENV !== 'production';
  const [dialogsEnabled, setDialogsEnabled] = useState<boolean>(isDev);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(isDev);
  const browserStorage = useMemo(() => getSafeBrowserStorage(), []);
  const directionMemoryRef = useRef<Record<string, string>>({});
  const keyboardManagerEnabled = useMemo(() => {
    const flag = process.env.EXPO_PUBLIC_ENABLE_KEYBOARD_MANAGER;
    if (flag === 'false') {
      return false;
    }
    return true;
  }, []);

  useEffect(() => {
    const detachDialog = onDialogsRequested(() => setDialogsEnabled(true));
    const detachNotifications = onToastsRequested(() => setNotificationsEnabled(true));
    return () => {
      detachDialog();
      detachNotifications();
    };
  }, []);

  // Enhanced theme mode configuration that matches the docs app's current behavior
  const themeModeConfig: ThemeModeConfig | undefined = useMemo(() => {
    if (Platform.OS === 'web' && browserStorage) {
      return {
        initialMode: 'auto',
        persistence: {
          get: () => {
            try {
              const stored = browserStorage.getItem('react-ui-library-theme-mode');
              if (stored === 'light' || stored === 'dark' || stored === 'auto') return stored;
            } catch {
              return null;
            }
            return null;
          },
          set: (mode) => {
            try {
              browserStorage.setItem('react-ui-library-theme-mode', mode);
            } catch {
              /* noop */
            }
          }
        },
        domConfig: {
          selector: 'html',
          lightClass: 'react-ui-library-light',
          darkClass: 'react-ui-library-dark',
          attribute: 'data-react-ui-library-manual'
        }
      };
    }

    // Native platforms still need the provider, but can rely on default persistence.
    return {
      initialMode: 'auto'
    };
  }, [browserStorage]);

  const readDirectionMemory = (key: string) => directionMemoryRef.current[key] ?? null;
  const writeDirectionMemory = (key: string, value: string) => {
    directionMemoryRef.current[key] = value;
  };

  // Direction storage controller for RTL support
  const directionStorage = useMemo(() => {
    if (Platform.OS === 'web' && browserStorage) {
      return {
        getItem: async (key: string) => {
          try {
            return browserStorage.getItem(key);
          } catch {
            return null;
          }
        },
        setItem: async (key: string, value: string) => {
          try {
            browserStorage.setItem(key, value);
          } catch {
            /* no-op */
          }
        }
      };
    }

    return {
      getItem: async (key: string) => {
        if (Platform.OS === 'web') {
          return readDirectionMemory(key);
        }

        try {
          const value = await AsyncStorage.getItem(key);
          if (value == null) {
            return readDirectionMemory(key);
          }
          writeDirectionMemory(key, value);
          return value;
        } catch {
          return readDirectionMemory(key);
        }
      },
      setItem: async (key: string, value: string) => {
        writeDirectionMemory(key, value);

        if (Platform.OS !== 'web') {
          try {
            await AsyncStorage.setItem(key, value);
          } catch {
            /* ignore write errors */
          }
        }
      }
    };
  }, [browserStorage]);

  // Memoize providers to avoid unnecessary re-renders when only color scheme changes
  const content = useMemo(() => (
    <ConditionalDialogProvider enabled={dialogsEnabled}>
      <SpotlightProvider>
        <ConditionalToastProvider enabled={notificationsEnabled}>
          <AccessibilityProvider>
            <SoundProvider initialSounds={getAllAppSounds()}>
              {children}
            </SoundProvider>
          </AccessibilityProvider>
        </ConditionalToastProvider>
      </SpotlightProvider>
    </ConditionalDialogProvider>
  ), [children, dialogsEnabled, notificationsEnabled]);

  return (
    <SafeAreaProvider initialMetrics={SSR_SAFE_AREA_METRICS}>
      <HapticsProvider>
        <DirectionProvider 
          initialDirection="ltr"
          storage={directionStorage}
          storageKey="react-ui-library-direction"
        >
          <PlatformBlocksProvider 
            themeModeConfig={themeModeConfig}
            withOverlays 
            i18nResources={docsI18nResources}
            // Colors resolve through the CSS variables defined in app/+html.tsx,
            // so the prerendered HTML is already in the reader's scheme at first
            // paint instead of waiting for hydration to restyle it.
            colorsAsCssVariables
          >
            <ThemeModeHydrator />
            <ChartThemeBridge>
              <KeyboardManagerProvider disabled={!keyboardManagerEnabled}>
                {content}
              </KeyboardManagerProvider>
            </ChartThemeBridge>
          </PlatformBlocksProvider>
        </DirectionProvider>
      </HapticsProvider>
    </SafeAreaProvider>
  );
});

AppProviders.displayName = 'AppProviders';

/**
 * Metrics used to seed SafeAreaProvider. On native, `initialWindowMetrics` is
 * populated synchronously; during web static rendering (Node) it is null, which
 * would leave insets null and make `useSafeAreaInsets()` throw — blanking the
 * whole prerendered tree. Falling back to zeroed metrics keeps insets defined so
 * every route renders real content into the static HTML.
 */
const SSR_SAFE_AREA_METRICS = initialWindowMetrics ?? {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

/**
 * Categorical series palette — a fixed hue order, assigned by slot and never cycled.
 *
 * Replaces deriving the palette from semantic roles at a uniform shade, which produced
 * adjacent slots a reader cannot separate: in dark mode `tertiary[5]` is a light blue
 * sitting next to `primary[5]`, and `sky[5]`/`cyan[5]` differed by only ΔE 6.7 even with
 * full colour vision.
 *
 * These steps were selected with the palette validator and pass all six checks —
 * lightness band, chroma floor, CVD separation, normal-vision floor, and 3:1 contrast —
 * against BOTH the light (#fcfcfb) and dark (#1a1a19) chart surfaces. Worst adjacent pair
 * is cyan↔amber at ΔE 19.0 under protanopia; the floor is 8. Re-run the validator before
 * changing the order or any step.
 *
 * One shared set (rather than per-mode steps) keeps a series the same colour across a
 * theme toggle. Pinned as hex rather than indexed off the theme ramps because the light
 * and dark ramps run in opposite directions — the same index is a different step in each.
 *
 * Deliberately excluded: `secondary` (a near-neutral slate that fails the chroma floor and
 * reads as "no data"), and the sky / pink / tertiary ramps (redundant with cyan / purple).
 */
const CHART_SERIES_PALETTE = [
  '#3B82F6', // blue
  '#16A34A', // green
  '#A855F7', // purple
  '#D97706', // amber
  '#0891B2', // cyan
  '#65A30D', // lime
  '#6366F1', // indigo
  '#EF4444', // red
];

const ChartThemeBridge: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const accentPalette = CHART_SERIES_PALETTE;

  const hostBridge = React.useMemo(() => ({
    // react-native-svg writes these into presentation attributes, which do not
    // understand `var()` — so the chart bridge reads the literal colors behind
    // the CSS-variable theme rather than the references themselves.
    textPrimary: literalText(theme).primary,
    textSecondary: literalText(theme).secondary,
    background: literalBackgrounds(theme).surface,
    grid: theme.colors.gray?.[3] ?? literalBackgrounds(theme).border ?? '#e5e7eb',
    accentPalette,
    fontFamily: theme.fontFamily,
  }), [theme, accentPalette]);

  return (
    <ChartThemeProvider hostThemeBridge={hostBridge}>
      {children}
    </ChartThemeProvider>
  );
};

ChartThemeBridge.displayName = 'ChartThemeBridge';

const ThemeModeHydrator: React.FC = () => {
  const { mode, setMode } = useThemeMode();
  const hydratedRef = React.useRef(Platform.OS === 'web');
  const latestModeRef = React.useRef(mode);

  useEffect(() => {
    latestModeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    if (Platform.OS === 'web' || hydratedRef.current) {
      return;
    }

    let cancelled = false;

    AsyncStorage.getItem('react-ui-library-theme-mode')
      .then((stored: string | null) => {
        if (cancelled) {
          return;
        }

        const persistedMode = stored === 'light' || stored === 'dark' || stored === 'auto' ? stored : null;
        hydratedRef.current = true; // Unlock writes only after the initial read completes

        if (persistedMode && persistedMode !== latestModeRef.current) {
          setMode(persistedMode);
        }
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        hydratedRef.current = true;
        // Ignore read errors
      });

    return () => {
      cancelled = true;
    };
  }, [setMode]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    if (!hydratedRef.current) {
      return;
    }

    AsyncStorage.setItem('react-ui-library-theme-mode', mode).catch(() => {
      // Ignore write errors
    });
  }, [mode]);

  return null;
};

ThemeModeHydrator.displayName = 'ThemeModeHydrator';

