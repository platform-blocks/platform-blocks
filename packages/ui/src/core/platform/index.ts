/**
 * Platform helpers (DESIGN §2).
 *
 * - flags: `isWeb`, `isNative`, `isIOS`, `isAndroid`, `hasDOM`
 * - `webStyle()` / `WebStyle`: web-only style properties, `{}` on native
 * - `webProps()` / `WebProps`: web-only DOM props (onKeyDown, dataSet, …), `{}` on native
 *
 * `react-native-web.d.ts` (next to this file) declares the web-only props on
 * React Native's `ViewProps` / `TextProps` / `TextInputProps`, so they can be
 * passed to RN components without `as any`.
 */
export { isWeb, isNative, isIOS, isAndroid, hasDOM } from './flags';
export { webStyle, nativeStyle } from './webStyle';
export type { WebStyle, WebBorderLineStyle } from './webStyle';
export { webProps } from './webProps';
export type { WebProps, WebKeyboardEvent, WebMouseEvent, WebDataSet } from './webProps';
