/**
 * Web-only props react-native-web forwards to the DOM, declared on React
 * Native's prop types so library code can pass them without `as any`.
 * On native these props are ignored; build them with `webProps()` so they are
 * not even passed there.
 *
 * This is a `.d.ts` inside `src`, so it type-checks the library but is not
 * emitted into `lib` — it never augments a consumer's React Native types.
 */
import 'react-native';

import type { WebDataSet, WebKeyboardEvent, WebMouseEvent } from './webProps';

declare module 'react-native' {
  interface ViewProps {
    /** Web only: rendered as `data-*` attributes. */
    dataSet?: WebDataSet;
    /**
     * Web only. Not called on `TextInput`: react-native-web replaces it with its
     * own keydown handler and reports keys through `onKeyPress` (whose event is
     * the DOM KeyboardEvent on web) — handle text-field keys there.
     */
    onKeyDown?: (event: WebKeyboardEvent) => void;
    /** Web only. */
    onKeyUp?: (event: WebKeyboardEvent) => void;
    /** Web only. Prefer Pressable `onHoverIn` / `useHover`. */
    onMouseEnter?: (event: WebMouseEvent) => void;
    /** Web only. Prefer Pressable `onHoverOut` / `useHover`. */
    onMouseLeave?: (event: WebMouseEvent) => void;
    /** Web only. */
    lang?: string;
    /** Web only. */
    dir?: 'ltr' | 'rtl' | 'auto';
  }

  interface TextProps {
    /** Web only: rendered as `data-*` attributes. */
    dataSet?: WebDataSet;
    /** Web only. */
    onKeyDown?: (event: WebKeyboardEvent) => void;
    /** Web only. */
    onMouseEnter?: (event: WebMouseEvent) => void;
    /** Web only. */
    onMouseLeave?: (event: WebMouseEvent) => void;
    /** Web only. */
    href?: string;
    /** Web only. */
    hrefAttrs?: { target?: string; rel?: string; download?: boolean | string };
    /** Web only. */
    lang?: string;
    /** Web only. */
    dir?: 'ltr' | 'rtl' | 'auto';
  }
}
