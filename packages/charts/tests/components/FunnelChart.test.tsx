import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ChartThemeProvider } from '../../src/theme/ChartThemeContext';
import { ChartInteractionProvider, useChartInteractionContext, useChartInteractionVolatile } from '../../src/interaction/ChartInteractionContext';
import { FunnelChart } from '../../src/components/FunnelChart/FunnelChart';

const InteractionSpy: React.FC<{ onRender?: (ctx: ReturnType<typeof useChartInteractionContext>) => void }> = ({ onRender }) => {
  const ctx = useChartInteractionContext();
  const __vol = useChartInteractionVolatile();
  onRender?.({ ...ctx, ...__vol });
  return <Text testID="interaction-spy" />;
};

const SERIES = {
  id: 'pipeline',
  steps: [
    { label: 'Visits', value: 1000 },
    { label: 'Signups', value: 400 },
    { label: 'Customers', value: 120 },
  ],
};

const renderChart = (onContext?: (ctx: ReturnType<typeof useChartInteractionContext>) => void) =>
  render(
    <ChartThemeProvider>
      <ChartInteractionProvider config={{ liveTooltip: true, multiTooltip: true, pointerRAF: false }}>
        <InteractionSpy onRender={onContext} />
        <FunnelChart series={SERIES} w={480} h={360} />
      </ChartInteractionProvider>
    </ChartThemeProvider>
  );

describe('FunnelChart (segment engine-swap)', () => {
  it('renders (off the legacy crosshair/registerSeries path) with segment nodes', () => {
    const { getByTestId } = renderChart();
    expect(getByTestId('interaction-spy')).toBeTruthy();
    expect(getByTestId('funnel-segment-pipeline-Signups')).toBeTruthy();
  });

  it('publishes the hovered step as a single ActiveTarget', async () => {
    let ctxRef: ReturnType<typeof useChartInteractionContext> | null = null;
    const { getByTestId } = renderChart((ctx) => { ctxRef = ctx; });

    fireEvent(getByTestId('funnel-segment-pipeline-Signups'), 'pressIn');

    await waitFor(() => {
      expect(ctxRef?.activeTarget?.kind).toBe('cell');
      expect(ctxRef?.activeTarget?.label).toBe('Signups');
      expect(ctxRef?.activeTarget?.value).toBe(400);
      expect(ctxRef?.activeSlice?.length).toBe(1);
      expect(String(ctxRef?.activeTarget?.customTooltip)).toContain('of first step');
    });

    fireEvent(getByTestId('funnel-segment-pipeline-Signups'), 'pressOut');
    await waitFor(() => {
      expect(ctxRef?.activeTarget).toBeNull();
      expect(ctxRef?.activeSlice?.length ?? 0).toBe(0);
    });
  });
});
