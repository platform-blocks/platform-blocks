import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ChartThemeProvider } from '../../src/theme/ChartThemeContext';
import { ChartInteractionProvider, useChartInteractionContext, useChartInteractionVolatile } from '../../src/interaction/ChartInteractionContext';
import { LineChart } from '../../src/components/LineChart/LineChart';

const InteractionSpy: React.FC<{ onRender?: (ctx: ReturnType<typeof useChartInteractionContext>) => void }> = ({ onRender }) => {
  const ctx = useChartInteractionContext();
  const __vol = useChartInteractionVolatile();
  onRender?.({ ...ctx, ...__vol });
  return <Text testID="interaction-spy" />;
};

const SERIES = [
  { id: 's1', name: 'S1', data: [{ x: 0, y: 10 }, { x: 1, y: 20 }, { x: 2, y: 15 }, { x: 3, y: 25 }] },
  { id: 's2', name: 'S2', data: [{ x: 0, y: 5 }, { x: 1, y: 12 }, { x: 2, y: 22 }, { x: 3, y: 18 }] },
];

const renderChart = (onContext?: (ctx: ReturnType<typeof useChartInteractionContext>) => void) =>
  render(
    <ChartThemeProvider>
      <ChartInteractionProvider config={{ liveTooltip: true, multiTooltip: true, pointerRAF: false }}>
        <InteractionSpy onRender={onContext} />
        <LineChart series={SERIES} w={400} h={300} disableAnimations />
      </ChartInteractionProvider>
    </ChartThemeProvider>
  );

describe('LineChart (point hit-test engine)', () => {
  it('renders (off the legacy nearest-point path) and exposes its gesture surface', () => {
    const { getByTestId } = renderChart();
    expect(getByTestId('interaction-spy')).toBeTruthy();
    expect(getByTestId('line-gesture-surface')).toBeTruthy();
  });

  it('renders both series without error and stays mounted through a data update', () => {
    const { rerender, getByTestId } = renderChart();
    expect(getByTestId('interaction-spy')).toBeTruthy();
    // Re-render with a mutated series to exercise the tester memo + render path.
    rerender(
      <ChartThemeProvider>
        <ChartInteractionProvider config={{ liveTooltip: true, multiTooltip: true, pointerRAF: false }}>
          <InteractionSpy />
          <LineChart series={[{ id: 's1', name: 'S1', data: [{ x: 0, y: 1 }, { x: 1, y: 9 }] }]} w={400} h={300} disableAnimations />
        </ChartInteractionProvider>
      </ChartThemeProvider>
    );
    expect(getByTestId('line-gesture-surface')).toBeTruthy();
  });
});

// NB: LineChart's pan/pinch/brush/zoom gestures use a native PanResponder that can't be
// driven by fireEvent in jest (RN TouchHistoryMath needs a real touch history). The
// gesture layer is unchanged by this migration — only the nearest-point ENGINE was
// swapped (useNearestPoint → PointSeriesHitTester) and the tooltip output moved from the
// legacy crosshair/ChartPopover to activeTarget/activeSlice (multi) / the built-in
// tooltip (single). Runtime gesture behavior is verified in the app.

describe('LineChart area fill', () => {
  const SERIES_ONE = [{ id: 's1', name: 'S1', data: [{ x: 0, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 2 }] }];
  // react-native-svg is mocked to one component, so find stops and defs by their props.
  it('fades a plain fill color from fillOpacity to transparent', () => {
    const r = render(
      <ChartThemeProvider>
        <LineChart series={SERIES_ONE} fill fillColor="#123456" fillOpacity={0.4} w={400} h={300} disableAnimations />
      </ChartThemeProvider>
    );
    const opacities = r.UNSAFE_queryAllByProps({ stopColor: '#123456' }).map((n) => n.props.stopOpacity);
    expect(opacities).toContain(0.4);
    expect(opacities).toContain(0);
  });

  it('uses a gradient fillColor exactly as given', () => {
    const r = render(
      <ChartThemeProvider>
        <LineChart
          series={SERIES_ONE}
          fill
          fillColor={{ extent: 'plot', stops: [{ offset: 0, color: '#aa00aa' }, { offset: 1, color: '#00aaaa', opacity: 0.1 }] }}
          w={400}
          h={300}
          disableAnimations
        />
      </ChartThemeProvider>
    );
    expect(r.UNSAFE_queryAllByProps({ stopColor: '#aa00aa' }).length).toBeGreaterThan(0);
    expect(r.UNSAFE_queryAllByProps({ stopColor: '#00aaaa' }).length).toBeGreaterThan(0);
    expect(r.UNSAFE_queryAllByProps({ gradientUnits: 'userSpaceOnUse' }).length).toBeGreaterThan(0);
  });
});

describe('LineChart line color', () => {
  const data = [{ x: 0, y: 1 }, { x: 1, y: 3 }];

  it('uses lineColor for single-series data', () => {
    const chart = render(
      <ChartThemeProvider>
        <LineChart data={data} lineColor="#123456" w={400} h={300} disableAnimations />
      </ChartThemeProvider>
    );

    expect(chart.UNSAFE_queryAllByProps({ stroke: '#123456' }).length).toBeGreaterThan(0);
  });

  it('keeps explicit series colors when lineColor is set', () => {
    const chart = render(
      <ChartThemeProvider>
        <LineChart series={[{ data, color: '#abcdef' }]} lineColor="#123456" w={400} h={300} disableAnimations />
      </ChartThemeProvider>
    );

    expect(chart.UNSAFE_queryAllByProps({ stroke: '#abcdef' }).length).toBeGreaterThan(0);
  });

  it('uses lineColor for an uncolored single series', () => {
    const chart = render(
      <ChartThemeProvider>
        <LineChart series={[{ data }]} lineColor="#123456" w={400} h={300} disableAnimations />
      </ChartThemeProvider>
    );

    expect(chart.UNSAFE_queryAllByProps({ stroke: '#123456' }).length).toBeGreaterThan(0);
  });
});
