import {
  resolveColorProp,
  resolveTextColor,
  resolveBg,
  resolveAccentColor,
  resolveLineColor,
} from '../resolveColors';
import { DEFAULT_THEME } from '../defaultTheme';
import { DARK_THEME } from '../darkTheme';

const T = DEFAULT_THEME;

describe('resolveColorProp', () => {
  it('passes raw CSS colors through untouched', () => {
    expect(resolveColorProp(T, '#FF0000')).toBe('#FF0000');
    expect(resolveColorProp(T, 'rebeccapurple')).toBe('rebeccapurple');
  });

  it('does not mistake a decimal inside a CSS function for shade syntax', () => {
    // A loose `value.includes('.')` test splits this into nonsense.
    expect(resolveColorProp(T, 'rgba(0, 0, 0, 0.5)')).toBe('rgba(0, 0, 0, 0.5)');
    expect(resolveTextColor(T, 'hsl(210, 50%, 50.5%)')).toBe('hsl(210, 50%, 50.5%)');
  });

  it('resolves explicit palette.shade syntax ahead of any named token', () => {
    expect(resolveColorProp(T, 'primary.6')).toBe(T.colors.primary[6]);
    // `primary` alone is a theme.text key, but the explicit shade wins.
    expect(resolveTextColor(T, 'primary.6')).toBe(T.colors.primary[6]);
  });

  it('falls back through the shade list when the requested index is absent', () => {
    expect(resolveColorProp(T, 'primary.42', { shades: [5, 0] })).toBe(T.colors.primary[5]);
  });

  it('returns undefined for an absent value', () => {
    expect(resolveColorProp(T, undefined)).toBeUndefined();
    expect(resolveTextColor(T, '')).toBeUndefined();
  });
});

describe('resolveTextColor', () => {
  it('resolves theme.text roles', () => {
    expect(resolveTextColor(T, 'primary')).toBe(T.text.primary);
    expect(resolveTextColor(T, 'secondary')).toBe(T.text.secondary);
    expect(resolveTextColor(T, 'muted')).toBe(T.text.muted);
    expect(resolveTextColor(T, 'disabled')).toBe(T.text.disabled);
    expect(resolveTextColor(T, 'link')).toBe(T.text.link);
  });

  it('treats `dimmed` as an alias for the muted token', () => {
    expect(resolveTextColor(T, 'dimmed')).toBe(T.text.muted);
  });

  it('lands a bare status palette on the readable shade, not the fill base', () => {
    expect(resolveTextColor(T, 'error')).toBe(T.colors.error[6]);
    expect(resolveTextColor(T, 'success')).toBe(T.colors.success[6]);
    expect(resolveTextColor(T, 'warning')).toBe(T.colors.warning[6]);
  });

  it('picks the higher-contrast neighbour of the base in both schemes', () => {
    // Palettes invert between schemes, so a fixed "darker" index would only work
    // in one. Shade 6 has to move away from the surface in both.
    const luminance = (hex: string) => {
      const n = parseInt(hex.slice(1), 16);
      return ((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114;
    };
    expect(luminance(resolveTextColor(T, 'error')!)).toBeLessThan(luminance(T.colors.error[5]));
    expect(luminance(resolveTextColor(DARK_THEME, 'error')!)).toBeGreaterThan(
      luminance(DARK_THEME.colors.error[5]),
    );
  });
});

describe('resolveBg', () => {
  it('resolves theme.backgrounds tokens', () => {
    expect(resolveBg(T, 'surface')).toBe(T.backgrounds.surface);
    expect(resolveBg(T, 'subtle')).toBe(T.backgrounds.subtle);
    expect(resolveBg(T, 'border')).toBe(T.backgrounds.border);
  });

  it('lands a bare palette on the subtle tint', () => {
    expect(resolveBg(T, 'primary')).toBe(T.colors.primary[1]);
    expect(resolveBg(T, 'error')).toBe(T.colors.error[1]);
  });
});

describe('resolveAccentColor', () => {
  it('lands a bare palette on the vivid base', () => {
    expect(resolveAccentColor(T, 'primary')).toBe(T.colors.primary[5]);
    expect(resolveAccentColor(T, 'success')).toBe(T.colors.success[5]);
  });

  it('reads `primary` as the brand palette, never as body text', () => {
    expect(resolveAccentColor(T, 'primary')).not.toBe(T.text.primary);
  });
});

describe('resolveLineColor', () => {
  it('resolves the divider vocabulary', () => {
    expect(resolveLineColor(T, 'border')).toBe(T.backgrounds.border);
    expect(resolveLineColor(T, 'subtle')).toBe(T.backgrounds.subtle);
    expect(resolveLineColor(T, 'muted')).toBe(T.text.muted);
  });

  it('keeps a tinted rule as chrome rather than an accent', () => {
    expect(resolveLineColor(T, 'primary')).toBe(T.colors.primary[3]);
    expect(resolveLineColor(T, 'success')).toBe(T.colors.success[3]);
  });

  it('does not divert palette names into theme.text', () => {
    // `muted` is the only text token in this vocabulary; adding 'text' to the
    // scope list would turn a tinted rule into body-text gray.
    expect(resolveLineColor(T, 'primary')).not.toBe(T.text.primary);
    expect(resolveLineColor(T, 'secondary')).not.toBe(T.text.secondary);
  });
});
