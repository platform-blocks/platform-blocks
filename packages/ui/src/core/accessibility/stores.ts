import { AccessibilityInfo } from 'react-native';
import { isWeb } from '../platform/flags';

/**
 * Small external stores behind the accessibility hooks. They let the hooks work
 * with or without an `AccessibilityProvider`, and let each consumer subscribe to
 * exactly the slice it renders (via `useSyncExternalStore`), so a focus change or
 * an announcement doesn't re-render every accessible component.
 */

type Listener = () => void;

// ---------------------------------------------------------------------------
// Screen reader (process-wide; there is one OS setting)
// ---------------------------------------------------------------------------

const screenReaderListeners = new Set<Listener>();
let screenReaderEnabled = false;
let stopScreenReader: (() => void) | null = null;

function setScreenReader(next: boolean) {
  if (next === screenReaderEnabled) return;
  screenReaderEnabled = next;
  screenReaderListeners.forEach((listener) => listener());
}

function startScreenReader() {
  // Browsers do not expose whether assistive technology is running. RNW's
  // isScreenReaderEnabled() stub reports true for every visitor.
  if (isWeb) return;
  let active = true;
  // Guarded: the accessors are absent or stubbed in some test renderers.
  const pending = AccessibilityInfo.isScreenReaderEnabled?.();
  if (pending && typeof pending.then === 'function') {
    pending.then((value) => { if (active) setScreenReader(!!value); }).catch(() => {});
  }
  const subscription = AccessibilityInfo.addEventListener?.('screenReaderChanged', (value: boolean) => {
    setScreenReader(!!value);
  });
  stopScreenReader = () => {
    active = false;
    subscription?.remove?.();
  };
}

export function subscribeScreenReader(listener: Listener): () => void {
  screenReaderListeners.add(listener);
  if (!stopScreenReader) startScreenReader();
  return () => {
    screenReaderListeners.delete(listener);
    if (screenReaderListeners.size === 0 && stopScreenReader) {
      stopScreenReader();
      stopScreenReader = null;
    }
  };
}

export const getScreenReaderSnapshot = (): boolean => isWeb ? false : screenReaderEnabled;
export const getScreenReaderServerSnapshot = (): boolean => false;

// ---------------------------------------------------------------------------
// Focus tracking (per provider; a shared default when there is none)
// ---------------------------------------------------------------------------

export interface FocusSnapshot {
  currentFocusId: string | null;
  focusHistory: string[];
}

export interface FocusStore {
  subscribe: (listener: Listener) => () => void;
  getSnapshot: () => FocusSnapshot;
  setFocus: (id: string) => void;
  restoreFocus: () => void;
}

const MAX_FOCUS_HISTORY = 10;
const EMPTY_FOCUS: FocusSnapshot = { currentFocusId: null, focusHistory: [] };

export function createFocusStore(): FocusStore {
  const listeners = new Set<Listener>();
  let snapshot = EMPTY_FOCUS;

  const emit = (next: FocusSnapshot) => {
    snapshot = next;
    listeners.forEach((listener) => listener());
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    getSnapshot: () => snapshot,
    setFocus(id) {
      const { currentFocusId, focusHistory } = snapshot;
      if (currentFocusId === id) return;
      const history = focusHistory.filter((entry) => entry !== id);
      if (currentFocusId) history.push(currentFocusId);
      emit({ currentFocusId: id, focusHistory: history.slice(-MAX_FOCUS_HISTORY) });
    },
    restoreFocus() {
      const { focusHistory } = snapshot;
      const last = focusHistory[focusHistory.length - 1];
      if (!last) return;
      emit({ currentFocusId: last, focusHistory: focusHistory.slice(0, -1) });
    },
  };
}

/** Used by the focus hooks when no AccessibilityProvider is mounted. */
export const defaultFocusStore: FocusStore = createFocusStore();

// ---------------------------------------------------------------------------
// Announcement log for `useAccessibility().announcements`.
// ---------------------------------------------------------------------------

export interface AnnouncementLog {
  subscribe: (listener: Listener) => () => void;
  getSnapshot: () => string[];
  add: (message: string, ttlMs: number) => void;
  clear: () => void;
  dispose: () => void;
}

const EMPTY_LOG: string[] = [];

export function createAnnouncementLog(): AnnouncementLog {
  const listeners = new Set<Listener>();
  const timers = new Set<ReturnType<typeof setTimeout>>();
  let messages = EMPTY_LOG;

  const emit = (next: string[]) => {
    messages = next;
    listeners.forEach((listener) => listener());
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    getSnapshot: () => messages,
    add(message, ttlMs) {
      emit([...messages, message]);
      const timer = setTimeout(() => {
        // Prune the handle as it fires so the set can't grow without bound.
        timers.delete(timer);
        const index = messages.indexOf(message);
        if (index >= 0) emit([...messages.slice(0, index), ...messages.slice(index + 1)]);
      }, ttlMs);
      timers.add(timer);
    },
    clear() {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
      if (messages.length) emit(EMPTY_LOG);
    },
    dispose() {
      // Timers only: subscribers unsubscribe themselves (and StrictMode re-runs
      // effects on the same instance, so the log must stay usable).
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    },
  };
}
