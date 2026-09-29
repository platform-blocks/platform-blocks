/**
 * Pure environment readers behind `useDeviceInfo`. Nothing here subscribes to
 * anything; the stores in `./stores` decide when to call these again.
 */
import { Appearance, Dimensions, NativeModules, Platform } from 'react-native';

import { hasDOM, isAndroid, isIOS, isWeb } from '../../core/platform/flags';
import type {
  ColorSchemePreference,
  ConnectionType,
  ContrastPreference,
  DeviceInfo,
  DeviceType,
  ExtendedDataState,
  InputState,
  LocaleState,
  ScreenMetrics,
} from './types';

declare const HermesInternal:
  | undefined
  | {
      getRuntimeProperties?: () => Record<string, string>;
    };

/**
 * The raw platform name. The flags in core/platform cover web/iOS/Android;
 * this also names out-of-tree platforms (`macos`, `windows`) for `system.os`.
 */
// eslint-disable-next-line no-restricted-syntax -- the raw OS name is the data being reported
const OS_NAME: string = Platform.OS;

// -------------------------------------------------------------
// Typed views of loosely-typed platform objects
// -------------------------------------------------------------

interface NetInfoStateShape {
  type?: string;
  details?: {
    ipAddress?: string | null;
    macAddress?: string | null;
    downlink?: number | null;
  } | null;
}

/** The optional native modules this file probes. All may be absent. */
interface NativeModulesShape {
  SettingsManager?: { settings?: { AppleLocale?: unknown; AppleLanguages?: unknown } | null } | null;
  I18nManager?: {
    localeIdentifier?: unknown;
    getConstants?: () => { is24Hour?: unknown } | null | undefined;
  } | null;
  RNCNetInfo?: { getCurrentState?: () => Promise<NetInfoStateShape | null | undefined> } | null;
  PlatformConstants?: { supportsHDR?: unknown; gpu?: unknown } | null;
}

/** `Platform.constants` keys read across iOS, Android and out-of-tree platforms. */
interface PlatformConstantsShape {
  Release?: string;
  SystemVersion?: string;
  interfaceIdiom?: string;
  UIUserInterfaceIdiom?: string;
  brand?: string;
  Brand?: string;
  model?: string;
  Device?: string;
  isTesting?: boolean;
  isEmulator?: boolean;
}

interface UserAgentData {
  brands?: Array<{ brand: string; version: string }>;
  platform?: string;
  model?: string;
}

// Read on every call (not cached): tests and polyfills swap these objects.
const nativeModules = (): NativeModulesShape => NativeModules as unknown as NativeModulesShape;
const platformConstants = (): PlatformConstantsShape | undefined =>
  Platform.constants as unknown as PlatformConstantsShape | undefined;

const nonEmptyString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim().length > 0 ? value : undefined;
const stringOrNull = (value: unknown): string | null => (typeof value === 'string' ? value : null);
const booleanOrNull = (value: unknown): boolean | null => (typeof value === 'boolean' ? value : null);

const matchesMedia = (query: string): boolean => {
  if (!hasDOM || typeof window.matchMedia !== 'function') return false;
  try {
    return window.matchMedia(query).matches;
  } catch {
    return false;
  }
};

// -------------------------------------------------------------
// Screen
// -------------------------------------------------------------

/** Pixel density and font scale (width/height come from the viewport store). */
export const readPixelMetrics = (): Pick<ScreenMetrics, 'scale' | 'fontScale'> => {
  try {
    const dims = Dimensions.get('window');
    return { scale: dims?.scale ?? 1, fontScale: dims?.fontScale ?? 1 };
  } catch {
    return { scale: 1, fontScale: 1 };
  }
};

export const orientationFromMetrics = (metrics: ScreenMetrics): 'portrait' | 'landscape' =>
  metrics.width >= metrics.height ? 'landscape' : 'portrait';

// -------------------------------------------------------------
// User agent (web)
// -------------------------------------------------------------

export interface UserAgentInfo {
  browserName: string | null;
  browserVersion: string | null;
  osName: string | null;
  osVersion: string | null;
  deviceBrand: string | null;
  deviceModel: string | null;
  deviceType: DeviceType;
}

/** What the user agent tells us before there is one (native, server rendering, hydration). */
export const EMPTY_USER_AGENT: UserAgentInfo = Object.freeze({
  browserName: null,
  browserVersion: null,
  osName: null,
  osVersion: null,
  deviceBrand: null,
  deviceModel: null,
  deviceType: 'unknown',
});

const BROWSER_MATCHERS = [
  { name: 'Edge', regex: /Edg\/(\d+[.\d+]*)/ },
  { name: 'Chrome', regex: /Chrome\/(\d+[.\d+]*)/ },
  { name: 'Firefox', regex: /Firefox\/(\d+[.\d+]*)/ },
  { name: 'Safari', regex: /Version\/(\d+[.\d+]*)\s+Safari/ },
  { name: 'Opera', regex: /OPR\/(\d+[.\d+]*)/ },
];

const OS_MATCHERS = [
  { name: 'iOS', regex: /iP(hone|ad|od).*OS\s([\d_]+)/ },
  { name: 'Android', regex: /Android\s([\d.]+)/ },
  { name: 'Windows', regex: /Windows NT\s([\d.]+)/ },
  { name: 'macOS', regex: /Mac OS X\s([\d_]+)/ },
  { name: 'Linux', regex: /Linux/ },
];

const BRAND_MAP: Array<{ key: RegExp; value: string }> = [
  { key: /apple/, value: 'Apple' },
  { key: /samsung/, value: 'Samsung' },
  { key: /google/, value: 'Google' },
  { key: /huawei/, value: 'Huawei' },
  { key: /oneplus/, value: 'OnePlus' },
  { key: /microsoft/, value: 'Microsoft' },
];

export const parseUserAgent = (): UserAgentInfo => {
  if (!hasDOM || typeof navigator === 'undefined') return EMPTY_USER_AGENT;

  const ua = navigator.userAgent ?? '';
  const data = (navigator as Navigator & { userAgentData?: UserAgentData }).userAgentData;

  let browserName: string | null = null;
  let browserVersion: string | null = null;
  for (const matcher of BROWSER_MATCHERS) {
    const match = ua.match(matcher.regex);
    if (match) {
      browserName = matcher.name;
      browserVersion = match[1];
      break;
    }
  }

  if (!browserName && data?.brands?.length) {
    browserName = data.brands[0]?.brand ?? null;
    browserVersion = data.brands[0]?.version ?? null;
  }

  let osName: string | null = null;
  let osVersion: string | null = null;
  for (const matcher of OS_MATCHERS) {
    const match = ua.match(matcher.regex);
    if (match) {
      osName = matcher.name;
      osVersion = match[2] ?? match[1] ?? null;
      if (osVersion) osVersion = osVersion.replace(/_/g, '.');
      break;
    }
  }

  const uaLower = ua.toLowerCase();
  const detectType = (): DeviceType => {
    if (/tv|smarttv|appletv|shield/.test(uaLower)) return 'tv';
    if (/playstation|xbox|nintendo/.test(uaLower)) return 'console';
    if (/watch|wear/.test(uaLower)) return 'wearable';
    if (/ipad|tablet/.test(uaLower)) return 'tablet';
    if (/mobi|iphone|android/.test(uaLower)) return 'phone';
    return 'desktop';
  };

  return {
    browserName,
    browserVersion,
    osName,
    osVersion,
    deviceBrand: BRAND_MAP.find((entry) => entry.key.test(uaLower))?.value ?? null,
    deviceModel: data?.model ?? null,
    deviceType: detectType(),
  };
};

// The user agent doesn't change during a session: parse it once.
let cachedUserAgent: UserAgentInfo | null = null;
export const getUserAgentInfo = (): UserAgentInfo => {
  if (!hasDOM) return EMPTY_USER_AGENT;
  if (!cachedUserAgent) cachedUserAgent = parseUserAgent();
  return cachedUserAgent;
};

// -------------------------------------------------------------
// Locale
// -------------------------------------------------------------

/** Deterministic locale for server rendering and hydration. */
export const SERVER_LOCALE: LocaleState = Object.freeze({
  language: 'en',
  region: 'US',
  full: 'en-US',
  timeZone: 'UTC',
  uses24HourClock: false,
});

export const detectLocale = (): LocaleState => {
  const modules = nativeModules();

  // Platform-specific locale identifiers first.
  const nativeLocale = (() => {
    const settings = modules?.SettingsManager?.settings;
    const appleLocale = nonEmptyString(settings?.AppleLocale);
    if (appleLocale) return appleLocale;
    const appleLanguages = settings?.AppleLanguages;
    if (Array.isArray(appleLanguages)) {
      const first = nonEmptyString(appleLanguages[0]);
      if (first) return first;
    }
    return nonEmptyString(modules?.I18nManager?.localeIdentifier);
  })();

  const browserLocale = (() => {
    if (typeof navigator === 'undefined' || !navigator) return undefined;
    const nav = navigator as Navigator & { userLanguage?: unknown };
    const language = nonEmptyString(nav.language);
    if (language) return language;
    if (Array.isArray(nav.languages) && nav.languages.length > 0) {
      const first = nonEmptyString(nav.languages[0]);
      if (first) return first;
    }
    return nonEmptyString(nav.userLanguage);
  })();

  const full = (nativeLocale ?? browserLocale ?? 'en-US').trim().replace(/_/g, '-');
  const [languagePart, regionPart] = full.split('-');

  const language = languagePart?.toLowerCase() || 'en';
  const region = regionPart ? regionPart.toUpperCase() : null;
  const timeZone = (() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';
    } catch {
      return 'UTC';
    }
  })();

  const uses24HourClock = (() => {
    const is24Hour = modules?.I18nManager?.getConstants?.()?.is24Hour;
    if (typeof is24Hour === 'boolean') return is24Hour;
    try {
      const formatter = new Intl.DateTimeFormat(undefined, { hour: 'numeric' });
      return !formatter.formatToParts(new Date()).some((part) => part.type === 'dayPeriod');
    } catch {
      return false;
    }
  })();

  return { language, region, full, timeZone, uses24HourClock };
};

export const localeEqual = (a: LocaleState, b: LocaleState): boolean =>
  a.full === b.full && a.timeZone === b.timeZone && a.uses24HourClock === b.uses24HourClock;

// -------------------------------------------------------------
// Input
// -------------------------------------------------------------

const NO_POINTERS: Array<'touch' | 'mouse' | 'pen'> = [];

/** Web input state before there is a DOM (server rendering, hydration). */
export const SERVER_INPUT: InputState = Object.freeze({
  primaryPointer: 'unknown',
  pointerTypes: NO_POINTERS,
  hasTouch: false,
  hasMouse: false,
  hasKeyboard: null,
});

const nativeInputState = (): InputState => {
  const touch = isIOS || isAndroid;
  return {
    primaryPointer: touch ? 'touch' : 'unknown',
    pointerTypes: touch ? ['touch'] : NO_POINTERS,
    hasTouch: touch,
    hasMouse: OS_NAME === 'macos' || OS_NAME === 'windows',
    hasKeyboard: null,
  };
};

/** Pointer capabilities. Web reads the pointer media queries; nothing here depends on the last event. */
export const getInputState = (): InputState => {
  if (!isWeb) return nativeInputState();
  if (!hasDOM) return SERVER_INPUT;

  const touchCapable =
    'ontouchstart' in window || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0);
  const finePointer = matchesMedia('(pointer: fine)');
  const coarsePointer = matchesMedia('(pointer: coarse)');

  const pointerTypes: Array<'touch' | 'mouse' | 'pen'> = [];
  if (touchCapable || coarsePointer) pointerTypes.push('touch');
  if (finePointer) pointerTypes.push('mouse');

  return {
    primaryPointer: pointerTypes[0] ?? 'unknown',
    pointerTypes,
    hasTouch: touchCapable,
    hasMouse: finePointer,
    hasKeyboard: typeof navigator !== 'undefined' && 'keyboard' in navigator ? true : null,
  };
};

export const inputStateEqual = (a: InputState, b: InputState): boolean =>
  a.primaryPointer === b.primaryPointer &&
  a.hasTouch === b.hasTouch &&
  a.hasMouse === b.hasMouse &&
  a.hasKeyboard === b.hasKeyboard &&
  a.pointerTypes.length === b.pointerTypes.length &&
  a.pointerTypes.every((type, index) => type === b.pointerTypes[index]);

// -------------------------------------------------------------
// Appearance
// -------------------------------------------------------------

export const CONTRAST_QUERIES = ['(prefers-contrast: more)', '(prefers-contrast: less)'] as const;

/** Web contrast preference from the media queries. */
export const getWebContrastPreference = (): ContrastPreference => {
  if (matchesMedia(CONTRAST_QUERIES[0])) return 'more';
  if (matchesMedia(CONTRAST_QUERIES[1])) return 'less';
  return 'no-preference';
};

export const getColorScheme = (): ColorSchemePreference => {
  const scheme = Appearance?.getColorScheme?.();
  // Newer React Native versions may report 'unspecified'.
  return scheme === 'light' || scheme === 'dark' ? scheme : 'no-preference';
};

// -------------------------------------------------------------
// Runtime & system
// -------------------------------------------------------------

export const detectRuntime = (ua: UserAgentInfo): DeviceInfo['runtime'] => {
  const { browserName, browserVersion } = ua;
  let jsEngine: DeviceInfo['runtime']['jsEngine'] = null;
  let engineVersion: string | null = null;

  if (typeof HermesInternal === 'object') {
    jsEngine = 'Hermes';
    try {
      engineVersion = HermesInternal?.getRuntimeProperties?.()?.['OSS Release Version'] ?? null;
    } catch {
      engineVersion = null;
    }
  } else if (isWeb) {
    jsEngine = browserName === 'Safari' ? 'JSC' : browserName ? 'V8' : null;
    engineVersion = browserVersion;
  } else {
    jsEngine = 'JSC';
  }

  return {
    platform: isWeb ? 'browser' : 'native',
    browserName,
    browserVersion,
    jsEngine,
    engineVersion,
  };
};

export const detectSystem = (metrics: ScreenMetrics, ua: UserAgentInfo): DeviceInfo['system'] => {
  const constants = platformConstants();

  const osName = isWeb ? ua.osName : isIOS ? 'iOS' : isAndroid ? 'Android' : OS_NAME;
  const osVersion = isWeb
    ? ua.osVersion
    : typeof Platform.Version === 'string'
      ? Platform.Version
      : Platform.Version != null
        ? String(Platform.Version)
        : null;

  let deviceType: DeviceType = 'unknown';
  if (isWeb) {
    deviceType = ua.deviceType;
    if (deviceType === 'desktop' && metrics.width <= 1024) {
      deviceType = metrics.width <= 768 ? 'tablet' : 'desktop';
    }
  } else {
    const idiom = constants?.interfaceIdiom ?? constants?.UIUserInterfaceIdiom;
    if (Platform.isTV) deviceType = 'tv';
    else if (idiom === 'tablet' || (Platform as { isPad?: boolean }).isPad) deviceType = 'tablet';
    else deviceType = 'phone';
  }

  return {
    os: {
      name: osName ?? null,
      version: osVersion ?? null,
      buildId: constants?.Release ?? constants?.SystemVersion ?? null,
    },
    device: {
      type: deviceType,
      brand: isWeb ? ua.deviceBrand : constants?.brand ?? constants?.Brand ?? (isIOS ? 'Apple' : null),
      model: isWeb ? ua.deviceModel : constants?.model ?? constants?.Device ?? null,
      isVirtual: constants?.isTesting ?? constants?.isEmulator ?? undefined,
    },
  };
};

// -------------------------------------------------------------
// Extended data (network + capabilities)
// -------------------------------------------------------------

export const EMPTY_EXTENDED: ExtendedDataState = Object.freeze({
  network: Object.freeze({ ipAddress: null, macAddress: null, connectionType: 'unknown' as const, downlink: null }),
  capabilities: Object.freeze({ hdr: null, gpu: null }),
});

const normalizeConnection = (value: string | undefined): ConnectionType => {
  if (!value) return 'unknown';
  if (value === 'wifi' || value === 'ethernet' || value === 'cellular') return value;
  if (['2g', '3g', '4g', '5g', 'slow-2g'].includes(value)) return 'cellular';
  return 'unknown';
};

const fetchWebGpuInfo = async (): Promise<string | null> => {
  if (!hasDOM) return null;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    if (!gl) return null;
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return null;
    return stringOrNull(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
  } catch {
    return null;
  }
};

export const fetchExtendedData = async (): Promise<ExtendedDataState> => {
  if (isWeb) {
    const connection =
      typeof navigator !== 'undefined'
        ? (navigator as Navigator & { connection?: { effectiveType?: string; downlink?: number } }).connection
        : undefined;
    return {
      network: {
        ipAddress: null,
        macAddress: null,
        connectionType: normalizeConnection(connection?.effectiveType),
        downlink: connection?.downlink ?? null,
      },
      capabilities: {
        hdr: hasDOM && typeof window.matchMedia === 'function' ? matchesMedia('(dynamic-range: high)') : null,
        gpu: await fetchWebGpuInfo(),
      },
    };
  }

  const modules = nativeModules();
  let network: DeviceInfo['network'] = EMPTY_EXTENDED.network;
  const netInfo = modules?.RNCNetInfo;
  if (netInfo && typeof netInfo.getCurrentState === 'function') {
    try {
      const state = await netInfo.getCurrentState();
      network = {
        ipAddress: state?.details?.ipAddress ?? null,
        macAddress: state?.details?.macAddress ?? null,
        connectionType: normalizeConnection(state?.type),
        downlink: state?.details?.downlink ?? null,
      };
    } catch {
      network = EMPTY_EXTENDED.network;
    }
  }

  return {
    network,
    capabilities: {
      hdr: booleanOrNull(modules?.PlatformConstants?.supportsHDR),
      gpu: stringOrNull(modules?.PlatformConstants?.gpu),
    },
  };
};
