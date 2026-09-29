import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, KeyboardEvent } from 'react-native';

export interface KeyboardManagerProviderProps {
  children: React.ReactNode;
  /**
   * Optional flag to disable native listeners (primarily for tests).
   */
  disabled?: boolean;
}

/** On-screen keyboard geometry. Changes while the keyboard moves. */
export interface KeyboardMetrics {
  /** Indicates if the on-screen keyboard is currently visible */
  isKeyboardVisible: boolean;
  /** Height of the keyboard in pixels when visible */
  keyboardHeight: number;
  /** Native end coordinates from the last keyboard event */
  keyboardEndCoordinates?: KeyboardEvent['endCoordinates'];
  /** Reported animation duration (ms) from the native keyboard event */
  keyboardAnimationDuration: number;
  /** Reported animation easing from the native keyboard event */
  keyboardAnimationEasing?: KeyboardEvent['easing'];
}

/** Focus hand-off helpers. Stable apart from `pendingFocusTarget`. */
export interface KeyboardFocusApi {
  /** Latest focus target requested via `setFocusTarget`; null when none pending */
  pendingFocusTarget: string | null;
  /** Imperative helper for dismissing the keyboard */
  dismissKeyboard: () => void;
  /**
   * Sets an optional focus target that can be consumed by an input after the keyboard closes.
   * Passing null clears the stored target.
   */
  setFocusTarget: (componentId: string | null) => void;
  /**
   * Returns true when the provided component id matches the stored focus target.
   * The focus target is cleared after a successful match.
   */
  consumeFocusTarget: (componentId: string) => boolean;
  /**
   * Helper that records a focus target so the next mounted input can restore focus.
   * Consumers can call `dismissKeyboard` separately when they need to drop the keyboard.
   */
  refocus: (componentId: string, options?: { dismiss?: boolean }) => void;
}

export type KeyboardManagerContextValue = KeyboardMetrics & KeyboardFocusApi;

const DEFAULT_METRICS: KeyboardMetrics = {
  isKeyboardVisible: false,
  keyboardHeight: 0,
  keyboardEndCoordinates: undefined,
  keyboardAnimationDuration: 0,
  keyboardAnimationEasing: undefined,
};

// Two contexts so the many inputs that only need the focus helpers don't
// re-render on every keyboard frame, and layout that follows the keyboard
// doesn't re-render on focus hand-offs.
const KeyboardMetricsContext = createContext<KeyboardMetrics | null>(null);
KeyboardMetricsContext.displayName = 'KeyboardMetricsContext';
const KeyboardFocusContext = createContext<KeyboardFocusApi | null>(null);
KeyboardFocusContext.displayName = 'KeyboardFocusContext';

export const KeyboardManagerProvider: React.FC<KeyboardManagerProviderProps> = ({
  children,
  disabled = false,
}) => {
  const [metrics, setMetrics] = useState<KeyboardMetrics>(DEFAULT_METRICS);
  const focusTargetRef = useRef<string | null>(null);
  const [pendingFocusTarget, setPendingFocusTarget] = useState<string | null>(null);

  const handleKeyboardChange = useCallback((event: KeyboardEvent) => {
    if (!event) {
      return;
    }

    const height = event.endCoordinates?.height ?? 0;

    // will/did pairs report the same frame twice: skip no-op updates so
    // consumers render once per actual change.
    setMetrics(prev => {
      if (prev.isKeyboardVisible && prev.keyboardHeight === height) return prev;
      return {
        isKeyboardVisible: true,
        keyboardHeight: height,
        keyboardEndCoordinates: event.endCoordinates,
        keyboardAnimationDuration: event.duration ?? 0,
        keyboardAnimationEasing: event.easing,
      };
    });
  }, []);

  const handleKeyboardHide = useCallback(() => {
    setMetrics(prev => (!prev.isKeyboardVisible && prev.keyboardHeight === 0 ? prev : DEFAULT_METRICS));
  }, []);

  useEffect(() => {
    if (disabled) {
      return undefined;
    }

    const listeners = [
      Keyboard.addListener('keyboardWillShow', handleKeyboardChange),
      Keyboard.addListener('keyboardDidShow', handleKeyboardChange),
      Keyboard.addListener('keyboardWillChangeFrame', handleKeyboardChange),
      Keyboard.addListener('keyboardDidChangeFrame', handleKeyboardChange),
      Keyboard.addListener('keyboardWillHide', handleKeyboardHide),
      Keyboard.addListener('keyboardDidHide', handleKeyboardHide),
    ];

    return () => {
      listeners.forEach(listener => listener.remove());
    };
  }, [disabled, handleKeyboardChange, handleKeyboardHide]);

  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  const setFocusTarget = useCallback((componentId: string | null) => {
    focusTargetRef.current = componentId;
    setPendingFocusTarget(componentId);
  }, []);

  const consumeFocusTarget = useCallback((componentId: string) => {
    if (!focusTargetRef.current) {
      return false;
    }

    if (focusTargetRef.current === componentId) {
      focusTargetRef.current = null;
      setPendingFocusTarget(null);
      return true;
    }

    return false;
  }, []);

  const refocus = useCallback((componentId: string, options?: { dismiss?: boolean }) => {
    if (!componentId) {
      return;
    }

    if (options?.dismiss) {
      dismissKeyboard();
    }

    setFocusTarget(componentId);
  }, [dismissKeyboard, setFocusTarget]);

  const focusApi = useMemo<KeyboardFocusApi>(() => ({
    pendingFocusTarget,
    dismissKeyboard,
    setFocusTarget,
    consumeFocusTarget,
    refocus,
  }), [pendingFocusTarget, dismissKeyboard, setFocusTarget, consumeFocusTarget, refocus]);

  return (
    <KeyboardFocusContext.Provider value={focusApi}>
      <KeyboardMetricsContext.Provider value={metrics}>
        {children}
      </KeyboardMetricsContext.Provider>
    </KeyboardFocusContext.Provider>
  );
};

KeyboardManagerProvider.displayName = 'KeyboardManagerProvider';

/** Keyboard geometry only; null outside a provider. Re-renders on keyboard moves only. */
export function useKeyboardMetricsOptional(): KeyboardMetrics | null {
  return useContext(KeyboardMetricsContext);
}

/** Focus hand-off helpers only; null outside a provider. Doesn't re-render on keyboard moves. */
export function useKeyboardFocusOptional(): KeyboardFocusApi | null {
  return useContext(KeyboardFocusContext);
}

function useCombined(): KeyboardManagerContextValue | null {
  const metrics = useContext(KeyboardMetricsContext);
  const focusApi = useContext(KeyboardFocusContext);
  return useMemo(
    () => (metrics && focusApi ? { ...metrics, ...focusApi } : null),
    [metrics, focusApi]
  );
}

/**
 * Everything (metrics + focus helpers). Re-renders on both; prefer
 * `useKeyboardMetricsOptional` / `useKeyboardFocusOptional` when you need one.
 */
export function useKeyboardManager(): KeyboardManagerContextValue {
  const context = useCombined();
  if (!context) {
    throw new Error('useKeyboardManager must be used within a KeyboardManagerProvider');
  }
  return context;
}

export function useKeyboardManagerOptional(): KeyboardManagerContextValue | null {
  return useCombined();
}
