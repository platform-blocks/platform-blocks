import { useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { useReducedMotion } from '../../core/motion/useReducedMotion';
import { isAndroid, isIOS, isNative, isWeb } from '../../core/platform/flags';
import {
  EMPTY_EXTENDED,
  EMPTY_USER_AGENT,
  detectRuntime,
  detectSystem,
  fetchExtendedData,
  getUserAgentInfo,
  orientationFromMetrics,
} from './detect';
import { clientStore, colorSchemeStore, contrastStore, inputStore, localeStore, screenStore, type ExternalStore } from './stores';
import type { DeviceInfo, ExtendedDataState, UseDeviceInfoOptions } from './types';

const DEFAULT_SAFE_AREA = Object.freeze({ top: 0, bottom: 0, left: 0, right: 0 });
const NO_EXTENDED_DATA: ExtendedDataState = Object.freeze({});

function useStore<T>(store: ExternalStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}

/**
 * A snapshot of the runtime, OS, device, screen, locale, appearance, input
 * capabilities and safe-area insets, kept up to date as they change.
 *
 * - All instances share one set of platform listeners (module-level stores).
 * - Hydration-safe: server rendering and the hydration pass see deterministic
 *   defaults (desktop-sized screen, `en-US`/UTC, no preferences, `meta.ready`
 *   false); the client re-renders with live values right after.
 * - `appearance.reducedMotion` is `useReducedMotion()` — the same value every
 *   library component animates by.
 * - The returned object keeps its identity until something in it changes.
 *
 * @example
 * const info = useDeviceInfo({ enableExtendedData: true });
 * const label = `${info.system.os.name} on a ${info.system.device.type}`;
 */
export function useDeviceInfo(options: UseDeviceInfoOptions = {}): DeviceInfo {
  const enableExtendedData = options.enableExtendedData ?? false;

  const isClient = useStore(clientStore);
  const screen = useStore(screenStore);
  const colorScheme = useStore(colorSchemeStore);
  const contrast = useStore(contrastStore);
  const input = useStore(inputStore);
  const locale = useStore(localeStore);
  const reducedMotion = useReducedMotion();

  // Safe area values update when the provider's insets change.
  const safeAreaInsets = useContext(SafeAreaInsetsContext) ?? DEFAULT_SAFE_AREA;

  // Extended data (network + capabilities) loads asynchronously; null = not loaded yet.
  const [extendedResult, setExtendedResult] = useState<ExtendedDataState | null>(null);
  useEffect(() => {
    if (!enableExtendedData) return undefined;
    let cancelled = false;
    fetchExtendedData().then(
      (result) => {
        if (!cancelled) setExtendedResult(result);
      },
      () => {
        if (!cancelled) setExtendedResult(EMPTY_EXTENDED);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [enableExtendedData]);

  const extended = enableExtendedData ? extendedResult ?? EMPTY_EXTENDED : NO_EXTENDED_DATA;
  const ready = isClient && (!enableExtendedData || extendedResult !== null);

  return useMemo<DeviceInfo>(() => {
    // The user agent is only read on a live client render, so hydration matches the server.
    const ua = isClient ? getUserAgentInfo() : EMPTY_USER_AGENT;
    const runtime = detectRuntime(ua);
    const system = detectSystem(screen, ua);
    const orientation = orientationFromMetrics(screen);

    const deviceType = system.device.type;
    const isTablet = deviceType === 'tablet';
    const isPhone = deviceType === 'phone';
    const isDesktop = deviceType === 'desktop';
    const isMobile = isPhone || isTablet;

    return {
      runtime,
      system,
      screen: {
        width: screen.width,
        height: screen.height,
        scale: screen.scale,
        fontScale: screen.fontScale,
        orientation,
      },
      locale,
      appearance: {
        colorScheme,
        contrast,
        reducedMotion,
        fontScale: screen.fontScale,
      },
      input,
      safeArea: {
        top: safeAreaInsets.top ?? 0,
        bottom: safeAreaInsets.bottom ?? 0,
        left: safeAreaInsets.left ?? 0,
        right: safeAreaInsets.right ?? 0,
      },
      network: extended.network,
      capabilities: extended.capabilities,
      platform: {
        isWeb,
        isNative,
        isIOS,
        isAndroid,
        isMobile,
        isTablet,
        isPhone,
        isDesktop,
        isConsole: deviceType === 'console',
        isTV: deviceType === 'tv',
        isWearable: deviceType === 'wearable',
      },
      helpers: {
        isPhone,
        isTablet,
        isMobile,
        isDesktop,
        isDarkMode: colorScheme === 'dark',
        isLandscape: orientation === 'landscape',
        getOS: () => system.os.name ?? 'unknown',
        getBrand: () => system.device.brand ?? null,
      },
      meta: {
        // Rebuilt only when an input changes, so this is "last changed at".
        updatedAt: isClient ? Date.now() : 0,
        ready,
      },
    };
  }, [isClient, screen, colorScheme, contrast, reducedMotion, locale, input, safeAreaInsets, extended, ready]);
}

export default useDeviceInfo;
