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
const optionalModuleLoaders: Record<string, OptionalModuleLoader> = {
  'react-native': () => require('react-native'),
  'expo-clipboard': () => require('expo-clipboard'),
  'expo-haptics': () => require('expo-haptics'),
  'expo-linear-gradient': () => require('expo-linear-gradient'),
  'expo-document-picker': () => require('expo-document-picker'),
  'react-native-webview': () => require('react-native-webview'),
  'lodash.debounce': () => require('lodash.debounce'),
  'expo-audio': () => require('expo-audio'),
  'react-native-gesture-handler': () => require('react-native-gesture-handler'),
  'expo-status-bar': () => require('expo-status-bar'),
  'expo-navigation-bar': () => require('expo-navigation-bar'),
  '@shopify/flash-list': () => require('@shopify/flash-list'),
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
