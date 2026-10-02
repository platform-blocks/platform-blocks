import { isWeb } from './flags';

/**
 * The subset of a DOM keyboard event library handlers read. React DOM's
 * `KeyboardEvent` (what react-native-web passes) satisfies it.
 */
export interface WebKeyboardEvent {
  key: string;
  code?: string;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  repeat?: boolean;
  defaultPrevented?: boolean;
  preventDefault(): void;
  stopPropagation(): void;
  nativeEvent?: unknown;
  target?: unknown;
  currentTarget?: unknown;
}

/** The subset of a DOM mouse event library handlers read. */
export interface WebMouseEvent {
  clientX?: number;
  clientY?: number;
  button?: number;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  defaultPrevented?: boolean;
  preventDefault(): void;
  stopPropagation(): void;
  nativeEvent?: unknown;
  target?: unknown;
  currentTarget?: unknown;
}

/** Values for `dataSet` — rendered as `data-*` attributes by react-native-web (keys camelCase → kebab-case). */
export type WebDataSet = Record<string, string | number | boolean | undefined>;

/**
 * Web-only DOM props react-native-web forwards from `View`, `Pressable`,
 * `Text` and `TextInput`. Declared on RN's prop types by
 * `core/platform/react-native-web.d.ts`, so they type-check without `as any`.
 */
export interface WebProps {
  onKeyDown?: (event: WebKeyboardEvent) => void;
  onKeyUp?: (event: WebKeyboardEvent) => void;
  onMouseEnter?: (event: WebMouseEvent) => void;
  onMouseLeave?: (event: WebMouseEvent) => void;
  onMouseDown?: (event: WebMouseEvent) => void;
  onMouseUp?: (event: WebMouseEvent) => void;
  onClick?: (event: WebMouseEvent) => void;
  tabIndex?: 0 | -1;
  dataSet?: WebDataSet;
  id?: string;
  href?: string;
  hrefAttrs?: { target?: string; rel?: string; download?: boolean | string };
  lang?: string;
  dir?: 'ltr' | 'rtl' | 'auto';
}

const EMPTY: WebProps = Object.freeze({}) as WebProps;

/**
 * The given web-only props on web, `{}` on native, with `undefined` entries
 * dropped. Spread onto any RN host component:
 *
 * ```tsx
 * <View {...webProps({ onKeyDown, tabIndex: 0, dataSet: { plocksInput: 'true' } })} />
 * ```
 */
export function webProps(props: WebProps): WebProps {
  if (!isWeb) return EMPTY;
  const out: WebProps = {};
  for (const key of Object.keys(props) as (keyof WebProps)[]) {
    const value = props[key];
    if (value !== undefined) (out as Record<string, unknown>)[key] = value;
  }
  return out;
}
