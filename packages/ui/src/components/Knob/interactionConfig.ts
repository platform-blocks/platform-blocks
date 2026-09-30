import type { KnobInteractionConfig, KnobInteractionMode } from './types';

const clampNumber = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export type NormalizedInteractionConfig = {
  modes: KnobInteractionMode[];
  lockThresholdPx: number;
  variancePx: number;
  slideDominanceRatio: number;
  slideRatio: number;
  slideHysteresisPx: number;
  spinStopAtLimits: boolean;
  spinDeadZoneDegrees: number;
  spinPrecisionRadius?: number;
  respectStartSide: boolean;
  tapToSet: boolean;
  tapDeadRadiusRatio: number;
  scroll: { enabled: boolean; ratio: number; invert: boolean; preventPageScroll: boolean };
  onModeChange?: (mode: KnobInteractionMode | null) => void;
};

export const DEFAULT_INTERACTION_MODES: KnobInteractionMode[] = [
  'spin',
  'vertical-slide',
  'horizontal-slide',
];

export const normalizeInteractionConfig = (
  appearanceInteraction?: KnobInteractionConfig
): NormalizedInteractionConfig => {
  const config: KnobInteractionConfig = appearanceInteraction ?? {};
  const providedModes = Array.isArray(config.modes) ? config.modes : undefined;
  const normalizedModes = (providedModes && providedModes.length > 0
    ? providedModes
    : DEFAULT_INTERACTION_MODES
  ).filter(Boolean) as KnobInteractionMode[];
  const uniqueModes = Array.from(new Set(normalizedModes));
  if (uniqueModes.length === 0) {
    uniqueModes.push(...DEFAULT_INTERACTION_MODES);
  }

  const slideRatioRaw = config.slideRatio;
  const slideDominanceRaw = config.slideDominanceRatio;
  const lockThresholdRaw = config.lockThresholdPx;
  const varianceRaw = config.variancePx;
  const scrollConfig = config.scroll ?? {};
  const spinStopAtLimits = Boolean(config.spinStopAtLimits);
  const spinDeadZoneRaw = config.spinDeadZoneDegrees;
  const slideHysteresisRaw = config.slideHysteresisPx;
  const tapDeadRadiusRaw = config.tapDeadRadiusRatio;

  const scrollEnabled =
    scrollConfig.enabled !== undefined ? !!scrollConfig.enabled : uniqueModes.includes('scroll');

  const normalizedSlideRatio =
    typeof slideRatioRaw === 'number' && Number.isFinite(slideRatioRaw) && slideRatioRaw > 0
      ? slideRatioRaw
      : 2;
  const defaultSlideHysteresis = Math.max(0.5, Math.min(3, normalizedSlideRatio * 0.4));

  return {
    modes: uniqueModes,
    lockThresholdPx:
      typeof lockThresholdRaw === 'number' && Number.isFinite(lockThresholdRaw)
        ? Math.max(0, lockThresholdRaw)
        : 28,
    variancePx:
      typeof varianceRaw === 'number' && Number.isFinite(varianceRaw) ? Math.max(0, varianceRaw) : 6,
    slideDominanceRatio:
      typeof slideDominanceRaw === 'number' && Number.isFinite(slideDominanceRaw)
        ? Math.max(1, slideDominanceRaw)
        : 5.5,
    slideRatio: normalizedSlideRatio,
    slideHysteresisPx:
      typeof slideHysteresisRaw === 'number' && Number.isFinite(slideHysteresisRaw)
        ? Math.max(0, slideHysteresisRaw)
        : defaultSlideHysteresis,
    spinStopAtLimits,
    spinDeadZoneDegrees:
      typeof spinDeadZoneRaw === 'number' && Number.isFinite(spinDeadZoneRaw)
        ? Math.max(0, spinDeadZoneRaw)
        : 0.8,
    spinPrecisionRadius: config.spinPrecisionRadius,
    respectStartSide: config.respectStartSide === undefined ? true : Boolean(config.respectStartSide),
    tapToSet: config.tapToSet === undefined ? true : Boolean(config.tapToSet),
    tapDeadRadiusRatio:
      typeof tapDeadRadiusRaw === 'number' && Number.isFinite(tapDeadRadiusRaw)
        ? clampNumber(tapDeadRadiusRaw, 0, 1)
        : 0.15,
    scroll: {
      enabled: scrollEnabled,
      ratio:
        typeof scrollConfig.ratio === 'number' && Number.isFinite(scrollConfig.ratio)
          ? scrollConfig.ratio
          : 0.5,
      invert: Boolean(scrollConfig.invert),
      preventPageScroll:
        scrollConfig.preventPageScroll === undefined
          ? true
          : Boolean(scrollConfig.preventPageScroll),
    },
    onModeChange: config.onModeChange,
  };
};
