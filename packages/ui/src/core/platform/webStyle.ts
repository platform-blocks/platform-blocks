import type { ViewStyle } from 'react-native';

import { isWeb } from './flags';

type CssLength = number | string;

/** CSS `border-style` keywords (RN's `borderStyle` only models solid/dotted/dashed, view-wide). */
export type WebBorderLineStyle =
  | 'none'
  | 'hidden'
  | 'solid'
  | 'dashed'
  | 'dotted'
  | 'double'
  | 'groove'
  | 'ridge'
  | 'inset'
  | 'outset';

/**
 * Web-only style properties React Native's `ViewStyle` doesn't model (or
 * models narrowly). Pass them through `webStyle()` — they are dropped on
 * native, so they can sit in a shared style array without `as any`.
 */
export interface WebStyle {
  cursor?:
    | 'auto'
    | 'default'
    | 'pointer'
    | 'text'
    | 'move'
    | 'grab'
    | 'grabbing'
    | 'not-allowed'
    | 'wait'
    | 'progress'
    | 'help'
    | 'crosshair'
    | 'zoom-in'
    | 'zoom-out'
    | 'col-resize'
    | 'row-resize'
    | 'ew-resize'
    | 'ns-resize'
    | 'nesw-resize'
    | 'nwse-resize'
    | 'copy'
    | 'none'
    | 'inherit';
  userSelect?: 'auto' | 'none' | 'text' | 'contain' | 'all';
  WebkitUserSelect?: 'auto' | 'none' | 'text' | 'contain' | 'all';
  outline?: string;
  outlineStyle?: 'none' | 'solid' | 'dotted' | 'dashed' | 'double' | 'auto';
  outlineWidth?: CssLength;
  outlineColor?: string;
  outlineOffset?: CssLength;
  transition?: string;
  transitionProperty?: string;
  transitionDuration?: string;
  transitionTimingFunction?: string;
  transitionDelay?: string;
  animationName?: string | object | object[];
  animationDuration?: string;
  animationTimingFunction?: string;
  animationIterationCount?: number | 'infinite';
  animationDirection?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  animationFillMode?: 'none' | 'forwards' | 'backwards' | 'both';
  animationDelay?: string;
  position?: 'absolute' | 'relative' | 'static' | 'fixed' | 'sticky';
  top?: CssLength;
  bottom?: CssLength;
  left?: CssLength;
  right?: CssLength;
  inset?: CssLength;
  boxShadow?: string;
  /**
   * Per-side border styles. `borderStartStyle` / `borderEndStyle` are logical
   * (react-native-web emits `border-inline-start/end-style`, RTL-aware).
   */
  borderTopStyle?: WebBorderLineStyle;
  borderBottomStyle?: WebBorderLineStyle;
  borderLeftStyle?: WebBorderLineStyle;
  borderRightStyle?: WebBorderLineStyle;
  borderStartStyle?: WebBorderLineStyle;
  borderEndStyle?: WebBorderLineStyle;
  backdropFilter?: string;
  WebkitBackdropFilter?: string;
  filter?: string;
  pointerEvents?: 'auto' | 'none' | 'box-none' | 'box-only';
  touchAction?: string;
  overscrollBehavior?: 'auto' | 'contain' | 'none';
  overflowX?: 'visible' | 'hidden' | 'scroll' | 'auto' | 'clip';
  overflowY?: 'visible' | 'hidden' | 'scroll' | 'auto' | 'clip';
  scrollbarWidth?: 'auto' | 'thin' | 'none';
  scrollBehavior?: 'auto' | 'smooth';
  scrollSnapType?: string;
  /** e.g. `'center'`, `'start end'`. */
  scrollSnapAlign?: string;
  scrollSnapStop?: 'normal' | 'always';
  /** iOS Safari long-press callout. */
  WebkitTouchCallout?: 'default' | 'none';
  /** Tap flash color (mobile WebKit / Chrome). */
  WebkitTapHighlightColor?: string;
  willChange?: string;
  contain?: string;
  visibility?: 'visible' | 'hidden' | 'collapse';
  whiteSpace?: 'normal' | 'nowrap' | 'pre' | 'pre-wrap' | 'pre-line' | 'break-spaces';
  wordBreak?: 'normal' | 'break-all' | 'keep-all' | 'break-word';
  overflowWrap?: 'normal' | 'break-word' | 'anywhere';
  textOverflow?: 'clip' | 'ellipsis';
  caretColor?: string;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
  appearance?: 'none' | 'auto';
  boxSizing?: 'border-box' | 'content-box';
  display?: 'flex' | 'none' | 'block' | 'inline' | 'inline-block' | 'inline-flex' | 'grid' | 'contents';
  backgroundImage?: string;
  backgroundClip?: string;
  WebkitBackgroundClip?: string;
  WebkitTextFillColor?: string;
  maskImage?: string;
  WebkitMaskImage?: string;
  isolation?: 'auto' | 'isolate';
  mixBlendMode?: string;
  zIndex?: number;
}

const EMPTY: ViewStyle = Object.freeze({}) as ViewStyle;

/**
 * `style` on web, `{}` on native. Typed as `ViewStyle` so it drops into any
 * style array: `style={[styles.row, webStyle({ cursor: 'pointer', userSelect: 'none' })]}`.
 */
export function webStyle(style: WebStyle): ViewStyle {
  return isWeb ? (style as unknown as ViewStyle) : EMPTY;
}

/** `style` on native, `{}` on web — the counterpart of `webStyle`. */
export function nativeStyle(style: ViewStyle): ViewStyle {
  return isWeb ? EMPTY : style;
}
