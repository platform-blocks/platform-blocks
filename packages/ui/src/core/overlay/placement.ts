import { I18nManager } from 'react-native';

import { useDirection } from '../providers/DirectionProvider';
import type { PlacementType } from '../utils/positioning-enhanced';

/**
 * Converts a placement written for left-to-right layouts into the physical
 * placement to use under the current direction.
 *
 * In RTL:
 * - the `left` / `right` sides swap (a `right` popover opens on the reading
 *   end of its trigger, which is physically the left);
 * - `-start` / `-end` swap for `top` / `bottom` sides, where the alignment
 *   runs horizontally. For `left` / `right` sides the alignment is vertical
 *   (start = top) and is left alone.
 */
export function resolvePlacementForDirection(placement: PlacementType, isRTL: boolean): PlacementType {
  if (!isRTL || placement === 'auto') return placement;
  const [side, align] = placement.split('-') as [string, string | undefined];

  if (side === 'left' || side === 'right') {
    const mirroredSide = side === 'left' ? 'right' : 'left';
    return (align ? `${mirroredSide}-${align}` : mirroredSide) as PlacementType;
  }

  if (align === 'start') return `${side}-end` as PlacementType;
  if (align === 'end') return `${side}-start` as PlacementType;
  return placement;
}

/** Mirrors every placement in a fallback list. */
export function resolvePlacementsForDirection(
  placements: PlacementType[] | undefined,
  isRTL: boolean
): PlacementType[] | undefined {
  if (!placements || !isRTL) return placements;
  return placements.map((placement) => resolvePlacementForDirection(placement, isRTL));
}

/**
 * Current layout direction for overlay positioning. Reads the
 * DirectionProvider when one is mounted, otherwise the platform direction.
 */
export function useIsRTL(): boolean {
  try {
    // useDirection is a plain context read; it throws only when no provider
    // is mounted (older versions), in which case the platform decides.
    return !!useDirection()?.isRTL;
  } catch {
    return !!I18nManager?.isRTL;
  }
}
