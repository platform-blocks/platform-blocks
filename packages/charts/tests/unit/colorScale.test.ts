import {
  createColorScale,
  interpolateColor,
  interpolateColors,
  oppositeHue,
  parseColor,
  resolveColorScaleColors,
  type ColorScaleContext,
} from '../../src/utils/colorScale';
import { fillSwatchColor, isChartGradient } from '../../src/core/ChartFill';

const ctx: ColorScaleContext = {
  base: '#2a78d6',
  background: '#ffffff',
  ink: '#111111',
  palette: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100'],
};

describe('parseColor', () => {
  it('reads short and long hex, dropping alpha', () => {
    expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseColor('#2a78d6')).toEqual({ r: 42, g: 120, b: 214 });
    expect(parseColor('#2a78d680')).toEqual({ r: 42, g: 120, b: 214 });
  });

  it('reads rgb() and rgba()', () => {
    expect(parseColor('rgb(10, 20, 30)')).toEqual({ r: 10, g: 20, b: 30 });
    expect(parseColor('rgba(10,20,30,0.5)')).toEqual({ r: 10, g: 20, b: 30 });
  });

  it('returns null for colors it cannot read', () => {
    expect(parseColor('var(--x)')).toBeNull();
    expect(parseColor('tomato')).toBeNull();
    expect(parseColor('#12')).toBeNull();
  });
});

describe('interpolateColor', () => {
  it('blends endpoints and clamps t', () => {
    expect(interpolateColor('#000000', '#ffffff', 0)).toBe('#000000');
    expect(interpolateColor('#000000', '#ffffff', 1)).toBe('#ffffff');
    expect(interpolateColor('#000000', '#ffffff', 0.5)).toBe('#808080');
    expect(interpolateColor('#000000', '#ffffff', 2)).toBe('#ffffff');
  });

  it('falls back to the nearer endpoint when a color is unreadable', () => {
    expect(interpolateColor('var(--a)', '#ffffff', 0.2)).toBe('var(--a)');
    expect(interpolateColor('var(--a)', '#ffffff', 0.8)).toBe('#ffffff');
  });

  it('walks a multi-stop ramp end to end', () => {
    const ramp = ['#000000', '#ff0000', '#ffffff'];
    expect(interpolateColors(ramp, 0)).toBe('#000000');
    expect(interpolateColors(ramp, 0.5)).toBe('#ff0000');
    expect(interpolateColors(ramp, 1)).toBe('#ffffff');
    expect(interpolateColors([], 0.5)).toBe('#ccc');
  });
});

describe('createColorScale — sequential', () => {
  it('defaults to a one-hue ramp built from the base color', () => {
    const colors = resolveColorScaleColors({}, ctx);
    expect(colors).toHaveLength(3);
    expect(colors[1]).toBe(ctx.base);
    const scale = createColorScale({}, [0, 10], ctx);
    expect(scale(0)).toBe(colors[0]);
    expect(scale(5)).toBe(ctx.base);
    expect(scale(10)).toBe(colors[2]);
  });

  it('honors an explicit domain and clamps outside it', () => {
    const scale = createColorScale({ colors: ['#000000', '#ffffff'], domain: [0, 100] }, [0, 10], ctx);
    expect(scale(50)).toBe('#808080');
    expect(scale(-5)).toBe('#000000');
    expect(scale(500)).toBe('#ffffff');
  });

  it('interpolates between explicit stops', () => {
    const scale = createColorScale(
      { stops: [{ value: 10, color: '#ffffff' }, { value: 0, color: '#000000' }] },
      [0, 100],
      ctx
    );
    expect(scale(-1)).toBe('#000000');
    expect(scale(5)).toBe('#808080');
    expect(scale(11)).toBe('#ffffff');
  });
});

describe('createColorScale — log interpolation', () => {
  it('gives each order of magnitude an equal share of the ramp', () => {
    const scale = createColorScale(
      { colors: ['#000000', '#ffffff'], interpolation: 'log' },
      [1, 10000],
      ctx
    );
    expect(scale(1)).toBe('#000000');
    expect(scale(100)).toBe('#808080');
    expect(scale(10000)).toBe('#ffffff');
  });
});

describe('createColorScale — threshold', () => {
  it('bands values at breakpoints, a breakpoint value taking the band above', () => {
    const scale = createColorScale(
      { type: 'threshold', thresholds: [10, 20], colors: ['#00ff00', '#ffff00', '#ff0000'] },
      [0, 30],
      ctx
    );
    expect(scale(5)).toBe('#00ff00');
    expect(scale(10)).toBe('#ffff00');
    expect(scale(19.9)).toBe('#ffff00');
    expect(scale(20)).toBe('#ff0000');
  });

  it('treats a float a hair under a breakpoint as on it', () => {
    const scale = createColorScale({ type: 'threshold', thresholds: [2.5], colors: ['#000001', '#000002'] }, [1.2, 4], ctx);
    expect(scale(2.4999999999999996)).toBe('#000002');
    expect(scale(2.49)).toBe('#000001');
  });

  it('fills missing band colors from the palette in slot order', () => {
    expect(resolveColorScaleColors({ type: 'threshold', thresholds: [1, 2] }, ctx)).toEqual(ctx.palette.slice(0, 3));
  });

  it('splits the domain evenly when no breakpoints are given', () => {
    const scale = createColorScale({ type: 'threshold', colors: ['#000001', '#000002', '#000003', '#000004'] }, [0, 100], ctx);
    expect(scale(10)).toBe('#000001');
    expect(scale(30)).toBe('#000002');
    expect(scale(60)).toBe('#000003');
    expect(scale(100)).toBe('#000004');
  });
});

describe('createColorScale — diverging', () => {
  const config = { type: 'diverging' as const, colors: ['#0000ff', '#888888', '#ff0000'], midpoint: 0 };

  it('is neutral at the midpoint and full strength at the reach', () => {
    const scale = createColorScale(config, [-10, 10], ctx);
    expect(scale(0)).toBe('#888888');
    expect(scale(-10)).toBe('#0000ff');
    expect(scale(10)).toBe('#ff0000');
  });

  it('keeps the arms symmetric when the domain is lopsided', () => {
    const scale = createColorScale(config, [-2, 10], ctx);
    // 2 below the midpoint is only 20% of the way out, same as 2 above it.
    expect(scale(-2)).toBe(interpolateColor('#888888', '#0000ff', 0.2));
    expect(scale(2)).toBe(interpolateColor('#888888', '#ff0000', 0.2));
  });

  it('adds a neutral middle and an opposite-hue pole by default', () => {
    const [low, , mid, , high] = resolveColorScaleColors({ type: 'diverging' }, ctx);
    expect(low).toBe(ctx.base);
    expect(parseColor(mid)).not.toBeNull();
    expect(high).not.toBe(ctx.base);
  });

  it('steps each arm through a tint of its pole', () => {
    const colors = resolveColorScaleColors({ type: 'diverging', colors: ['#ff0000', '#0000ff'] }, ctx);
    expect(colors).toHaveLength(5);
    expect(colors[0]).toBe('#ff0000');
    expect(colors[1]).toBe(interpolateColor('#ff0000', ctx.background, 0.5));
    expect(colors[3]).toBe(interpolateColor('#0000ff', ctx.background, 0.5));
    expect(colors[4]).toBe('#0000ff');
  });
});

describe('oppositeHue', () => {
  it('picks the palette color farthest around the wheel', () => {
    // Blue's opposite in this set is amber, not the nearer red or green.
    expect(oppositeHue('#3B82F6', ['#3B82F6', '#16A34A', '#D97706', '#EF4444'])).toBe('#D97706');
  });
});

describe('ChartFill helpers', () => {
  it('recognizes gradients and picks a swatch color', () => {
    const gradient = { stops: [{ offset: 0, color: '#aaaaaa', opacity: 0.2 }, { offset: 1, color: '#123456' }] };
    expect(isChartGradient(gradient)).toBe(true);
    expect(isChartGradient('#fff')).toBe(false);
    expect(fillSwatchColor(gradient, '#000')).toBe('#123456');
    expect(fillSwatchColor('#abcdef', '#000')).toBe('#abcdef');
    expect(fillSwatchColor(undefined, '#000')).toBe('#000');
  });
});
