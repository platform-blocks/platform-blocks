import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ChartThemeProvider } from '../../src/theme/ChartThemeContext';
import { ChartInteractionProvider, useChartInteractionContext, useChartInteractionVolatile } from '../../src/interaction/ChartInteractionContext';
import { StackedAreaChart } from '../../src/components/StackedAreaChart/StackedAreaChart';

const InteractionSpy: React.FC<{ onRender?: (ctx: ReturnType<typeof useChartInteractionContext>) => void }> = ({ onRender }) => {
  const ctx = useChartInteractionContext();
  const __vol = useChartInteractionVolatile();
  onRender?.({ ...ctx, ...__vol });
  return <Text testID="interaction-spy" />;
};

const SERIES = [
  { id: 'mobile', name: 'Mobile', color: '#6366f1', data: [{ x: 1, y: 10 }, { x: 2, y: 20 }, { x: 3, y: 30 }] },
  { id: 'desktop', name: 'Desktop', color: '#22c55e', data: [{ x: 1, y: 5 }, { x: 2, y: 15 }, { x: 3, y: 25 }] },
];

const renderChart = (onContext?: (ctx: ReturnType<typeof useChartInteractionContext>) => void) =>
  render(
    <ChartThemeProvider>
      <ChartInteractionProvider config={{ liveTooltip: true, multiTooltip: true, pointerRAF: false }}>
        <InteractionSpy onRender={onContext} />
        <StackedAreaChart series={SERIES} width={400} height={240} />
      </ChartInteractionProvider>
    </ChartThemeProvider>
  );

describe('StackedAreaChart (hit-test engine)', () => {
  it('registers one hit-tester series per layer with formatted marks', async () => {
    let ctxRef: ReturnType<typeof useChartInteractionContext> | null = null;
    renderChart((ctx) => { ctxRef = ctx; });

    // Registration happens in an effect; the store's hitTest resolves the nearest
    // registered mark. It returns whichever layer is nearest at the query point.
    // The query is deliberately generous rather than a pixel that assumed a
    // particular axis margin — margins are measured from the labels now, so a
    // hard-coded point stops landing on a mark the moment a label changes width.
    await waitFor(() => {
      const target = ctxRef?.hitTest({ px: 200, py: 120, maxDistance: 400 });
      expect(target).not.toBeNull();
      expect(['mobile', 'desktop']).toContain(String(target?.seriesId));
      expect(typeof target?.formattedValue).toBe('string');
    });
  });

  it('produces a multi-series slice (both layers) on pointer move and clears on release', async () => {
    let ctxRef: ReturnType<typeof useChartInteractionContext> | null = null;
    const { getByTestId } = renderChart((ctx) => { ctxRef = ctx; });

    const surface = getByTestId('stacked-area-gesture-surface');

    // Native responder path (Platform defaults to ios in the RN jest preset).
    fireEvent(surface, 'responderGrant', { nativeEvent: { locationX: 200, locationY: 120, pageX: 40, pageY: 60 } });
    fireEvent(surface, 'responderMove', { nativeEvent: { locationX: 200, locationY: 120, pageX: 40, pageY: 60 } });

    await waitFor(() => {
      expect(ctxRef?.pointer?.inside).toBe(true);
      // slice() returns the nearest mark per visible series → one entry per layer.
      expect(ctxRef?.activeSlice?.length).toBe(2);
      const ids = (ctxRef?.activeSlice ?? []).map((t) => String(t.seriesId)).sort();
      expect(ids).toEqual(['desktop', 'mobile']);
      (ctxRef?.activeSlice ?? []).forEach((t) => expect(typeof t.formattedValue).toBe('string'));
    });

    fireEvent(surface, 'responderRelease', { nativeEvent: {} });

    await waitFor(() => {
      expect(ctxRef?.pointer?.inside).toBe(false);
      expect(ctxRef?.activeTarget).toBeNull();
      expect(ctxRef?.activeSlice?.length).toBe(0);
    });
  });
});
