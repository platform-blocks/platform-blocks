import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ChartThemeProvider } from '../../src/theme/ChartThemeContext';
import { ChartInteractionProvider, useChartInteractionContext, useChartInteractionVolatile } from '../../src/interaction/ChartInteractionContext';
import { NetworkChart } from '../../src/components/NetworkChart/NetworkChart';

const InteractionSpy: React.FC<{ onRender?: (ctx: ReturnType<typeof useChartInteractionContext>) => void }> = ({ onRender }) => {
  const ctx = useChartInteractionContext();
  const __vol = useChartInteractionVolatile();
  onRender?.({ ...ctx, ...__vol });
  return <Text testID="interaction-spy" />;
};

const NODES = [
  { id: 'product', name: 'Product', value: 12, color: '#4C6EF5' },
  { id: 'design', name: 'Design', value: 8, color: '#845EF7' },
  { id: 'eng', name: 'Engineering', value: 18, color: '#20C997' },
];
const LINKS = [
  { source: 'product', target: 'design', value: 7 },
  { source: 'product', target: 'eng', value: 8 },
];

const renderChart = (onContext?: (ctx: ReturnType<typeof useChartInteractionContext>) => void) =>
  render(
    <ChartThemeProvider>
      <ChartInteractionProvider config={{ liveTooltip: true, multiTooltip: true, pointerRAF: false }}>
        <InteractionSpy onRender={onContext} />
        <NetworkChart nodes={NODES} links={LINKS} w={480} h={320} disabled />
      </ChartInteractionProvider>
    </ChartThemeProvider>
  );

describe('NetworkChart (element-hover engine-swap)', () => {
  // The force simulation + rAF-throttled renderer never advances in jsdom, so the node
  // <G> testIDs (and hence a fireable hover) aren't available here — same class of
  // untestable-in-jest interaction as LineChart's PanResponder. We assert the engine-swap
  // at the store level instead: the chart mounts and registers NO legacy series.
  it('renders inside an interaction provider', () => {
    const { getByTestId } = renderChart();
    expect(getByTestId('interaction-spy')).toBeTruthy();
  });

  it('no longer registers a legacy "network-nodes" series (registerSeries removed)', () => {
    let ctxRef: ReturnType<typeof useChartInteractionContext> | null = null;
    renderChart((ctx) => { ctxRef = ctx; });
    const ids = (ctxRef?.series ?? []).map((s) => String(s.id));
    expect(ids).not.toContain('network-nodes');
  });
});
