import { Platform } from 'react-native';

interface OptionalModuleCacheEntry {
  value: any | null;
  error: Error | null;
  logged: boolean;
}

interface ResolveOptionalModuleOptions<T> {
  accessor?: (module: any) => T | null | undefined;
  devWarning?: string;
  loader?: () => any;
}

const optionalModuleCache = new Map<string, OptionalModuleCacheEntry>();

const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

type OptionalModuleLoader = () => any;

// Metro bundler requires static string literals for require; keep all optional modules here.
// NOTE: Do NOT add react-syntax-highlighter here - it causes Metro to fail on native
// when the package isn't installed. Instead, pass the loader dynamically from web-only code.
//
// Every require below sits lexically inside its own try/catch. Metro's
// `allowOptionalDependencies` (on by default in Expo and RN CLI metro configs)
// only treats a require as optional when the call site is wrapped this way —
// a bare `() => require('x')` makes Metro fail the whole app bundle when `x`
// isn't installed, which silently turned all of these into hard dependencies
// for consumers. The runtime try/catch in resolveOptionalModule is not enough;
// the wrapping has to be visible to the bundler at each require site.
const optionalModuleLoaders: Record<string, OptionalModuleLoader> = {
  'react-native': () => { try { return require('react-native'); } catch { return null; } },
  'expo-clipboard': () => { try { return require('expo-clipboard'); } catch { return null; } },
  'expo-haptics': () => { try { return require('expo-haptics'); } catch { return null; } },
  'expo-linear-gradient': () => { try { return require('expo-linear-gradient'); } catch { return null; } },
  'expo-document-picker': () => { try { return require('expo-document-picker'); } catch { return null; } },
  'react-native-webview': () => { try { return require('react-native-webview'); } catch { return null; } },
  'lodash.debounce': () => { try { return require('lodash.debounce'); } catch { return null; } },
  'expo-audio': () => { try { return require('expo-audio'); } catch { return null; } },
  'react-native-gesture-handler': () => { try { return require('react-native-gesture-handler'); } catch { return null; } },
  'expo-status-bar': () => { try { return require('expo-status-bar'); } catch { return null; } },
  'expo-navigation-bar': () => { try { return require('expo-navigation-bar'); } catch { return null; } },
  '@shopify/flash-list': () => { try { return require('@shopify/flash-list'); } catch { return null; } },
  'react-native-reanimated-carousel': () => { try { return require('react-native-reanimated-carousel'); } catch { return null; } },
  '@react-native-masked-view/masked-view': () => { try { return require('@react-native-masked-view/masked-view'); } catch { return null; } },
};

/**
 * Attempts to synchronously resolve an optional dependency while caching the result.
 * Returns `null` when the module cannot be loaded. An optional accessor can pull
 * a specific export off the module evaluation.
 */
export function resolveOptionalModule<T = any>(moduleId: string, options: ResolveOptionalModuleOptions<T> = {}): T | null {
  const { accessor, devWarning, loader } = options;

  const cached = optionalModuleCache.get(moduleId);
  if (cached) {
    if (cached.value != null) {
      const result = accessor ? accessor(cached.value) : cached.value;
      return (result ?? null) as T | null;
    }
    if (isDev && devWarning && !cached.logged) {
      cached.logged = true;
      console.warn(devWarning);
    }
    return null;
  }

  const entry: OptionalModuleCacheEntry = { value: null, error: null, logged: false };
  optionalModuleCache.set(moduleId, entry);

  const moduleLoader = loader ?? optionalModuleLoaders[moduleId];
  if (!moduleLoader) {
    const message = `Optional module "${moduleId}" is not registered with optionalModuleLoaders.`;
    entry.error = new Error(message);
    if (isDev) {
      const prefix = Platform.OS === 'web' ? '[platform-blocks]' : '[platform-blocks/native]';
      entry.logged = true;
      console.warn(`${prefix} ${devWarning ?? message}`);
    }
    return null;
  }

  try {
    const required = moduleLoader();
    entry.value = required;
  } catch (error) {
    entry.error = error instanceof Error ? error : new Error(String(error));
    entry.value = null;
  }

  // The registered loaders swallow their own require failure and return null
  // (the try/catch has to be lexical at the require site for Metro), so a null
  // module here means "not installed" whichever path reported it.
  if (entry.value == null) {
    entry.error = entry.error ?? new Error(`Optional module "${moduleId}" could not be loaded.`);
    if (isDev && devWarning) {
      entry.logged = true;
      const prefix = Platform.OS === 'web' ? '[platform-blocks]' : '[platform-blocks/native]';
      console.warn(`${prefix} ${devWarning}`);
    }
    return null;
  }

  const result = accessor ? accessor(entry.value) : entry.value;
  return (result ?? null) as T | null;
}

/**
 * Clears the cached optional module entries. Useful for tests to re-attempt loads.
 */
export function resetOptionalModuleCache() {
  optionalModuleCache.clear();
}
