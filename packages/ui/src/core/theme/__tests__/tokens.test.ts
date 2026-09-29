import { DARK_THEME } from '../darkTheme';
import { DEFAULT_THEME } from '../defaultTheme';
import { DESIGN_TOKENS, RADIUS_TOKENS } from '../../design-tokens';
import { RADIUS_SCALE } from '../radius';
import { DEFAULT_CONTROL_SIZES } from '../scales';
import { SIZE_SCALES, getHeight } from '../sizes';
import {
  getBreakpoints,
  getControlSize,
  onColor,
  parsePx,
  resolveFontSize,
  resolveIconSize,
  resolveLineHeight,
  resolveRadius,
  resolveScrim,
  resolveSpacing,
  stepDown,
} from '../tokens';
import { contrastRatio } from '../colorUtils';
import { getBuiltInTheme, mergeTheme, normalizeTheme, resolveThemeForScheme } from '../utils';
import type { PlatformBlocksTheme } from '../types';

describe('parsePx', () => {
  it('parses px, rem and unitless strings and passes numbers through', () => {
    expect(parsePx('8px')).toBe(8);
    expect(parsePx('0.5rem')).toBe(8);
    expect(parsePx('12')).toBe(12);
    expect(parsePx(7)).toBe(7);
    expect(parsePx('auto')).toBeUndefined();
    expect(parsePx(undefined)).toBeUndefined();
  });
});

describe('scale resolvers', () => {
  it('resolves spacing tokens through theme.spacing', () => {
    expect(resolveSpacing(DEFAULT_THEME, 'xs')).toBe(4);
    expect(resolveSpacing(DEFAULT_THEME, 'md')).toBe(12);
    expect(resolveSpacing(DEFAULT_THEME, '3xl')).toBe(32);
    expect(resolveSpacing(DEFAULT_THEME, 10)).toBe(10);
    expect(resolveSpacing(DEFAULT_THEME, '0')).toBe(0);
    expect(resolveSpacing(DEFAULT_THEME, 'auto')).toBe('auto');
  });

  it('follows a custom theme scale', () => {
    const theme = mergeTheme(DEFAULT_THEME, { spacing: { ...DEFAULT_THEME.spacing, md: '20px' } });
    expect(resolveSpacing(theme, 'md')).toBe(20);
  });

  it('falls back to the default numbers for partial themes', () => {
    expect(resolveSpacing({} as Partial<PlatformBlocksTheme>, 'lg')).toBe(16);
    expect(resolveRadius(null, 'lg')).toBe(8);
    expect(resolveFontSize(undefined, 'md')).toBe(14);
  });

  it('resolves radii, including none / full / chip', () => {
    expect(resolveRadius(DEFAULT_THEME, 'md')).toBe(6);
    expect(resolveRadius(DEFAULT_THEME, '3xl')).toBe(20);
    expect(resolveRadius(DEFAULT_THEME, 'none')).toBe(0);
    expect(resolveRadius(DEFAULT_THEME, 'full')).toBe(9999);
    expect(resolveRadius(DEFAULT_THEME, 'chip')).toBe(9999);
    expect(resolveRadius(DEFAULT_THEME, 5)).toBe(5);
    expect(resolveRadius(DEFAULT_THEME, undefined)).toBe(6);
  });

  it('resolves font sizes, line heights and icon sizes', () => {
    expect(resolveFontSize(DEFAULT_THEME, 'sm')).toBe(12);
    expect(resolveFontSize(DEFAULT_THEME, 22)).toBe(22);
    expect(resolveLineHeight(DEFAULT_THEME, 'md')).toBeCloseTo(14 * 1.4);
    expect(resolveLineHeight(DEFAULT_THEME, 16)).toBeCloseTo(16 * 1.3);
    expect(resolveIconSize(DEFAULT_THEME, 'md')).toBe(20);
    expect(resolveIconSize(DEFAULT_THEME, 18)).toBe(18);
  });

  it('caches parsed scales per scale object', () => {
    const theme = mergeTheme(DEFAULT_THEME, { spacing: { ...DEFAULT_THEME.spacing } });
    expect(resolveSpacing(theme, 'sm')).toBe(8);
    // Mutating after the first read is not observed: parsed once per object.
    (theme.spacing as Record<string, string>).sm = '99px';
    expect(resolveSpacing(theme, 'sm')).toBe(8);
  });
});

describe('getControlSize', () => {
  it('returns the canonical heights', () => {
    const heights = (['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const).map(
      (size) => getControlSize(DEFAULT_THEME, size).height
    );
    expect(heights).toEqual([28, 32, 40, 44, 48, 52, 56]);
  });

  it('returns every metric for a size, defaulting to md', () => {
    expect(getControlSize(DEFAULT_THEME, 'md')).toEqual({
      height: 40,
      paddingX: 12,
      fontSize: 14,
      iconSize: 16,
      radius: 8,
      gap: 6,
    });
    expect(getControlSize(DEFAULT_THEME, undefined)).toBe(getControlSize(DEFAULT_THEME, 'md'));
  });

  it('treats a number as the height and scales the rest from md', () => {
    const metrics = getControlSize(DEFAULT_THEME, 80);
    expect(metrics.height).toBe(80);
    expect(metrics.paddingX).toBe(24);
    expect(metrics.fontSize).toBe(28);
  });

  it('reads theme.controlSizes with per-field fallback', () => {
    const theme = mergeTheme(DEFAULT_THEME, { controlSizes: { md: { height: 42 } } });
    expect(getControlSize(theme, 'md')).toMatchObject({ height: 42, paddingX: 12 });
  });

  it('keeps control font sizes on the theme font scale when fontSizes is overridden', () => {
    const theme = mergeTheme(DEFAULT_THEME, { fontSizes: { ...DEFAULT_THEME.fontSizes, md: '15px' } });
    expect(getControlSize(theme, 'md').fontSize).toBe(15);
  });

  it('steps down one size for compact controls', () => {
    expect(stepDown('md')).toBe('sm');
    expect(stepDown('xs')).toBe('xs');
    expect(stepDown('3xl')).toBe('2xl');
    expect(stepDown(30)).toBe(30);
    expect(getControlSize(DEFAULT_THEME, stepDown('lg')).height).toBe(40);
  });
});

describe('one set of numbers', () => {
  it('derives the legacy tables from the default theme', () => {
    expect(SIZE_SCALES.height).toEqual({ xs: 28, sm: 32, md: 40, lg: 44, xl: 48, '2xl': 52, '3xl': 56 });
    expect(getHeight('md')).toBe(40);
    expect(RADIUS_TOKENS['3xl']).toBe(20);
    expect(RADIUS_SCALE['3xl']).toBe(20);
    expect(DESIGN_TOKENS.spacing.md).toBe(resolveSpacing(DEFAULT_THEME, 'md'));
    expect(DESIGN_TOKENS.interactive.height.md).toBe(DEFAULT_CONTROL_SIZES.md.height);
  });
});

describe('getBreakpoints', () => {
  it('is the single breakpoint table', () => {
    expect(getBreakpoints(DEFAULT_THEME)).toEqual({ xs: 480, sm: 576, md: 768, lg: 992, xl: 1200 });
    expect(getBreakpoints(DARK_THEME)).toEqual(getBreakpoints(DEFAULT_THEME));
  });
});

describe('theme shape', () => {
  const roles = ['borderStrong', 'hover', 'pressed', 'selected', 'disabled', 'mark', 'scrim'] as const;

  it('defines the new background roles in both schemes, with distinct values', () => {
    for (const role of roles) {
      expect(DEFAULT_THEME.backgrounds[role]).toBeTruthy();
      expect(DARK_THEME.backgrounds[role]).toBeTruthy();
      expect(DARK_THEME.backgrounds[role]).not.toBe(DEFAULT_THEME.backgrounds[role]);
    }
  });

  it('keeps mark readable under text.primary in both schemes (>= 4.5:1)', () => {
    expect(contrastRatio(DEFAULT_THEME.text.primary, DEFAULT_THEME.backgrounds.mark)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(DARK_THEME.text.primary, DARK_THEME.backgrounds.mark)).toBeGreaterThanOrEqual(4.5);
  });

  it('derives the deprecated semantic aliases from the roles', () => {
    for (const theme of [DEFAULT_THEME, DARK_THEME]) {
      expect(theme.semantic.borderDefault).toBe(theme.backgrounds.borderStrong);
      expect(theme.semantic.borderSubtle).toBe(theme.backgrounds.border);
      expect(theme.semantic.surfaceElevated).toBe(theme.backgrounds.elevated);
      expect(theme.semantic.focusRing).toBe(theme.states?.focusRing);
    }
    const merged = mergeTheme(DEFAULT_THEME, { backgrounds: { border: '#123456' } });
    expect(merged.semantic.borderSubtle).toBe('#123456');
  });

  it('has z-indices, control sizes and a monospace family on both themes', () => {
    expect(DEFAULT_THEME.zIndices.modal).toBe(1400);
    expect(DARK_THEME.zIndices.tooltip).toBe(1700);
    expect(DARK_THEME.controlSizes).toBe(DEFAULT_THEME.controlSizes);
    expect(DEFAULT_THEME.fontFamilyMono).toBe('Menlo'); // jest runs as iOS
  });

  it('fills post-1.x fields on complete themes that predate them', () => {
    const legacy = { ...DARK_THEME } as Partial<PlatformBlocksTheme>;
    delete legacy.controlSizes;
    delete legacy.zIndices;
    delete legacy.fontFamilyMono;
    const legacyBackgrounds = { ...DARK_THEME.backgrounds } as Partial<PlatformBlocksTheme['backgrounds']>;
    delete legacyBackgrounds.hover;
    legacy.backgrounds = legacyBackgrounds as PlatformBlocksTheme['backgrounds'];

    const normalized = normalizeTheme(legacy as PlatformBlocksTheme);
    expect(normalized.controlSizes).toBeDefined();
    expect(normalized.zIndices.modal).toBe(1400);
    expect(normalized.backgrounds.hover).toBe(DARK_THEME.backgrounds.hover);
    expect(normalizeTheme(legacy as PlatformBlocksTheme)).toBe(normalized);
    expect(normalizeTheme(DEFAULT_THEME)).toBe(DEFAULT_THEME);
  });

  it('fills backgrounds.scrim from the built-in theme of the same scheme', () => {
    const withoutScrim = (theme: PlatformBlocksTheme) => {
      const backgrounds = { ...theme.backgrounds } as Partial<PlatformBlocksTheme['backgrounds']>;
      delete backgrounds.scrim;
      return { ...theme, backgrounds } as PlatformBlocksTheme;
    };
    expect(normalizeTheme(withoutScrim(DARK_THEME)).backgrounds.scrim).toBe(DARK_THEME.backgrounds.scrim);
    expect(normalizeTheme(withoutScrim(DEFAULT_THEME)).backgrounds.scrim).toBe(DEFAULT_THEME.backgrounds.scrim);
    // Overrides may set it (or leave it to the base theme).
    expect(mergeTheme(DEFAULT_THEME, { backgrounds: { scrim: 'rgba(1, 2, 3, 0.4)' } }).backgrounds.scrim).toBe('rgba(1, 2, 3, 0.4)');
    expect(mergeTheme(DARK_THEME, { backgrounds: { border: '#123456' } }).backgrounds.scrim).toBe(DARK_THEME.backgrounds.scrim);
  });
});

describe('resolveScrim', () => {
  it('returns the theme scrim, or its color at an explicit opacity', () => {
    expect(resolveScrim(DEFAULT_THEME)).toBe(DEFAULT_THEME.backgrounds.scrim);
    expect(resolveScrim(DARK_THEME)).toBe(DARK_THEME.backgrounds.scrim);
    expect(resolveScrim(DEFAULT_THEME, 0.9)).toBe('rgba(15, 23, 42, 0.9)');
    expect(resolveScrim(DARK_THEME, 2)).toBe('rgba(0, 0, 0, 1)');
    const hexScrim = mergeTheme(DEFAULT_THEME, { backgrounds: { scrim: '#102030' } });
    expect(resolveScrim(hexScrim, 0.5)).toBe('rgba(16, 32, 48, 0.5)');
  });

  it('reads the literal color behind a CSS-variable theme', () => {
    const cssVarTheme = {
      ...DEFAULT_THEME,
      backgrounds: { ...DEFAULT_THEME.backgrounds, scrim: 'var(--platform-blocks-bg-scrim, rgba(15, 23, 42, 0.45))' },
      literalColors: { text: DEFAULT_THEME.text, backgrounds: DEFAULT_THEME.backgrounds },
    } as PlatformBlocksTheme;
    expect(resolveScrim(cssVarTheme)).toBe(cssVarTheme.backgrounds.scrim);
    expect(resolveScrim(cssVarTheme, 0.2)).toBe('rgba(15, 23, 42, 0.2)');
  });

  it('falls back to the built-in scrim for partial themes', () => {
    expect(resolveScrim(undefined)).toBe(DEFAULT_THEME.backgrounds.scrim);
    expect(resolveScrim({ colorScheme: 'dark' })).toBe(DARK_THEME.backgrounds.scrim);
  });
});

describe('resolveThemeForScheme', () => {
  it('uses the built-in theme per scheme when no theme is given', () => {
    expect(resolveThemeForScheme(undefined, 'light')).toBe(DEFAULT_THEME);
    expect(resolveThemeForScheme(undefined, 'dark')).toBe(getBuiltInTheme('dark'));
  });

  it('merges a partial override onto the scheme-appropriate built-in theme', () => {
    const override = { primaryColor: '#FF0000' };
    const dark = resolveThemeForScheme(override, 'dark');
    expect(dark.colorScheme).toBe('dark');
    expect(dark.backgrounds.base).toBe(DARK_THEME.backgrounds.base);
    expect(dark.primaryColor).toBe('#FF0000');
    expect(resolveThemeForScheme(override, 'light').backgrounds.base).toBe(DEFAULT_THEME.backgrounds.base);
    // cached per input + scheme
    expect(resolveThemeForScheme(override, 'dark')).toBe(dark);
  });

  it('picks the matching side of a { light, dark } pair', () => {
    const pair = { light: { primaryColor: '#111111' }, dark: { primaryColor: '#EEEEEE' } };
    expect(resolveThemeForScheme(pair, 'light').primaryColor).toBe('#111111');
    expect(resolveThemeForScheme(pair, 'dark').primaryColor).toBe('#EEEEEE');
    expect(resolveThemeForScheme(pair, 'dark').colorScheme).toBe('dark');
    expect(resolveThemeForScheme({ light: { primaryColor: '#111111' } }, 'dark')).toBe(getBuiltInTheme('dark'));
  });

  it('lets an explicit colorScheme pin the scheme', () => {
    const pinned = resolveThemeForScheme({ colorScheme: 'dark' }, 'light');
    expect(pinned.colorScheme).toBe('dark');
    expect(pinned.backgrounds.base).toBe(DARK_THEME.backgrounds.base);
  });
});

describe('onColor', () => {
  it('prefers onPrimary on saturated fills and dark ink on light fills', () => {
    expect(onColor(DEFAULT_THEME, DEFAULT_THEME.colors.primary[5])).toBe('#FFFFFF');
    expect(onColor(DEFAULT_THEME, '#FDE68A')).toBe(DEFAULT_THEME.text.primary);
    const darkInk = onColor(getBuiltInTheme('dark'), '#FDE68A');
    expect(contrastRatio(darkInk, '#FDE68A')).toBeGreaterThanOrEqual(4.5);
  });

  it('measures translucent and var() fills', () => {
    expect(onColor(DEFAULT_THEME, 'rgba(0, 0, 0, 0.04)')).toBe(DEFAULT_THEME.text.primary);
    expect(onColor(DEFAULT_THEME, 'var(--platform-blocks-bg-selected, #1E3A8A)')).toBe('#FFFFFF');
  });
});
