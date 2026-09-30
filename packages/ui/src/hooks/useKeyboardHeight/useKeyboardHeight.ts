import { useSyncExternalStore } from 'react';
import { Keyboard } from 'react-native';

import { hasDOM, isIOS, isWeb } from '../../core/platform/flags';
import { useKeyboardMetricsOptional } from '../../core/providers/KeyboardManagerProvider';

export interface UseKeyboardHeightOptions {
  /** Set to `false` to stop tracking; the hook then returns 0. @default true */
  enabled?: boolean;
}

/**
 * Overlaps smaller than this are not an on-screen keyboard: a desktop
 * horizontal scrollbar (which the visual viewport excludes and `innerHeight`
 * includes), or the thin shortcut bar iOS shows with a hardware keyboard.
 */
const WEB_MIN_KEYBOARD_HEIGHT = 60;

type Listener = () => void;

// One set of platform listeners shared by every consumer, attached while at
// least one is subscribed (same shape as core/responsive/viewportStore).
const listeners = new Set<Listener>();
let height = 0;
let detach: (() => void) | null = null;

function update(next: number): void {
  const rounded = Math.max(0, Math.round(next));
  if (rounded === height) return;
  height = rounded;
  listeners.forEach((listener) => listener());
}

/**
 * How much of the layout viewport the keyboard covers on the web. iOS Safari
 * and Chrome for Android shrink only the visual viewport when the keyboard
 * opens; multiplying by `scale` keeps a pinch-zoom from reading as a keyboard.
 */
function readWebKeyboardHeight(viewport: VisualViewport): number {
  const overlap = window.innerHeight - viewport.height * viewport.scale;
  return overlap >= WEB_MIN_KEYBOARD_HEIGHT ? overlap : 0;
}

/** The native keyboard's current height, when it is already up. */
function readNativeKeyboardHeight(): number {
  const keyboard = Keyboard as { isVisible?: () => boolean; metrics?: () => { height: number } | undefined };
  if (typeof keyboard.isVisible === 'function' && !keyboard.isVisible()) return 0;
  return typeof keyboard.metrics === 'function' ? (keyboard.metrics()?.height ?? 0) : 0;
}

function attach(): () => void {
  if (isWeb) {
    const viewport = hasDOM ? window.visualViewport : null;
    if (!viewport) return () => {};
    // No emit: React reads the snapshot again right after subscribing.
    height = Math.round(readWebKeyboardHeight(viewport));
    const onResize = () => update(readWebKeyboardHeight(viewport));
    viewport.addEventListener('resize', onResize);
    return () => viewport.removeEventListener('resize', onResize);
  }

  height = Math.round(readNativeKeyboardHeight());
  // iOS announces the move before it animates (`will`); Android only after (`did`).
  const show = Keyboard.addListener(isIOS ? 'keyboardWillShow' : 'keyboardDidShow', (event) => {
    update(event?.endCoordinates?.height ?? 0);
  });
  const hide = Keyboard.addListener(isIOS ? 'keyboardWillHide' : 'keyboardDidHide', () => update(0));
  return () => {
    show.remove();
    hide.remove();
  };
}

function subscribeKeyboard(listener: Listener): () => void {
  listeners.add(listener);
  if (!detach) detach = attach();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && detach) {
      detach();
      detach = null;
      height = 0;
    }
  };
}

const subscribeNothing = () => () => {};
const getHeight = () => height;
const getServerHeight = () => 0;

/**
 * The height, in pixels, of the on-screen keyboard currently covering the
 * app, or 0 when it's hidden. Use it to keep a footer, a floating button or a
 * sheet above the keyboard.
 *
 * - Native: follows the keyboard show / hide events. Inside a
 *   `KeyboardManagerProvider` it reads the provider's metrics instead of
 *   adding listeners of its own.
 * - Web: the part of the layout viewport the keyboard covers, from
 *   `visualViewport` (mobile browsers). Desktop browsers report 0.
 *
 * All instances share one set of listeners. Hydration-safe: static rendering
 * and the hydration pass see 0.
 *
 * @example
 * const keyboardHeight = useKeyboardHeight();
 * return <View style={{ paddingBottom: keyboardHeight }}>…</View>;
 */
export function useKeyboardHeight(options: UseKeyboardHeightOptions = {}): number {
  const { enabled = true } = options;
  const metrics = useKeyboardMetricsOptional();
  // The provider only listens to React Native's Keyboard module, which has no
  // events on the web; there the visual viewport is the source.
  const fromProvider = !isWeb && metrics !== null;

  const storeHeight = useSyncExternalStore(
    enabled && !fromProvider ? subscribeKeyboard : subscribeNothing,
    getHeight,
    getServerHeight
  );

  if (!enabled) return 0;
  if (fromProvider) return metrics.isKeyboardVisible ? metrics.keyboardHeight : 0;
  return storeHeight;
}
