import type { TooltipConfig, TooltipPropValue } from './types';

/**
 * Normalizes a host component's `tooltip` prop into `Tooltip` props.
 *
 * Lets every component expose one prop that accepts the shorthand string
 * (`tooltip="Copy"`) or the full config (`tooltip={{ label: 'Copy', position: 'right' }}`)
 * without each one re-implementing the union. `defaults` carries the host's own
 * legacy props (e.g. `tooltipPosition`) and always loses to explicit config keys.
 *
 * Returns `null` when there is nothing to show, so callers can skip the wrapper.
 */
export function resolveTooltipProps(
  tooltip: TooltipPropValue | undefined,
  defaults?: Partial<TooltipConfig>
): TooltipConfig | null {
  if (tooltip === undefined || tooltip === null || tooltip === false) {
    return null;
  }

  if (typeof tooltip === 'string' || typeof tooltip === 'number') {
    const label = String(tooltip);
    return label.length > 0 ? { ...defaults, label } : null;
  }

  if (typeof tooltip === 'object') {
    const merged = { ...defaults, ...tooltip } as TooltipConfig;
    // `label` is the only required piece; without it there is nothing to render.
    return merged.label === undefined || merged.label === null || merged.label === '' ? null : merged;
  }

  return null;
}

/**
 * Best-effort plain-text form of a tooltip value, for `accessibilityLabel`
 * fallbacks and screen-reader announcements. Non-string labels yield undefined.
 */
export function getTooltipText(tooltip: TooltipPropValue | undefined): string | undefined {
  const resolved = resolveTooltipProps(tooltip);
  if (!resolved) return undefined;
  return typeof resolved.label === 'string' ? resolved.label : undefined;
}
