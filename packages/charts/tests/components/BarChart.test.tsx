import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ChartThemeProvider } from '../../src/theme/ChartThemeContext';
import { ChartInteractionProvider, useChartInteractionContext, useChartInteractionVolatile } from '../../src/interaction/ChartInteractionContext';
import { BarChart } from '../../src/components/BarChart/BarChart';

const InteractionSpy: React.FC<{ onRender?: (ctx: ReturnType<typeof useChartInteractionContext>) => void }> = ({ onRender }) => {
  const ctx = useChartInteractionContext();
  const __vol = useChartInteractionVolatile();
  onRender?.({ ...ctx, ...__vol });
  return <Text testID="interaction-spy" />;
};

const SERIES = [
  { id: 'a', name: 'A', data: [{ category: 'X', value: 20 }, { category: 'Y', value: 30 }] },
  { id: 'b', name: 'B', data: [{ category: 'X', value: 15 }, { category: 'Y', value: 25 }] },
];

const renderChart = (onContext?: (ctx: ReturnType<typeof useChartInteractionContext>) => void) =>
  render(
    <ChartThemeProvider>
      <ChartInteractionProvider config={{ liveTooltip: true, multiTooltip: true, pointerRAF: false }}>
        <InteractionSpy onRender={onContext} />
        <BarChart series={SERIES} layout="grouped" w={400} h={300} />
      </ChartInteractionProvider>
    </ChartThemeProvider>
  );

describe('BarChart (band hit-test engine)', () => {
  it('registers a band hit-tester whose bars resolve by rect / nearest-category', async () => {
    let ctxRef: ReturnType<typeof useChartInteractionContext> | null = null;
    renderChart((ctx) => { ctxRef = ctx; });

    // A query in the plot resolves to a bar (rect membership, else nearest category).
    await waitFor(() => {
      const target = ctxRef?.hitTest({ px: 200, py: 150 });
      expect(target).not.toBeNull();
      expect(target?.kind).toBe('band');
      expect(['a', 'b']).toContain(String(target?.seriesId));
      expect(typeof target?.formattedValue).toBe('string');
    });
  });

  it('produces a grouped slice (all series at the category) on pointer move', async () => {
    let ctxRef: ReturnType<typeof useChartInteractionContext> | null = null;
    const { getByTestId } = renderChart((ctx) => { ctxRef = ctx; });
    const surface = getByTestId('bar-gesture-surface');

    fireEvent(surface, 'responderGrant', { nativeEvent: { locationX: 200, locationY: 150, pageX: 40, pageY: 60 } });
    fireEvent(surface, 'responderMove', { nativeEvent: { locationX: 200, locationY: 150, pageX: 40, pageY: 60 } });

    await waitFor(() => {
      expect(ctxRef?.pointer?.inside).toBe(true);
      expect(ctxRef?.activeSlice?.length).toBe(2);
      const ids = (ctxRef?.activeSlice ?? []).map((t) => String(t.seriesId)).sort();
      expect(ids).toEqual(['a', 'b']);
      (ctxRef?.activeSlice ?? []).forEach((t) => expect(t.kind).toBe('band'));
    });

    fireEvent(surface, 'responderRelease', { nativeEvent: {} });
    await waitFor(() => {
      expect(ctxRef?.activeTarget).toBeNull();
      expect(ctxRef?.activeSlice?.length).toBe(0);
    });
  });
});

describe('BarChart color', () => {
  const DATA = [
    { category: 'Q1', value: -20 },
    { category: 'Q2', value: 10 },
    { category: 'Q3', value: 30 },
  ];
  const renderBars = (props: Partial<React.ComponentProps<typeof BarChart>>) =>
    render(
      <ChartThemeProvider>
        <BarChart data={DATA} w={400} h={300} {...props} />
      </ChartThemeProvider>
    );
  // react-native-svg is mocked to one component, so count elements by their props.
  const countFill = (r: ReturnType<typeof renderBars>, fill: string) => r.UNSAFE_queryAllByProps({ fill }).length;

  it('colors bars by value with a scale config, even alongside barColor', () => {
    const r = renderBars({
      barColor: '#123456',
      colorScale: { type: 'threshold', thresholds: [0], colors: ['#cc0000', '#00aa00'] },
    });
    expect(countFill(r, '#cc0000')).toBeGreaterThan(0);
    expect(countFill(r, '#00aa00')).toBeGreaterThan(0);
    expect(countFill(r, '#123456')).toBe(0);
  });

  it('still lets a function scale fall through to barColor', () => {
    const r = renderBars({
      barColor: '#123456',
      colorScale: ({ datum }) => (datum.value < 0 ? '#cc0000' : undefined),
    });
    expect(countFill(r, '#cc0000')).toBeGreaterThan(0);
    expect(countFill(r, '#123456')).toBeGreaterThan(0);
  });

  it('paints bars with a gradient barColor', () => {
    const r = renderBars({
      barColor: { extent: 'plot', stops: [{ offset: 0, color: '#1c5cab' }, { offset: 1, color: '#86b6ef', opacity: 0.5 }] },
    });
    const gradientFills = r.UNSAFE_queryAllByProps({}).filter((n) => typeof n.props.fill === 'string' && n.props.fill.startsWith('url(#bar-fill-'));
    expect(gradientFills.length).toBeGreaterThan(0);
    expect(r.UNSAFE_queryAllByProps({ gradientUnits: 'userSpaceOnUse' }).length).toBeGreaterThan(0);
  });
});
