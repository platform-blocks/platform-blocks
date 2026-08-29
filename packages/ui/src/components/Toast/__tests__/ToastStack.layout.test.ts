/**
 * Toast stack layout — the placement rules that make a multi-toast stack read
 * as a stack instead of as a pile that snaps around.
 */

import { computeStackLayout } from '../ToastStack';

const item = (id: string, visible = true) => ({ id, visible });
const HEIGHTS = { a: 60, b: 80, c: 50 };
const GAP = 12;

const layout = (
  items: { id: string; visible: boolean }[],
  pinned: Record<string, number> = {},
  heights: Record<string, number> = HEIGHTS,
) => computeStackLayout(items, heights, GAP, pinned);

describe('computeStackLayout', () => {
  it('puts the newest toast against the anchored edge', () => {
    // Items arrive oldest-first; `c` is the most recent.
    const { offsets } = layout([item('a'), item('b'), item('c')]);
    expect(offsets.c).toBe(0);
    expect(offsets.b).toBe(HEIGHTS.c + GAP);
    expect(offsets.a).toBe(HEIGHTS.c + GAP + HEIGHTS.b + GAP);
  });

  it('leaves the toasts already on screen where they are when one arrives', () => {
    const before = layout([item('a'), item('b')]);
    const after = layout([item('a'), item('b'), item('c')]);
    // Every existing toast shifts by exactly the new toast's footprint — one
    // uniform move, not a reshuffle.
    expect(after.offsets.a - before.offsets.a).toBe(HEIGHTS.c + GAP);
    expect(after.offsets.b - before.offsets.b).toBe(HEIGHTS.c + GAP);
  });

  it('closes the gap behind a leaving toast without moving the toast itself', () => {
    const visible = layout([item('a'), item('b'), item('c')]);
    // `b`, in the middle, starts leaving.
    const leaving = layout(
      [item('a'), item('b', false), item('c')],
      visible.pinned,
    );

    // The leaving toast holds the slot it is leaving from...
    expect(leaving.offsets.b).toBe(visible.offsets.b);
    // ...the newest is untouched...
    expect(leaving.offsets.c).toBe(0);
    // ...and the toast behind it moves up into the vacated space immediately,
    // rather than snapping when the leaving toast finally unmounts.
    expect(leaving.offsets.a).toBe(HEIGHTS.c + GAP);
  });

  it('holds a leaving toast still even as the stack keeps changing around it', () => {
    const step1 = layout([item('a'), item('b'), item('c')]);
    const step2 = layout([item('a'), item('b', false), item('c')], step1.pinned);
    const step3 = layout([item('a'), item('b', false), item('c')], step2.pinned);
    expect(step3.offsets.b).toBe(step1.offsets.b);
  });

  it('drops a toast that has left from the pinned offsets', () => {
    const withB = layout([item('a'), item('b', false)]);
    const withoutB = layout([item('a')], withB.pinned);
    expect(withoutB.pinned).not.toHaveProperty('b');
  });

  it('sizes the container to cover leaving toasts as well as visible ones', () => {
    const visible = layout([item('a'), item('b'), item('c')]);
    expect(visible.stackHeight).toBe(HEIGHTS.c + GAP + HEIGHTS.b + GAP + HEIGHTS.a);

    // The oldest starts leaving: it still needs to be inside the container's
    // bounds or it gets clipped out of hit-testing mid-transition.
    const leaving = layout(
      [item('a', false), item('b'), item('c')],
      visible.pinned,
    );
    expect(leaving.stackHeight).toBe(visible.offsets.a + HEIGHTS.a);
  });

  it('falls back to an estimated height only for an unmeasured toast', () => {
    const { offsets } = layout([item('a'), item('new')], {}, HEIGHTS);
    // The newest is at the edge regardless, so the estimate only affects the
    // toast behind it for the single frame before layout arrives.
    expect(offsets.new).toBe(0);
    expect(offsets.a).toBeGreaterThan(0);
  });

  it('returns an empty layout for an empty stack', () => {
    expect(layout([])).toEqual({ offsets: {}, stackHeight: 0, pinned: {} });
  });
});
