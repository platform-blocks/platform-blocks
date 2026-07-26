import { resolveKnobAppearance } from '../appearance';
import { buildKnobVariantAppearance, mergeKnobAppearance } from '../variants';
import { DEFAULT_THEME } from '../../../core/theme/defaultTheme';
import type { KnobVariant } from '../types';

const baseOptions = {
  theme: DEFAULT_THEME,
  behavior: 'level' as const,
  disabled: false,
  size: 200,
};

const VARIANTS: KnobVariant[] = ['default', 'minimal', 'digital', 'retro', 'studio'];

describe('Knob visual variants', () => {
  it('leaves the stock knob untouched', () => {
    const stock = resolveKnobAppearance(baseOptions);
    const explicit = resolveKnobAppearance({ ...baseOptions, variant: 'default' });

    expect(explicit).toEqual(stock);
  });

  it('resolves every variant without throwing', () => {
    VARIANTS.forEach(variant => {
      expect(() => resolveKnobAppearance({ ...baseOptions, variant })).not.toThrow();
    });
  });

  it('gives each variant a distinct ring weight', () => {
    const thicknesses = VARIANTS.map(
      variant => resolveKnobAppearance({ ...baseOptions, variant }).ring.thickness
    );

    expect(new Set(thicknesses).size).toBeGreaterThan(1);
  });

  it('gives the stock dial no arm, and the presets that want one an arm', () => {
    expect(resolveKnobAppearance({ ...baseOptions, variant: 'default' }).pointer).toBeNull();
    expect(resolveKnobAppearance(baseOptions).pointer).toBeNull();

    (['digital', 'retro', 'studio'] as const).forEach(variant => {
      expect(resolveKnobAppearance({ ...baseOptions, variant }).pointer).toMatchObject({ visible: true });
    });
  });

  it('drops the arm for minimal and the rim dot for retro', () => {
    expect(resolveKnobAppearance({ ...baseOptions, variant: 'minimal' }).pointer).toBeNull();
    expect(resolveKnobAppearance({ ...baseOptions, variant: 'retro' }).thumb).toBeNull();
    expect(resolveKnobAppearance({ ...baseOptions, variant: 'retro' }).progress).toBeNull();
  });

  it('squares off the digital marker and its caps', () => {
    const resolved = resolveKnobAppearance({ ...baseOptions, variant: 'digital' });

    expect(resolved.thumb?.shape).toBe('square');
    expect(resolved.ring.cap).toBe('butt');
    expect(resolved.progress?.roundedCaps).toBe(false);
  });

  it('takes its accent from the theme rather than a hardcoded palette', () => {
    const themed = resolveKnobAppearance({
      ...baseOptions,
      variant: 'studio',
      accentColor: '#ff00ff',
    });

    expect(themed.thumb?.color).toBe('#ff00ff');
    expect(themed.progress?.color).toBe('#ff00ff');
  });

  it('scales its metrics with the knob size', () => {
    const small = resolveKnobAppearance({ ...baseOptions, size: 80, variant: 'studio' });
    const large = resolveKnobAppearance({ ...baseOptions, size: 280, variant: 'studio' });

    expect(large.ring.thickness).toBeGreaterThan(small.ring.thickness);
    expect(large.thumb!.size).toBeGreaterThan(small.thumb!.size);
  });
});

describe('Knob variant overrides', () => {
  it('lets appearance win property by property without losing the preset', () => {
    const preset = resolveKnobAppearance({ ...baseOptions, variant: 'studio' });
    const overridden = resolveKnobAppearance({
      ...baseOptions,
      variant: 'studio',
      appearance: { ring: { color: '#123456' } },
    });

    expect(overridden.ring.color).toBe('#123456');
    // Everything else the variant set survives the override.
    expect(overridden.ring.thickness).toBe(preset.ring.thickness);
    expect(overridden.ring.cap).toBe(preset.ring.cap);
  });

  it('lets appearance remove a layer the variant enabled', () => {
    const resolved = resolveKnobAppearance({
      ...baseOptions,
      variant: 'studio',
      appearance: { thumb: false },
    });

    expect(resolved.thumb).toBeNull();
  });

  it('lets appearance restore a layer the variant removed', () => {
    const resolved = resolveKnobAppearance({
      ...baseOptions,
      variant: 'minimal',
      appearance: { pointer: { width: 4 } },
    });

    expect(resolved.pointer).toMatchObject({ visible: true, width: 4 });
  });
});

describe('mergeKnobAppearance', () => {
  it('returns the other side when one is missing', () => {
    expect(mergeKnobAppearance(undefined, { ring: { thickness: 4 } })).toEqual({ ring: { thickness: 4 } });
    expect(mergeKnobAppearance({ ring: { thickness: 4 } }, undefined)).toEqual({ ring: { thickness: 4 } });
  });

  it('merges layer objects one level deep', () => {
    const merged = mergeKnobAppearance(
      { ring: { thickness: 4, color: 'red' } },
      { ring: { color: 'blue' } }
    );

    expect(merged?.ring).toEqual({ thickness: 4, color: 'blue' });
  });

  it('replaces arrays instead of concatenating them', () => {
    const merged = mergeKnobAppearance(
      { ticks: [{ source: 'marks' }, { source: 'steps' }] },
      { ticks: [{ source: 'values', values: [1] }] }
    );

    expect(merged?.ticks).toHaveLength(1);
  });

  it('keeps an explicit false from the override', () => {
    expect(mergeKnobAppearance({ thumb: { size: 10 } }, { thumb: false })?.thumb).toBe(false);
  });

  it('ignores undefined keys on the override', () => {
    const merged = mergeKnobAppearance({ thumb: { size: 10 } }, { thumb: undefined });

    expect(merged?.thumb).toEqual({ size: 10 });
  });

  it('adds nothing for the default variant', () => {
    expect(buildKnobVariantAppearance('default', {
      theme: DEFAULT_THEME,
      size: 200,
      accentColor: '#000',
      disabled: false,
    })).toBeUndefined();
  });
});
