import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ChartThemeProvider, type ChartTheme } from '../../src/theme/ChartThemeContext';
import { ChartInteractionProvider, useChartInteractionContext } from '../../src/interaction/ChartInteractionContext';
import { BarChart } from '../../src/components/BarChart/BarChart';

const SERIES = [
  { id: 'revenue', name: 'Revenue', data: [{ category: 'Q1', value: 9000 }, { category: 'Q2', value: 4000 }] },
];

const ContextSpy: React.FC<{ onRender: (ctx: ReturnType<typeof useChartInteractionContext>) => void }> = ({ onRender }) => {
  onRender(useChartInteractionContext());
  return <Text testID="context-spy" />;
};

const renderChart = (theme?: Partial<ChartTheme>, onContext?: (ctx: ReturnType<typeof useChartInteractionContext>) => void) =>
  render(
    <ChartThemeProvider value={theme}>
      <ChartInteractionProvider config={{ pointerRAF: false }}>
        {onContext && <ContextSpy onRender={onContext} />}
        <BarChart series={SERIES} w={400} h={300} />
      </ChartInteractionProvider>
    </ChartThemeProvider>
  );

describe('chart number format', () => {
  it('abbreviates axis ticks by default', () => {
    const { queryAllByText } = renderChart();
    expect(queryAllByText(/^\d+K$/).length).toBeGreaterThan(0);
    expect(queryAllByText(/^\d{1,3},\d{3}$/)).toHaveLength(0);
  });

  it("renders grouped digits with numberFormat: 'full'", () => {
    const { queryAllByText } = renderChart({ numberFormat: 'full' });
    expect(queryAllByText(/^\d{1,3},\d{3}$/).length).toBeGreaterThan(0);
    expect(queryAllByText(/^\d+K$/)).toHaveLength(0);
  });

  it('keeps full values in tooltips', async () => {
    let ctxRef: ReturnType<typeof useChartInteractionContext> | null = null;
    renderChart(undefined, (ctx) => { ctxRef = ctx; });
    await waitFor(() => {
      const target = ctxRef?.hitTest({ px: 200, py: 150 });
      expect(target?.formattedValue).toMatch(/^[49],000$/);
    });
  });
});
