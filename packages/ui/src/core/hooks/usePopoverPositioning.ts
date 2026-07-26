import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Platform, Dimensions } from 'react-native';
import {
  calculateOverlayPositionEnhanced,
  measureElement,
  type PositionResult,
  type PositioningOptions,
  type PlacementType,
} from '../utils/positioning-enhanced';
import { useKeyboardManagerOptional } from '../providers/KeyboardManagerProvider';

export interface UsePopoverPositioningOptions extends PositioningOptions {
  /** Whether to automatically reposition on window resize */
  autoUpdate?: boolean;
  /** Debounce delay for resize/scroll updates in ms */
  updateDelay?: number;
  /** Adjust viewport height when on-screen keyboard is visible (default: true) */
  keyboardAvoidance?: boolean;
}

/**
 * True when two results describe the same placement, so we can skip a state
 * update (and the consumer re-render it triggers) on a no-op reposition.
 */
function samePosition(
  prev: PositionResult | null,
  next: PositionResult,
  nextHasMeasuredPopover: boolean
): boolean {
  if (!prev) return false;
  if (((prev as any)._hasMeasuredPopover ?? false) !== nextHasMeasuredPopover) return false;
  return (
    prev.x === next.x &&
    prev.y === next.y &&
    prev.placement === next.placement &&
    prev.finalWidth === next.finalWidth &&
    prev.finalHeight === next.finalHeight &&
    prev.maxWidth === next.maxWidth &&
    prev.maxHeight === next.maxHeight &&
    prev.anchorEdge === next.anchorEdge &&
    prev.anchorOffset === next.anchorOffset
  );
}

export interface UsePopoverPositioningReturn {
  /** Current position result */
  position: PositionResult | null;
  /** Update position manually. Pass `{ silent: true }` to skip the isPositioning flag. */
  updatePosition: (options?: { silent?: boolean }) => Promise<void>;
  /** Whether positioning is currently being calculated */
  isPositioning: boolean;
  /** Ref to attach to the anchor element */
  anchorRef: React.RefObject<any>;
  /** Ref to attach to the popover element for size measurement */
  popoverRef: React.RefObject<any>;
}

/**
 * Hook for managing popover positioning with automatic viewport constraint handling
 */
export function usePopoverPositioning(
  isOpen: boolean,
  options: UsePopoverPositioningOptions = {}
): UsePopoverPositioningReturn {
  const {
    autoUpdate = true,
    updateDelay = 100,
    keyboardAvoidance = true,
    ...positioningOptions
  } = options;

  const [position, setPosition] = useState<PositionResult | null>(null);
  const [isPositioning, setIsPositioning] = useState(false);

  const anchorRef = useRef<any>(null);
  const popoverRef = useRef<any>(null);
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const positioningOptionsRef = useRef(positioningOptions);
  // `updatePosition` is read through refs by the scroll/resize listeners so they
  // never capture a stale `isOpen` (which would null out the position mid-scroll).
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;
  // Placement currently on screen, for flip hysteresis. Reset on close so a
  // reopened popover picks its side fresh rather than inheriting a stale one.
  const currentPlacementRef = useRef<PlacementType | null>(null);

  const keyboardManager = useKeyboardManagerOptional();

  const computedPositioningOptions = useMemo(() => {
    if (!keyboardAvoidance || !keyboardManager?.isKeyboardVisible) {
      return positioningOptions;
    }

    // Reported as an inset rather than by shrinking `viewport.height`. Available
    // space has to exclude the keyboard, but an edge pin is resolved by the
    // platform against the real viewport — shrinking the height here would lift
    // an above-the-trigger popover by the keyboard height a second time.
    return {
      ...positioningOptions,
      viewportInsetBottom: Math.max(0, keyboardManager.keyboardHeight),
    } satisfies PositioningOptions;
  }, [keyboardAvoidance, keyboardManager?.isKeyboardVisible, keyboardManager?.keyboardHeight, positioningOptions]);

  // Update the ref when positioning options change
  positioningOptionsRef.current = computedPositioningOptions;

  const updatePosition = useCallback(async (options?: { silent?: boolean }) => {
    if (!isOpenRef.current || !anchorRef.current) {
      currentPlacementRef.current = null;
      setPosition(null);
      return;
    }

    const silent = options?.silent === true;

    if (!silent) setIsPositioning(true);

    try {
      // Measure anchor element
      const anchorRect = await measureElement(anchorRef);
      
      if (!anchorRect.width || !anchorRect.height) {
        setPosition(null);
        return;
      }

      // Get popover dimensions
      // Always use measureElement for robustness across platforms (RNW refs may not expose getBoundingClientRect)
      //
      // Height stays 0 until the popover is actually measured. A non-zero
      // placeholder here reads downstream as a real measurement and defeats the
      // unmeasured-height heuristics — a 100px default made a dropdown near the
      // bottom edge decide it fitted below, then flip above once measured.
      let popoverDimensions = { width: 200, height: 0 };
      let hasMeasuredPopover = false;

      if (popoverRef.current) {
        const popoverRect = await measureElement(popoverRef);
        if (popoverRect.width > 0 && popoverRect.height > 0) {
          popoverDimensions = { width: popoverRect.width, height: popoverRect.height };
          hasMeasuredPopover = true;
        }
      }

      // Calculate optimal position. The placement already on screen is fed back
      // in so an open popover only changes sides when the other side is
      // meaningfully roomier, instead of oscillating around the threshold.
      const result = calculateOverlayPositionEnhanced(
        anchorRect,
        popoverDimensions,
        {
          ...positioningOptionsRef.current,
          currentPlacement: currentPlacementRef.current ?? undefined,
        }
      );

      // Only a measurement-based placement gets to be "sticky". Hysteresis is
      // there to stop a settled popover oscillating as it scrolls past the
      // decision threshold — if it also applied to the pre-measure guess it
      // would lock in that guess, which for a consumer with no `desiredHeight`
      // hint (a plain Popover, say) is just the conservative default.
      if (hasMeasuredPopover) {
        currentPlacementRef.current = result.placement;
      }

      // Mark whether this position is based on actual measurements
      (result as any)._hasMeasuredPopover = hasMeasuredPopover;

      // Bail out when nothing moved so a scroll that doesn't shift the anchor
      // (e.g. an already-pinned element) doesn't re-render every consumer.
      setPosition(prev => (samePosition(prev, result, hasMeasuredPopover) ? prev : result));
    } catch (error) {
      console.error('Error calculating popover position:', error);
      setPosition(null);
    } finally {
      if (!silent) setIsPositioning(false);
    }
  }, []);

  const updatePositionRef = useRef(updatePosition);
  updatePositionRef.current = updatePosition;

  const debouncedUpdate = useCallback(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => updatePositionRef.current(), updateDelay);
  }, [updateDelay]);

  /**
   * Reposition on the next frame instead of after a debounce. Scroll has to
   * track the anchor continuously — a trailing debounce leaves the popover
   * parked at its old viewport coordinates until scrolling stops.
   */
  const frameUpdate = useCallback(() => {
    if (Platform.OS !== 'web' || typeof requestAnimationFrame !== 'function') {
      debouncedUpdate();
      return;
    }

    if (rafRef.current !== null) return;

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      updatePositionRef.current({ silent: true });
    });
  }, [debouncedUpdate]);

  // Update position when opened
  useEffect(() => {
    if (isOpen) {
      updatePosition();
    } else {
      currentPlacementRef.current = null;
      setPosition(null);
    }
  }, [isOpen]);

  const optionsSignature = useMemo(() => JSON.stringify(computedPositioningOptions), [computedPositioningOptions]);
  const lastSignatureRef = useRef<string | null>(null);

  // Update position when positioning options change (if already open)
  useEffect(() => {
    if (!isOpen) {
      lastSignatureRef.current = null;
      return;
    }

    if (lastSignatureRef.current === optionsSignature) {
      return;
    }

    lastSignatureRef.current = optionsSignature;
    debouncedUpdate();
  }, [isOpen, optionsSignature, debouncedUpdate]);

  // Auto-update on window resize/orientation change
  useEffect(() => {
    if (!autoUpdate || !isOpen) return;

    const handleResize = () => {
      debouncedUpdate();
    };

    // Scroll keeps the popover docked to its anchor, so it runs per-frame
    // rather than debounced.
    const handleScroll = () => {
      frameUpdate();
    };

    const handleOrientationChange = () => {
      // Add slight delay for orientation change to complete
      setTimeout(debouncedUpdate, 150);
    };

    if (Platform.OS === 'web') {
      window.addEventListener('resize', handleResize);
      // Capture phase so scrolling containers between the anchor and the window
      // are caught too, not just the document scroller.
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('orientationchange', handleOrientationChange);

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('orientationchange', handleOrientationChange);
      };
    } else {
      // React Native orientation change listener
      const subscription = Dimensions.addEventListener('change', handleOrientationChange);
      
      return () => subscription?.remove();
    }
  }, [autoUpdate, isOpen, debouncedUpdate, frameUpdate]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      if (rafRef.current !== null && typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  return {
    position,
    updatePosition,
    isPositioning,
    anchorRef,
    popoverRef,
  };
}

/**
 * Hook for managing tooltip positioning specifically 
 * (simplified version with tooltip-specific defaults)
 */
export function useTooltipPositioning(
  isOpen: boolean,
  placement: PositioningOptions['placement'] = 'auto'
) {
  return usePopoverPositioning(isOpen, {
    placement,
    flip: true,
    shift: true,
    boundary: 8,
    offset: 8,
    autoUpdate: true,
    updateDelay: 50, // Faster updates for tooltips
  });
}