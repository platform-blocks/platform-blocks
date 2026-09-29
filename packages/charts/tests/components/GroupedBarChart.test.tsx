import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ChartThemeProvider } from '../../src/theme/ChartThemeContext';
import { ChartInteractionProvider, useChartInteractionContext, useChartInteractionVolatile } from '../../src/interaction/ChartInteractionContext';
import { GroupedBarChart } from '../../src/components/GroupedBarChart/GroupedBarChart';

const InteractionSpy: React.FC<{ onRender?: (ctx: ReturnType<typeof useChartInteractionContext>) => void }> = ({ onRender }) => {
  const ctx = useChartInteractionContext();
  const __vol = useChartInteractionVolatile();
  onRender?.({ ...ctx, ...__vol });
  return <Text testID="interaction-spy" />;
};

const SERIES = [
  { id: 'a', name: 'A', color: '#6366f1', data: [{ category: 'X', value: 20 }, { category: 'Y', value: 30 }] },
  { id: 'b', name: 'B', color: '#22c55e', data: [{ category: 'X', value: 10 }, { category: 'Y', value: 25 }] },
];

const renderChart = (onContext?: (ctx: ReturnType<typeof useChartInteractionContext>) => void) =>
  render(
    <ChartThemeProvider>
      <ChartInteractionProvider config={{ liveTooltip: true, multiTooltip: true, pointerRAF: false }}>
        <InteractionSpy onRender={onContext} />
        <GroupedBarChart series={SERIES} w={400} h={260} />
      </ChartInteractionProvider>
    </ChartThemeProvider>
  );

describe('GroupedBarChart (band hit-test engine)', () => {
  it('registers one band hit-series per series', async () => {
    let ctxRef: ReturnType<typeof useChartInteractionContext> | null = null;
    renderChart((ctx) => { ctxRef = ctx; });

    await waitFor(() => {
      const target = ctxRef?.hitTest({ px: 150, py: 150 });
      expect(target).not.toBeNull();
      expect(target?.kind).toBe('band');
      expect(['a', 'b']).toContain(String(target?.seriesId));
      expect(typeof target?.formattedValue).toBe('string');
    });
  });

  it('produces a grouped slice (all series at the category) on pointer move', async () => {
    let ctxRef: ReturnType<typeof useChartInteractionContext> | null = null;
    const { getByTestId } = renderChart((ctx) => { ctxRef = ctx; });
    const surface = getByTestId('grouped-bar-gesture-surface');

    fireEvent(surface, 'responderGrant', { nativeEvent: { locationX: 150, locationY: 120, pageX: 40, pageY: 60 } });
    fireEvent(surface, 'responderMove', { nativeEvent: { locationX: 150, locationY: 120, pageX: 40, pageY: 60 } });

    await waitFor(() => {
      expect(ctxRef?.pointer?.inside).toBe(true);
      expect(ctxRef?.activeSlice?.length).toBe(2);
      const ids = (ctxRef?.activeSlice ?? []).map((t) => String(t.seriesId)).sort();
      expect(ids).toEqual(['a', 'b']);
      (ctxRef?.activeSlice ?? []).forEach((t) => expect(t.kind).toBe('band'));
    });

    fireEvent(surface, 'responderRelease', { nativeEvent: {} });
    await waitFor(() => {
      expect(ctxRef?.activeTarget).toBeNull();
      expect(ctxRef?.activeSlice?.length).toBe(0);
    });
  });
});
