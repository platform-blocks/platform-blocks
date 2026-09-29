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
    /**
     * Whether animations should be reduced — the library's single source
     * (`useReducedMotion()`): the nearest `ReducedMotionProvider` override,
     * otherwise the OS preference. Always `false` during server rendering.
     */
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
    /** When this snapshot was built (ms since epoch); `0` during server rendering and hydration. */
    updatedAt: number;
    /**
     * `true` once live client values are in: `false` during server rendering
     * and hydration, and — with `enableExtendedData` — until the network and
     * capability data has loaded.
     */
    ready: boolean;
  };
}

export interface UseDeviceInfoOptions {
  /** Also load network and GPU/HDR capability data (async). @default false */
  enableExtendedData?: boolean;
}

export type ScreenMetrics = {
  width: number;
  height: number;
  scale: number;
  fontScale: number;
};

export type InputState = DeviceInfo['input'];
export type LocaleState = DeviceInfo['locale'];
export type ColorSchemePreference = DeviceInfo['appearance']['colorScheme'];
export type ContrastPreference = DeviceInfo['appearance']['contrast'];
export type ConnectionType = NonNullable<DeviceInfo['network']>['connectionType'];
export type DeviceType = DeviceInfo['system']['device']['type'];

export type ExtendedDataState = {
  network?: DeviceInfo['network'];
  capabilities?: DeviceInfo['capabilities'];
};
