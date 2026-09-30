import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ChartThemeProvider } from '../../src/theme/ChartThemeContext';
import { ChartInteractionProvider, useChartInteractionContext, useChartInteractionVolatile } from '../../src/interaction/ChartInteractionContext';
import { StackedBarChart } from '../../src/components/StackedBarChart/StackedBarChart';

const InteractionSpy: React.FC<{ onRender?: (ctx: ReturnType<typeof useChartInteractionContext>) => void }> = ({ onRender }) => {
  const ctx = useChartInteractionContext();
  const __vol = useChartInteractionVolatile();
  onRender?.({ ...ctx, ...__vol });
  return <Text testID="interaction-spy" />;
};

const SERIES = [
  { id: 'a', name: 'A', color: '#6366f1', data: [{ category: 'Q1', value: 20 }, { category: 'Q2', value: 30 }] },
  { id: 'b', name: 'B', color: '#22c55e', data: [{ category: 'Q1', value: 10 }, { category: 'Q2', value: 15 }] },
  { id: 'c', name: 'C', color: '#f97316', data: [{ category: 'Q1', value: 5 }, { category: 'Q2', value: 8 }] },
];

const renderChart = (onContext?: (ctx: ReturnType<typeof useChartInteractionContext>) => void) =>
  render(
    <ChartThemeProvider>
      <ChartInteractionProvider config={{ liveTooltip: true, multiTooltip: true, pointerRAF: false }}>
        <InteractionSpy onRender={onContext} />
        <StackedBarChart series={SERIES} w={400} h={260} />
      </ChartInteractionProvider>
    </ChartThemeProvider>
  );

describe('StackedBarChart (band hit-test engine)', () => {
  it('registers one band hit-series per stack series', async () => {
    let ctxRef: ReturnType<typeof useChartInteractionContext> | null = null;
    renderChart((ctx) => { ctxRef = ctx; });

    await waitFor(() => {
      const target = ctxRef?.hitTest({ px: 200, py: 200 });
      expect(target).not.toBeNull();
      expect(target?.kind).toBe('band');
      expect(['a', 'b', 'c']).toContain(String(target?.seriesId));
      expect(typeof target?.formattedValue).toBe('string');
    });
  });

  it('produces a full-stack slice (all series at the category) on pointer move', async () => {
    let ctxRef: ReturnType<typeof useChartInteractionContext> | null = null;
    const { getByTestId } = renderChart((ctx) => { ctxRef = ctx; });
    const surface = getByTestId('stacked-bar-gesture-surface');

    fireEvent(surface, 'responderGrant', { nativeEvent: { locationX: 200, locationY: 120, pageX: 40, pageY: 60 } });
    fireEvent(surface, 'responderMove', { nativeEvent: { locationX: 200, locationY: 120, pageX: 40, pageY: 60 } });

    await waitFor(() => {
      expect(ctxRef?.pointer?.inside).toBe(true);
      // slice() returns the nearest category's segment for every visible series.
      expect(ctxRef?.activeSlice?.length).toBe(3);
      const ids = (ctxRef?.activeSlice ?? []).map((t) => String(t.seriesId)).sort();
      expect(ids).toEqual(['a', 'b', 'c']);
      (ctxRef?.activeSlice ?? []).forEach((t) => {
        expect(t.kind).toBe('band');
        expect(typeof t.formattedValue).toBe('string');
      });
    });

    fireEvent(surface, 'responderRelease', { nativeEvent: {} });
    await waitFor(() => {
      expect(ctxRef?.activeTarget).toBeNull();
      expect(ctxRef?.activeSlice?.length).toBe(0);
    });
  });
});
