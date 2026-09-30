import { resolvePlacementForDirection, resolvePlacementsForDirection } from '../placement';

describe('resolvePlacementForDirection', () => {
  it('leaves LTR placements alone', () => {
    expect(resolvePlacementForDirection('bottom-start', false)).toBe('bottom-start');
    expect(resolvePlacementForDirection('left', false)).toBe('left');
  });

  it('mirrors horizontal alignment of top/bottom placements in RTL', () => {
    expect(resolvePlacementForDirection('bottom-start', true)).toBe('bottom-end');
    expect(resolvePlacementForDirection('top-end', true)).toBe('top-start');
    expect(resolvePlacementForDirection('bottom', true)).toBe('bottom');
  });

  it('swaps left/right sides in RTL but keeps their vertical alignment', () => {
    expect(resolvePlacementForDirection('left', true)).toBe('right');
    expect(resolvePlacementForDirection('right-start', true)).toBe('left-start');
    expect(resolvePlacementForDirection('left-end', true)).toBe('right-end');
  });

  it('keeps auto', () => {
    expect(resolvePlacementForDirection('auto', true)).toBe('auto');
  });

  it('mirrors fallback lists', () => {
    expect(resolvePlacementsForDirection(['right-start', 'bottom-start'], true)).toEqual(['left-start', 'bottom-end']);
    expect(resolvePlacementsForDirection(undefined, true)).toBeUndefined();
  });
});
