import { Platform, Dimensions } from 'react-native';

/**
 * Position results used to be memoised in an LRU keyed on rounded geometry. That
 * cache predated the per-frame scroll repositioning and actively worked against
 * it: the placement decision is now stateful (see `currentPlacement` hysteresis),
 * so a cache hit could resurrect a side the popover had already flipped away
 * from. The math here is a couple of dozen arithmetic ops — cheaper than the
 * key-building string join the cache needed — so it simply runs every time.
 *
 * Kept as an exported no-op because it is part of the public surface.
 */
export const clearOverlayPositionCache = () => {
  /* no cache to clear — retained for API compatibility */
};

// ============================================================================
// Type Definitions
// ============================================================================

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Viewport {
  
  width: number;
  height: number;
  padding: number;
}

export interface PositionResult {
  x: number;
  y: number;
  placement: PlacementType;
  maxWidth?: number;
  maxHeight?: number;
  /** Indicates if the popover was flipped to stay in bounds */
  flipped: boolean;
  /** Indicates if the popover was shifted to stay in bounds */
  shifted: boolean;
  /** Final calculated dimensions that fit in viewport */
  finalWidth: number;
  finalHeight: number;
  /**
   * Viewport edge the popover should be pinned to on its main axis, and the
   * distance from that edge.
   *
   * This is the important half of the result for vertical placements. Pinning to
   * the trigger-adjacent edge (`top` for a dropdown below, `bottom` for one
   * above) makes the rendered position independent of the popover's own height:
   * the content grows and shrinks *away* from the trigger. Without it, a `top`
   * placement is `y = anchorTop - popoverHeight - offset`, so every content
   * change — an AutoComplete list filtering down as you type — moves the whole
   * popover, and any discrepancy between the estimated and measured height shows
   * up as a jump on first paint.
   *
   * `y` remains populated as a best-effort absolute coordinate for consumers
   * that need one, but renderers should prefer these fields when present.
   */
  anchorEdge?: 'top' | 'bottom';
  anchorOffset?: number;
}

export type PlacementType = 
  | 'top' | 'bottom' | 'left' | 'right' | 'auto'
  | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'
  | 'left-start' | 'left-end' | 'right-start' | 'right-end';

export interface PositioningOptions {
  placement?: PlacementType;
  offset?: number;
  viewport?: Viewport;
  strategy?: 'absolute' | 'fixed';
  /** Enable flipping to opposite side when popover would go off-screen */
  flip?: boolean;
  /** Enable shifting within bounds when popover would go off-screen */
  shift?: boolean;
  /** Minimum distance from viewport edges */
  boundary?: number;
  /** Fallback placements to try if primary placement doesn't fit */
  fallbackPlacements?: PlacementType[];
  /** Match the anchor element's width (useful for dropdown inputs) */
  matchAnchorWidth?: boolean;
  /**
   * How tall the popover expects to be, in px, *before* it has been measured.
   *
   * This is what lets the very first calculation pick the correct side. A
   * dropdown almost always knows this up front (its `maxH`, or row height ×
   * option count, whichever is smaller); supplying it means the pre-measure pass
   * and the post-measure pass reach the same conclusion, so there is no visible
   * flip. Falls back to the measured height, then to `DEFAULT_DESIRED_HEIGHT`.
   */
  desiredHeight?: number;
  /**
   * Space at the bottom of the viewport that is covered by something the popover
   * must avoid — in practice the on-screen keyboard.
   *
   * Passed separately rather than baked into `viewport.height` because the two
   * are needed for different things: available-space math has to exclude the
   * keyboard, but a bottom edge pin is resolved by the platform against the
   * *real* viewport, so pinning against a shrunken height would lift the popover
   * by the keyboard height twice.
   */
  viewportInsetBottom?: number;
  /**
   * The placement currently on screen, if any. Used for flip hysteresis: an open
   * popover only switches sides when the other side is meaningfully better, so
   * scrolling across the decision threshold doesn't make it ping-pong.
   */
  currentPlacement?: PlacementType;
  /** How much extra space (px) the opposite side must offer before re-flipping an already-open popover. */
  flipHysteresis?: number;
}

/** Assumed popover height when neither a measurement nor a `desiredHeight` hint is available. */
const DEFAULT_DESIRED_HEIGHT = 240;

/** Never squeeze a popover below this; better to overflow than to render a sliver. */
const MIN_POPOVER_HEIGHT = 80;

/** Default extra space the opposite side must offer before an open popover re-flips. */
const DEFAULT_FLIP_HYSTERESIS = 24;

/**
 * Default fallback placements for a given primary placement.
 *
 * Fallbacks stay on the SAME axis as the request: a vertical placement (top/bottom)
 * falls back only to the opposite vertical side, and a horizontal placement only to
 * the opposite horizontal side. Switching axes (e.g. a `top` popover jumping to
 * `right` when it can't fit above/below) is surprising and was a real bug — an
 * explicit directional request should flip, not rotate. `auto` still considers all
 * four sides since it has no requested axis.
 */
function getDirectionalFallbacks(placement: PlacementType): PlacementType[] {
  const side = String(placement).split('-')[0];
  if (side === 'top' || side === 'bottom') return ['bottom', 'top'];
  if (side === 'left' || side === 'right') return ['right', 'left'];
  return ['bottom', 'top', 'right', 'left'];
}

/** True for placements whose main axis is vertical — i.e. dropdown-shaped. */
function isVerticalPlacement(placement: PlacementType): boolean {
  const side = String(placement).split('-')[0];
  return side === 'top' || side === 'bottom';
}

/**
 * Height of the viewport a `bottom` edge pin is actually resolved against.
 *
 * On web the overlay renderer applies the pin as CSS `bottom` on a
 * `position: fixed` element, which the browser resolves against the *layout*
 * viewport. `viewport.height` here comes from `Dimensions.get('window')`,
 * which react-native-web sources from `visualViewport` — a height that shrinks
 * when the on-screen keyboard opens (iOS Safari) or the browser UI changes.
 * Mixing the two drops every upward-opening overlay by exactly the difference
 * (one keyboard height, on a phone), which is how menus and dropdowns ended up
 * "in the wrong place" on mobile web. Anchor rects (getBoundingClientRect) are
 * layout-viewport coordinates, so the pin must use the layout height too.
 */
function getBottomPinBaseHeight(viewport: Viewport): number {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const layoutHeight = document.documentElement?.clientHeight;
    if (layoutHeight && layoutHeight > 0) {
      return layoutHeight;
    }
  }
  return viewport.height;
}

/**
 * Positioning for vertical (dropdown-shaped) placements.
 *
 * Deliberately does *not* share the flip/fallback/enforce machinery below, which
 * works by placing the popover and then correcting it once it turns out not to
 * fit. That correct-after-the-fact loop is what produced the visible "renders
 * below, then jumps above" behaviour, because the first pass runs before the
 * popover has been measured and therefore guesses its height.
 *
 * This path makes the popover unable to be wrong instead of correcting it:
 *
 *  1. The side is chosen from the space available above and below the trigger,
 *     compared against `desiredHeight` — a value the caller knows before the
 *     popover mounts. The pre-measure and post-measure passes agree, so nothing
 *     flips after paint.
 *  2. `maxHeight` is capped to the chosen side's available space, so the popover
 *     physically cannot overflow the viewport and never needs correcting.
 *  3. The result is pinned to the trigger-adjacent edge, so the rendered
 *     position doesn't depend on the popover's own height at all.
 */
function calculateVerticalPosition(
  anchor: Rect,
  overlay: { width: number; height: number },
  options: Required<Pick<PositioningOptions, 'placement' | 'offset' | 'viewport' | 'flip' | 'shift' | 'boundary' | 'matchAnchorWidth'>> & {
    desiredHeight?: number;
    viewportInsetBottom: number;
    currentPlacement?: PlacementType;
    flipHysteresis: number;
  }
): PositionResult {
  const {
    placement, offset, viewport, flip, shift, boundary, matchAnchorWidth,
    desiredHeight, viewportInsetBottom, currentPlacement, flipHysteresis,
  } = options;

  const requestedSide = String(placement).split('-')[0] as 'top' | 'bottom';
  const align = String(placement).split('-')[1] as 'start' | 'end' | undefined;

  // Usable bottom edge excludes anything overlaying the viewport (the keyboard).
  const usableBottom = viewport.height - viewportInsetBottom;

  const spaceBelow = usableBottom - (anchor.y + anchor.height) - offset - boundary;
  const spaceAbove = anchor.y - offset - boundary;

  // What the popover wants: an explicit hint, else its measured height, else a
  // conservative assumption. The assumption matters — guessing *small* is what
  // makes a dropdown near the bottom edge wrongly choose "below".
  const desired = desiredHeight && desiredHeight > 0
    ? desiredHeight
    : (overlay.height > 0 ? overlay.height : DEFAULT_DESIRED_HEIGHT);

  const spaceOn = (side: 'top' | 'bottom') => (side === 'bottom' ? spaceBelow : spaceAbove);
  const opposite = (side: 'top' | 'bottom') => (side === 'bottom' ? 'top' : 'bottom') as 'top' | 'bottom';

  let side = requestedSide;
  if (flip) {
    const other = opposite(requestedSide);
    if (spaceOn(requestedSide) < desired && spaceOn(other) > spaceOn(requestedSide)) {
      side = other;
    }
  }

  // Hysteresis: an already-open popover keeps its current side unless the other
  // one is meaningfully roomier. Without this, scrolling the trigger across the
  // threshold flips the popover back and forth every frame.
  const currentSide = currentPlacement && isVerticalPlacement(currentPlacement)
    ? (String(currentPlacement).split('-')[0] as 'top' | 'bottom')
    : null;
  if (currentSide && currentSide !== side && spaceOn(side) - spaceOn(currentSide) < flipHysteresis) {
    side = currentSide;
  }

  // Cap to the chosen side. The popover can now never overflow, so no
  // post-measure correction is ever required.
  const available = spaceOn(side);
  const maxHeight = Math.max(MIN_POPOVER_HEIGHT, available);
  const finalHeight = Math.min(desired, maxHeight);

  // --- Cross axis (horizontal) -------------------------------------------
  const overlayWidth = matchAnchorWidth
    ? anchor.width
    : Math.min(overlay.width, Math.max(0, viewport.width - boundary * 2));

  let x: number;
  if (align === 'start') {
    x = anchor.x;
  } else if (align === 'end') {
    x = anchor.x + anchor.width - overlayWidth;
  } else {
    x = anchor.x + anchor.width / 2 - overlayWidth / 2;
  }

  let shifted = false;
  if (shift) {
    const minX = boundary;
    const maxX = Math.max(boundary, viewport.width - overlayWidth - boundary);
    const clamped = Math.max(minX, Math.min(x, maxX));
    if (clamped !== x) {
      shifted = true;
      x = clamped;
    }
  }

  // --- Main axis (vertical) ----------------------------------------------
  // Pin to the edge touching the trigger. Note the bottom pin resolves against
  // the viewport CSS `bottom` is laid out in (see getBottomPinBaseHeight), not
  // `usableBottom` — the keyboard has already been accounted for by capping
  // `maxHeight`.
  let anchorEdge: 'top' | 'bottom';
  let anchorOffset: number;
  let y: number;

  if (side === 'bottom') {
    anchorEdge = 'top';
    anchorOffset = anchor.y + anchor.height + offset;
    y = anchorOffset;
  } else {
    anchorEdge = 'bottom';
    anchorOffset = getBottomPinBaseHeight(viewport) - (anchor.y - offset);
    y = Math.max(boundary, anchor.y - offset - finalHeight);
  }

  return {
    x,
    y,
    placement: (align ? `${side}-${align}` : side) as PlacementType,
    maxWidth: matchAnchorWidth ? undefined : Math.max(0, viewport.width - boundary * 2),
    maxHeight,
    flipped: side !== requestedSide,
    shifted,
    finalWidth: overlayWidth,
    finalHeight,
    anchorEdge,
    anchorOffset,
  };
}

/**
 * Enhanced overlay positioning that prevents off-screen rendering.
 */
export function calculateOverlayPositionEnhanced(
  anchor: Rect,
  overlay: { width: number; height: number },
  options: PositioningOptions = {}
): PositionResult {
  const {
    placement = 'auto',
    offset = 8,
    viewport = getViewport(),
    strategy = 'fixed',
    flip = true,
    shift = true,
    boundary = 8,
    fallbackPlacements = getDirectionalFallbacks(placement),
    matchAnchorWidth = false,
    desiredHeight,
    viewportInsetBottom = 0,
    currentPlacement,
    flipHysteresis = DEFAULT_FLIP_HYSTERESIS,
  } = options;

  // If overlay height is unknown/small (pre-measure), use a heuristic height for decision-making
  // This helps avoid choosing "bottom" when near the bottom of the viewport.
  const heuristicHeight = Math.max(overlay.height || 0, desiredHeight || DEFAULT_DESIRED_HEIGHT);
  // When matchAnchorWidth is true, use anchor width for overlay width calculations
  const overlayWidth = matchAnchorWidth ? anchor.width : overlay.width;
  const overlayHeight = overlay.height > 0 ? overlay.height : heuristicHeight;

  // Everything below reasons about the space actually available, so the region
  // covered by the on-screen keyboard is excluded from the viewport bounds.
  const bounds: Viewport = viewportInsetBottom > 0
    ? { ...viewport, height: Math.max(1, viewport.height - viewportInsetBottom) }
    : viewport;

  // Account for scroll if using absolute positioning
  const scrollX = (Platform.OS === 'web' && strategy === 'absolute')
    ? (window.pageXOffset || document.documentElement.scrollLeft || 0) : 0;
  const scrollY = (Platform.OS === 'web' && strategy === 'absolute')
    ? (window.pageYOffset || document.documentElement.scrollTop || 0) : 0;

  // Adjusted anchor position
  const anchorX = anchor.x + scrollX;
  const anchorY = anchor.y + scrollY;

  // Available space calculation
  const spaces = calculateAvailableSpaces(anchor, bounds, boundary, scrollX, scrollY);

  // Determine optimal placement
  let finalPlacement = placement;
  if (placement === 'auto') {
    finalPlacement = findBestPlacement(
      spaces,
      { width: overlayWidth, height: overlayHeight },
      offset,
      fallbackPlacements
    );
  }

  // Dropdown-shaped placements take the edge-pinned path above — including an
  // `auto` that just resolved to one, which is how an unconfigured Menu arrives
  // here. Only genuinely horizontal placements keep the original
  // place-then-correct behaviour, which tooltips rely on for their
  // axis-rotating fallbacks.
  if (isVerticalPlacement(finalPlacement)) {
    return calculateVerticalPosition(anchor, overlay, {
      placement: finalPlacement, offset, viewport, flip, shift, boundary, matchAnchorWidth,
      desiredHeight, viewportInsetBottom, currentPlacement, flipHysteresis,
    });
  }

  // Try primary placement first
  let result = calculatePositionForPlacement(
    finalPlacement, 
    { x: anchorX, y: anchorY, width: anchor.width, height: anchor.height },
    { width: overlayWidth, height: overlayHeight }, 
    bounds, 
    offset, 
    boundary
  );

  // If primary placement doesn't fit and flip is enabled, try alternatives
  if (flip && !fitsInViewport(result, bounds, boundary)) {
    const flippedPlacement = getFlippedPlacement(finalPlacement);
    const flippedResult = calculatePositionForPlacement(
      flippedPlacement,
      { x: anchorX, y: anchorY, width: anchor.width, height: anchor.height },
      { width: overlayWidth, height: overlayHeight },
      bounds,
      offset,
      boundary
    );

    // Prefer flipped placement if it fits better or doesn't cover the anchor
    const anchorRect = { x: anchorX, y: anchorY, width: anchor.width, height: anchor.height };
    const originalCoversAnchor = coversAnchor(result, anchorRect);
    const flippedCoversAnchor = coversAnchor(flippedResult, anchorRect);
    
    if (fitsInViewport(flippedResult, bounds, boundary) || 
        (!originalCoversAnchor && flippedCoversAnchor) ||
        (originalCoversAnchor && !flippedCoversAnchor)) {
      result = { ...flippedResult, flipped: true };
      finalPlacement = flippedPlacement;
    }
  }

  // If still doesn't fit, try fallback placements
  if (!fitsInViewport(result, bounds, boundary)) {
    const anchorRect = { x: anchorX, y: anchorY, width: anchor.width, height: anchor.height };
    let bestFallback: PositionResult | null = null;
    let bestFallbackPlacement: PlacementType | null = null;
    
    for (const fallback of fallbackPlacements) {
      if (fallback === finalPlacement) continue;
      
      const fallbackResult = calculatePositionForPlacement(
        fallback,
        anchorRect,
        { width: overlayWidth, height: overlayHeight },
        bounds,
        offset,
        boundary
      );

      // Prefer placements that fit in bounds
      if (fitsInViewport(fallbackResult, bounds, boundary)) {
        result = { ...fallbackResult, flipped: fallback !== placement };
        finalPlacement = fallback;
        break;
      }
      
      // If no placement fits perfectly, keep track of the best one that doesn't cover anchor
      if (!bestFallback || 
          (!coversAnchor(fallbackResult, anchorRect) && coversAnchor(bestFallback, anchorRect))) {
        bestFallback = fallbackResult;
        bestFallbackPlacement = fallback;
      }
    }
    
    // If no fallback fits perfectly, use the best one that doesn't cover anchor
    if (!fitsInViewport(result, bounds, boundary) && bestFallback && bestFallbackPlacement) {
      result = { ...bestFallback, flipped: bestFallbackPlacement !== placement };
      finalPlacement = bestFallbackPlacement;
    }
  }

  // Apply shifting if enabled and still needed
  if (shift) {
    result = applyShifting(result, bounds, boundary);
  }

  // Final constraint enforcement - this guarantees no off-screen rendering
  // Pass anchor info to avoid covering it when possible
  const anchorRect = { x: anchorX, y: anchorY, width: anchor.width, height: anchor.height };
  result = enforceViewportBoundsWithAnchorAwareness(result, bounds, boundary, anchorRect, offset);

  // If enforcement moved the overlay to the opposite vertical side to avoid covering the anchor,
  // reflect that in the returned placement so arrows/styles are consistent.
  const resolvedPlacement = adjustPlacementIfMoved(finalPlacement, result, anchorRect);

  // When matchAnchorWidth is true, preserve anchor width without constraining to maxWidth
  const computedFinalWidth = matchAnchorWidth 
    ? anchor.width 
    : Math.min(result.finalWidth || overlay.width, result.maxWidth || overlay.width);

  const finalResult = {
    ...result,
    placement: resolvedPlacement,
    finalWidth: computedFinalWidth,
    finalHeight: Math.min(result.finalHeight || overlay.height, result.maxHeight || overlay.height),
  };

  return finalResult;
}

function calculateAvailableSpaces(
  anchor: Rect, 
  viewport: Viewport, 
  boundary: number,
  scrollX: number,
  scrollY: number
) {
  const anchorX = anchor.x + scrollX;
  const anchorY = anchor.y + scrollY;

  return {
    top: anchorY - boundary,
    bottom: viewport.height - (anchorY + anchor.height) - boundary,
    left: anchorX - boundary,
    right: viewport.width - (anchorX + anchor.width) - boundary,
  };
}

function findBestPlacement(
  spaces: ReturnType<typeof calculateAvailableSpaces>,
  overlay: { width: number; height: number },
  offset: number,
  fallbacks: PlacementType[]
): PlacementType {
  // Prioritize placements based on available space
  const candidates = [
    { placement: 'bottom' as PlacementType, space: spaces.bottom, needed: overlay.height + offset },
    { placement: 'top' as PlacementType, space: spaces.top, needed: overlay.height + offset },
    { placement: 'right' as PlacementType, space: spaces.right, needed: overlay.width + offset },
    { placement: 'left' as PlacementType, space: spaces.left, needed: overlay.width + offset },
  ];

  // Find first placement with enough space
  const suitable = candidates.find(c => c.space >= c.needed);
  if (suitable) return suitable.placement;

  // If no placement has enough space, choose the one with most space
  const mostSpace = candidates.sort((a, b) => b.space - a.space)[0];
  return mostSpace.placement;
}

function calculatePositionForPlacement(
  placement: PlacementType,
  anchor: Rect,
  overlay: { width: number; height: number },
  viewport: Viewport,
  offset: number,
  boundary: number
): PositionResult {
  let x = 0, y = 0;
  let maxWidth: number | undefined;
  let maxHeight: number | undefined;
  
  const { width: overlayWidth, height: overlayHeight } = overlay;

  switch (placement) {
    case 'top':
      x = anchor.x + anchor.width / 2 - overlayWidth / 2;
      y = anchor.y - overlayHeight - offset;
      break;
      
    case 'top-start':
      x = anchor.x;
      y = anchor.y - overlayHeight - offset;
      break;
      
    case 'top-end':
      x = anchor.x + anchor.width - overlayWidth;
      y = anchor.y - overlayHeight - offset;
      break;
      
    case 'bottom':
      x = anchor.x + anchor.width / 2 - overlayWidth / 2;
      y = anchor.y + anchor.height + offset;
      break;
      
    case 'bottom-start':
      x = anchor.x;
      y = anchor.y + anchor.height + offset;
      break;
      
    case 'bottom-end':
      x = anchor.x + anchor.width - overlayWidth;
      y = anchor.y + anchor.height + offset;
      break;
      
    case 'left':
      x = anchor.x - overlayWidth - offset;
      y = anchor.y + anchor.height / 2 - overlayHeight / 2;
      break;
      
    case 'left-start':
      x = anchor.x - overlayWidth - offset;
      y = anchor.y;
      break;
      
    case 'left-end':
      x = anchor.x - overlayWidth - offset;
      y = anchor.y + anchor.height - overlayHeight;
      break;
      
    case 'right':
      x = anchor.x + anchor.width + offset;
      y = anchor.y + anchor.height / 2 - overlayHeight / 2;
      break;
      
    case 'right-start':
      x = anchor.x + anchor.width + offset;
      y = anchor.y;
      break;
      
    case 'right-end':
      x = anchor.x + anchor.width + offset;
      y = anchor.y + anchor.height - overlayHeight;
      break;
      
    default:
      x = anchor.x;
      y = anchor.y + anchor.height + offset;
      break;
  }

  return {
    x,
    y,
    placement,
    maxWidth,
    maxHeight,
    flipped: false,
    shifted: false,
    finalWidth: overlayWidth,
    finalHeight: overlayHeight
  };
}

function getFlippedPlacement(placement: PlacementType): PlacementType {
  const flips: Record<string, PlacementType> = {
    'top': 'bottom',
    'bottom': 'top',
    'left': 'right',
    'right': 'left',
    'top-start': 'bottom-start',
    'top-end': 'bottom-end',
    'bottom-start': 'top-start',
    'bottom-end': 'top-end',
    'left-start': 'right-start',
    'left-end': 'right-end',
    'right-start': 'left-start',
    'right-end': 'left-end',
  };
  
  return flips[placement] || placement;
}

function fitsInViewport(
  result: PositionResult, 
  viewport: Viewport, 
  boundary: number
): boolean {
  return (
    result.x >= boundary &&
    result.y >= boundary &&
    result.x + result.finalWidth <= viewport.width - boundary &&
    result.y + result.finalHeight <= viewport.height - boundary
  );
}

/**
 * If after enforcement the overlay ended up above the anchor but the placement says bottom (or vice versa),
 * normalize the placement string to match the actual side. This keeps arrows and component logic aligned.
 */
function adjustPlacementIfMoved(
  placement: PlacementType,
  result: PositionResult,
  anchor: Rect
): PlacementType {
  // Determine relative vertical position of overlay to anchor
  const overlayBottom = result.y + result.finalHeight;
  const overlayTop = result.y;
  const anchorTop = anchor.y;
  const anchorBottom = anchor.y + anchor.height;

  const isAbove = overlayBottom <= anchorTop; // entire overlay above anchor
  const isBelow = overlayTop >= anchorBottom; // entire overlay below anchor

  // Only adjust for vertical placements
  if (isAbove && (placement.startsWith('bottom'))) {
    return swapPlacementVertical(placement, 'top');
  }
  if (isBelow && (placement.startsWith('top'))) {
    return swapPlacementVertical(placement, 'bottom');
  }

  return placement;
}

function swapPlacementVertical(placement: PlacementType, to: 'top' | 'bottom'): PlacementType {
  // Preserve -start / -end suffixes
  if (placement.includes('-start')) {
    return (to + '-start') as PlacementType;
  }
  if (placement.includes('-end')) {
    return (to + '-end') as PlacementType;
  }
  // Core vertical
  if (placement === 'top' || placement === 'bottom') {
    return to as PlacementType;
  }
  // For horizontal placements, leave unchanged
  return placement;
}

function coversAnchor(result: PositionResult, anchor: Rect): boolean {
  return (
    result.x < anchor.x + anchor.width &&
    result.x + result.finalWidth > anchor.x &&
    result.y < anchor.y + anchor.height &&
    result.y + result.finalHeight > anchor.y
  );
}

function applyShifting(
  result: PositionResult, 
  viewport: Viewport, 
  boundary: number
): PositionResult {
  let { x, y } = result;
  let shifted = false;

  // Shift horizontally if needed
  if (x < boundary) {
    x = boundary;
    shifted = true;
  } else if (x + result.finalWidth > viewport.width - boundary) {
    x = viewport.width - result.finalWidth - boundary;
    shifted = true;
  }

  // Shift vertically if needed  
  if (y < boundary) {
    y = boundary;
    shifted = true;
  } else if (y + result.finalHeight > viewport.height - boundary) {
    y = viewport.height - result.finalHeight - boundary;
    shifted = true;
  }

  return { ...result, x, y, shifted };
}

function enforceViewportBounds(
  result: PositionResult, 
  viewport: Viewport, 
  boundary: number
): PositionResult {
  let { x, y, finalWidth, finalHeight } = result;
  let maxWidth = result.maxWidth;
  let maxHeight = result.maxHeight;

  // Enforce horizontal bounds
  const maxAvailableWidth = viewport.width - boundary * 2;
  if (finalWidth > maxAvailableWidth) {
    maxWidth = Math.max(200, maxAvailableWidth); // Minimum 200px width
    finalWidth = maxWidth;
  }

  x = Math.max(boundary, Math.min(x, viewport.width - finalWidth - boundary));

  // Enforce vertical bounds
  const maxAvailableHeight = viewport.height - boundary * 2;
  if (finalHeight > maxAvailableHeight) {
    maxHeight = Math.max(100, maxAvailableHeight); // Minimum 100px height
    finalHeight = maxHeight;
  }

  y = Math.max(boundary, Math.min(y, viewport.height - finalHeight - boundary));

  return {
    ...result,
    x,
    y,
    maxWidth,
    maxHeight,
    finalWidth,
    finalHeight
  };
}

function enforceViewportBoundsWithAnchorAwareness(
  result: PositionResult,
  viewport: Viewport,
  boundary: number,
  anchor: Rect,
  offset: number
): PositionResult {
  let { x, y, finalWidth, finalHeight } = result;
  let maxWidth = result.maxWidth;
  let maxHeight = result.maxHeight;

  // Enforce horizontal bounds
  const maxAvailableWidth = viewport.width - boundary * 2;
  if (finalWidth > maxAvailableWidth) {
    maxWidth = Math.max(200, maxAvailableWidth);
    finalWidth = maxWidth;
  }

  x = Math.max(boundary, Math.min(x, viewport.width - finalWidth - boundary));

  // Enforce vertical bounds with anchor awareness
  const maxAvailableHeight = viewport.height - boundary * 2;
  if (finalHeight > maxAvailableHeight) {
    maxHeight = Math.max(100, maxAvailableHeight);
    finalHeight = maxHeight;
  }

  // Smart vertical positioning to avoid covering anchor
  let constrainedY = Math.max(boundary, Math.min(y, viewport.height - finalHeight - boundary));

  // Detect original vertical intent relative to anchor (before constraints)
  const originallyBelow = y >= anchor.y + anchor.height;
  const originallyAbove = y + finalHeight <= anchor.y;
  
  // If the constrained position would cover the anchor, try to position it better
  const wouldCoverAnchor = (
    constrainedY < anchor.y + anchor.height &&
    constrainedY + finalHeight > anchor.y &&
    x < anchor.x + anchor.width &&
    x + finalWidth > anchor.x
  );

  if (wouldCoverAnchor) {
    // Try positioning above the anchor first, shrinking height to fit if needed
    const gap = Math.max(boundary, Math.max(0, Math.floor(offset)) || 4);
    const spaceAbove = anchor.y - gap - boundary; // space from top boundary to just above anchor with gap
    if (spaceAbove > 0) {
      // Fit overlay into the available above space
      const fittedHeight = Math.min(finalHeight, spaceAbove);
      finalHeight = fittedHeight;
      maxHeight = Math.min(maxHeight ?? fittedHeight, fittedHeight);
      constrainedY = anchor.y - fittedHeight - gap;
    } else {
      // Try positioning below the anchor, shrinking height to fit if needed
      const belowStart = anchor.y + anchor.height + gap;
      const spaceBelow = (viewport.height - boundary) - belowStart;
      if (spaceBelow > 0) {
        const fittedHeight = Math.min(finalHeight, spaceBelow);
        finalHeight = fittedHeight;
        maxHeight = Math.min(maxHeight ?? fittedHeight, fittedHeight);
        constrainedY = belowStart;
      }
      // If neither works, stick with the constrained position (last resort)
    }
  }

  // Additional preference: if the overlay was intended to be below but is constrained by the bottom viewport edge,
  // prefer placing it above (with fitted height) when there is available space above. This avoids the "pushed up but
  // still below the anchor" scenario.
  {
    const gap = Math.max(boundary, Math.max(0, Math.floor(offset)) || 4);
    const bottomConstrained = (constrainedY + finalHeight) >= (viewport.height - boundary);
    const stillBelowAnchor = (constrainedY >= anchor.y + anchor.height);
    if (originallyBelow && bottomConstrained && stillBelowAnchor) {
      const spaceAbove = anchor.y - gap - boundary;
      if (spaceAbove > 0) {
        const fittedHeight = Math.min(finalHeight, spaceAbove);
        finalHeight = fittedHeight;
        maxHeight = Math.min(maxHeight ?? fittedHeight, fittedHeight);
        constrainedY = anchor.y - fittedHeight - gap;
      }
    }
  }

  y = constrainedY;

  return {
    ...result,
    x,
    y,
    finalWidth,
    finalHeight,
    maxWidth,
    maxHeight,
  };
}

/**
 * Get current viewport dimensions
 */
export function getViewport(): Viewport {
  const screen = Dimensions.get(Platform.OS === 'web' ? 'window' : 'screen');
  return {
    width: screen.width,
    height: screen.height,
    padding: 8,
  };
}

/**
 * Measure element dimensions and position
 */
export function measureElement(ref: any): Promise<Rect> {
  return new Promise((resolve) => {
    if (!ref?.current) {
      resolve({ x: 0, y: 0, width: 0, height: 0 });
      return;
    }

    if (Platform.OS === 'web') {
      const element = ref.current;
      let targetElement = element;
      
      // Find DOM element for React Native Web
      if (element._nativeTag || element._children || !element.getBoundingClientRect) {
        const findDOMElement = (el: any): any => {
          if (el && el.getBoundingClientRect) return el;
          if (el && el.children) {
            for (let i = 0; i < el.children.length; i++) {
              const found = findDOMElement(el.children[i]);
              if (found) return found;
            }
          }
          return null;
        };
        
        targetElement = findDOMElement(element) || element;
      }

      if (targetElement && targetElement.getBoundingClientRect) {
        const rect = targetElement.getBoundingClientRect();
        resolve({
          x: rect.left,
          y: rect.top, 
          width: rect.width,
          height: rect.height
        });
      } else {
        resolve({ x: 0, y: 0, width: 0, height: 0 });
      }
    } else {
      // React Native
      ref.current.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        resolve({ x: pageX, y: pageY, width, height });
      });
    }
  });
}

/**
 * Check if a point is inside a rectangle
 */
export function pointInRect(point: { x: number; y: number }, rect: Rect): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

/**
 * Get scroll position for web compatibility
 */
export function getScrollPosition(): { x: number; y: number } {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return {
      x: window.pageXOffset || document.documentElement.scrollLeft || 0,
      y: window.pageYOffset || document.documentElement.scrollTop || 0,
    };
  }
  return { x: 0, y: 0 };
}