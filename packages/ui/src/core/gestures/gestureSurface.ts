import { Platform } from 'react-native';
import type { ViewStyle } from 'react-native';
import type { DragAxis } from './types';

export interface GestureSurfaceStyleOptions {
  /**
   * Directions the surface consumes. `both` (default) hands the surface every
   * direction, which is what a knob, joystick or XY pad needs. `x` / `y` leave
   * the perpendicular direction to the page so a full-width horizontal control
   * does not become a dead band for vertical scrolling.
   */
  axis?: DragAxis;
  /**
   * When false the surface behaves like ordinary content: the page scrolls
   * normally and text stays selectable. Use for `disabled` / `readOnly`.
   */
  enabled?: boolean;
  /** Web cursor for the idle surface. */
  cursor?: string;
  /** Allow text selection inside the surface (default false). */
  selectable?: boolean;
}

const TOUCH_ACTION_BY_AXIS: Record<DragAxis, string> = {
  both: 'none',
  // A horizontal control still permits vertical page panning, and vice versa.
  x: 'pan-y',
  y: 'pan-x',
};

/**
 * Style props every draggable control should spread onto the View that owns its
 * pan responder.
 *
 * `touch-action` is the load-bearing one. Without it the browser owns the touch
 * as soon as the finger crosses its scroll slop — which is exactly the reported
 * bug: press a Slider, drift a few pixels above or below it, and the page starts
 * scrolling while the drag is still live. Setting it on the surface means the
 * browser never claims the touch in the first place, so the drag survives the
 * finger wandering anywhere on screen.
 *
 * The properties are web-only; native ignores them, so this returns an empty
 * object off web rather than shipping dead style keys into the RN style diff.
 */
export const getGestureSurfaceStyle = (
  options: GestureSurfaceStyleOptions = {}
): ViewStyle => {
  if (Platform.OS !== 'web') return {};

  const { axis = 'both', enabled = true, cursor, selectable = false } = options;

  if (!enabled) {
    return cursor ? ({ cursor } as ViewStyle) : {};
  }

  return {
    touchAction: TOUCH_ACTION_BY_AXIS[axis],
    ...(selectable ? null : {
      userSelect: 'none',
      WebkitUserSelect: 'none',
      // Suppresses the iOS long-press callout/magnifier on a held control.
      WebkitTouchCallout: 'none',
      // Kills the grey tap flash Android Chrome paints over the control.
      WebkitTapHighlightColor: 'transparent',
    }),
    ...(cursor ? { cursor } : null),
  } as ViewStyle;
};

/**
 * PanResponder options that keep a value drag from being stolen mid-gesture.
 *
 * - `onPanResponderTerminationRequest: false` — a scroll container asking to
 *   take over gets told no, so an iOS `ScrollView` cannot yank the gesture away
 *   once the finger drifts off-axis.
 * - `onShouldBlockNativeResponder: true` — on Android this is what triggers
 *   `requestDisallowInterceptTouchEvent` on the enclosing native scroll view.
 *
 * Spread these into every `PanResponder.create` config for a control whose drag
 * should outrank scrolling.
 */
export const GESTURE_RESPONDER_LOCK = {
  onPanResponderTerminationRequest: () => false,
  onShouldBlockNativeResponder: () => true,
} as const;
