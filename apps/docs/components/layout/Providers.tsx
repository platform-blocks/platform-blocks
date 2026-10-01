import React, { useEffect, useMemo, useRef } from 'react';
import {
  useDeviceInfo,
  hasDOM,
  HapticsProvider,
  PlocksProvider,
  DialogProvider,
  ToastProvider,
  DialogRenderer,
  useTheme,
  AccessibilityProvider,
  KeyboardManagerProvider,
  DirectionProvider,
  useThemeMode,
  usePersistedState,
  literalText,
  literalBackgrounds,
  type ThemeModeConfig,
} from '@plocks/ui';
import { SpotlightProvider } from '@plocks/spotlight';
import { docsI18nResources } from '../../i18n/resources';
import { ChartThemeProvider } from '@plocks/charts';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
  children: React.ReactNode;
}

const getSafeBrowserStorage = (): Storage | null => {
  if (!hasDOM) {
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

export const AppProviders: React.FC<Props> = React.memo(({ children }) => {
  const { platform: { isWeb } } = useDeviceInfo();
  const browserStorage = useMemo(() => getSafeBrowserStorage(), []);
  const directionMemoryRef = useRef<Record<string, string>>({});
  const keyboardManagerEnabled = useMemo(() => {
    const flag = process.env.EXPO_PUBLIC_ENABLE_KEYBOARD_MANAGER;
    if (flag === 'false') {
      return false;
    }
    return true;
  }, []);

  // ThemeModeProvider already persists the web mode with the same key and DOM
  // marker that app/+html.tsx reads before hydration.
  const themeModeConfig: ThemeModeConfig = useMemo(() => ({ initialMode: 'auto' }), []);

  const readDirectionMemory = (key: string) => directionMemoryRef.current[key] ?? null;
  const writeDirectionMemory = (key: string, value: string) => {
    directionMemoryRef.current[key] = value;
  };

  // Direction storage controller for RTL support
  const directionStorage = useMemo(() => {
    if (isWeb && browserStorage) {
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
        if (isWeb) {
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

        if (!isWeb) {
          try {
            await AsyncStorage.setItem(key, value);
          } catch {
            /* ignore write errors */
          }
        }
      }
    };
  }, [browserStorage, isWeb]);

  // Keep provider types stable: inserting one on first use remounts the router
  // and resets the current page, including the home gallery tab.
  const content = useMemo(() => (
    <DialogProvider>
      <SpotlightProvider>
        <ToastProvider>
          <AccessibilityProvider>
            {children}
          </AccessibilityProvider>
        </ToastProvider>
      </SpotlightProvider>
      <DialogRenderer />
    </DialogProvider>
  ), [children]);

  return (
    <HapticsProvider>
      <DirectionProvider 
        initialDirection="ltr"
        storage={directionStorage}
        storageKey="plocks-direction"
      >
        <PlocksProvider
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
        </PlocksProvider>
      </DirectionProvider>
    </HapticsProvider>
  );
});

AppProviders.displayName = 'AppProviders';

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
  const { platform: { isWeb } } = useDeviceInfo();
  const { mode, setMode } = useThemeMode();
  const [storedMode, setStoredMode, { ready }] = usePersistedState<'light' | 'dark' | 'auto'>(
    'plocks-theme-mode',
    'auto',
    {
      serialize: (value) => value,
      deserialize: (value) => {
        if (value === 'light' || value === 'dark' || value === 'auto') return value;
        throw new Error('Invalid theme mode');
      },
    }
  );
  const hydratedRef = React.useRef(false);
  const skipWriteRef = React.useRef(false);

  useEffect(() => {
    if (isWeb || !ready || hydratedRef.current) return;
    hydratedRef.current = true;
    skipWriteRef.current = true;
    if (storedMode !== mode) setMode(storedMode);
  }, [isWeb, ready, storedMode, mode, setMode]);

  useEffect(() => {
    if (isWeb || !ready || !hydratedRef.current) return;
    if (skipWriteRef.current) {
      skipWriteRef.current = false;
      return;
    }
    if (storedMode !== mode) setStoredMode(mode);
  }, [isWeb, ready, mode, storedMode, setStoredMode]);

  return null;
};

ThemeModeHydrator.displayName = 'ThemeModeHydrator';
