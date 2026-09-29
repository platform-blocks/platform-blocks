import { Platform } from 'react-native';

import { DARK_THEME } from '../darkTheme';
import { DEFAULT_THEME } from '../defaultTheme';
import {
  boxShadowToStyle,
  createShadowStyles,
  parseBoxShadow,
  parseShadowColor,
  pickProminentLayer,
  resolveShadow,
} from '../shadow';
import { resolveShadow as resolveShadowToken } from '../tokens';

const TOKENS = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
const originalOS = Platform.OS;
const setPlatform = (os: string) => {
  (Platform as unknown as { OS: string }).OS = os;
};

afterEach(() => setPlatform(originalOS));

describe('parseBoxShadow', () => {
  it('accepts a unitless 0 and decimals', () => {
    expect(parseBoxShadow('0 1px 3px rgba(0, 0, 0, 0.1)')).toEqual([
      { inset: false, offsetX: 0, offsetY: 1, blur: 3, spread: 0, color: 'rgb(0, 0, 0)', opacity: 0.1 },
    ]);
    expect(parseBoxShadow('0.5px 1.5px 2.5px #000')[0]).toMatchObject({ offsetX: 0.5, offsetY: 1.5, blur: 2.5 });
  });

  it('parses negative offsets, spread, inset and several layers', () => {
    const layers = parseBoxShadow('inset 0 -2px 4px 1px rgba(1,2,3,.5), -1px 4px 8px #11223380');
    expect(layers).toHaveLength(2);
    expect(layers[0]).toMatchObject({ inset: true, offsetY: -2, blur: 4, spread: 1, color: 'rgb(1, 2, 3)', opacity: 0.5 });
    expect(layers[1]).toMatchObject({ inset: false, offsetX: -1, offsetY: 4, blur: 8, color: '#112233' });
    expect(layers[1].opacity).toBeCloseTo(0x80 / 255);
  });

  it('handles color-first layers, rem units and none', () => {
    expect(parseBoxShadow('rgba(0,0,0,0.2) 0 0.25rem 0.5rem')[0]).toMatchObject({ offsetY: 4, blur: 8, opacity: 0.2 });
    expect(parseBoxShadow('none')).toEqual([]);
    expect(parseBoxShadow('')).toEqual([]);
  });

  it('parses modern color syntax', () => {
    expect(parseShadowColor('rgb(0 0 0 / 25%)')).toEqual({ color: 'rgb(0, 0, 0)', opacity: 0.25 });
    expect(parseShadowColor('transparent').opacity).toBe(0);
    expect(parseShadowColor('black')).toEqual({ color: 'black', opacity: 1 });
  });
});

describe('pickProminentLayer', () => {
  it('prefers the largest blur and ignores inset layers', () => {
    const layers = parseBoxShadow('inset 0 0 40px #000, 0 1px 2px rgba(0,0,0,.3), 0 4px 12px rgba(0,0,0,.1)');
    expect(pickProminentLayer(layers)).toMatchObject({ blur: 12, offsetY: 4 });
  });
});

describe('native shadows', () => {
  beforeEach(() => setPlatform('ios'));

  it('maps the prominent layer to iOS shadow props and Android elevation', () => {
    expect(boxShadowToStyle('0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.10)')).toEqual({
      shadowColor: 'rgb(0, 0, 0)',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 12,
    });
  });

  it('gives every light token its own native style', () => {
    const styles = TOKENS.map((token) => resolveShadow(DEFAULT_THEME, token));
    styles.forEach((style) => {
      expect(style.shadowOffset).toBeDefined();
      expect(style.elevation).toBeGreaterThanOrEqual(1);
    });
    const serialized = new Set(styles.map((style) => JSON.stringify(style)));
    expect(serialized.size).toBe(TOKENS.length);
  });

  it('gives every dark token its own native style, distinct from light', () => {
    const dark = TOKENS.map((token) => resolveShadow(DARK_THEME, token));
    const light = TOKENS.map((token) => resolveShadow(DEFAULT_THEME, token));
    expect(new Set(dark.map((style) => JSON.stringify(style))).size).toBe(TOKENS.length);
    dark.forEach((style, index) => {
      expect(JSON.stringify(style)).not.toBe(JSON.stringify(light[index]));
      expect(style.shadowOpacity).toBeGreaterThan(light[index].shadowOpacity as number);
    });
  });

  it('grows elevation with the token', () => {
    const elevations = TOKENS.map((token) => resolveShadow(DEFAULT_THEME, token).elevation as number);
    for (let i = 1; i < elevations.length; i += 1) {
      expect(elevations[i]).toBeGreaterThanOrEqual(elevations[i - 1]);
    }
    expect(elevations[elevations.length - 1]).toBeGreaterThan(elevations[0]);
  });

  it('returns an empty style for none / unknown tokens and caches per theme', () => {
    expect(resolveShadow(DEFAULT_THEME, 'none')).toEqual({});
    expect(resolveShadow({ shadows: undefined } as never, 'md')).toEqual({});
    expect(resolveShadow(DEFAULT_THEME, 'md')).toBe(resolveShadow(DEFAULT_THEME, 'md'));
    expect(resolveShadowToken(DEFAULT_THEME, 'md')).toBe(resolveShadow(DEFAULT_THEME, 'md'));
  });

  it('keeps createShadowStyles working (fresh object, component defaults)', () => {
    const style = createShadowStyles(undefined, DEFAULT_THEME, 'dropdown');
    expect(style).toEqual(resolveShadow(DEFAULT_THEME, 'md'));
    expect(style).not.toBe(resolveShadow(DEFAULT_THEME, 'md'));
    expect(createShadowStyles('none', DEFAULT_THEME, 'dropdown')).toEqual({});
  });
});

describe('web shadows', () => {
  beforeEach(() => setPlatform('web'));

  it('returns the CSS box-shadow of the current theme', () => {
    const shadows = { ...DEFAULT_THEME.shadows };
    expect(resolveShadow({ shadows }, 'lg')).toEqual({ boxShadow: DEFAULT_THEME.shadows.lg });
    const darkShadows = { ...DARK_THEME.shadows };
    expect(resolveShadow({ shadows: darkShadows }, 'lg')).toEqual({ boxShadow: DARK_THEME.shadows.lg });
  });
});
