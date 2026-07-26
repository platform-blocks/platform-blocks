import type { FC, ReactNode } from 'react';
import type { TextStyle, ViewStyle, StyleProp } from 'react-native';
import type { SpacingProps, LayoutProps } from '../../core/utils';
import type { ComponentSizeValue } from '../../core/theme/componentSize';

export interface KnobMark {
  /** Absolute value within the knob range to display */
  value: number;
  /** Optional label rendered near the tick */
  label?: ReactNode;
  /** Optional accent color applied when the mark becomes active */
  accentColor?: string;
  /** Optional icon surfaced by status-oriented variants */
  icon?: ReactNode;
}

/**
 * What kind of control the knob is — how it behaves and what it reads out, not how it
 * looks. Visual styling belongs to `variant` (and `appearance`).
 *
 * - `level` — plain bounded dial; the default
 * - `stepped` — snaps to `marks`
 * - `endless` — continuous encoder with no absolute angle→value mapping
 * - `dual` — primary readout in the centre plus a secondary line below
 * - `status` — discrete scenes: the active mark's icon and accent take over the centre
 */
export type KnobBehavior = 'level' | 'stepped' | 'endless' | 'dual' | 'status';

/**
 * How the knob looks. Variants set stroke weights, caps, body fill, and which indicator
 * carries the value; they take their colors from the theme and the accent rather than
 * shipping their own palettes. Every value is a default that `appearance` can override.
 *
 * - `default` — the stock dial: neutral ring, accent thumb, no arm
 * - `minimal` — hairline track and a small dot, no body or arm; for dense panels
 * - `digital` — a 128-segment collar that lights with the value; step-readout look
 * - `retro` — solid body with a bevel border and a stubby indicator arm, no rim dot
 * - `studio` — chunky track with a bright filled arc and an outlined rim dot
 */
export type KnobVariant = 'default' | 'minimal' | 'digital' | 'retro' | 'studio';

export type KnobValueLabelPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';

export interface KnobValueLabelConfig {
  /** Placement relative to the knob surface */
  position?: KnobValueLabelPosition;
  /** Primary formatter for the displayed value */
  formatter?: (value: number) => ReactNode;
  /** Optional prefix rendered before the value */
  prefix?: ReactNode;
  /** Optional suffix rendered after the value */
  suffix?: ReactNode;
  /** Style overrides for the wrapper */
  containerStyle?: StyleProp<ViewStyle>;
  /** Style overrides for the primary text */
  textStyle?: StyleProp<TextStyle>;
  /** Secondary readout rendered at an independent slot */
  secondary?: {
    formatter?: (value: number) => ReactNode;
    position?: KnobValueLabelPosition;
    prefix?: ReactNode;
    suffix?: ReactNode;
    containerStyle?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
  };
}

export type KnobInteractionMode = 'spin' | 'vertical-slide' | 'horizontal-slide' | 'scroll';

export interface KnobInteractionConfig {
  /** Enabled gesture modalities */
  modes?: KnobInteractionMode[];
  /** Distance in pixels before committing to a gesture */
  lockThresholdPx?: number;
  /** Allowable perpendicular wiggle while detecting slides */
  variancePx?: number;
  /** Required dominance ratio (primary axis vs secondary) before locking into slide */
  slideDominanceRatio?: number;
  /** Pixels of movement required for one degree of rotation */
  slideRatio?: number;
  /** Minimum pixel delta before slides update, filters jitter */
  slideHysteresisPx?: number;
  /** Prevent spin gestures from wrapping past min/max in bounded mode */
  spinStopAtLimits?: boolean;
  /** Ignore tiny spin deltas (degrees) to avoid jitter */
  spinDeadZoneDegrees?: number;
  /** Radius at which spin drags increase precision */
  spinPrecisionRadius?: number;
  /** Whether to mirror GarageBand-style sidedness rules */
  respectStartSide?: boolean;
  /**
   * Jump to the pressed angle on mouse-down and scrub from there for the rest of the
   * gesture. Defaults to `true`. Ignored in endless mode, where an angle has no absolute
   * value; knobs without `'spin'` fall back to setting the value on release.
   */
  tapToSet?: boolean;
  /**
   * Fraction of the knob radius around the centre where presses are ignored, because the
   * angle there is dominated by a few pixels of noise. Defaults to `0.15`.
   */
  tapDeadRadiusRatio?: number;
  /** Mouse/trackpad scroll behavior */
  scroll?: {
    enabled?: boolean;
    ratio?: number;
    invert?: boolean;
    preventPageScroll?: boolean;
  };
  /** Gesture change callback */
  onModeChange?: (mode: KnobInteractionMode | null) => void;
}

export interface KnobRingShadow {
  color?: string;
  offsetX?: number;
  offsetY?: number;
  blur?: number;
  opacity?: number;
}

/**
 * One band of a segmented ring, in the spirit of `Progress.Section`: segments are laid end
 * to end from `min`, each covering `value` units of the knob's own range. Any range the
 * segments leave uncovered keeps the plain ring color.
 */
export interface KnobRingSegment {
  /** Span of this band in value units (for a 0–100 knob these read as percentages) */
  value: number;
  /** Band color. Defaults to the ring color. */
  color?: string;
  /** Band thickness. Defaults to the ring thickness. */
  thickness?: number;
}

export interface KnobRingStyle {
  thickness?: number;
  color?: string;
  trailColor?: string;
  backgroundColor?: string;
  cap?: 'butt' | 'round';
  radiusOffset?: number;
  shadow?: KnobRingShadow;
  /** Colored bands drawn over the ring, laid end to end from `min`. */
  segments?: KnobRingSegment[];
  /**
   * How `segments` relate to the current value.
   *
   * - `'track'` (default) paints every band across the whole ring as a static backdrop —
   *   zones you read the value against, with the progress arc drawn over the top.
   * - `'progress'` makes the bands the progress arc itself: they are clipped at the current
   *   value and nothing is drawn beyond it, so the dial fills through each color in turn.
   *   The plain progress stroke is suppressed, since the bands replace it.
   */
  segmentMode?: 'track' | 'progress';
}

export interface KnobFillStyle {
  color?: string;
  borderWidth?: number;
  borderColor?: string;
  radiusOffset?: number;
}

export type KnobThumbShape = 'circle' | 'pill' | 'square';

export interface KnobThumbGlow {
  color?: string;
  blur?: number;
  intensity?: number;
}

export interface KnobThumbRenderContext {
  value: number;
  angle: number;
  size: number;
  /** True while the knob is being dragged, so custom thumbs can show their own press state. */
  isScrubbing: boolean;
}

export interface KnobThumbStyle {
  size?: number;
  /**
   * Scale applied to the thumb while the knob is being scrubbed, as press feedback.
   * `1` disables it; values below 1 shrink instead. @default 1.25
   */
  activeScale?: number;
  shape?: KnobThumbShape;
  color?: string;
  strokeWidth?: number;
  strokeColor?: string;
  offset?: number;
  glow?: KnobThumbGlow;
  style?: StyleProp<ViewStyle>;
  renderThumb?: (context: KnobThumbRenderContext) => ReactNode;
}

export type KnobTickSource = 'marks' | 'steps' | 'values' | 'count';
export type KnobTickShape = 'dot' | 'line' | 'icon' | 'custom';

export interface KnobTickLabelConfig {
  show?: boolean;
  formatter?: (mark: KnobMark, index: number) => ReactNode;
  position?: 'inner' | 'center' | 'outer';
  offset?: number;
  style?: StyleProp<TextStyle>;
}

/** What a per-tick color resolver is told about the tick it is being asked to color. */
export interface KnobTickColorContext {
  /** The value this tick sits at. */
  value: number;
  /** Index within the layer, in ascending value order. */
  index: number;
  /** Angle the tick is drawn at, in degrees. */
  angle: number;
  /** Whether the layer's `activeMode` counts this tick as lit. */
  isActive: boolean;
  /** The mark the tick came from — only for `source: 'marks'`. */
  mark?: KnobMark;
}

/**
 * One color for the whole layer, or a resolver called per tick so every tick can differ.
 * Returning `undefined` from the resolver falls through to the usual defaults.
 */
export type KnobTickColor = string | ((context: KnobTickColorContext) => string | undefined);

export interface KnobTickLayer {
  source?: KnobTickSource;
  values?: number[];
  /**
   * With `source: 'count'`, how many evenly spaced ticks to lay around the arc — an LED
   * ring of a fixed resolution, independent of `step` and `marks`. Capped at 512.
   */
  count?: number;
  shape?: KnobTickShape;
  length?: number;
  width?: number;
  radiusOffset?: number;
  position?: 'inner' | 'center' | 'outer';
  /**
   * Color of an active tick. A resolver colors each tick individually; for
   * `source: 'marks'`, a mark's own `accentColor` is used ahead of a flat string, so
   * per-detent colors need no resolver at all.
   */
  color?: KnobTickColor;
  /** Color of a tick the layer's `activeMode` leaves unlit. Also accepts a resolver. */
  inactiveColor?: KnobTickColor;
  /**
   * What counts as an active tick in this layer.
   *
   * - `'fill'` (default) lights every tick from `min` up to the current value, the way a
   *   meter fills.
   * - `'nearest'` lights only the single tick the pointer is aimed at, the way a selector
   *   or detent indicator reads. Matched by angle, so it works on endless knobs too.
   */
  activeMode?: 'fill' | 'nearest';
  iconName?: string;
  label?: KnobTickLabelConfig;
  renderTick?: (context: {
    value: number;
    angle: number;
    index: number;
    isActive: boolean;
    center: { x: number; y: number };
    radius: number;
  }) => ReactNode;
}

export interface KnobPointerStyle {
  visible?: boolean;
  length?: number;
  width?: number;
  offset?: number;
  color?: string;
  cap?: 'round' | 'butt';
  counterweight?: { size?: number; color?: string };
}

export interface KnobArcConfig {
  startAngle?: number;
  sweepAngle?: number;
  direction?: 'cw' | 'ccw';
  clampInput?: boolean;
  wrap?: boolean;
}

export type KnobProgressMode = 'none' | 'contiguous' | 'split';

export interface KnobProgressConfig {
  mode?: KnobProgressMode;
  color?: string;
  trailColor?: string;
  roundedCaps?: boolean;
  thickness?: number;
}

export interface KnobPanningConfig {
  pivotValue?: number;
  positiveColor?: string;
  negativeColor?: string;
  showZeroIndicator?: boolean;
  valueFormatter?: (value: number) => string | ReactNode;
  mirrorThumbOffset?: boolean;
}

export interface KnobAppearance {
  /**
   * Take the knob's accent — thumb, arm, and progress arc — from the `accentColor` of the
   * mark nearest the current value, so the whole control matches the detent it is on.
   * `behavior="status"` already does this; this opts any other behavior in. Marks without
   * an `accentColor` leave the theme accent in place. @default false
   */
  accentFromMarks?: boolean;
  ring?: KnobRingStyle;
  fill?: KnobFillStyle;
  thumb?: KnobThumbStyle | false;
  ticks?: KnobTickLayer | KnobTickLayer[] | false;
  pointer?: KnobPointerStyle | false;
  arc?: KnobArcConfig;
  progress?: KnobProgressConfig | false;
  panning?: KnobPanningConfig;
  interaction?: KnobInteractionConfig;
}

export interface KnobProps extends SpacingProps, LayoutProps {
  /** What kind of control this is: how it behaves and what it reads out. @default 'level' */
  behavior?: KnobBehavior;
  /**
   * Visual style preset. Merged under `appearance`, so single properties stay overridable.
   * Behavior values (`level`, `stepped`, …) still work here at runtime but are deprecated —
   * pass them to `behavior` instead. @default 'default'
   */
  variant?: KnobVariant;
  /** Interaction mode for bounded or endless rotary behavior */
  mode?: 'bounded' | 'endless';
  /** Controlled value */
  value?: number;
  /** Uncontrolled initial value */
  defaultValue?: number;
  /** Minimum selectable value */
  min?: number;
  /** Maximum selectable value */
  max?: number;
  /** Step increment applied when interacting */
  step?: number;
  /** Called on every value change */
  onChange?: (value: number) => void;
  /** Called after interaction completes */
  onChangeEnd?: (value: number) => void;
  /** Fired when the user begins dragging */
  onScrubStart?: () => void;
  /** Fired when the user ends dragging */
  onScrubEnd?: () => void;
  /** Size token (`xs`–`3xl`) or an explicit diameter in pixels */
  size?: ComponentSizeValue;
  /** Diameter of the thumb indicator, in pixels. Defaults to a ratio of the resolved size. */
  thumbSize?: number;
  /** Disable all user interaction */
  disabled?: boolean;
  /** Prevent interaction but keep visual state */
  readOnly?: boolean;
  /** Custom formatter for the value label */
  formatLabel?: (value: number) => ReactNode;
  /** Render the value label inside the knob */
  withLabel?: boolean;
  /** Structured configuration for the value label block */
  valueLabel?: KnobValueLabelConfig | false;
  /** Optional marks rendered around the control */
  marks?: KnobMark[];
  /** Restrict interaction to the supplied marks */
  restrictToMarks?: boolean;
  /** Optional visual label rendered outside the knob */
  label?: ReactNode;
  /** Optional helper text rendered with the label */
  description?: ReactNode;
  /** Placement for the external label */
  labelPosition?: 'left' | 'right' | 'top' | 'bottom';
  /** Style overrides for the outer container */
  style?: StyleProp<ViewStyle>;
  /** Style overrides for the circular track */
  trackStyle?: StyleProp<ViewStyle>;
  /** Style overrides for the thumb */
  thumbStyle?: StyleProp<ViewStyle>;
  /** Style overrides for mark labels */
  markLabelStyle?: StyleProp<TextStyle>;
  /** Accessibility identifier */
  testID?: string;
  /** Screen reader label */
  accessibilityLabel?: string;
  /** Unified surface styling and interaction overrides */
  appearance?: KnobAppearance;
}

export interface KnobRootProps extends KnobProps {
  /** Modular children composed of Knob.* sub-components */
  children?: ReactNode;
}

export interface KnobFillPartProps extends KnobFillStyle {
  visible?: boolean;
}

export interface KnobRingPartProps extends KnobRingStyle {
  visible?: boolean;
}

export interface KnobRingSegmentPartProps extends KnobRingSegment {
  visible?: boolean;
}

export interface KnobProgressPartProps extends KnobProgressConfig {
  visible?: boolean;
}

export type KnobTickLayerPartProps = KnobTickLayer;

export interface KnobPointerPartProps extends KnobPointerStyle {
  enabled?: boolean;
}

export interface KnobThumbPartProps extends KnobThumbStyle {
  visible?: boolean;
}

export interface KnobValueLabelPartProps extends KnobValueLabelConfig {
  visible?: boolean;
}

export type KnobPartKind =
  | 'fill'
  | 'ring'
  | 'ringSegment'
  | 'progress'
  | 'tick'
  | 'pointer'
  | 'thumb'
  | 'valueLabel';

export type KnobPartEntry =
  | { kind: 'fill'; props: KnobFillPartProps; order: number }
  | { kind: 'ring'; props: KnobRingPartProps; order: number }
  | { kind: 'ringSegment'; props: KnobRingSegmentPartProps; order: number }
  | { kind: 'progress'; props: KnobProgressPartProps; order: number }
  | { kind: 'tick'; props: KnobTickLayerPartProps; order: number }
  | { kind: 'pointer'; props: KnobPointerPartProps; order: number }
  | { kind: 'thumb'; props: KnobThumbPartProps; order: number }
  | { kind: 'valueLabel'; props: KnobValueLabelPartProps; order: number };

export type KnobPartComponent<P> = FC<P> & {
  __knobPartKind: KnobPartKind;
};
