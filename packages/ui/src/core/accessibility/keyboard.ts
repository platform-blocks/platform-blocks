/** The fields of an RN-style `nativeEvent` the keyboard hooks read. */
interface NativeKeyFields {
  key?: string;
  code?: string;
  shiftKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  isComposing?: boolean;
}

/**
 * Minimal keyboard-event shape shared by the keyboard hooks. React DOM's
 * synthetic event (what react-native-web passes to `onKeyDown`, typed as
 * `WebKeyboardEvent` in core/platform) satisfies it, and so does an RN-style
 * `{ nativeEvent: { key } }` event, so handlers built from it can be spread
 * onto `View` / `Pressable` / `TextInput` without casts.
 */
export interface KeyboardEventLike {
  key?: string;
  code?: string;
  shiftKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  defaultPrevented?: boolean;
  nativeEvent?: unknown;
  preventDefault?: () => void;
  stopPropagation?: () => void;
}

export interface ReadKey {
  key: string;
  shift: boolean;
  ctrl: boolean;
  meta: boolean;
  alt: boolean;
  composing: boolean;
}

export function readKey(event: KeyboardEventLike): ReadKey {
  const native =
    event.nativeEvent && typeof event.nativeEvent === 'object' ? (event.nativeEvent as NativeKeyFields) : undefined;
  return {
    key: event.key ?? native?.key ?? event.code ?? native?.code ?? '',
    shift: !!(event.shiftKey ?? native?.shiftKey),
    ctrl: !!(event.ctrlKey ?? native?.ctrlKey),
    meta: !!(event.metaKey ?? native?.metaKey),
    alt: !!(event.altKey ?? native?.altKey),
    composing: !!native?.isComposing,
  };
}

/** Stops the browser's default for a handled key (page scroll, caret jump). */
export function consumeEvent(event: KeyboardEventLike): void {
  event.preventDefault?.();
  event.stopPropagation?.();
}

/** A host node that can take DOM focus (react-native-web host refs are DOM elements). */
export interface FocusableNode {
  focus?: (options?: { preventScroll?: boolean }) => void;
}

export function focusNode(node: unknown): void {
  const target = node as FocusableNode | null | undefined;
  if (target && typeof target.focus === 'function') target.focus();
}
