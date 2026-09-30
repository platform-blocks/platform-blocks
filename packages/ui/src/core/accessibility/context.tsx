import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react';

import { ReducedMotionProvider } from '../motion/ReducedMotionProvider';
import { useReducedMotion } from '../motion/useReducedMotion';
import { announce as announceToScreenReader } from './announce';
import {
  createAnnouncementLog,
  createFocusStore,
  defaultFocusStore,
  getScreenReaderServerSnapshot,
  getScreenReaderSnapshot,
  subscribeScreenReader,
  type AnnouncementLog,
  type FocusStore,
} from './stores';
import type { AccessibilityContextValue, AccessibilityProviderProps } from './types';

/**
 * What the provider shares. Everything in it is created once per provider, so
 * the context value never changes and never re-renders a consumer; hooks
 * subscribe to the individual stores for the slice they render.
 */
interface AccessibilityInternals {
  focusStore: FocusStore;
  announcementLog: AnnouncementLog;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  clearAnnouncements: () => void;
}

const AccessibilityInternalsContext = createContext<AccessibilityInternals | null>(null);
AccessibilityInternalsContext.displayName = 'AccessibilityContext';

const EMPTY_ANNOUNCEMENTS: string[] = [];
const noopSubscribe = () => () => {};
const getEmptyAnnouncements = () => EMPTY_ANNOUNCEMENTS;

/**
 * Accessibility services for a subtree: focus tracking, the announcement log,
 * and a reduced-motion override. The hooks in this module all work without it;
 * `PlocksProvider` mounts one. Its context value is stable, so mounting
 * it costs no re-renders.
 */
export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({
  children,
  reducedMotion = false,
}) => {
  const [internals] = useState<AccessibilityInternals>(() => {
    const focusStore = createFocusStore();
    const announcementLog = createAnnouncementLog();
    return {
      focusStore,
      announcementLog,
      announce: (message, priority = 'polite') => {
        if (!message) return;
        announceToScreenReader(message, { politeness: priority });
        announcementLog.add(message, priority === 'assertive' ? 5000 : 3000);
      },
      clearAnnouncements: () => announcementLog.clear(),
    };
  });

  useEffect(() => () => internals.announcementLog.dispose(), [internals]);

  return (
    <AccessibilityInternalsContext.Provider value={internals}>
      {/* Always rendered (undefined = inherit) so toggling the prop never remounts children. */}
      <ReducedMotionProvider reducedMotion={reducedMotion ? true : undefined}>
        {children}
      </ReducedMotionProvider>
    </AccessibilityInternalsContext.Provider>
  );
};

AccessibilityProvider.displayName = 'AccessibilityProvider';

/** @internal Provider internals, or null outside a provider. */
export const useAccessibilityInternals = (): AccessibilityInternals | null =>
  useContext(AccessibilityInternalsContext);

/** @internal The focus store for this subtree (the shared default without a provider). */
export const useFocusStore = (): FocusStore =>
  useContext(AccessibilityInternalsContext)?.focusStore ?? defaultFocusStore;

/** Whether a screen reader is running. Works without a provider. */
export const useScreenReaderEnabled = (): boolean =>
  useSyncExternalStore(subscribeScreenReader, getScreenReaderSnapshot, getScreenReaderServerSnapshot);

/**
 * A stable `announce(message, priority)` function. Inside a provider it also
 * records the message in the provider's announcement log.
 */
export const useAnnounce = (): ((message: string, priority?: 'polite' | 'assertive') => void) => {
  const internals = useContext(AccessibilityInternalsContext);
  return useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      if (internals) internals.announce(message, priority);
      else announceToScreenReader(message, { politeness: priority });
    },
    [internals]
  );
};

function useAccessibilityValue(internals: AccessibilityInternals | null): AccessibilityContextValue {
  const focusStore = internals?.focusStore ?? defaultFocusStore;
  const focus = useSyncExternalStore(focusStore.subscribe, focusStore.getSnapshot, focusStore.getSnapshot);
  const announcements = useSyncExternalStore(
    internals ? internals.announcementLog.subscribe : noopSubscribe,
    internals ? internals.announcementLog.getSnapshot : getEmptyAnnouncements,
    internals ? internals.announcementLog.getSnapshot : getEmptyAnnouncements
  );
  const screenReaderEnabled = useScreenReaderEnabled();
  const prefersReducedMotion = useReducedMotion();
  const announce = useAnnounce();
  const clearAnnouncements = internals?.clearAnnouncements;

  return useMemo<AccessibilityContextValue>(
    () => ({
      prefersReducedMotion,
      currentFocusId: focus.currentFocusId,
      focusHistory: focus.focusHistory,
      screenReaderEnabled,
      announcements,
      setFocus: focusStore.setFocus,
      restoreFocus: focusStore.restoreFocus,
      announce,
      clearAnnouncements: clearAnnouncements ?? (() => {}),
    }),
    [prefersReducedMotion, focus, screenReaderEnabled, announcements, focusStore, announce, clearAnnouncements]
  );
}

/**
 * Combined accessibility state. Subscribes to every slice, so the component
 * re-renders on any focus change or announcement. Prefer the specific hooks
 * (`useReducedMotion`, `useScreenReader`, `useAnnouncer`, `useFocus`).
 */
export const useAccessibility = (): AccessibilityContextValue => {
  const internals = useContext(AccessibilityInternalsContext);
  const value = useAccessibilityValue(internals);
  if (!internals) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return value;
};

/** Like `useAccessibility`, but returns null outside a provider instead of throwing. */
export const useOptionalAccessibility = (): AccessibilityContextValue | null => {
  const internals = useContext(AccessibilityInternalsContext);
  const value = useAccessibilityValue(internals);
  return internals ? value : null;
};
