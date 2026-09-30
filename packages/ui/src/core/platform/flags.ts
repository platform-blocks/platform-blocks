import { Platform } from 'react-native';

/**
 * Platform flags for library code.
 *
 * Prefer these over repeating `Platform.OS === 'web'` checks. For DOM access
 * use `hasDOM`, never `typeof window !== 'undefined'`: React Native defines a
 * global `window` too, so that test is true on iOS and Android.
 */
export const isWeb = Platform.OS === 'web';
export const isNative = !isWeb;
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

/** True when a DOM `document` exists (web, not during static rendering). */
export const hasDOM = isWeb && typeof document !== 'undefined';
