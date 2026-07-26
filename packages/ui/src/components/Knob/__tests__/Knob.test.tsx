/**
 * Knob Component - Prop typing smoke tests
 */

import React from 'react';

import { Knob, __KnobInternals } from '../Knob';
import type {
  KnobProps,
  KnobFillPartProps,
  KnobRingPartProps,
  KnobRingSegmentPartProps,
  KnobProgressPartProps,
  KnobTickLayerPartProps,
  KnobPointerPartProps,
  KnobThumbPartProps,
  KnobValueLabelPartProps,
  KnobTickLayer,
} from '../types';
import type { KnobPartEntry } from '../Knob';

describe('Knob - Prop Contracts', () => {
  it('accepts the behavior prop', () => {
    const props: KnobProps = {
      behavior: 'stepped',
      marks: [{ value: 0 }],
    };
    expect(<Knob {...props} />).toBeDefined();
  });

  it('accepts the visual variant prop', () => {
    const props: KnobProps = {
      variant: 'retro',
    };
    expect(<Knob {...props} />).toBeDefined();
  });

  it('still accepts a behavior value on the deprecated variant alias', () => {
    // Deliberately not typed as `KnobProps`: `variant` now only types the visual presets,
    // so this is the JS-consumer path the runtime shim exists for.
    const props = { variant: 'stepped', marks: [{ value: 0 }] } as unknown as KnobProps;
    expect(<Knob {...props} />).toBeDefined();
  });

  it('accepts structured valueLabel config', () => {
    const props: KnobProps = {
      valueLabel: {
        position: 'top',
        formatter: (value) => `${value}%`,
        secondary: {
          position: 'bottom',
          formatter: (value) => `${value} dB`,
        },
      },
    };
    expect(<Knob {...props} />).toBeDefined();
  });

  it('allows disabling the value label entirely', () => {
    const props: KnobProps = {
      valueLabel: false,
    };
    expect(<Knob {...props} />).toBeDefined();
  });

  it('accepts marks with accent colors and icons', () => {
    const props: KnobProps = {
      marks: [
        {
          value: 0,
          label: 'Off',
          accentColor: '#f87171',
          icon: '🔴',
        },
      ],
    };
    expect(<Knob {...props} />).toBeDefined();
  });

  it('accepts pointer appearance configuration', () => {
    const props: KnobProps = {
      appearance: {
        pointer: {
          visible: true,
          length: 60,
          width: 4,
          color: '#ffffff',
        },
      },
    };
    expect(<Knob {...props} />).toBeDefined();
  });

  it('accepts the spinStopAtLimits interaction flag', () => {
    const props: KnobProps = {
      appearance: {
        interaction: {
          modes: ['spin'],
          spinStopAtLimits: true,
        },
      },
    };
    expect(<Knob {...props} />).toBeDefined();
  });

  it('accepts split progress and panning helpers', () => {
    const props: KnobProps = {
      min: -100,
      max: 100,
      value: 25,
      appearance: {
        progress: {
          mode: 'split',
          color: '#10b981',
          thickness: 12,
        },
        panning: {
          pivotValue: 0,
          positiveColor: '#10b981',
          negativeColor: '#ef4444',
          showZeroIndicator: true,
          mirrorThumbOffset: true,
        },
      },
    };
    expect(<Knob {...props} />).toBeDefined();
  });

  it('accepts tick layer appearance configuration', () => {
    const props: KnobProps = {
      min: 0,
      max: 100,
      value: 45,
      marks: [
        { value: 0, label: 'Min' },
        { value: 50, label: 'Mid' },
        { value: 100, label: 'Max' },
      ],
      appearance: {
        ticks: [
          {
            source: 'marks',
            shape: 'line',
            length: 10,
            color: '#fff',
            label: { show: true },
          },
          {
            source: 'values',
            shape: 'dot',
            values: [25, 75],
            color: '#888',
          },
        ],
      },
    };
    expect(<Knob {...props} />).toBeDefined();
  });
});

const { buildAppearanceFromParts, buildValueLabelFromParts, getGestureDegreeSpan } = __KnobInternals;

describe('Knob gesture math helpers', () => {
  it('scales gesture spans for partial arcs', () => {
    expect(getGestureDegreeSpan(false, 240)).toBe(240);
    expect(getGestureDegreeSpan(false, 90)).toBe(90);
    expect(getGestureDegreeSpan(true, 180)).toBe(360);
  });
});

const createPart = <K extends KnobPartEntry['kind']>(
  kind: K,
  props: Extract<KnobPartEntry, { kind: K }>['props'],
  order: number
) => ({ kind, props, order }) as KnobPartEntry;

describe('Knob compound parts', () => {
  it('merges appearance overrides from child components', () => {
    const appearance = buildAppearanceFromParts(
      { ring: { thickness: 16, color: '#94a3b8' } },
      [
        createPart('fill', { color: '#0f172a', borderWidth: 2 } as KnobFillPartProps, 0),
        createPart('ring', { thickness: 24, color: '#1e293b' } as KnobRingPartProps, 1),
        createPart('progress', { visible: false } as KnobProgressPartProps, 2),
        createPart('tick', { source: 'values', values: [0], shape: 'line' } as KnobTickLayerPartProps, 3),
        createPart('pointer', { enabled: false } as KnobPointerPartProps, 4),
        createPart('thumb', { visible: false } as KnobThumbPartProps, 5),
      ]
    );

    expect(appearance?.fill).toMatchObject({ color: '#0f172a', borderWidth: 2 });
    expect(appearance?.ring).toMatchObject({ thickness: 24, color: '#1e293b' });
    expect(appearance?.progress).toBe(false);
    expect(appearance?.pointer).toBe(false);
    expect(appearance?.thumb).toBe(false);
    expect(Array.isArray(appearance?.ticks)).toBe(true);
    expect(appearance?.ticks).toHaveLength(1);
  });

  it('appends tick layers and toggles the value label', () => {
    const parts: KnobPartEntry[] = [
      createPart('tick', { source: 'values', values: [25], shape: 'line' } as KnobTickLayerPartProps, 1),
      createPart('tick', { source: 'values', values: [75], shape: 'line' } as KnobTickLayerPartProps, 2),
      createPart('valueLabel', { visible: false } as KnobValueLabelPartProps, 3),
    ];

    const appearance = buildAppearanceFromParts({ ticks: { source: 'marks', shape: 'dot' } }, parts);
    const valueLabel = buildValueLabelFromParts(
      { position: 'center', formatter: (value: number) => value.toFixed(0) },
      parts
    );

    expect(Array.isArray(appearance?.ticks)).toBe(true);
    const ticks = appearance?.ticks as KnobTickLayer[];
    expect(ticks).toHaveLength(3);
    expect(ticks[1]).toMatchObject({ values: [25] });
    expect(ticks[2]).toMatchObject({ values: [75] });
    expect(valueLabel).toBe(false);
  });

  it('collects ring segments in child order, like Progress.Section', () => {
    const appearance = buildAppearanceFromParts(undefined, [
      createPart('ringSegment', { value: 35, color: '#22c55e' } as KnobRingSegmentPartProps, 0),
      createPart('ringSegment', { value: 25, color: '#f59e0b' } as KnobRingSegmentPartProps, 1),
      createPart('ringSegment', { value: 40, color: '#ef4444' } as KnobRingSegmentPartProps, 2),
    ]);

    expect(appearance?.ring?.segments).toEqual([
      { value: 35, color: '#22c55e' },
      { value: 25, color: '#f59e0b' },
      { value: 40, color: '#ef4444' },
    ]);
  });

  it('skips segments marked invisible and keeps sibling ring props', () => {
    const appearance = buildAppearanceFromParts({ ring: { thickness: 20 } }, [
      createPart('ringSegment', { value: 50, color: '#22c55e' } as KnobRingSegmentPartProps, 0),
      createPart(
        'ringSegment',
        { value: 50, color: '#ef4444', visible: false } as KnobRingSegmentPartProps,
        1
      ),
      createPart('ring', { color: '#1e293b' } as KnobRingPartProps, 2),
    ]);

    expect(appearance?.ring).toMatchObject({ thickness: 20, color: '#1e293b' });
    expect(appearance?.ring?.segments).toEqual([{ value: 50, color: '#22c55e' }]);
  });
});
