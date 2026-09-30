import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { AccessibilityInfo, findNodeHandle } from 'react-native';
import type { View } from 'react-native';

import { isIOS, isAndroid, isWeb } from '../platform';
import { devWarn } from '../utils/logger';
import { useAnnounce, useFocusStore, useScreenReaderEnabled } from './context';
import type { AnnouncementOptions, FocusOptions, ScreenReaderInfo } from './types';

/** What `useFocus` calls on the attached node: a DOM element or a focusable native instance. */
interface FocusableHost {
  focus?: (options?: { preventScroll?: boolean }) => void;
  blur?: () => void;
}

/**
 * Tracks and moves focus for the element `ref` is attached to. Works with or
 * without an AccessibilityProvider; only this component re-renders when its own
 * `isFocused` flips.
 *
 * `T` is the host type the ref is attached to (`View` by default; pass e.g.
 * `TextInput` for an input). On web it is the DOM node.
 */
export const useFocus = <T = View>(id: string, options: FocusOptions = {}) => {
  const store = useFocusStore();
  const { preventScroll = false, restoreOnUnmount = false } = options;
  const elementRef = useRef<T>(null);

  const isFocused = useSyncExternalStore(
    store.subscribe,
    () => store.getSnapshot().currentFocusId === id,
    () => false
  );

  const focus = useCallback(() => {
    const element: unknown = elementRef.current;
    if (!element) return;
    store.setFocus(id);
    try {
      const host = element as FocusableHost;
      if (typeof host.focus === 'function') {
        host.focus({ preventScroll });
      } else {
        const node = findNodeHandle(element as Parameters<typeof findNodeHandle>[0]);
        if (node) AccessibilityInfo.setAccessibilityFocus(node);
      }
    } catch (error) {
      devWarn('Failed to set focus:', error);
    }
  }, [id, store, preventScroll]);

  const blur = useCallback(() => {
    const element = elementRef.current as FocusableHost | null;
    if (element && typeof element.blur === 'function') element.blur();
  }, []);

  const isFocusedRef = useRef(isFocused);
  isFocusedRef.current = isFocused;

  useEffect(() => {
    if (!restoreOnUnmount) return undefined;
    return () => {
      if (isFocusedRef.current) store.restoreFocus();
    };
  }, [restoreOnUnmount, store]);

  return { ref: elementRef, focus, blur, isFocused };
};

/**
 * Screen reader announcements. Works without a provider: messages go straight to
 * `announce()` (native AccessibilityInfo / web live region).
 */
export const useAnnouncer = () => {
  const announceFn = useAnnounce();
  const screenReaderEnabled = useScreenReaderEnabled();

  const announce = useCallback(
    (message: string, options: AnnouncementOptions = {}) => {
      announceFn(message, options.priority ?? 'polite');
    },
    [announceFn]
  );

  return { announce, screenReaderEnabled };
};

/** Screen reader state. Works without a provider. */
export const useScreenReader = (): ScreenReaderInfo => {
  const enabled = useScreenReaderEnabled();
  return useMemo<ScreenReaderInfo>(() => {
    let type: ScreenReaderInfo['type'] = 'unknown';
    if (enabled && !isWeb) {
      if (isIOS) type = 'voiceover';
      else if (isAndroid) type = 'talkback';
    }
    return { enabled, type };
  }, [enabled]);
};
