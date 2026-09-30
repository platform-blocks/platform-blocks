import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';
import { resolveOptionalModule } from '../../utils/optionalModule';

export type ColorScheme = 'light' | 'dark';

/** The part of React Native's `Appearance` API read here. */
interface AppearanceApi {
  getColorScheme?: () => string | null | undefined;
  addChangeListener?: (listener: () => void) => { remove?: () => void } | undefined;
}

function getAppearance() {
  return resolveOptionalModule<AppearanceApi>('react-native', {
    accessor: (mod: { Appearance?: AppearanceApi }) => mod.Appearance,
    devWarning: 'Appearance API not available',
  });
}

function subscribeToSystemColorScheme(callback: () => void): () => void {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return () => {};
    }
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', callback);
    return () => mediaQuery.removeEventListener('change', callback);
  }

  const Appearance = getAppearance();
  if (Appearance?.addChangeListener) {
    const subscription = Appearance.addChangeListener(callback);
    return () => subscription?.remove?.();
  }
  return () => {};
}

function getSystemColorSchemeSnapshot(): ColorScheme {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }

  const Appearance = getAppearance();
  return Appearance?.getColorScheme?.() === 'dark' ? 'dark' : 'light';
}

/* Static rendering has no OS preference to read, so the server always renders
   light. useSyncExternalStore hydrates against this snapshot and then
   re-renders synchronously — before the browser paints — with the real value
   from getSystemColorSchemeSnapshot, so dark-mode readers never see a light
   frame and the hydration pass still matches the server HTML. */
function getServerColorSchemeSnapshot(): ColorScheme {
  return 'light';
}

/**
 * Hook that reads and follows the OS color scheme on web and React Native.
 */
export function useColorScheme(): ColorScheme {
  return useSyncExternalStore(
    subscribeToSystemColorScheme,
    getSystemColorSchemeSnapshot,
    getServerColorSchemeSnapshot
  );
}
