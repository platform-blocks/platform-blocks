import {
  calculateOverlayPositionEnhanced,
  type PositioningOptions,
  type Rect,
} from '../positioning-enhanced';

/**
 * Covers the vertical (dropdown-shaped) positioning path — the one Select,
 * AutoComplete and ColorInput use.
 *
 * The behaviour being pinned down here is that the placement decision is stable:
 * the pass that runs before the popover has been measured must reach the same
 * conclusion as the pass that runs after, because any disagreement between them
 * is what the user sees as the dropdown flipping sides after it has appeared.
 */

const VIEWPORT = { width: 1024, height: 768, padding: 8 };

/** A 40px-tall trigger whose top edge sits at `y`. */
const triggerAt = (y: number): Rect => ({ x: 100, y, width: 200, height: 40 });

const position = (anchor: Rect, overlay: { width: number; height: number }, options: PositioningOptions = {}) =>
  calculateOverlayPositionEnhanced(anchor, overlay, {
    placement: 'bottom-start',
    offset: 6,
    boundary: 8,
    viewport: VIEWPORT,
    matchAnchorWidth: true,
    ...options,
  });

/** What `usePopoverPositioning` passes before the popover has rendered. */
const UNMEASURED = { width: 200, height: 0 };

describe('calculateOverlayPositionEnhanced — vertical placements', () => {
  describe('choosing a side before the popover is measured', () => {
    it('places a dropdown below a trigger with room beneath it', () => {
      const result = position(triggerAt(100), UNMEASURED, { desiredHeight: 260 });

      expect(result.placement).toBe('bottom-start');
      expect(result.anchorEdge).toBe('top');
      expect(result.anchorOffset).toBe(146); // 100 + 40 + 6
    });

    it('places it above a trigger near the bottom edge, without needing a measurement', () => {
      // 620 + 40 = 660; only ~100px below, but ~600px above.
      const result = position(triggerAt(620), UNMEASURED, { desiredHeight: 260 });

      expect(result.placement).toBe('top-start');
      expect(result.flipped).toBe(true);
    });

    it('reaches the same decision before and after measurement', () => {
      // The regression this guards: the unmeasured pass used to assume a short
      // popover, choose "below", paint, and only then flip above.
      const anchor = triggerAt(620);
      const desiredHeight = 260;

      const beforeMeasure = position(anchor, UNMEASURED, { desiredHeight });
      const afterMeasure = position(anchor, { width: 200, height: 260 }, { desiredHeight });

      expect(beforeMeasure.placement).toBe(afterMeasure.placement);
      expect(beforeMeasure.anchorEdge).toBe(afterMeasure.anchorEdge);
      expect(beforeMeasure.anchorOffset).toBe(afterMeasure.anchorOffset);
    });

    it('does not send a short dropdown above when it fits below', () => {
      // Three options near the bottom: 100px still fits in the ~148px below.
      const result = position(triggerAt(600), UNMEASURED, { desiredHeight: 100 });

      expect(result.placement).toBe('bottom-start');
    });
  });

  describe('edge pinning', () => {
    it('pins an above-the-trigger dropdown by its bottom edge', () => {
      const result = position(triggerAt(620), UNMEASURED, { desiredHeight: 260 });

      expect(result.anchorEdge).toBe('bottom');
      // Distance from the viewport bottom up to the trigger's top, less the gap.
      expect(result.anchorOffset).toBe(768 - (620 - 6));
    });

    it('keeps that pin fixed as the content height changes', () => {
      // An AutoComplete list filtering from 10 rows to 2 must not move the
      // popover — only shrink it.
      const anchor = triggerAt(620);
      const tall = position(anchor, { width: 200, height: 250 }, { desiredHeight: 258 });
      const short = position(anchor, { width: 200, height: 60 }, { desiredHeight: 258 });

      expect(short.anchorEdge).toBe(tall.anchorEdge);
      expect(short.anchorOffset).toBe(tall.anchorOffset);
    });
  });

  describe('height capping', () => {
    it('caps the dropdown to the space available on its chosen side', () => {
      const result = position(triggerAt(500), UNMEASURED, { desiredHeight: 600 });

      // Neither side fits 600; whichever wins, the cap must keep it on screen.
      const spaceUsed = result.maxHeight!;
      expect(spaceUsed).toBeLessThanOrEqual(VIEWPORT.height);
      if (result.anchorEdge === 'top') {
        expect(result.anchorOffset! + spaceUsed).toBeLessThanOrEqual(VIEWPORT.height);
      } else {
        expect(spaceUsed).toBeLessThanOrEqual(500 - 6 - 8);
      }
    });

    it('excludes the on-screen keyboard from the space below', () => {
      const withoutKeyboard = position(triggerAt(300), UNMEASURED, { desiredHeight: 260 });
      const withKeyboard = position(triggerAt(300), UNMEASURED, {
        desiredHeight: 260,
        viewportInsetBottom: 340,
      });

      expect(withoutKeyboard.placement).toBe('bottom-start');
      // 768 - 340 = 428 usable; only ~80px below the trigger, so it goes above.
      expect(withKeyboard.placement).toBe('top-start');
    });

    it('resolves a bottom pin against the real viewport, not the keyboard-adjusted one', () => {
      // The pin is applied by the platform relative to the full viewport, so
      // subtracting the keyboard here as well would lift the popover twice.
      const anchor = triggerAt(300);
      const result = position(anchor, UNMEASURED, { desiredHeight: 260, viewportInsetBottom: 340 });

      expect(result.anchorEdge).toBe('bottom');
      expect(result.anchorOffset).toBe(768 - (300 - 6));
    });
  });

  describe('flip hysteresis', () => {
    it('keeps the current side when the alternative is only marginally roomier', () => {
      // Trigger straddling the midpoint: ~354 above, ~354 below.
      const anchor = triggerAt(368);
      const result = position(anchor, { width: 200, height: 400 }, {
        desiredHeight: 400,
        currentPlacement: 'bottom-start',
      });

      expect(result.placement).toBe('bottom-start');
    });

    it('still flips when the alternative is decisively roomier', () => {
      const result = position(triggerAt(650), { width: 200, height: 400 }, {
        desiredHeight: 400,
        currentPlacement: 'bottom-start',
      });

      expect(result.placement).toBe('top-start');
    });
  });

  describe('cross-axis alignment', () => {
    it('aligns -start to the trigger regardless of popover height', () => {
      const anchor = triggerAt(100);
      expect(position(anchor, UNMEASURED).x).toBe(anchor.x);
      expect(position(anchor, { width: 200, height: 400 }).x).toBe(anchor.x);
    });

    it('shifts back inside the viewport rather than overflowing', () => {
      const anchor: Rect = { x: 950, y: 100, width: 200, height: 40 };
      const result = position(anchor, { width: 200, height: 200 }, { matchAnchorWidth: false });

      expect(result.shifted).toBe(true);
      expect(result.x + result.finalWidth).toBeLessThanOrEqual(VIEWPORT.width - 8);
    });
  });

  describe('non-vertical placements', () => {
    it('leaves horizontal placements on the original path (no edge pin)', () => {
      const result = position(triggerAt(300), { width: 200, height: 200 }, { placement: 'right' });

      expect(result.anchorEdge).toBeUndefined();
      expect(result.placement).toBe('right');
    });

    it('routes an `auto` that resolves to a vertical side through the pinned path', () => {
      // How an unconfigured Menu arrives here — it defaults to `position: 'auto'`
      // and would otherwise miss the edge pin entirely.
      const result = position(triggerAt(300), { width: 200, height: 200 }, { placement: 'auto' });

      expect(result.placement).toBe('bottom');
      expect(result.anchorEdge).toBe('top');
    });

    it('leaves an `auto` that resolves horizontally on the original path', () => {
      // Vertically hemmed in but with room to the right.
      const anchor: Rect = { x: 100, y: 8, width: 200, height: 752 };
      const result = position(anchor, { width: 200, height: 200 }, { placement: 'auto' });

      expect(result.anchorEdge).toBeUndefined();
    });
  });
});
