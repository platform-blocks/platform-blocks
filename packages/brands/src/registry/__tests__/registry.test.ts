import {
  brandColors,
  brandIcons,
  brandLabels,
  brandNames,
  getBrand,
  getBrandColors,
  getBrandPalette,
  isBrandName,
} from '..';

describe('brand registry', () => {
  it('uses kebab-case for every multi-word brand name', () => {
    const camelCased = Object.keys(brandIcons).filter((name) => /[A-Z]/.test(name));
    expect(camelCased).toEqual([]);
  });

  it('gives every brand a color config and a label', () => {
    for (const brand of Object.keys(brandIcons)) {
      expect([brand, brand in brandColors, brand in brandLabels]).toEqual([brand, true, true]);
    }
  });

  it('has no colors or labels for brands without a mark', () => {
    expect(Object.keys(brandColors).filter((brand) => !(brand in brandIcons))).toEqual([]);
    expect(Object.keys(brandLabels).filter((brand) => !(brand in brandIcons))).toEqual([]);
  });
});

describe('brandNames', () => {
  it('lists every brand once, A–Z', () => {
    expect(brandNames).toEqual(Object.keys(brandIcons).sort());
  });
});

describe('isBrandName', () => {
  it('accepts registered names only', () => {
    expect(isBrandName('github')).toBe(true);
    expect(isBrandName('google-play')).toBe(true);
    expect(isBrandName('GitHub')).toBe(false);
    expect(isBrandName('toString')).toBe(false);
    expect(isBrandName(undefined)).toBe(false);
  });
});

describe('getBrandColors', () => {
  it('returns a copy callers can change', () => {
    const colors = getBrandColors('spotify');
    expect(colors).toEqual({ backgroundColor: '#1DB954', textColor: '#FFFFFF' });
    colors.backgroundColor = '#000000';
    expect(getBrandColors('spotify').backgroundColor).toBe('#1DB954');
  });

  it('falls back to black on white for an unknown name', () => {
    expect(getBrandColors('nope' as never)).toEqual({ backgroundColor: '#000000', textColor: '#FFFFFF' });
  });
});

describe('getBrandPalette', () => {
  it('leads with the primary color, then the mark colors in drawing order', () => {
    expect(getBrandPalette('google')).toEqual(['#4285F4', '#34A853', '#FBBC05', '#EA4335']);
  });

  it('includes gradient stops and skips gradient references', () => {
    const palette = getBrandPalette('galaxy-store');
    expect(palette).toEqual(expect.arrayContaining(['#FF74F5', '#C062FF', '#6D4DFF']));
    expect(palette.some((color) => color.startsWith('url('))).toBe(false);
  });

  it('returns unique uppercase hex colors for every brand', () => {
    for (const brand of brandNames) {
      const palette = getBrandPalette(brand);
      expect(palette.every((color) => /^#[0-9A-F]{6}$/.test(color))).toBe(true);
      expect(new Set(palette).size).toBe(palette.length);
      expect(palette[0]).toBe(brandColors[brand].backgroundColor.toUpperCase());
    }
  });
});

describe('getBrand', () => {
  it('bundles the label, colors and palette', () => {
    expect(getBrand('github')).toEqual({
      name: 'github',
      label: 'GitHub',
      colors: { backgroundColor: '#181717', textColor: '#FFFFFF' },
      palette: ['#181717', '#000000'],
    });
  });
});
