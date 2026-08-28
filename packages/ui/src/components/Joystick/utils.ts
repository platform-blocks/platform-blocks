import type { JoystickShape, JoystickValue } from './types';

export const clampUnit = (value: number): number => (
  value < -1 ? -1 : value > 1 ? 1 : value
);

/**
 * Constrains a raw position to the control's shape.
 *
 * `circle` clamps the magnitude, so the handle rides the rim at full deflection
 * in every direction — the behaviour of a physical stick. `square` clamps each
 * axis on its own, letting the corners reach (±1, ±1), which is what an XY pad
 * needs so every combination of the two parameters is reachable.
 */
export const clampToShape = (
  x: number,
  y: number,
  shape: JoystickShape
): JoystickValue => {
  if (shape === 'square') {
    return { x: clampUnit(x), y: clampUnit(y) };
  }
  const magnitude = Math.sqrt(x * x + y * y);
  if (magnitude <= 1 || magnitude === 0) {
    return { x, y };
  }
  return { x: x / magnitude, y: y / magnitude };
};

/**
 * Zeroes small deflections and rescales what is left, so the value still spans
 * the full −1…1 range past the threshold instead of jumping to `deadZone`.
 * Without the rescale a stick with a dead zone can never report a value below it.
 */
export const applyDeadZone = (
  value: JoystickValue,
  deadZone: number,
  shape: JoystickShape
): JoystickValue => {
  if (deadZone <= 0) return value;
  const limit = Math.min(deadZone, 0.99);

  if (shape === 'square') {
    const rescale = (component: number) => {
      const magnitude = Math.abs(component);
      if (magnitude <= limit) return 0;
      return Math.sign(component) * ((magnitude - limit) / (1 - limit));
    };
    return { x: rescale(value.x), y: rescale(value.y) };
  }

  const magnitude = Math.sqrt(value.x * value.x + value.y * value.y);
  if (magnitude <= limit) return { x: 0, y: 0 };
  const scaled = ((magnitude - limit) / (1 - limit)) / magnitude;
  return { x: value.x * scaled, y: value.y * scaled };
};

/** Snaps a single axis to `step`, then re-clamps (rounding can overshoot ±1). */
export const snapToStep = (value: number, step: number): number => {
  if (!step || step <= 0) return value;
  return clampUnit(Math.round(value / step) * step);
};

/** Kills float dust like `0.30000000000000004` in reported values and labels. */
export const roundValue = (value: number, precision: number = 4): number => {
  const factor = 10 ** precision;
  const rounded = Math.round(value * factor) / factor;
  // Inverting the Y axis turns a centred `0` into `-0`, which serializes oddly
  // and is not `Object.is`-equal to `0` — enough to defeat a consumer's memo.
  return rounded === 0 ? 0 : rounded;
};

export const valuesEqual = (a: JoystickValue, b: JoystickValue): boolean => (
  a.x === b.x && a.y === b.y
);

export interface ResolveJoystickValueOptions {
  shape: JoystickShape;
  deadZone: number;
  step: number;
  lockAxis?: 'x' | 'y';
  invertY: boolean;
}

/**
 * Turns a raw pointer offset from the centre, already divided by the travel
 * radius, into the value the component reports.
 */
export const resolveJoystickValue = (
  rawX: number,
  rawY: number,
  options: ResolveJoystickValueOptions
): JoystickValue => {
  const { shape, deadZone, step, lockAxis, invertY } = options;

  const lockedX = lockAxis === 'y' ? 0 : rawX;
  const lockedY = lockAxis === 'x' ? 0 : rawY;

  const clamped = clampToShape(lockedX, lockedY, shape);
  const withDeadZone = applyDeadZone(clamped, deadZone, shape);

  // Screen Y grows downward; `invertY` (the default) flips it so pushing the
  // stick up reports a positive Y, the way a gamepad axis reads.
  const orientedY = invertY ? -withDeadZone.y : withDeadZone.y;

  return {
    x: roundValue(snapToStep(withDeadZone.x, step)),
    y: roundValue(snapToStep(orientedY, step)),
  };
};

/** Value → on-screen offset in screen space (Y down), in normalized units. */
export const valueToOffset = (value: JoystickValue, invertY: boolean): JoystickValue => ({
  x: clampUnit(value.x),
  y: clampUnit(invertY ? -value.y : value.y),
});
