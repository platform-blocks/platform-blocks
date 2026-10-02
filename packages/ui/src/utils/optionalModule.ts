import { Platform } from 'react-native';
import { isDev, devWarn } from '../core/utils/logger';

interface OptionalModuleCacheEntry {
  /** The loaded module's exports, or `null` when it isn't available. */
  value: unknown;
  error: Error | null;
  logged: boolean;
}

export interface ResolveOptionalModuleOptions<T> {
  /**
   * Picks the export to use off the loaded module. Nothing about the module's
   * shape is known until it loads, so annotate the parameter with the shape
   * you read: `accessor: (mod: { FlashList?: FlashListComponent } | null) => mod?.FlashList`.
   * (Declared as a method so such an annotated parameter is accepted.)
   */
  accessor?(module: unknown): T | null | undefined;
  devWarning?: string;
  loader?: () => unknown;
}

const optionalModuleCache = new Map<string, OptionalModuleCacheEntry>();

type OptionalModuleLoader = () => unknown;

// Metro bundler requires static string literals for require; keep this package's
// optional modules here. Other @plocks packages pass their own `loader` (with the
// same lexical try/catch) so their modules never appear in @plocks/ui's bundle.
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
  'react-native-gesture-handler': () => { try { return require('react-native-gesture-handler'); } catch { return null; } },
  'react-native-gesture-handler/ReanimatedSwipeable': () => { try { return require('react-native-gesture-handler/ReanimatedSwipeable'); } catch { return null; } },
  'expo-status-bar': () => { try { return require('expo-status-bar'); } catch { return null; } },
  'expo-navigation-bar': () => { try { return require('expo-navigation-bar'); } catch { return null; } },
  '@shopify/flash-list': () => { try { return require('@shopify/flash-list'); } catch { return null; } },
  '@react-native-masked-view/masked-view': () => { try { return require('@react-native-masked-view/masked-view'); } catch { return null; } },
  '@react-native-async-storage/async-storage': () => { try { return require('@react-native-async-storage/async-storage'); } catch { return null; } },
};

/**
 * Attempts to synchronously resolve an optional dependency while caching the result.
 * Returns `null` when the module cannot be loaded. An optional accessor can pull
 * a specific export off the module evaluation.
 *
 * `T` is the shape the caller relies on (the module itself, or what `accessor`
 * returns); it is asserted, not checked, since the module is loaded at runtime.
 */
export function resolveOptionalModule<T = unknown>(moduleId: string, options: ResolveOptionalModuleOptions<T> = {}): T | null {
  const { accessor, devWarning, loader } = options;

  const cached = optionalModuleCache.get(moduleId);
  if (cached) {
    if (cached.value != null) {
      const result = accessor ? accessor(cached.value) : cached.value;
      return (result ?? null) as T | null;
    }
    if (isDev && devWarning && !cached.logged) {
      cached.logged = true;
      devWarn(devWarning);
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
      const prefix = Platform.OS === 'web' ? '[plocks]' : '[plocks/native]';
      entry.logged = true;
      devWarn(`${prefix} ${devWarning ?? message}`);
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
      const prefix = Platform.OS === 'web' ? '[plocks]' : '[plocks/native]';
      devWarn(`${prefix} ${devWarning}`);
    }
    return null;
  }

  const result = accessor ? accessor(entry.value) : entry.value;
  return (result ?? null) as T | null;
}

/**
 * A loaded module's default export: `mod.default` when the package is compiled
 * ESM (`exports.default = X`), else the module itself (`module.exports = X`).
 * Like `resolveOptionalModule`, `T` is asserted, not checked.
 */
export function defaultExportOf<T>(mod: unknown): T | null {
  if (mod == null) return null;
  if (typeof mod === 'object' && 'default' in mod) {
    const exported = (mod as { default?: unknown }).default;
    if (exported != null) return exported as T;
  }
  return mod as T;
}

/**
 * Clears the cached optional module entries. Useful for tests to re-attempt loads.
 */
export function resetOptionalModuleCache() {
  optionalModuleCache.clear();
}
