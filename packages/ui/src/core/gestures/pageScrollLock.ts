import { Platform } from 'react-native';

/**
 * Web-only page-scroll lock held for the duration of a value drag.
 *
 * Why this exists: react-native-web's responder system registers its
 * `touchmove` listener on `document` without `{ passive: false }`, so the
 * `preventDefault()` a component calls from `onPanResponderMove` is a no-op in
 * every modern browser. Dragging a Slider/Knob/Joystick therefore let the page
 * scroll underneath the gesture as soon as the finger drifted off the control.
 *
 * `touch-action: none` on the surface (see `getGestureSurfaceStyle`) is the
 * primary fix — it stops the browser from ever starting a scroll for touches
 * that begin on the control. This lock is the second line of defence for the
 * cases CSS cannot cover: the touch began on a descendant that re-enabled
 * `touch-action`, a browser that latched a scroll before the responder was
 * granted, or a drag that started as a mouse gesture and picked up a stray
 * touch. The lock is taken on responder *grant*, i.e. at `touchstart`, which is
 * early enough that the first `touchmove` is cancellable and no scroll has begun.
 *
 * Ref-counted so nested/simultaneous drags (a Slider inside a dragging Dialog)
 * release cleanly, and always paired with an unmount-safe release in
 * `useDragGesture`.
 */

type SavedStyles = {
  bodyOverscroll: string;
  htmlOverscroll: string;
};

let lockCount = 0;
let saved: SavedStyles | null = null;

const isWeb = () => Platform.OS === 'web' && typeof document !== 'undefined';

const preventTouchMove = (event: TouchEvent) => {
  // Multi-finger gestures are pinch-zoom, which we never own — let them through
  // so a drag on a control cannot trap an accessibility zoom.
  if (event.touches && event.touches.length > 1) return;
  if (event.cancelable) event.preventDefault();
};

/** Take (or increment) the page-scroll lock. No-op off web. */
export const acquirePageScrollLock = (): void => {
  if (!isWeb()) return;
  lockCount += 1;
  if (lockCount > 1) return;

  const body = document.body;
  const html = document.documentElement;
  saved = {
    bodyOverscroll: body?.style.overscrollBehavior ?? '',
    htmlOverscroll: html?.style.overscrollBehavior ?? '',
  };
  // Stops iOS rubber-banding / Chrome pull-to-refresh from firing when the drag
  // reaches the top or bottom of the viewport.
  if (body) body.style.overscrollBehavior = 'none';
  if (html) html.style.overscrollBehavior = 'none';
  document.addEventListener('touchmove', preventTouchMove, { passive: false });
};

/** Release (or decrement) the page-scroll lock. No-op off web. */
export const releasePageScrollLock = (): void => {
  if (!isWeb()) return;
  if (lockCount === 0) return;
  lockCount -= 1;
  if (lockCount > 0) return;

  document.removeEventListener('touchmove', preventTouchMove);
  const body = document.body;
  const html = document.documentElement;
  if (body) body.style.overscrollBehavior = saved?.bodyOverscroll ?? '';
  if (html) html.style.overscrollBehavior = saved?.htmlOverscroll ?? '';
  saved = null;
};

/**
 * Drop the lock regardless of depth. Only for teardown paths that cannot know
 * how many acquisitions leaked (hot reload, error boundaries, tests).
 */
export const resetPageScrollLock = (): void => {
  if (lockCount === 0) return;
  lockCount = 1;
  releasePageScrollLock();
};

/** Current lock depth. Exposed for tests. */
export const getPageScrollLockCount = (): number => lockCount;
