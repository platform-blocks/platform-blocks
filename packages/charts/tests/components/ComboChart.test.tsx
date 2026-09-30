import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ChartThemeProvider } from '../../src/theme/ChartThemeContext';
import { ChartInteractionProvider, useChartInteractionContext, useChartInteractionVolatile } from '../../src/interaction/ChartInteractionContext';
import { ComboChart } from '../../src/components/ComboChart/ComboChart';

const InteractionSpy: React.FC<{ onRender?: (ctx: ReturnType<typeof useChartInteractionContext>) => void }> = ({ onRender }) => {
  const ctx = useChartInteractionContext();
  const __vol = useChartInteractionVolatile();
  onRender?.({ ...ctx, ...__vol });
  return <Text testID="interaction-spy" />;
};

const LAYERS = [
  {
    id: 'sales',
    name: 'Sales',
    type: 'bar' as const,
    color: '#6366f1',
    data: [
      { x: 0, y: 100 },
      { x: 1, y: 140 },
      { x: 2, y: 120 },
    ],
  },
  {
    id: 'margin',
    name: 'Margin',
    type: 'line' as const,
    targetAxis: 'right' as const,
    color: '#22c55e',
    data: [
      { x: 0, y: 12 },
      { x: 1, y: 18 },
      { x: 2, y: 15 },
    ],
  },
];

const renderChart = (onContext?: (ctx: ReturnType<typeof useChartInteractionContext>) => void) =>
  render(
    <ChartThemeProvider>
      <ChartInteractionProvider config={{ liveTooltip: true, multiTooltip: true, pointerRAF: false }}>
        <InteractionSpy onRender={onContext} />
        <ComboChart layers={LAYERS} w={480} h={320} />
      </ChartInteractionProvider>
    </ChartThemeProvider>
  );

describe('ComboChart (mixed-geometry engine-swap)', () => {
  it('renders (off the legacy crosshair/registerSeries path)', () => {
    const { getByTestId } = renderChart();
    expect(getByTestId('interaction-spy')).toBeTruthy();
    expect(getByTestId('combo-bar-sales-0')).toBeTruthy();
  });

  it('publishes a multi-layer ActiveTarget slice when a bar is hovered', async () => {
    let ctxRef: ReturnType<typeof useChartInteractionContext> | null = null;
    const { getByTestId } = renderChart((ctx) => { ctxRef = ctx; });

    // Native bar hover routes through handleBarHover -> updatePointerFromPlotCoords,
    // which builds one ActiveTarget per visible layer at the pointer x.
    fireEvent(getByTestId('combo-bar-sales-1'), 'pressIn');

    await waitFor(() => {
      expect(ctxRef?.activeTarget?.kind).toBe('point');
      // One mark per visible layer (bar + line).
      expect(ctxRef?.activeSlice?.length).toBe(2);
      const labels = (ctxRef?.activeSlice ?? []).map((t) => t.label).sort();
      expect(labels).toEqual(['Margin', 'Sales']);
    });

    fireEvent(getByTestId('combo-bar-sales-1'), 'pressOut');
    await waitFor(() => {
      expect(ctxRef?.activeSlice?.length ?? 0).toBe(0);
    });
  });
});
