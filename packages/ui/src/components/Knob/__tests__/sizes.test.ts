import {
  KNOB_SIZE_SCALE,
  MIN_KNOB_SIZE,
  resolveKnobSize,
  getKnobValueLabelFontSize,
  getKnobSecondaryLabelFontSize,
} from '../sizes';

describe('resolveKnobSize', () => {
  it('maps every size token to its scale diameter', () => {
    (Object.keys(KNOB_SIZE_SCALE) as (keyof typeof KNOB_SIZE_SCALE)[]).forEach(token => {
      expect(resolveKnobSize(token)).toBe(KNOB_SIZE_SCALE[token]);
    });
  });

  it('defaults to md so the historical 120px default is preserved', () => {
    expect(resolveKnobSize(undefined)).toBe(120);
    expect(KNOB_SIZE_SCALE.md).toBe(120);
  });

  it('passes numeric diameters through', () => {
    expect(resolveKnobSize(200)).toBe(200);
  });

  it('clamps to the minimum renderable diameter', () => {
    expect(resolveKnobSize(10)).toBe(MIN_KNOB_SIZE);
  });

  it('falls back to md for non-finite input', () => {
    expect(resolveKnobSize(Number.NaN)).toBe(KNOB_SIZE_SCALE.md);
  });

  it('orders tokens smallest to largest', () => {
    const diameters = Object.values(KNOB_SIZE_SCALE);
    expect(diameters).toEqual([...diameters].sort((a, b) => a - b));
  });
});

describe('value label font sizing', () => {
  it('grows the readout with the diameter', () => {
    // The old behavior was a flat 12px at every size; md must now be larger than that.
    expect(getKnobValueLabelFontSize(KNOB_SIZE_SCALE.md)).toBeGreaterThan(12);
    expect(getKnobValueLabelFontSize(KNOB_SIZE_SCALE.xl)).toBeGreaterThan(
      getKnobValueLabelFontSize(KNOB_SIZE_SCALE.md)
    );
  });

  it('never shrinks below a legible floor on the smallest knobs', () => {
    expect(getKnobValueLabelFontSize(MIN_KNOB_SIZE)).toBe(13);
    expect(getKnobValueLabelFontSize(10)).toBe(13);
  });

  it('caps the readout so the largest knobs stay a dial, not a billboard', () => {
    expect(getKnobValueLabelFontSize(KNOB_SIZE_SCALE['3xl'])).toBe(32);
    expect(getKnobValueLabelFontSize(2000)).toBe(32);
  });

  it('never decreases as the knob grows', () => {
    const sizes = Object.values(KNOB_SIZE_SCALE).map(getKnobValueLabelFontSize);
    expect(sizes).toEqual([...sizes].sort((a, b) => a - b));
  });

  it('keeps secondary readouts smaller than the primary but still legible', () => {
    Object.values(KNOB_SIZE_SCALE).forEach((diameter) => {
      const primary = getKnobValueLabelFontSize(diameter);
      const secondary = getKnobSecondaryLabelFontSize(diameter);
      expect(secondary).toBeLessThanOrEqual(primary);
      expect(secondary).toBeGreaterThanOrEqual(11);
    });
  });
});
