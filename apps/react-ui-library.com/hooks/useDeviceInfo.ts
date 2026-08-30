import { useContext, useEffect, useMemo, useState } from 'react';
import {
  AccessibilityInfo,
  Appearance,
  Dimensions,
  NativeModules,
  PixelRatio,
  Platform,
  type EmitterSubscription,
} from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

declare const HermesInternal:
  | undefined
  | {
      getRuntimeProperties?: () => Record<string, string>;
    };

// -------------------------------------------------------------
// Types
// -------------------------------------------------------------
export interface DeviceInfo {
  runtime: {
    platform: 'browser' | 'native';
    browserName: string | null;
    browserVersion: string | null;
    jsEngine: 'Hermes' | 'JSC' | 'V8' | null;
    engineVersion: string | null;
  };
  system: {
    os: {
      name: string | null;
      version: string | null;
      buildId?: string | null;
    };
    device: {
      type: 'phone' | 'tablet' | 'desktop' | 'tv' | 'console' | 'wearable' | 'unknown';
      brand: string | null;
      model: string | null;
      isVirtual?: boolean;
    };
  };
  screen: {
    width: number;
    height: number;
    scale: number;
    fontScale?: number;
    orientation: 'portrait' | 'landscape';
  };
  locale: {
    language: string;
    region: string | null;
    full: string;
    timeZone: string;
    uses24HourClock: boolean;
  };
  appearance: {
    colorScheme: 'light' | 'dark' | 'no-preference';
    contrast: 'more' | 'less' | 'no-preference';
    reducedMotion: boolean;
    fontScale: number;
  };
  input: {
    primaryPointer: 'touch' | 'mouse' | 'pen' | 'unknown';
    pointerTypes: Array<'touch' | 'mouse' | 'pen'>;
    hasTouch: boolean;
    hasMouse: boolean;
    hasKeyboard: boolean | null;
  };
  safeArea: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  network?: {
    ipAddress?: string | null;
    macAddress?: string | null;
    connectionType?: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
    downlink?: number | null;
  };
  capabilities?: {
    hdr: boolean | null;
    gpu: string | null;
  };
  platform: {
    isWeb: boolean;
    isNative: boolean;
    isIOS: boolean;
    isAndroid: boolean;
    isMobile: boolean;
    isTablet: boolean;
    isPhone: boolean;
    isDesktop: boolean;
    isConsole: boolean;
    isTV: boolean;
    isWearable: boolean;
  };
  helpers: {
    isPhone: boolean;
    isTablet: boolean;
    isMobile: boolean;
    isDesktop: boolean;
    isDarkMode: boolean;
    isLandscape: boolean;
    getOS: () => string;
    getBrand: () => string | null;
  };
  meta: {
    updatedAt: number;
    ready: boolean;
  };
}

export interface UseDeviceInfoOptions {
  enableExtendedData?: boolean;
}

type ScreenMetrics = {
  width: number;
  height: number;
  scale: number;
  fontScale: number;
};

type InputState = DeviceInfo['input'];

type LocaleState = DeviceInfo['locale'];

type ContrastPreference = DeviceInfo['appearance']['contrast'];

type ConnectionType = NonNullable<DeviceInfo['network']>['connectionType'];

type ExtendedDataState = {
  network?: DeviceInfo['network'];
  capabilities?: DeviceInfo['capabilities'];
};

const DEFAULT_SAFE_AREA = Object.freeze({ top: 0, bottom: 0, left: 0, right: 0 });
const NO_POINTERS: Array<'touch' | 'mouse' | 'pen'> = [];

// -------------------------------------------------------------
// Environment helpers
// -------------------------------------------------------------
const canUseDOM = () => typeof window !== 'undefined' && typeof document !== 'undefined';

const getScreenMetrics = (): ScreenMetrics => {
  try {
    const dims = Dimensions.get('window');
    return {
      width: dims?.width ?? 0,
      height: dims?.height ?? 0,
      scale: dims?.scale ?? 1,
      fontScale: dims?.fontScale ?? PixelRatio.getFontScale?.() ?? 1,
    };
  } catch {
    return { width: 0, height: 0, scale: 1, fontScale: 1 };
  }
};

const orientationFromMetrics = (metrics: ScreenMetrics): 'portrait' | 'landscape' =>
  metrics.width >= metrics.height ? 'landscape' : 'portrait';

const parseUserAgent = () => {
  if (!canUseDOM() || typeof navigator === 'undefined') {
    return {
      browserName: null,
      browserVersion: null,
      osName: null,
      osVersion: null,
      deviceBrand: null,
      deviceModel: null,
      deviceType: 'unknown' as DeviceInfo['system']['device']['type'],
    };
  }

  const ua = navigator.userAgent ?? '';
  const data = navigator as unknown as { userAgentData?: { brands?: Array<{ brand: string; version: string }>; platform?: string; model?: string } };

  const browserMatchers = [
    { name: 'Edge', regex: /Edg\/(\d+[\.\d+]*)/ },
    { name: 'Chrome', regex: /Chrome\/(\d+[\.\d+]*)/ },
    { name: 'Firefox', regex: /Firefox\/(\d+[\.\d+]*)/ },
    { name: 'Safari', regex: /Version\/(\d+[\.\d+]*)\s+Safari/ },
    { name: 'Opera', regex: /OPR\/(\d+[\.\d+]*)/ },
  ];

  let browserName: string | null = null;
  let browserVersion: string | null = null;
  for (const matcher of browserMatchers) {
    const match = ua.match(matcher.regex);
    if (match) {
      browserName = matcher.name;
      browserVersion = match[1];
      break;
    }
  }

  if (!browserName && data.userAgentData?.brands?.length) {
    browserName = data.userAgentData.brands[0]?.brand ?? null;
    browserVersion = data.userAgentData.brands[0]?.version ?? null;
  }

  const osMatchers = [
    { name: 'iOS', regex: /iP(hone|ad|od).*OS\s([\d_]+)/ },
    { name: 'Android', regex: /Android\s([\d.]+)/ },
    { name: 'Windows', regex: /Windows NT\s([\d.]+)/ },
    { name: 'macOS', regex: /Mac OS X\s([\d_]+)/ },
    { name: 'Linux', regex: /Linux/ },
  ];

  let osName: string | null = null;
  let osVersion: string | null = null;
  for (const matcher of osMatchers) {
    const match = ua.match(matcher.regex);
    if (match) {
      osName = matcher.name;
      osVersion = match[2] ?? match[1] ?? null;
      if (osVersion) osVersion = osVersion.replace(/_/g, '.');
      break;
    }
  }

  const uaLower = ua.toLowerCase();
  const detectType = (): DeviceInfo['system']['device']['type'] => {
    if (/tv|smarttv|appletv|shield/.test(uaLower)) return 'tv';
    if (/playstation|xbox|nintendo/.test(uaLower)) return 'console';
    if (/watch|wear/.test(uaLower)) return 'wearable';
    if (/ipad|tablet/.test(uaLower)) return 'tablet';
    if (/mobi|iphone|android/.test(uaLower)) return 'phone';
    return 'desktop';
  };

  const brandMap: Array<{ key: RegExp; value: string }> = [
    { key: /apple/, value: 'Apple' },
    { key: /samsung/, value: 'Samsung' },
    { key: /google/, value: 'Google' },
    { key: /huawei/, value: 'Huawei' },
    { key: /oneplus/, value: 'OnePlus' },
    { key: /microsoft/, value: 'Microsoft' },
  ];

  const brand = brandMap.find((entry) => entry.key.test(uaLower))?.value ?? null;
  const model = data.userAgentData?.model ?? null;

  return { browserName, browserVersion, osName, osVersion, deviceBrand: brand, deviceModel: model, deviceType: detectType() };
};

const detectLocale = (): LocaleState => {
  // Try platform-specific locale identifiers first
  const nativeLocale = (() => {
    const settings = (NativeModules as Record<string, any>)?.SettingsManager?.settings;
    if (settings?.AppleLocale) return settings.AppleLocale;
    if (Array.isArray(settings?.AppleLanguages)) return settings.AppleLanguages[0];
    const i18n = (NativeModules as Record<string, any>)?.I18nManager;
    if (typeof i18n?.localeIdentifier === 'string') return i18n.localeIdentifier;
    return undefined;
  })();

  const full = nativeLocale ?? (typeof navigator !== 'undefined' ? navigator.language : 'en-US');
  const [languagePart, regionPart] = full.replace('_', '-').split('-');

  const language = languagePart?.toLowerCase() ?? 'en';
  const region = regionPart ? regionPart.toUpperCase() : null;
  const timeZone = (() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';
    } catch {
      return 'UTC';
    }
  })();

  const uses24HourClock = (() => {
    const i18n = (NativeModules as Record<string, any>)?.I18nManager;
    if (typeof i18n?.getConstants === 'function') {
      const constants = i18n.getConstants();
      if (typeof constants?.is24Hour === 'boolean') return constants.is24Hour;
    }
    try {
      const formatter = new Intl.DateTimeFormat(undefined, { hour: 'numeric' });
      const parts = formatter.formatToParts(new Date()).find((part) => part.type === 'dayPeriod');
      return !parts;
    } catch {
      return false;
    }
  })();

  return {
    language,
    region,
    full,
    timeZone,
    uses24HourClock,
  };
};

const getInputState = (): InputState => {
  if (!canUseDOM() || Platform.OS !== 'web') {
    const brand = Platform.OS === 'ios' || Platform.OS === 'android' ? 'touch' : 'unknown';
    const pointerTypes: Array<'touch' | 'mouse' | 'pen'> = brand === 'touch' ? ['touch'] : NO_POINTERS;
    return {
      primaryPointer: brand as InputState['primaryPointer'],
      pointerTypes,
      hasTouch: brand === 'touch',
      hasMouse: Platform.OS === 'macos' || Platform.OS === 'windows',
      hasKeyboard: null,
    };
  }

  const touchCapable = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const finePointer = window.matchMedia?.('(pointer: fine)').matches ?? false;
  const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? false;

  const pointerTypes: Array<'touch' | 'mouse' | 'pen'> = [];
  if (touchCapable || coarsePointer) pointerTypes.push('touch');
  if (finePointer) pointerTypes.push('mouse');

  const primaryPointer: InputState['primaryPointer'] = pointerTypes[0] ?? 'unknown';

  return {
    primaryPointer,
    pointerTypes,
    hasTouch: touchCapable,
    hasMouse: finePointer,
    hasKeyboard: typeof navigator !== 'undefined' && 'keyboard' in navigator ? true : null,
  };
};

const getContrastPreference = (): ContrastPreference => {
  if (Platform.OS !== 'web') return 'no-preference';
  const supports = typeof window !== 'undefined' && typeof window.matchMedia === 'function';
  if (!supports) return 'no-preference';
  if (window.matchMedia('(prefers-contrast: more)').matches) return 'more';
  if (window.matchMedia('(prefers-contrast: less)').matches) return 'less';
  return 'no-preference';
};

const getColorScheme = (): DeviceInfo['appearance']['colorScheme'] => {
  const scheme = Appearance?.getColorScheme?.();
  if (scheme === 'light' || scheme === 'dark') return scheme;
  return 'no-preference';
};

const getReducedMotion = async () => {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  if (typeof AccessibilityInfo?.isReduceMotionEnabled === 'function') {
    try {
      return await AccessibilityInfo.isReduceMotionEnabled();
    } catch {
      return false;
    }
  }
  return false;
};

const detectRuntime = (): DeviceInfo['runtime'] => {
  const { browserName, browserVersion } = parseUserAgent();
  const hermes = typeof HermesInternal === 'object';
  let jsEngine: DeviceInfo['runtime']['jsEngine'] = null;
  let engineVersion: string | null = null;

  if (hermes) {
    jsEngine = 'Hermes';
    try {
      engineVersion = HermesInternal?.getRuntimeProperties?.()?.['OSS Release Version'] ?? null;
    } catch {
      engineVersion = null;
    }
  } else if (Platform.OS === 'web') {
    jsEngine = browserName === 'Safari' ? 'JSC' : browserName ? 'V8' : null;
    engineVersion = browserVersion;
  } else {
    jsEngine = Platform.OS === 'ios' ? 'JSC' : 'JSC';
    engineVersion = null;
  }

  return {
    platform: Platform.OS === 'web' ? 'browser' : 'native',
    browserName,
    browserVersion,
    jsEngine,
    engineVersion,
  };
};

const detectSystem = (metrics: ScreenMetrics) => {
  const isWeb = Platform.OS === 'web';
  const uaInfo = parseUserAgent();
  const constants = Platform.constants as Record<string, any> | undefined;

  const osName = isWeb ? uaInfo.osName : Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : Platform.OS;
  const osVersion = isWeb
    ? uaInfo.osVersion
    : typeof Platform.Version === 'string'
      ? Platform.Version
      : Platform.Version != null
        ? String(Platform.Version)
        : null;

  const buildId = constants?.Release ?? constants?.SystemVersion ?? null;

  let deviceType: DeviceInfo['system']['device']['type'] = 'unknown';
  if (isWeb) {
    deviceType = uaInfo.deviceType;
    if (deviceType === 'desktop' && metrics.width <= 1024) {
      deviceType = metrics.width <= 768 ? 'tablet' : 'desktop';
    }
  } else {
    const idiom = constants?.interfaceIdiom ?? constants?.UIUserInterfaceIdiom;
    const platformFlags = Platform as unknown as { isPad?: boolean };
    if (Platform.isTV) deviceType = 'tv';
    else if (idiom === 'tablet' || platformFlags?.isPad) deviceType = 'tablet';
    else deviceType = 'phone';
  }

  const brand = isWeb
    ? uaInfo.deviceBrand
    : constants?.brand ?? constants?.Brand ?? (Platform.OS === 'ios' ? 'Apple' : null);

  const model = isWeb ? uaInfo.deviceModel : constants?.model ?? constants?.Device ?? null;

  return {
    os: {
      name: osName ?? null,
      version: osVersion ?? null,
      buildId,
    },
    device: {
      type: deviceType,
      brand,
      model,
      isVirtual: constants?.isTesting ?? constants?.isEmulator ?? undefined,
    },
  } satisfies DeviceInfo['system'];
};

const createEmptyNetwork = (): DeviceInfo['network'] => ({
  ipAddress: null,
  macAddress: null,
  connectionType: 'unknown',
  downlink: null,
});

const createEmptyCapabilities = (): DeviceInfo['capabilities'] => ({ hdr: null, gpu: null });

const fetchWebGpuInfo = async (): Promise<string | null> => {
  if (!canUseDOM()) return null;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    if (!gl) return null;
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return null;
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    return typeof renderer === 'string' ? renderer : null;
  } catch {
    return null;
  }
};

const fetchExtendedData = async (): Promise<ExtendedDataState> => {
  const isWeb = Platform.OS === 'web';
  if (isWeb) {
    const connection = (navigator as unknown as { connection?: { effectiveType?: string; downlink?: number } })?.connection;
    const normalizeConnection = (value?: string): ConnectionType => {
      if (!value) return 'unknown';
      if (value === 'wifi') return 'wifi';
      if (value === 'ethernet') return 'ethernet';
      if (['2g', '3g', '4g', '5g', 'slow-2g'].includes(value)) return 'cellular';
      return 'unknown';
    };
    const network: DeviceInfo['network'] = {
      ipAddress: null,
      macAddress: null,
      connectionType: normalizeConnection(connection?.effectiveType),
      downlink: connection?.downlink ?? null,
    };

    const hdr = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(dynamic-range: high)').matches
      : null;

    return {
      network,
      capabilities: {
        hdr,
        gpu: await fetchWebGpuInfo(),
      },
    };
  }

  const netModule = (NativeModules as Record<string, any>)?.RNCNetInfo;
  let network: DeviceInfo['network'] | undefined;
  if (typeof netModule?.getCurrentState === 'function') {
    try {
      const state = await netModule.getCurrentState();
      network = {
        ipAddress: state?.details?.ipAddress ?? null,
        macAddress: state?.details?.macAddress ?? null,
        connectionType: state?.type ?? 'unknown',
        downlink: state?.details?.downlink ?? null,
      };
    } catch {
      network = createEmptyNetwork();
    }
  } else {
    network = createEmptyNetwork();
  }

  const capabilities: DeviceInfo['capabilities'] = {
    hdr: (NativeModules as Record<string, any>)?.PlatformConstants?.supportsHDR ?? null,
    gpu: (NativeModules as Record<string, any>)?.PlatformConstants?.gpu ?? null,
  };

  return { network, capabilities };
};

// -------------------------------------------------------------
// Hook implementation
// -------------------------------------------------------------
export function useDeviceInfo(options: UseDeviceInfoOptions = {}): DeviceInfo {
  const enableExtendedData = options.enableExtendedData ?? false;
  const [screen, setScreen] = useState<ScreenMetrics>(() => getScreenMetrics());
  const [colorScheme, setColorScheme] = useState<DeviceInfo['appearance']['colorScheme']>(() => getColorScheme());
  const [contrast, setContrast] = useState<ContrastPreference>(() => getContrastPreference());
  const [reducedMotion, setReducedMotionState] = useState<boolean>(false);
  const [locale, setLocale] = useState<LocaleState>(() => detectLocale());
  const [input, setInput] = useState<InputState>(() => getInputState());
  const [extended, setExtended] = useState<ExtendedDataState>(() =>
    enableExtendedData
      ? { network: createEmptyNetwork(), capabilities: createEmptyCapabilities() }
      : {}
  );
  const [ready, setReady] = useState<boolean>(false);
  const [updatedAt, setUpdatedAt] = useState(() => Date.now());

  // Safe area values reactively update when the provider changes
  const safeAreaInsets = useContext(SafeAreaInsetsContext) ?? DEFAULT_SAFE_AREA;

  // Update screen metrics (width/height/orientation)
  useEffect(() => {
    const handler = ({ window }: { window: ScreenMetrics }) => {
      setScreen({
        width: window.width,
        height: window.height,
        scale: window.scale,
        fontScale: window.fontScale ?? PixelRatio.getFontScale?.() ?? window.scale,
      });
    };

    const subscription = Dimensions.addEventListener('change', handler);
    return () => {
      // RN returns an object with remove, RNW returns function
      if (typeof (subscription as unknown as { remove?: () => void }).remove === 'function') {
        (subscription as unknown as { remove: () => void }).remove();
      } else if (typeof (subscription as unknown as (() => void)) === 'function') {
        (subscription as unknown as () => void)();
      }
    };
  }, []);

  // Appearance (color scheme + contrast) listeners
  useEffect(() => {
    const colorSubscription = Appearance?.addChangeListener?.(({ colorScheme: scheme }) => {
      setColorScheme(scheme === 'light' || scheme === 'dark' ? scheme : 'no-preference');
    });

    const mediaListeners: Array<{ mq: MediaQueryList; handler: () => void }> = [];
    let boldSubscription: EmitterSubscription | undefined;

    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      const mediaQueries = ['(prefers-contrast: more)', '(prefers-contrast: less)'];
      mediaQueries.forEach((query) => {
        const mq = window.matchMedia(query);
        const handler = () => setContrast(getContrastPreference());
        mq.addEventListener?.('change', handler);
        mediaListeners.push({ mq, handler });
      });
    } else if (typeof AccessibilityInfo?.addEventListener === 'function') {
      boldSubscription = AccessibilityInfo.addEventListener('boldTextChanged', (enabled: boolean) => {
        setContrast(enabled ? 'more' : 'no-preference');
      });
    }

    return () => {
      colorSubscription?.remove?.();
      mediaListeners.forEach(({ mq, handler }) => mq.removeEventListener?.('change', handler));
      boldSubscription?.remove?.();
    };
  }, []);

  // Reduced motion + font scale updates
  useEffect(() => {
    let isMounted = true;
    let reduceMotionSub: EmitterSubscription | undefined;
    let mediaListener: { mq: MediaQueryList; handler: () => void } | undefined;

    getReducedMotion().then((value) => {
      if (isMounted) setReducedMotionState(Boolean(value));
    });

    if (typeof AccessibilityInfo?.addEventListener === 'function') {
      reduceMotionSub = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled: boolean) => {
        setReducedMotionState(Boolean(enabled));
      });
    } else if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const handler = () => setReducedMotionState(mq.matches);
      mq.addEventListener?.('change', handler);
      mediaListener = { mq, handler };
    }

    return () => {
      isMounted = false;
      reduceMotionSub?.remove?.();
      mediaListener?.mq.removeEventListener?.('change', mediaListener.handler);
    };
  }, []);

  // Pointer/input detection listeners (web only)
  useEffect(() => {
    if (Platform.OS !== 'web' || !canUseDOM()) return;
  const update = () => setInput(getInputState());

  const events = ['pointerdown', 'mousemove', 'touchstart', 'keydown'];
  events.forEach((eventName) => window.addEventListener(eventName, update));

    const pointerMediaQueries = ['(pointer: fine)', '(pointer: coarse)'].map((query) => window.matchMedia?.(query)).filter(Boolean) as MediaQueryList[];
    pointerMediaQueries.forEach((mq) => mq.addEventListener?.('change', update));

    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, update));
      pointerMediaQueries.forEach((mq) => mq.removeEventListener?.('change', update));
    };
  }, []);

  // Locale change listener (web only)
  useEffect(() => {
    if (Platform.OS !== 'web' || !canUseDOM()) return;
    const handler = () => setLocale(detectLocale());
    window.addEventListener('languagechange', handler);
    return () => window.removeEventListener('languagechange', handler);
  }, []);

  // Extended data (network + capabilities). This is a genuine async data-fetch
  // effect — marking readiness here (and in the promise handlers below) is the
  // correct pattern, so the synchronous setReady is intentional.
  useEffect(() => {
    if (!enableExtendedData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- async data-fetch orchestration
      setReady(true);
      return;
    }
    let cancelled = false;
    fetchExtendedData()
      .then((result) => {
        if (cancelled) return;
        setExtended(result);
        setReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        setExtended({ network: createEmptyNetwork(), capabilities: createEmptyCapabilities() });
        setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [enableExtendedData]);

  // Update timestamp whenever relevant measurements change. The value is an
  // impure Date.now() reading captured as a side effect of those changes, so it
  // genuinely belongs in an effect.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- timestamp captured on change
    setUpdatedAt(Date.now());
  }, [screen, colorScheme, contrast, reducedMotion, locale, input, safeAreaInsets, extended, ready]);

  // Compose the final object with memoization for referential stability
  const deviceInfo = useMemo<DeviceInfo>(() => {
    const runtime = detectRuntime();
    const system = detectSystem(screen);
    const orientation = orientationFromMetrics(screen);

    const screenInfo: DeviceInfo['screen'] = {
      width: screen.width,
      height: screen.height,
      scale: screen.scale,
      fontScale: screen.fontScale,
      orientation,
    };

    const appearance: DeviceInfo['appearance'] = {
      colorScheme,
      contrast,
      reducedMotion,
      fontScale: screen.fontScale,
    };

    const safeArea = {
      top: safeAreaInsets.top ?? 0,
      bottom: safeAreaInsets.bottom ?? 0,
      left: safeAreaInsets.left ?? 0,
      right: safeAreaInsets.right ?? 0,
    };

    const platformFlags = {
      isWeb: Platform.OS === 'web',
      isNative: Platform.OS !== 'web',
      isIOS: Platform.OS === 'ios',
      isAndroid: Platform.OS === 'android',
    };

    const derived = {
      isTablet: system.device.type === 'tablet',
      isPhone: system.device.type === 'phone',
      isDesktop: system.device.type === 'desktop',
      isTV: system.device.type === 'tv',
      isConsole: system.device.type === 'console',
      isWearable: system.device.type === 'wearable',
    };

    const platform = {
      ...platformFlags,
      isMobile: derived.isPhone || derived.isTablet,
      isTablet: derived.isTablet,
      isPhone: derived.isPhone,
      isDesktop: derived.isDesktop,
      isConsole: derived.isConsole,
      isTV: derived.isTV,
      isWearable: derived.isWearable,
    } satisfies DeviceInfo['platform'];

    const helpers: DeviceInfo['helpers'] = {
      isPhone: derived.isPhone,
      isTablet: derived.isTablet,
      isMobile: derived.isPhone || derived.isTablet,
      isDesktop: derived.isDesktop,
      isDarkMode: appearance.colorScheme === 'dark',
      isLandscape: orientation === 'landscape',
      getOS: () => system.os.name ?? 'unknown',
      getBrand: () => system.device.brand ?? null,
    };

    return {
      runtime,
      system,
      screen: screenInfo,
      locale,
      appearance,
      input,
      safeArea,
      network: extended.network,
      capabilities: extended.capabilities,
      platform,
      helpers,
      meta: {
        updatedAt,
        ready,
      },
    };
  }, [screen, colorScheme, contrast, reducedMotion, locale, input, safeAreaInsets, extended, ready, updatedAt]);

  return deviceInfo;
}

export default useDeviceInfo;

/**
 * Example Usage:
 *
 * const info = useDeviceInfo({ enableExtendedData: true });
 * console.log(`Running on ${info.system.os.name} with a ${info.system.device.type}`);
 */
