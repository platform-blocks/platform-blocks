import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ChartThemeProvider } from '../../src/theme/ChartThemeContext';
import { ChartInteractionProvider, useChartInteractionContext, useChartInteractionVolatile } from '../../src/interaction/ChartInteractionContext';
import { SankeyChart } from '../../src/components/SankeyChart/SankeyChart';

const InteractionSpy: React.FC<{ onRender?: (ctx: ReturnType<typeof useChartInteractionContext>) => void }> = ({ onRender }) => {
  const ctx = useChartInteractionContext();
  const __vol = useChartInteractionVolatile();
  onRender?.({ ...ctx, ...__vol });
  return <Text testID="interaction-spy" />;
};

const NODES = [
  { id: 'a', name: 'A' },
  { id: 'b', name: 'B' },
  { id: 'c', name: 'C' },
];
const LINKS = [
  { source: 'a', target: 'b', value: 30 },
  { source: 'b', target: 'c', value: 20 },
];

const renderChart = (onContext?: (ctx: ReturnType<typeof useChartInteractionContext>) => void) =>
  render(
    <ChartThemeProvider>
      <ChartInteractionProvider config={{ liveTooltip: true, multiTooltip: true, pointerRAF: false }}>
        <InteractionSpy onRender={onContext} />
        <SankeyChart nodes={NODES} links={LINKS} w={480} h={320} />
      </ChartInteractionProvider>
    </ChartThemeProvider>
  );

describe('SankeyChart (element-hover engine-swap)', () => {
  it('renders (off the legacy registerSeries path) with node rects', () => {
    const { getByTestId } = renderChart();
    expect(getByTestId('interaction-spy')).toBeTruthy();
    expect(getByTestId('sankey-node-b')).toBeTruthy();
  });

  it('publishes the hovered node as a single ActiveTarget', async () => {
    let ctxRef: ReturnType<typeof useChartInteractionContext> | null = null;
    const { getByTestId } = renderChart((ctx) => { ctxRef = ctx; });

    fireEvent(getByTestId('sankey-node-b'), 'pressIn');

    await waitFor(() => {
      expect(ctxRef?.activeTarget?.kind).toBe('cell');
      expect(ctxRef?.activeTarget?.markId).toBe('b');
      expect(ctxRef?.activeSlice?.length).toBe(1);
      expect(String(ctxRef?.activeTarget?.customTooltip)).toContain('in ');
    });

    fireEvent(getByTestId('sankey-node-b'), 'pressOut');
    await waitFor(() => {
      expect(ctxRef?.activeTarget).toBeNull();
      expect(ctxRef?.activeSlice?.length ?? 0).toBe(0);
    });
  });
});
