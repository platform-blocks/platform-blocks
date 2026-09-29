import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ChartThemeProvider } from '../../src/theme/ChartThemeContext';
import { ChartInteractionProvider, useChartInteractionContext, useChartInteractionVolatile } from '../../src/interaction/ChartInteractionContext';
import { BubbleChart } from '../../src/components/BubbleChart/BubbleChart';

const InteractionSpy: React.FC<{ onRender?: (ctx: ReturnType<typeof useChartInteractionContext>) => void }> = ({ onRender }) => {
  const ctx = useChartInteractionContext();
  const __vol = useChartInteractionVolatile();
  onRender?.({ ...ctx, ...__vol });
  return <Text testID="interaction-spy" />;
};

const DATA = [
  { name: 'A', rev: 100, growth: 20, val: 500, color: '#6366f1' },
  { name: 'B', rev: 200, growth: 40, val: 700, color: '#22c55e' },
  { name: 'C', rev: 300, growth: 30, val: 900, color: '#f97316' },
];

const renderChart = (onContext?: (ctx: ReturnType<typeof useChartInteractionContext>) => void) =>
  render(
    <ChartThemeProvider>
      <ChartInteractionProvider config={{ liveTooltip: true, multiTooltip: true, pointerRAF: false }}>
        <InteractionSpy onRender={onContext} />
        <BubbleChart
          data={DATA}
          w={420}
          h={320}
          dataKey={{ x: 'rev', y: 'growth', z: 'val', label: 'name', id: 'name', color: 'color' }}
        />
      </ChartInteractionProvider>
    </ChartThemeProvider>
  );

describe('BubbleChart (point engine-swap)', () => {
  it('renders (off the legacy crosshair/registerSeries path) with a gesture surface', () => {
    const { getByTestId } = renderChart();
    expect(getByTestId('interaction-spy')).toBeTruthy();
    expect(getByTestId('bubble-gesture-surface')).toBeTruthy();
  });

  it('feeds the store pointer on a responder move over the plot', async () => {
    let ctxRef: ReturnType<typeof useChartInteractionContext> | null = null;
    const { getByTestId } = renderChart((ctx) => { ctxRef = ctx; });
    const surface = getByTestId('bubble-gesture-surface');

    // handlePointer runs on the responder move: it resolves the nearest bubble (radius
    // aware) and either publishes an ActiveTarget or (miss) feeds an inside pointer.
    fireEvent(surface, 'responderMove', { nativeEvent: { locationX: 150, locationY: 120 } });

    await waitFor(() => {
      expect(ctxRef?.pointer?.inside).toBe(true);
    });

    fireEvent(surface, 'responderRelease', { nativeEvent: {} });
    await waitFor(() => {
      expect(ctxRef?.pointer?.inside).toBe(false);
    });
  });
});

describe('BubbleChart color scale config', () => {
  const POINTS = [
    { name: 'a', rev: 1, growth: 1, size: 10, score: 10 },
    { name: 'b', rev: 2, growth: 2, size: 20, score: 40 },
    { name: 'c', rev: 3, growth: 3, size: 30, score: 90 },
  ];
  const renderBubbles = (colorScale: React.ComponentProps<typeof BubbleChart>['colorScale'], dataKey: Record<string, string>) =>
    render(
      <ChartThemeProvider>
        <BubbleChart data={POINTS} dataKey={{ x: 'rev', y: 'growth', ...dataKey } as any} colorScale={colorScale} w={400} h={300} />
      </ChartThemeProvider>
    );
  const bubbleColors = (r: ReturnType<typeof renderBubbles>) =>
    r.UNSAFE_root.findAll((n) => {
      const style = n.props.style;
      const flat = Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style;
      return typeof n.type === 'string' && typeof flat?.backgroundColor === 'string' && flat.backgroundColor.startsWith('#');
    }).map((n) => {
      const style = n.props.style;
      const flat = Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style;
      return flat.backgroundColor;
    });

  it('reads the dataKey.color field by default', () => {
    const colors = bubbleColors(renderBubbles(
      { type: 'threshold', thresholds: [50], colors: ['#00aa00', '#aa0000'] },
      { z: 'size', color: 'score' }
    ));
    expect(colors.filter((c) => c === '#00aa00')).toHaveLength(2);
    expect(colors.filter((c) => c === '#aa0000')).toHaveLength(1);
  });

  it('reads bubble size when no color field is mapped', () => {
    const colors = bubbleColors(renderBubbles(
      { type: 'threshold', thresholds: [25], colors: ['#00aa00', '#aa0000'] },
      { z: 'size' }
    ));
    expect(colors.filter((c) => c === '#00aa00')).toHaveLength(2);
    expect(colors.filter((c) => c === '#aa0000')).toHaveLength(1);
  });
});
