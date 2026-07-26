import {
  resolveComponentSize,
  type ComponentSize,
  type ComponentSizeValue,
} from '../../core/theme/componentSize';
import { clamp } from './utils/math';

/** Smallest diameter that still leaves room for the ring, ticks, and thumb. */
export const MIN_KNOB_SIZE = 60;

/** Token → diameter in pixels. `md` matches the historical numeric default of 120. */
export const KNOB_SIZE_SCALE: Record<ComponentSize, number> = {
  xs: 72,
  sm: 96,
  md: 120,
  lg: 160,
  xl: 200,
  '2xl': 240,
  '3xl': 288,
};

/** Resolves a size token or raw pixel diameter to the diameter the knob renders at. */
export const resolveKnobSize = (value: ComponentSizeValue | undefined): number => {
  const resolved = resolveComponentSize(value, KNOB_SIZE_SCALE, { fallback: 'md' });
  return Number.isFinite(resolved) ? Math.max(MIN_KNOB_SIZE, resolved) : KNOB_SIZE_SCALE.md;
};

/**
 * Diameter → font size for the primary value readout. It used to be a flat 12px at every
 * diameter, which disappears inside a 200px dial. Scaling keeps the readout proportional to
 * the knob it sits in; the clamp stops the smallest knobs from overflowing their inner disk
 * and the largest from turning the number into a billboard.
 */
export const getKnobValueLabelFontSize = (size: number): number =>
  clamp(Math.round(size * 0.13), 13, 32);

/** Font size for secondary readouts and prefix/suffix affixes, kept in step with the primary. */
export const getKnobSecondaryLabelFontSize = (size: number): number =>
  Math.max(11, Math.round(getKnobValueLabelFontSize(size) * 0.7));
