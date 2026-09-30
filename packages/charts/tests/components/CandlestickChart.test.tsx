import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ChartThemeProvider } from '../../src/theme/ChartThemeContext';
import { ChartInteractionProvider, useChartInteractionContext, useChartInteractionVolatile } from '../../src/interaction/ChartInteractionContext';
import { CandlestickChart } from '../../src/components/CandlestickChart/CandlestickChart';

const InteractionSpy: React.FC<{ onRender?: (ctx: ReturnType<typeof useChartInteractionContext>) => void }> = ({ onRender }) => {
  const ctx = useChartInteractionContext();
  const __vol = useChartInteractionVolatile();
  onRender?.({ ...ctx, ...__vol });
  return <Text testID="interaction-spy" />;
};

const SERIES = [
  {
    id: 'ohlc',
    name: 'OHLC',
    data: [
      { x: 0, open: 100, high: 110, low: 95, close: 108 },
      { x: 1, open: 108, high: 115, low: 104, close: 112 },
      { x: 2, open: 112, high: 118, low: 109, close: 111 },
      { x: 3, open: 111, high: 120, low: 110, close: 119 },
    ],
  },
];

const renderChart = (onContext?: (ctx: ReturnType<typeof useChartInteractionContext>) => void) =>
  render(
    <ChartThemeProvider>
      <ChartInteractionProvider config={{ liveTooltip: true, multiTooltip: true, pointerRAF: false }}>
        <InteractionSpy onRender={onContext} />
        <CandlestickChart series={SERIES} w={420} h={320} />
      </ChartInteractionProvider>
    </ChartThemeProvider>
  );

describe('CandlestickChart (point engine-swap)', () => {
  it('renders (off the legacy crosshair/registerSeries path) with a gesture surface', () => {
    const { getByTestId } = renderChart();
    expect(getByTestId('interaction-spy')).toBeTruthy();
    expect(getByTestId('candlestick-gesture-surface')).toBeTruthy();
  });

  it('publishes the nearest candle as an ActiveTarget (OHLC) on responder move', async () => {
    let ctxRef: ReturnType<typeof useChartInteractionContext> | null = null;
    const { getByTestId } = renderChart((ctx) => { ctxRef = ctx; });
    const surface = getByTestId('candlestick-gesture-surface');

    // Nearest-x resolution has no threshold, so any in-plot point resolves to a candle.
    fireEvent(surface, 'responderGrant', { nativeEvent: { locationX: 150, locationY: 100 } });
    fireEvent(surface, 'responderMove', { nativeEvent: { locationX: 150, locationY: 100 } });

    await waitFor(() => {
      expect(ctxRef?.pointer?.inside).toBe(true);
      expect(ctxRef?.activeTarget?.kind).toBe('point');
      expect(ctxRef?.activeSlice?.length).toBeGreaterThan(0);
      // OHLC string is the default formattedValue.
      expect(String(ctxRef?.activeTarget?.formattedValue)).toContain('O ');
    });

    fireEvent(surface, 'responderRelease', { nativeEvent: {} });
    await waitFor(() => {
      expect(ctxRef?.activeTarget).toBeNull();
    });
  });
});
