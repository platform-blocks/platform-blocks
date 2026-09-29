import React, { createContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { Platform, I18nManager } from 'react-native';
import { devWarn, devError, warnOnce } from '../utils/logger';

/**
 * Direction type - left-to-right or right-to-left
 */
export type Direction = 'ltr' | 'rtl';

/**
 * Direction context value interface
 */
export interface DirectionContextValue {
  /** Current text direction */
  dir: Direction;
  /** Whether current direction is RTL */
  isRTL: boolean;
  /** Set the text direction */
  setDirection: (direction: Direction) => void;
  /** Toggle between LTR and RTL */
  toggleDirection: () => void;
}

/**
 * Storage controller interface for persisting direction preference
 */
export interface StorageController {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
}

/**
 * DirectionProvider props
 */
export interface DirectionProviderProps {
  /** Initial direction. If not provided, will auto-detect from platform */
  initialDirection?: Direction;
  /** Optional storage controller for persisting direction */
  storage?: StorageController;
  /** Storage key for persisting direction preference */
  storageKey?: string;
  /** Children to render */
  children: ReactNode;
}

/**
 * Direction Context
 */
const DirectionContext = createContext<DirectionContextValue | null>(null);

/**
 * Get initial direction from platform
 */
const getInitialDirection = (): Direction => {
  if (Platform.OS === 'web') {
    // On web, check document.documentElement.dir
    if (typeof document !== 'undefined') {
      const htmlDir = document.documentElement.dir;
      if (htmlDir === 'rtl') return 'rtl';
    }
    return 'ltr';
  } else {
    // On native, check I18nManager
    return I18nManager.isRTL ? 'rtl' : 'ltr';
  }
};

/**
 * Update platform-specific direction settings
 */
const updatePlatformDirection = (direction: Direction) => {
  const isRTL = direction === 'rtl';
  
  if (Platform.OS === 'web') {
    // Update HTML dir attribute
    if (typeof document !== 'undefined') {
      document.documentElement.dir = direction;
      document.documentElement.setAttribute('dir', direction);
    }
  } else {
    // On native, update I18nManager
    // Note: This requires app reload on React Native
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.forceRTL(isRTL);
      I18nManager.allowRTL(isRTL);
      
      // Warn developer about reload requirement
      devWarn(
        '[DirectionProvider] Direction change on native requires app reload. ' +
        'Please reload the app to see RTL changes take effect.'
      );
    }
  }
};

/** The provider that owns direction state (see `DirectionProvider`). */
const DirectionProviderRoot: React.FC<DirectionProviderProps> = ({
  initialDirection,
  storage,
  storageKey = 'app-direction',
  children,
}) => {
  // Initialize direction state
  const [direction, setDirectionState] = useState<Direction>(() => {
    return initialDirection || getInitialDirection();
  });

  // Load persisted direction on mount
  useEffect(() => {
    if (storage) {
      storage.getItem(storageKey).then((stored) => {
        if (stored === 'ltr' || stored === 'rtl') {
          setDirectionState(stored);
          updatePlatformDirection(stored);
        }
      }).catch((error) => {
        devError('[DirectionProvider] Failed to load direction from storage:', error);
      });
    }
  }, [storage, storageKey]);

  // Sync with platform when direction changes
  useEffect(() => {
    updatePlatformDirection(direction);
  }, [direction]);

  /**
   * Set direction and persist if storage is available
   */
  const setDirection = useCallback(
    (newDirection: Direction) => {
      setDirectionState(newDirection);
      
      // Persist to storage if available
      if (storage) {
        storage.setItem(storageKey, newDirection).catch((error) => {
          devError('[DirectionProvider] Failed to persist direction:', error);
        });
      }
    },
    [storage, storageKey]
  );

  /**
   * Toggle between LTR and RTL
   */
  const toggleDirection = useCallback(() => {
    setDirection(direction === 'ltr' ? 'rtl' : 'ltr');
  }, [direction, setDirection]);

  /**
   * Computed RTL flag
   */
  const isRTL = useMemo(() => direction === 'rtl', [direction]);

  /**
   * Context value
   */
  const contextValue = useMemo<DirectionContextValue>(
    () => ({
      dir: direction,
      isRTL,
      setDirection,
      toggleDirection,
    }),
    [direction, isRTL, setDirection, toggleDirection]
  );

  return (
    <DirectionContext.Provider value={contextValue}>
      {children}
    </DirectionContext.Provider>
  );
};

/**
 * DirectionProvider Component
 *
 * Provides direction context for the entire app. Manages LTR/RTL state
 * and syncs with platform-specific direction settings.
 *
 * A nested DirectionProvider with neither `initialDirection` nor `storage`
 * inherits its parent's direction (it renders nothing of its own) instead of
 * resetting to the platform default. `PlatformBlocksProvider` mounts one, so an
 * app-level provider above it keeps control.
 *
 * @example
 * ```tsx
 * import { DirectionProvider } from '@platform-blocks/ui';
 *
 * function App() {
 *   return (
 *     <DirectionProvider initialDirection="ltr">
 *       <YourApp />
 *     </DirectionProvider>
 *   );
 * }
 * ```
 */
export const DirectionProvider: React.FC<DirectionProviderProps> = (props) => {
  const parent = React.useContext(DirectionContext);
  if (parent && props.initialDirection === undefined && props.storage === undefined) {
    return <>{props.children}</>;
  }
  return <DirectionProviderRoot {...props} />;
};

DirectionProvider.displayName = 'DirectionProvider';

const warnOutsideProvider = () =>
  warnOnce(
    'DirectionProvider:setDirection-outside',
    '[platform-blocks] setDirection/toggleDirection called outside a DirectionProvider; ignored.'
  );

/** What `useDirection()` returns without a provider: LTR, and setters that do nothing. */
const DEFAULT_DIRECTION: DirectionContextValue = Object.freeze({
  dir: 'ltr' as const,
  isRTL: false,
  setDirection: warnOutsideProvider,
  toggleDirection: warnOutsideProvider,
});

/**
 * Hook to access direction context.
 *
 * Never throws: outside a DirectionProvider (e.g. `direction={false}` on
 * PlatformBlocksProvider) it returns a stable LTR default whose setters are no-ops.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { dir, isRTL, toggleDirection } = useDirection();
 *   return <Button onPress={toggleDirection}>Direction: {dir}</Button>;
 * }
 * ```
 */
export const useDirection = (): DirectionContextValue => {
  return React.useContext(DirectionContext) ?? DEFAULT_DIRECTION;
};

/** Alias of `useDirection` (which no longer throws). Kept for compatibility. */
export const useDirectionSafe = useDirection;

// Export context for advanced use cases
export { DirectionContext };
