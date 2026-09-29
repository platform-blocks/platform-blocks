// Value → color scales and the small amount of color math they need. Shared by
// every chart that colors marks by data (Histogram bins, Heatmap cells, …) so a
// "sequential" or "threshold" scale means the same thing wherever it is passed.
//
// Color resolution order, for any chart that supports these props:
//   1. the data item's own `color`
//   2. the series' `color`
//   3. `colorScale` (config or function; a function returning undefined falls through)
//   4. the chart-level color prop (`barColor`, `lineColor`, …)
//   5. the theme's `accentPalette` slot

export interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Parse `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, `rgb()` and `rgba()`. Alpha is
 * dropped. Returns null for anything else (named colors, `var()`, gradients).
 */
export function parseColor(input: string | undefined | null): RGB | null {
  if (!input) return null;
  const value = input.trim();
  if (value[0] === '#') {
    let hex = value.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      hex = hex.slice(0, 3).split('').map((c) => c + c).join('');
    } else if (hex.length === 8) {
      hex = hex.slice(0, 6);
    }
    if (hex.length !== 6 || !/^[0-9a-f]{6}$/i.test(hex)) return null;
    const n = parseInt(hex, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  const fn = value.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
  if (fn) {
    const [r, g, b] = [fn[1], fn[2], fn[3]].map((c) => Math.max(0, Math.min(255, Math.round(Number(c)))));
    if ([r, g, b].some((c) => Number.isNaN(c))) return null;
    return { r, g, b };
  }
  return null;
}

export function rgbToHex({ r, g, b }: RGB): string {
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/**
 * Linear RGB blend: `t = 0` is `a`, `t = 1` is `b`. If either color cannot be
 * parsed, returns whichever endpoint `t` is closer to.
 */
export function interpolateColor(a: string, b: string, t: number): string {
  const pa = parseColor(a);
  const pb = parseColor(b);
  if (!pa || !pb) return t < 0.5 ? a : b;
  const k = Math.min(1, Math.max(0, t));
  return rgbToHex({
    r: Math.round(pa.r + (pb.r - pa.r) * k),
    g: Math.round(pa.g + (pb.g - pa.g) * k),
    b: Math.round(pa.b + (pb.b - pa.b) * k),
  });
}

/** Evenly spaced multi-stop ramp: `t` in [0, 1] walks `colors` end to end. */
export function interpolateColors(colors: string[], t: number, fallback = '#ccc'): string {
  if (colors.length === 0) return fallback;
  if (colors.length === 1) return colors[0];
  const k = Math.min(1, Math.max(0, t));
  const seg = 1 / (colors.length - 1);
  const idx = Math.min(colors.length - 2, Math.floor(k / seg));
  return interpolateColor(colors[idx], colors[idx + 1], (k - idx * seg) / seg);
}

/** Hue in degrees, or null for an achromatic / unparseable color. */
function hueOf(color: string): number | null {
  const rgb = parseColor(color);
  if (!rgb) return null;
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d < 0.08) return null;
  let h: number;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return (h * 60 + 360) % 360;
}

/**
 * The palette color whose hue sits farthest around the wheel from `base` — the
 * natural opposite pole for a diverging scale. Falls back to the second palette
 * slot when hues cannot be read.
 */
export function oppositeHue(base: string, palette: string[]): string {
  const baseHue = hueOf(base);
  let best: string | undefined;
  let bestDistance = -1;
  if (baseHue != null) {
    for (const color of palette) {
      const hue = hueOf(color);
      if (hue == null) continue;
      const raw = Math.abs(hue - baseHue);
      const distance = Math.min(raw, 360 - raw);
      if (distance > bestDistance) {
        bestDistance = distance;
        best = color;
      }
    }
  }
  return best ?? palette.find((c) => c !== base) ?? base;
}

export interface ColorScaleStop {
  /** Data value at which `color` applies exactly */
  value: number;
  color: string;
}

/**
 * Declarative value → color mapping.
 *
 * - `sequential` (default) — one ramp, low → high. Use for magnitude.
 *   Defaults to a single-hue ramp built from the chart's base color.
 * - `diverging` — two arms either side of `midpoint`, meeting at a neutral gray.
 *   Use for above/below a baseline or target. Arms are symmetric, so equal
 *   distances from the midpoint get equal intensity.
 * - `threshold` — flat bands split at `thresholds`. Use when ranges have meaning
 *   (under / near / over an SLO). Without `thresholds` the domain is split into
 *   `colors.length` equal bands.
 */
export interface ColorScaleConfig {
  type?: 'sequential' | 'diverging' | 'threshold';
  /**
   * sequential: the ramp, low → high (2+ colors).
   * diverging: `[low, high]` (tints and a neutral middle are added) or `[low, …, mid, …, high]` with an odd count.
   * threshold: one color per band — `thresholds.length + 1` of them.
   */
  colors?: string[];
  /** Value extent the ramp spans. Defaults to the data's extent. */
  domain?: [number, number];
  /** Diverging only: the neutral value. Defaults to the center of the domain. */
  midpoint?: number;
  /** Threshold only: ascending breakpoints. A value equal to a breakpoint takes the band above it. */
  thresholds?: number[];
  /** Threshold only: a legend label per band, so band meaning never rides on color alone. */
  labels?: string[];
  /** Sequential only: explicit value → color stops (interpolated between). Overrides `colors` and `domain`. */
  stops?: ColorScaleStop[];
  /**
   * Sequential only: how values spread along the ramp. `'log'` gives each order of
   * magnitude an equal share, for data spanning 1 to 10,000. Needs a positive domain.
   */
  interpolation?: 'linear' | 'log';
}

/** Theme-derived inputs a scale uses when the config leaves colors out. */
export interface ColorScaleContext {
  /** Anchor hue — the chart's own color (e.g. `barColor`) or palette slot 0 */
  base: string;
  /** Chart surface; the light end of a sequential ramp recedes toward it */
  background: string;
  /** Primary ink; the strong end of a sequential ramp leans toward it */
  ink: string;
  /** Categorical palette, for threshold bands and the diverging opposite pole */
  palette: string[];
}

/** The colors a config resolves to once theme defaults are filled in. */
export function resolveColorScaleColors(config: ColorScaleConfig, ctx: ColorScaleContext): string[] {
  const type = config.type ?? 'sequential';
  const given = config.colors?.filter(Boolean) ?? [];

  if (type === 'threshold') {
    const bandCount = config.thresholds?.length ? config.thresholds.length + 1 : Math.max(given.length, 1);
    return Array.from({ length: bandCount }, (_, i) => given[i] ?? ctx.palette[i % Math.max(1, ctx.palette.length)] ?? ctx.base);
  }

  if (type === 'diverging') {
    const neutral = interpolateColor(ctx.ink, ctx.background, 0.75);
    if (given.length >= 3 && given.length % 2 === 1) return given;
    const low = given[0] ?? ctx.base;
    const high = given.length > 1 ? given[given.length - 1] : oppositeHue(low, ctx.palette);
    // Each arm steps through a tint of its pole on the way to the neutral, so the
    // arms keep their hue instead of washing straight into gray.
    const tint = (pole: string) => interpolateColor(pole, ctx.background, 0.5);
    return [low, tint(low), neutral, tint(high), high];
  }

  if (config.stops?.length) return [...config.stops].sort((a, b) => a.value - b.value).map((s) => s.color);
  if (given.length >= 2) return given;
  const base = given[0] ?? ctx.base;
  // One hue, light → dark on a light surface; the same blend flips the anchor on
  // a dark surface, where "near zero" should recede into the dark.
  return [interpolateColor(base, ctx.background, 0.72), base, interpolateColor(base, ctx.ink, 0.28)];
}

/**
 * Build `value => color` for a config. `dataDomain` is used when the config has
 * no `domain` of its own.
 */
export function createColorScale(
  config: ColorScaleConfig,
  dataDomain: [number, number],
  ctx: ColorScaleContext
): (value: number) => string {
  const type = config.type ?? 'sequential';
  const colors = resolveColorScaleColors(config, ctx);
  const [lo, hi] = config.domain ?? dataDomain;
  const span = hi - lo;
  const norm = (v: number) => (span === 0 || !Number.isFinite(span) ? 0.5 : (v - lo) / span);

  if (type === 'threshold') {
    const breaks = config.thresholds?.length
      ? [...config.thresholds].sort((a, b) => a - b)
      : Array.from({ length: colors.length - 1 }, (_, i) => lo + (span * (i + 1)) / colors.length);
    // Values computed from bin edges land a hair off a breakpoint (2.4999999999999996
    // for 2.5); treat those as on it.
    const epsilon = (Math.abs(span) || Math.abs(breaks[breaks.length - 1] ?? 1) || 1) * 1e-9;
    return (value) => {
      let band = 0;
      while (band < breaks.length && value >= breaks[band] - epsilon) band += 1;
      return colors[Math.min(band, colors.length - 1)];
    };
  }

  if (type === 'diverging') {
    const mid = config.midpoint ?? (lo + hi) / 2;
    const reach = Math.max(Math.abs(mid - lo), Math.abs(hi - mid)) || 1;
    const midIndex = (colors.length - 1) / 2;
    const lowArm = colors.slice(0, midIndex + 1).reverse();
    const highArm = colors.slice(midIndex);
    return (value) => {
      const t = Math.min(1, Math.abs(value - mid) / reach);
      return interpolateColors(value < mid ? lowArm : highArm, t);
    };
  }

  const stops = config.stops?.length ? [...config.stops].sort((a, b) => a.value - b.value) : null;
  if (stops) {
    return (value) => {
      if (value <= stops[0].value) return stops[0].color;
      for (let i = 1; i < stops.length; i += 1) {
        const upper = stops[i];
        if (value <= upper.value) {
          const lower = stops[i - 1];
          const width = upper.value - lower.value;
          return width === 0 ? upper.color : interpolateColor(lower.color, upper.color, (value - lower.value) / width);
        }
      }
      return stops[stops.length - 1].color;
    };
  }
  if (config.interpolation === 'log') {
    const safeLo = lo > 0 ? lo : 1e-6;
    const logSpan = Math.log(Math.max(hi, safeLo * (1 + 1e-6))) - Math.log(safeLo);
    return (value) => {
      const t = logSpan > 0 ? (Math.log(Math.max(value, safeLo)) - Math.log(safeLo)) / logSpan : 0.5;
      return interpolateColors(colors, t);
    };
  }
  return (value) => interpolateColors(colors, norm(value));
}
