export type { DragAxis, DragPoint, DragGestureCallback, DragGestureCallbackArgs } from './types';
export {
  getGestureSurfaceStyle,
  GESTURE_RESPONDER_LOCK,
  type GestureSurfaceStyleOptions,
} from './gestureSurface';
export {
  acquirePageScrollLock,
  releasePageScrollLock,
  resetPageScrollLock,
  getPageScrollLockCount,
} from './pageScrollLock';
export {
  acquireTextSelectionLock,
  releaseTextSelectionLock,
  resetTextSelectionLock,
  getTextSelectionLockCount,
} from './textSelectionLock';
export {
  useDragGesture,
  type UseDragGestureOptions,
  type UseDragGestureResult,
} from './useDragGesture';
