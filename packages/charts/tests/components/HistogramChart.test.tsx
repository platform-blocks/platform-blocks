import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ChartThemeProvider } from '../../src/theme/ChartThemeContext';
import { ChartInteractionProvider, useChartInteractionContext, useChartInteractionVolatile } from '../../src/interaction/ChartInteractionContext';
import { HistogramChart } from '../../src/components/HistogramChart/HistogramChart';

const InteractionSpy: React.FC<{ onRender?: (ctx: ReturnType<typeof useChartInteractionContext>) => void }> = ({ onRender }) => {
  const ctx = useChartInteractionContext();
  const __vol = useChartInteractionVolatile();
  onRender?.({ ...ctx, ...__vol });
  return <Text testID="interaction-spy" />;
};

const DATA = [1, 2, 2, 3, 3, 3, 4, 4, 5, 6, 6, 7, 8, 9, 10];

const renderChart = (onContext?: (ctx: ReturnType<typeof useChartInteractionContext>) => void) =>
  render(
    <ChartThemeProvider>
      <ChartInteractionProvider config={{ liveTooltip: true, pointerRAF: false }}>
        <InteractionSpy onRender={onContext} />
        <HistogramChart data={DATA} w={400} h={240} />
      </ChartInteractionProvider>
    </ChartThemeProvider>
  );

describe('HistogramChart (band hit-test engine)', () => {
  it('registers a band hit-tester whose bins resolve by rect / nearest-category', async () => {
    let ctxRef: ReturnType<typeof useChartInteractionContext> | null = null;
    renderChart((ctx) => { ctxRef = ctx; });

    // A query anywhere over the plot resolves to a bin (rect membership, else the
    // nearest category along the band axis). The band mark carries a formatted value.
    await waitFor(() => {
      const target = ctxRef?.hitTest({ px: 200, py: 150 });
      expect(target).not.toBeNull();
      expect(String(target?.seriesId)).toBe('hist-bins');
      expect(target?.kind).toBe('band');
      expect(typeof target?.formattedValue).toBe('string');
    });
  });

  it('sets the active target on pointer move and clears it on release', async () => {
    let ctxRef: ReturnType<typeof useChartInteractionContext> | null = null;
    const { getByTestId } = renderChart((ctx) => { ctxRef = ctx; });
    const surface = getByTestId('histogram-gesture-surface');

    fireEvent(surface, 'responderGrant', { nativeEvent: { locationX: 200, locationY: 120, pageX: 40, pageY: 60 } });
    fireEvent(surface, 'responderMove', { nativeEvent: { locationX: 200, locationY: 120, pageX: 40, pageY: 60 } });

    await waitFor(() => {
      expect(ctxRef?.pointer?.inside).toBe(true);
      expect(String(ctxRef?.activeTarget?.seriesId)).toBe('hist-bins');
      expect(ctxRef?.activeTarget?.kind).toBe('band');
      expect(typeof ctxRef?.activeTarget?.formattedValue).toBe('string');
    });

    fireEvent(surface, 'responderRelease', { nativeEvent: {} });

    await waitFor(() => {
      expect(ctxRef?.pointer?.inside).toBe(false);
      expect(ctxRef?.activeTarget).toBeNull();
    });
  });
});

describe('HistogramChart color', () => {
  const renderWith = (
    props: Partial<React.ComponentProps<typeof HistogramChart>>,
    onContext: (ctx: ReturnType<typeof useChartInteractionContext>) => void
  ) =>
    render(
      <ChartThemeProvider>
        <ChartInteractionProvider config={{ liveTooltip: true, pointerRAF: false }}>
          <InteractionSpy onRender={onContext} />
          <HistogramChart data={DATA} w={400} h={240} {...props} />
        </ChartInteractionProvider>
      </ChartThemeProvider>
    );

  // First and last bins resolve by nearest category from the plot's outer edges.
  const edgeColors = (ctx: ReturnType<typeof useChartInteractionContext> | null) => [
    ctx?.hitTest({ px: 1, py: 150 })?.color,
    ctx?.hitTest({ px: 399, py: 150 })?.color,
  ];

  it('colors bins by a threshold scale on x', async () => {
    let ctxRef: ReturnType<typeof useChartInteractionContext> | null = null;
    renderWith(
      { colorScale: { type: 'threshold', thresholds: [5], colors: ['#00aa00', '#cc0000'] } },
      (ctx) => { ctxRef = ctx; }
    );
    await waitFor(() => expect(edgeColors(ctxRef)).toEqual(['#00aa00', '#cc0000']));
  });

  it('colors bins by count when asked', async () => {
    let ctxRef: ReturnType<typeof useChartInteractionContext> | null = null;
    renderWith(
      { colorScale: { type: 'threshold', by: 'count', thresholds: [100], colors: ['#111111', '#222222'] } },
      (ctx) => { ctxRef = ctx; }
    );
    // No bin reaches 100 samples, so every bin takes the lower band.
    await waitFor(() => expect(edgeColors(ctxRef)).toEqual(['#111111', '#111111']));
  });

  it('lets a function pick per-bin colors and fall back to barColor', async () => {
    let ctxRef: ReturnType<typeof useChartInteractionContext> | null = null;
    renderWith(
      { barColor: '#123456', colorScale: (bin) => (bin.index === 0 ? '#abcdef' : undefined) },
      (ctx) => { ctxRef = ctx; }
    );
    await waitFor(() => expect(edgeColors(ctxRef)).toEqual(['#abcdef', '#123456']));
  });

  it('uses a gradient barColor’s strongest stop as the swatch color', async () => {
    let ctxRef: ReturnType<typeof useChartInteractionContext> | null = null;
    renderWith(
      {
        barColor: {
          angle: 270,
          stops: [
            { offset: 0, color: '#0000ff', opacity: 0.3 },
            { offset: 1, color: '#ff00ff' },
          ],
        },
      },
      (ctx) => { ctxRef = ctx; }
    );
    await waitFor(() => expect(edgeColors(ctxRef)).toEqual(['#ff00ff', '#ff00ff']));
  });

  it('lists one legend entry per labelled threshold band', () => {
    const { getByText, queryByText } = renderWith(
      {
        legend: { show: true },
        showDensity: false,
        colorScale: { type: 'threshold', thresholds: [5], colors: ['#00aa00', '#cc0000'], labels: ['Fast', 'Slow'] },
      },
      () => {}
    );
    expect(getByText('Fast')).toBeTruthy();
    expect(getByText('Slow')).toBeTruthy();
    expect(queryByText('Density')).toBeNull();
  });
});

describe('HistogramChart gradient extent', () => {
  const stops = [{ offset: 0, color: '#000000' }, { offset: 1, color: '#ffffff' }];

  it("spans one gradient across the plot for extent: 'plot'", () => {
    const { UNSAFE_queryAllByProps } = render(
      <ChartThemeProvider>
        <HistogramChart data={DATA} w={400} h={240} barColor={{ angle: 90, extent: 'plot', stops }} />
      </ChartThemeProvider>
    );
    // react-native-svg is mocked to one component, so find the def by its props.
    const [def] = UNSAFE_queryAllByProps({ gradientUnits: 'userSpaceOnUse' });
    expect(def).toBeTruthy();
    expect(Number(def.props.y1)).toBeCloseTo(0);
    expect(Number(def.props.y2)).toBeGreaterThan(100);
    expect(Number(def.props.x1)).toBeCloseTo(Number(def.props.x2));
  });

  it('gives each bar the whole gradient by default', () => {
    const { UNSAFE_queryAllByProps } = render(
      <ChartThemeProvider>
        <HistogramChart data={DATA} w={400} h={240} barColor={{ stops }} />
      </ChartThemeProvider>
    );
    expect(UNSAFE_queryAllByProps({ gradientUnits: 'objectBoundingBox' }).length).toBeGreaterThan(0);
    expect(UNSAFE_queryAllByProps({ gradientUnits: 'userSpaceOnUse' })).toHaveLength(0);
  });
});
