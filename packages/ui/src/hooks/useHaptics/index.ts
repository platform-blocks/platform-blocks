import { useCallback, useMemo, useRef } from 'react';

import { useOptionalHapticsSettings } from '../../core/haptics/HapticsProvider';
import { isAndroid, isIOS } from '../../core/platform/flags';
import { resolveOptionalModule } from '../../utils/optionalModule';
import { devWarn, warnOnce } from '../../core/utils/logger';

/** The part of expo-haptics this hook calls (optional dependency). */
interface ExpoHapticsModule {
  impactAsync?: (style?: string) => Promise<void>;
  notificationAsync?: (type?: string) => Promise<void>;
  selectionAsync?: () => Promise<void>;
  ImpactFeedbackStyle: { Light: string; Medium: string };
  NotificationFeedbackType: { Success: string; Warning: string; Error: string };
}

// Lazy load expo-haptics (optional dependency) so the library works without it.
const Haptics = resolveOptionalModule<ExpoHapticsModule>('expo-haptics');

export interface UseHapticsOptions {
  /** Whether haptics are disabled */
  disabled?: boolean;
  /** Minimum ms between triggers to avoid flood. */
  throttleMs?: number;
}

export interface UseHapticsReturn {
  /** Medium impact when press starts */
  impactPressIn: () => void;
  /** Light impact on release */
  impactPressOut: () => void;
  /** Convenience for success events (e.g., toast show) */
  notifySuccess: () => void;
  /** Convenience for warning events */
  notifyWarning: () => void;
  /** Convenience for error events */
  notifyError: () => void;
  /** Haptic feedback for selection changes */
  selection: () => void;
}

/**
 * Haptic feedback via the optional `expo-haptics` module (iOS/Android only;
 * no-op elsewhere or when it isn't installed). Respects `<HapticsProvider>`'s
 * `enabled` setting and throttles bursts. The returned object is stable while
 * `disabled` / the provider setting don't change.
 */
export function useHaptics(opts: UseHapticsOptions = {}): UseHapticsReturn {
  const { disabled, throttleMs = 40 } = opts;
  const lastRef = useRef(0);
  const hapticsSettings = useOptionalHapticsSettings();

  if (!hapticsSettings) {
    warnOnce(
      'useHaptics.noProvider',
      '[plocks] useHaptics called without <HapticsProvider>; falling back to defaults.'
    );
  }

  const enabled = hapticsSettings?.enabled ?? true;
  const can = !!Haptics && !disabled && enabled && (isIOS || isAndroid);

  const safeRun = useCallback(
    (fn: () => Promise<unknown> | void) => {
      if (!can) return;
      const now = Date.now();
      if (now - lastRef.current < throttleMs) return;
      lastRef.current = now;
      try {
        // Fire and forget; a rejected promise must not surface as an unhandled rejection.
        const result = fn();
        if (result && typeof result.catch === 'function') result.catch(() => {});
      } catch {
        devWarn('Haptics call failed, ensure expo-haptics is installed correctly');
      }
    },
    [can, throttleMs]
  );

  return useMemo<UseHapticsReturn>(
    () => ({
      // Deferred to avoid a synchronous call on the UI thread causing a worklet boundary error.
      impactPressIn: () => {
        Promise.resolve().then(() => safeRun(() => Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle.Medium)));
      },
      impactPressOut: () => {
        Promise.resolve().then(() => safeRun(() => Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle.Light)));
      },
      notifySuccess: () => safeRun(() => Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType.Success)),
      notifyWarning: () => safeRun(() => Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType.Warning)),
      notifyError: () => safeRun(() => Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType.Error)),
      selection: () => safeRun(() => Haptics?.selectionAsync?.()),
    }),
    [safeRun]
  );
}

export default useHaptics;
