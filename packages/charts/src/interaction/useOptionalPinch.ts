// Optional pinch support. The built-in two-touch distance math (fed into
// usePanZoom's startPinch/updatePinch) is the default and works with zero extra
// dependencies. react-native-gesture-handler, when installed, can be opted into
// for more robust multi-touch — but we NEVER hard-depend on it (matching how the
// ui package treats it) and never assume a GestureHandlerRootView is mounted.

/** Euclidean distance between the first two active touches, or null. */
export function touchDistance(rawEvent: any): number | null {
  const touches = rawEvent?.nativeEvent?.touches ?? rawEvent?.touches;
  if (!touches || touches.length < 2) return null;
  const dx = touches[1].pageX - touches[0].pageX;
  const dy = touches[1].pageY - touches[0].pageY;
  return Math.hypot(dx, dy);
}

/** Midpoint (page space) between the first two active touches, or null. */
export function touchCenter(rawEvent: any): { x: number; y: number } | null {
  const touches = rawEvent?.nativeEvent?.touches ?? rawEvent?.touches;
  if (!touches || touches.length < 2) return null;
  return {
    x: (touches[0].pageX + touches[1].pageX) / 2,
    y: (touches[0].pageY + touches[1].pageY) / 2,
  };
}

let cachedRNGH: any | null | undefined;

/**
 * Lazily resolve react-native-gesture-handler if present. Returns null when not
 * installed. Callers must degrade to the built-in two-touch path in that case.
 */
export function resolveGestureHandler(): any | null {
  if (cachedRNGH !== undefined) return cachedRNGH;
  try {
    cachedRNGH = require('react-native-gesture-handler');
  } catch {
    cachedRNGH = null;
  }
  return cachedRNGH;
}
