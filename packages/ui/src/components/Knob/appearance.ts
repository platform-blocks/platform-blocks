import type { PlatformBlocksTheme } from '../../core/theme/types';
import type {
  KnobAppearance,
  KnobVariant,
  KnobRingSegment,
  KnobRingShadow,
  KnobPointerStyle,
  KnobTickLayer,
  KnobThumbShape,
  KnobThumbStyle,
  KnobBehavior,
  KnobPanningConfig,
} from './types';
import { buildKnobVariantAppearance, mergeKnobAppearance } from './variants';

const clampNumber = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const getDefaultRingThickness = (size: number) => {
  const derived = Math.round(size * 0.04);
  return clampNumber(derived, 3, 14);
};

const getDefaultThumbSize = (size: number) => Math.max(12, Math.round(size * 0.18));

/** How much the thumb grows while the knob is being scrubbed. */
const DEFAULT_THUMB_ACTIVE_SCALE = 1.25;

export type ResolvedRingStyle = {
  thickness: number;
  color: string;
  trailColor: string;
  backgroundColor: string;
  cap: 'butt' | 'round';
  radiusOffset: number;
  shadow?: KnobRingShadow;
  segments: KnobRingSegment[];
  segmentMode: 'track' | 'progress';
};

export type ResolvedFillStyle = {
  color: string;
  borderWidth: number;
  borderColor: string;
  radiusOffset: number;
};

export type ResolvedThumbStyle = {
  size: number;
  activeScale: number;
  color: string;
  shape: KnobThumbShape;
  strokeWidth: number;
  strokeColor: string;
  offset: number;
  glow?: KnobThumbStyle['glow'];
  style?: KnobThumbStyle['style'];
  renderThumb?: KnobThumbStyle['renderThumb'];
};

export type ResolvedProgressStyle = {
  mode: 'none' | 'contiguous' | 'split';
  color: string;
  trailColor: string;
  roundedCaps: boolean;
  thickness: number;
};

export type ResolvedKnobAppearance = {
  ring: ResolvedRingStyle;
  fill: ResolvedFillStyle | null;
  thumb: ResolvedThumbStyle | null;
  progress: ResolvedProgressStyle | null;
  pointer: (KnobPointerStyle & { visible: boolean }) | null;
  ticks: KnobTickLayer[];
  panning: KnobPanningConfig | null;
};

export interface ResolveAppearanceOptions {
  appearance?: KnobAppearance;
  /** Visual preset merged *under* `appearance`. */
  variant?: KnobVariant;
  theme: PlatformBlocksTheme;
  behavior: KnobBehavior;
  disabled: boolean;
  size: number;
  thumbSize?: number;
  accentColor?: string;
}

const pickAccentColor = (
  theme: PlatformBlocksTheme,
  behavior: KnobBehavior,
  accentColor?: string
) => {
  if (accentColor) return accentColor;
  switch (behavior) {
    case 'status':
      return theme.colors.primary[5];
    case 'dual':
      return theme.colors.teal ? theme.colors.teal[5] : theme.colors.primary[5];
    default:
      return theme.colors.primary[5];
  }
};

export const resolveKnobAppearance = ({
  appearance: appearanceProp,
  variant,
  theme,
  behavior,
  disabled,
  size,
  thumbSize,
  accentColor,
}: ResolveAppearanceOptions): ResolvedKnobAppearance => {
  const derivedThumbSize = thumbSize ?? getDefaultThumbSize(size);
  const ringThicknessBase = getDefaultRingThickness(size);
  const highlightColor = pickAccentColor(theme, behavior, accentColor);

  // The variant only supplies defaults, so it goes underneath everything the caller passed.
  const appearance = mergeKnobAppearance(
    buildKnobVariantAppearance(variant, { theme, size, accentColor: highlightColor, disabled }),
    appearanceProp
  );

  const resolvedRingThickness = appearance?.ring?.thickness ?? ringThicknessBase;
  const ringColorFallback = disabled ? theme.colors.gray[4] : theme.colors.gray[3];

  const ring: ResolvedRingStyle = {
    thickness: resolvedRingThickness,
    color: appearance?.ring?.color ?? ringColorFallback,
    trailColor:
      appearance?.ring?.trailColor ?? (disabled ? theme.colors.gray[2] : theme.colors.gray[2]),
    backgroundColor: appearance?.ring?.backgroundColor ?? theme.backgrounds.surface,
    cap: appearance?.ring?.cap ?? 'round',
    radiusOffset: appearance?.ring?.radiusOffset ?? 0,
    shadow: appearance?.ring?.shadow,
    segments: (appearance?.ring?.segments ?? []).filter(
      (segment): segment is KnobRingSegment =>
        !!segment && Number.isFinite(segment.value) && segment.value > 0
    ),
    segmentMode: appearance?.ring?.segmentMode === 'progress' ? 'progress' : 'track',
  };

  const fill: ResolvedFillStyle | null = appearance?.fill === null
    ? null
    : {
        color:
          appearance?.fill?.color ??
          (behavior === 'status'
            ? theme.colors.surface?.[0] ?? theme.backgrounds.surface
            : theme.backgrounds.surface),
        borderWidth: appearance?.fill?.borderWidth ?? 0,
        borderColor: appearance?.fill?.borderColor ?? 'transparent',
        radiusOffset:
          appearance?.fill?.radiusOffset ?? -Math.max(4, Math.round(ring.thickness * 0.6)),
      };

  const thumb: ResolvedThumbStyle | null = appearance?.thumb === false
    ? null
    : {
        size: appearance?.thumb?.size ?? derivedThumbSize,
        activeScale: Number.isFinite(appearance?.thumb?.activeScale as number)
          ? Math.max(0, appearance!.thumb!.activeScale as number)
          : DEFAULT_THUMB_ACTIVE_SCALE,
        color: appearance?.thumb?.color ?? (disabled ? theme.colors.gray[4] : highlightColor),
        shape: appearance?.thumb?.shape ?? 'circle',
        strokeWidth: appearance?.thumb?.strokeWidth ?? 0,
        strokeColor: appearance?.thumb?.strokeColor ?? 'transparent',
        offset: appearance?.thumb?.offset ?? 0,
        glow: appearance?.thumb?.glow,
        style: appearance?.thumb?.style,
        renderThumb: appearance?.thumb?.renderThumb,
      };

  const progress: ResolvedProgressStyle | null = appearance?.progress === false
    ? null
    : {
        mode: appearance?.progress?.mode ?? 'none',
        color: appearance?.progress?.color ?? highlightColor,
        trailColor:
          appearance?.progress?.trailColor ?? appearance?.ring?.trailColor ?? ring.trailColor,
        roundedCaps: appearance?.progress?.roundedCaps ?? true,
        thickness: appearance?.progress?.thickness ?? ring.thickness,
      };

  // The arm is opt-in: the stock dial has none, and the variants that want one ask for it.
  // Anything falsy — omitted, `null`, or `false` — leaves it off.
  const pointerInput = appearance?.pointer;
  const pointer: (KnobPointerStyle & { visible: boolean }) | null = !pointerInput
    ? null
    : {
        ...pointerInput,
        visible: pointerInput.visible ?? true,
        color: pointerInput.color ?? (disabled ? theme.colors.gray[4] : highlightColor),
      };

  const ticksInput = appearance?.ticks;
  let ticks: KnobTickLayer[] = [];
  if (Array.isArray(ticksInput)) {
    ticks = ticksInput;
  } else if (ticksInput && typeof ticksInput !== 'boolean') {
    ticks = [ticksInput];
  }

  return {
    ring,
    fill,
    thumb,
    progress,
    pointer,
    ticks,
    panning: appearance?.panning ?? null,
  };
};
