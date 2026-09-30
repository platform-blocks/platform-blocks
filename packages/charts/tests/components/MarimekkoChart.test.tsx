import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ChartThemeProvider } from '../../src/theme/ChartThemeContext';
import { ChartInteractionProvider, useChartInteractionContext, useChartInteractionVolatile } from '../../src/interaction/ChartInteractionContext';
import { MarimekkoChart } from '../../src/components/MarimekkoChart/MarimekkoChart';

const InteractionSpy: React.FC<{ onRender?: (ctx: ReturnType<typeof useChartInteractionContext>) => void }> = ({ onRender }) => {
  const ctx = useChartInteractionContext();
  const __vol = useChartInteractionVolatile();
  onRender?.({ ...ctx, ...__vol });
  return <Text testID="interaction-spy" />;
};

const DATA = [
  {
    id: 'inbound',
    label: 'Inbound',
    segments: [
      { id: 'na', label: 'North America', value: 52 },
      { id: 'emea', label: 'EMEA', value: 34 },
    ],
  },
  {
    id: 'outbound',
    label: 'Outbound',
    segments: [
      { id: 'na', label: 'North America', value: 44 },
      { id: 'emea', label: 'EMEA', value: 28 },
    ],
  },
];

const renderChart = (onContext?: (ctx: ReturnType<typeof useChartInteractionContext>) => void) =>
  render(
    <ChartThemeProvider>
      <ChartInteractionProvider config={{ liveTooltip: true, multiTooltip: true, pointerRAF: false }}>
        <InteractionSpy onRender={onContext} />
        <MarimekkoChart data={DATA} w={480} h={320} />
      </ChartInteractionProvider>
    </ChartThemeProvider>
  );

describe('MarimekkoChart (segment engine-swap)', () => {
  it('renders (off the legacy crosshair/registerSeries path) with segment rects', () => {
    const { getByTestId } = renderChart();
    expect(getByTestId('interaction-spy')).toBeTruthy();
    expect(getByTestId('marimekko-segment-inbound-na')).toBeTruthy();
  });

  it('publishes the hovered segment as a single ActiveTarget', async () => {
    let ctxRef: ReturnType<typeof useChartInteractionContext> | null = null;
    const { getByTestId } = renderChart((ctx) => { ctxRef = ctx; });

    fireEvent(getByTestId('marimekko-segment-inbound-na'), 'pressIn');

    await waitFor(() => {
      expect(ctxRef?.activeTarget?.kind).toBe('cell');
      expect(ctxRef?.activeTarget?.label).toBe('North America');
      expect(ctxRef?.activeSlice?.length).toBe(1);
      expect(String(ctxRef?.activeTarget?.customTooltip)).toContain('of total');
    });

    fireEvent(getByTestId('marimekko-segment-inbound-na'), 'pressOut');
    await waitFor(() => {
      expect(ctxRef?.activeTarget).toBeNull();
      expect(ctxRef?.activeSlice?.length ?? 0).toBe(0);
    });
  });
});
