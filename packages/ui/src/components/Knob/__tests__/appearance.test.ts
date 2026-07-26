import { resolveKnobAppearance } from '../appearance';
import { DEFAULT_THEME } from '../../../core/theme/defaultTheme';

const baseOptions = {
  theme: DEFAULT_THEME,
  behavior: 'level' as const,
  disabled: false,
  size: 140,
};

describe('resolveKnobAppearance - misc', () => {
  it('passes through panning configuration', () => {
    const appearance = {
      panning: {
        pivotValue: 0,
        positiveColor: '#22c55e',
        negativeColor: '#ef4444',
        showZeroIndicator: true,
      },
    };

    const resolved = resolveKnobAppearance({
      appearance,
      ...baseOptions,
    });

    expect(resolved.panning).toEqual(appearance.panning);
  });
});

describe('resolveKnobAppearance - ticks', () => {
  it('returns an empty array when ticks are undefined or explicitly disabled', () => {
    const resolvedDefault = resolveKnobAppearance({
      appearance: {},
      ...baseOptions,
    });
    const resolvedDisabled = resolveKnobAppearance({
      appearance: { ticks: false },
      ...baseOptions,
    });

    expect(resolvedDefault.ticks).toEqual([]);
    expect(resolvedDisabled.ticks).toEqual([]);
  });

  it('wraps single tick layer objects into an array', () => {
    const tickLayer = {
      source: 'values' as const,
      values: [0, 50, 100],
      shape: 'line' as const,
    };

    const resolved = resolveKnobAppearance({
      appearance: { ticks: tickLayer },
      ...baseOptions,
    });

    expect(resolved.ticks).toHaveLength(1);
    expect(resolved.ticks[0]).toBe(tickLayer);
  });

  it('preserves tick layer arrays as-is', () => {
    const tickLayers = [
      { source: 'marks' as const, shape: 'line' as const },
      { source: 'steps' as const, shape: 'dot' as const, radiusOffset: -6 },
    ];

    const resolved = resolveKnobAppearance({
      appearance: { ticks: tickLayers },
      ...baseOptions,
    });

    expect(resolved.ticks).toEqual(tickLayers);
  });
});

describe('resolveKnobAppearance - pointer', () => {
  it('leaves the arm off until something asks for one', () => {
    expect(resolveKnobAppearance(baseOptions).pointer).toBeNull();
  });

  it('draws the arm as soon as a config is present, however empty', () => {
    const resolved = resolveKnobAppearance({ appearance: { pointer: {} }, ...baseOptions });

    expect(resolved.pointer).toMatchObject({ visible: true });
  });

  it('defaults the arm to the accent color so it reads as one needle with the thumb', () => {
    const resolved = resolveKnobAppearance({ appearance: { pointer: {} }, ...baseOptions });

    expect(resolved.pointer?.color).toBe(resolved.thumb?.color);
  });

  it.each([[false], [null]])('drops the arm when pointer is %p', (pointerInput: false | null) => {
    const resolved = resolveKnobAppearance({
      appearance: { pointer: pointerInput as false | undefined },
      ...baseOptions,
    });

    expect(resolved.pointer).toBeNull();
  });

  it('keeps visible:false so the layer can opt out without dropping its config', () => {
    const resolved = resolveKnobAppearance({
      appearance: { pointer: { visible: false, length: 40 } },
      ...baseOptions,
    });

    expect(resolved.pointer).toMatchObject({ visible: false, length: 40 });
  });

  it('lets explicit pointer props win over the defaults', () => {
    const resolved = resolveKnobAppearance({
      appearance: { pointer: { color: '#ff0000', length: 12, width: 9 } },
      ...baseOptions,
    });

    expect(resolved.pointer).toMatchObject({ color: '#ff0000', length: 12, width: 9, visible: true });
  });
});

describe('resolveKnobAppearance - ring segments', () => {
  it('defaults to no segments', () => {
    expect(resolveKnobAppearance(baseOptions).ring.segments).toEqual([]);
  });

  it('passes segments through in order', () => {
    const segments = [
      { value: 35, color: '#22c55e' },
      { value: 25, color: '#f59e0b' },
      { value: 40, color: '#ef4444' },
    ];

    const resolved = resolveKnobAppearance({
      appearance: { ring: { segments } },
      ...baseOptions,
    });

    expect(resolved.ring.segments).toEqual(segments);
  });

  it('drops segments that cannot be drawn', () => {
    const resolved = resolveKnobAppearance({
      appearance: {
        ring: {
          segments: [
            { value: 10 },
            { value: 0 },
            { value: -5 },
            { value: Number.NaN },
          ],
        },
      },
      ...baseOptions,
    });

    expect(resolved.ring.segments).toEqual([{ value: 10 }]);
  });
});
