import {
  normalizeArcConfig,
  getArcAngleFromRatio,
  getArcRatioFromAngle,
  getSignedArcSweepBetweenRatios,
} from '../arc';

describe('Knob arc helpers', () => {
  it('normalizes defaults', () => {
    const arc = normalizeArcConfig();
    expect(arc).toEqual({
      startAngle: 0,
      sweepAngle: 360,
      direction: 'cw',
      clampInput: true,
      wrap: true,
    });
  });

  it('clamps sweep and direction', () => {
    const arc = normalizeArcConfig(
      {
        startAngle: -135,
        sweepAngle: 720,
        direction: 'ccw',
        clampInput: false,
      },
      { isEndless: true }
    );
    expect(arc.startAngle).toBe(225);
    expect(arc.sweepAngle).toBe(360);
    expect(arc.direction).toBe('ccw');
    expect(arc.clampInput).toBe(false);
    expect(arc.wrap).toBe(true);
  });

  it('maps ratios to angles for clockwise sweeps', () => {
    const arc = normalizeArcConfig({ startAngle: -90, sweepAngle: 180 });
    const start = getArcAngleFromRatio(arc, 0);
    const mid = getArcAngleFromRatio(arc, 0.5);
    const end = getArcAngleFromRatio(arc, 1);
    expect(start).toBe(270);
    expect(mid).toBe(0);
    expect(end).toBe(90);
  });

  it('derives ratios from angles for counter-clockwise sweeps', () => {
    const arc = normalizeArcConfig({ startAngle: 90, sweepAngle: 180, direction: 'ccw' });
    const ratioStart = getArcRatioFromAngle(arc, 90);
    const ratioQuarter = getArcRatioFromAngle(arc, 0);
    const ratioEnd = getArcRatioFromAngle(arc, 270);
    expect(ratioStart).toBe(0);
    expect(ratioQuarter).toBeCloseTo(0.5, 3);
    expect(ratioEnd).toBe(1);
  });

  it('respects clampInput=false when deriving ratios', () => {
    const arc = normalizeArcConfig({ startAngle: 0, sweepAngle: 180, clampInput: false });
    const ratio = getArcRatioFromAngle(arc, 300);
    expect(ratio).toBeGreaterThan(1);
  });

  describe('dead-zone clamping', () => {
    // 270deg arc starting at -135 (=225). Its ends sit at 225 (min) and 135 (max), leaving
    // a 90deg dead zone across the bottom, centred on 180.
    const arc = normalizeArcConfig({ startAngle: -135, sweepAngle: 270, clampInput: true });

    it('clamps to the nearer end rather than always to the far one', () => {
      // Regression: progress wraps, so everything in the dead zone read as ~355deg and a
      // plain clamp sent it to max — dragging one degree past min snapped the knob to max.
      expect(getArcRatioFromAngle(arc, 224)).toBe(0);
      expect(getArcRatioFromAngle(arc, 200)).toBe(0);
      expect(getArcRatioFromAngle(arc, 181)).toBe(0);
      // Past the midpoint the max end genuinely is nearer.
      expect(getArcRatioFromAngle(arc, 179)).toBe(1);
      expect(getArcRatioFromAngle(arc, 136)).toBe(1);
    });

    it('still maps angles on the arc itself proportionally', () => {
      expect(getArcRatioFromAngle(arc, 225)).toBeCloseTo(0);
      expect(getArcRatioFromAngle(arc, 0)).toBeCloseTo(0.5);
      expect(getArcRatioFromAngle(arc, 135)).toBeCloseTo(1);
    });

    it('clamps to the nearer end for counter-clockwise arcs', () => {
      const ccw = normalizeArcConfig({
        startAngle: -135,
        sweepAngle: 270,
        direction: 'ccw',
        clampInput: true,
      });
      expect(getArcRatioFromAngle(ccw, 230)).toBe(0);
      expect(getArcRatioFromAngle(ccw, 275)).toBe(1);
    });

    it('has no dead zone on a full-circle arc', () => {
      const full = normalizeArcConfig({ startAngle: 0, sweepAngle: 360, clampInput: true });
      expect(getArcRatioFromAngle(full, 90)).toBeCloseTo(0.25);
      expect(getArcRatioFromAngle(full, 359)).toBeCloseTo(359 / 360);
    });
  });

  describe('getSignedArcSweepBetweenRatios', () => {
    // The panning demo: min -100 / max 100 / pivot 0 over a 270deg arc starting at -135.
    const panArc = normalizeArcConfig({ startAngle: -135, sweepAngle: 270 });
    const panRatio = (value: number) => (value + 100) / 200;

    it('sweeps symmetrically on both sides of the pivot', () => {
      const center = panRatio(0);
      expect(getSignedArcSweepBetweenRatios(panArc, center, panRatio(50))).toBeCloseTo(67.5);
      // Regression: this used to return +292.5 -- pivot and value angles are each wrapped
      // into [0,360), so subtracting them sent left-of-center pans the long way around.
      expect(getSignedArcSweepBetweenRatios(panArc, center, panRatio(-50))).toBeCloseTo(-67.5);
    });

    it('returns zero at the pivot', () => {
      const center = panRatio(0);
      expect(getSignedArcSweepBetweenRatios(panArc, center, center)).toBe(0);
    });

    it('preserves sweeps wider than 180 degrees', () => {
      expect(getSignedArcSweepBetweenRatios(panArc, panRatio(-50), panRatio(100))).toBeCloseTo(202.5);
    });

    it('mirrors the sign for counter-clockwise arcs', () => {
      const ccw = normalizeArcConfig({ startAngle: -135, sweepAngle: 270, direction: 'ccw' });
      const center = panRatio(0);
      expect(getSignedArcSweepBetweenRatios(ccw, center, panRatio(50))).toBeCloseTo(-67.5);
      expect(getSignedArcSweepBetweenRatios(ccw, center, panRatio(-50))).toBeCloseTo(67.5);
    });

    it('reaches a half turn at the far end of a full-circle arc', () => {
      const full = normalizeArcConfig({ startAngle: 0, sweepAngle: 360 });
      expect(getSignedArcSweepBetweenRatios(full, panRatio(0), panRatio(100))).toBeCloseTo(180);
    });
  });
});
