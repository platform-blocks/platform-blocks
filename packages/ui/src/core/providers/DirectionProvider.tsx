import React, { createContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { Platform, I18nManager } from 'react-native';

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
      if (__DEV__) {
        console.warn(
          '[DirectionProvider] Direction change on native requires app reload. ' +
          'Please reload the app to see RTL changes take effect.'
        );
      }
    }
  }
};

/**
 * DirectionProvider Component
 * 
 * Provides direction context for the entire app. Manages LTR/RTL state
 * and syncs with platform-specific direction settings.
 * 
 * @example
 * ```tsx
 * import { DirectionProvider } from '@platform-blocks/react-ui-library';
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
export const DirectionProvider: React.FC<DirectionProviderProps> = ({
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
        if (__DEV__) {
          console.error('[DirectionProvider] Failed to load direction from storage:', error);
        }
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
          if (__DEV__) {
            console.error('[DirectionProvider] Failed to persist direction:', error);
          }
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
 * Hook to access direction context
 * 
 * @throws Error if used outside DirectionProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { dir, isRTL, setDirection, toggleDirection } = useDirection();
 *   
 *   return (
 *     <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
 *       <Text>Direction: {dir}</Text>
 *       <Button onPress={toggleDirection}>Toggle</Button>
 *     </View>
 *   );
 * }
 * ```
 */
export const useDirection = (): DirectionContextValue => {
  const context = React.useContext(DirectionContext);
  
  if (!context) {
    throw new Error(
      'useDirection must be used within a DirectionProvider. ' +
      'Wrap your app with <DirectionProvider> to use RTL features.'
    );
  }
  
  return context;
};

/**
 * Hook to safely access direction context with fallback
 * Use this if you want to support components outside DirectionProvider
 */
export const useDirectionSafe = (): DirectionContextValue => {
  const context = React.useContext(DirectionContext);
  
  // Return default LTR context if no provider
  return context || {
    dir: 'ltr',
    isRTL: false,
    setDirection: () => {
      if (__DEV__) {
        console.warn('setDirection called outside DirectionProvider');
      }
    },
    toggleDirection: () => {
      if (__DEV__) {
        console.warn('toggleDirection called outside DirectionProvider');
      }
    },
  };
};

// Export context for advanced use cases
export { DirectionContext };
