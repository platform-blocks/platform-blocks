import type { GestureResponderEvent, PanResponderGestureState } from 'react-native';

/**
 * Which directions a gesture surface consumes.
 *
 * On web this maps to `touch-action`, which is what actually decides whether the
 * browser is allowed to scroll the page out from under a drag:
 *
 * - `both` → `none`  (surface owns every direction; the page never scrolls)
 * - `x`    → `pan-y` (vertical page scroll still works, horizontal drags are ours)
 * - `y`    → `pan-x` (horizontal page scroll still works, vertical drags are ours)
 */
export type DragAxis = 'x' | 'y' | 'both';

/** A pointer sample expressed in the gesture surface's own coordinate space. */
export interface DragPoint {
  /** Pointer X relative to the surface's left edge, in px. */
  x: number;
  /** Pointer Y relative to the surface's top edge, in px. */
  y: number;
  /** Surface width captured for this gesture, in px. */
  width: number;
  /** Surface height captured for this gesture, in px. */
  height: number;
  /** Travel on X since the gesture started, in px. */
  dx: number;
  /** Travel on Y since the gesture started, in px. */
  dy: number;
  /** Straight-line travel since the gesture started, in px. */
  distance: number;
  /** Raw page coordinates as reported by the responder event. */
  pageX: number;
  pageY: number;
  /** True for the sample delivered by `onStart`. */
  isFirst: boolean;
  /** True for the sample delivered by `onEnd`. */
  isFinal: boolean;
}

export interface DragGestureCallbackArgs {
  event: GestureResponderEvent;
  state: PanResponderGestureState | null;
}

export type DragGestureCallback = (point: DragPoint, args: DragGestureCallbackArgs) => void;
