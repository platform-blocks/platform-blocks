import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ChartThemeProvider } from '../../src/theme/ChartThemeContext';
import { ChartInteractionProvider, useChartInteractionContext, useChartInteractionVolatile } from '../../src/interaction/ChartInteractionContext';
import { RidgeChart } from '../../src/components/RidgeChart/RidgeChart';

const InteractionSpy: React.FC<{ onRender?: (ctx: ReturnType<typeof useChartInteractionContext>) => void }> = ({ onRender }) => {
  const ctx = useChartInteractionContext();
  const __vol = useChartInteractionVolatile();
  onRender?.({ ...ctx, ...__vol });
  return <Text testID="interaction-spy" />;
};

const SERIES = [
  { id: 'r0', name: 'R0', values: [1, 2, 3, 4, 5, 3, 2] },
  { id: 'r1', name: 'R1', values: [3, 5, 7, 9, 6, 4, 5] },
];

// padding {top:40,left:80,bottom:60}. 400×300 → plot 300×200, 2 ridges → bandH 100.
// Ridge 0 row = [40,140], ridge 1 = [140,240] (container-origin), full plot width.
const renderChart = (onContext?: (ctx: ReturnType<typeof useChartInteractionContext>) => void) =>
  render(
    <ChartThemeProvider>
      <ChartInteractionProvider config={{ liveTooltip: true, pointerRAF: false }}>
        <InteractionSpy onRender={onContext} />
        <RidgeChart series={SERIES} w={400} h={300} />
      </ChartInteractionProvider>
    </ChartThemeProvider>
  );

describe('RidgeChart (band-summary hit-test engine)', () => {
  it('resolves which ridge the pointer is over (band orientation y)', async () => {
    let ctxRef: ReturnType<typeof useChartInteractionContext> | null = null;
    renderChart((ctx) => { ctxRef = ctx; });

    await waitFor(() => {
      const top = ctxRef?.hitTest({ px: 200, py: 80 });
      const bottom = ctxRef?.hitTest({ px: 200, py: 200 });
      expect(top?.kind).toBe('band');
      expect(bottom?.kind).toBe('band');
      // Different rows resolve to different ridge marks.
      expect(String(top?.markId)).not.toBe(String(bottom?.markId));
      expect(top?.label).toBe('R0');
      expect(bottom?.label).toBe('R1');
    });
  });

  it('sets the active ridge on pointer move and clears it on release', async () => {
    let ctxRef: ReturnType<typeof useChartInteractionContext> | null = null;
    const { getByTestId } = renderChart((ctx) => { ctxRef = ctx; });
    const surface = getByTestId('ridge-gesture-surface');

    fireEvent(surface, 'responderGrant', { nativeEvent: { locationX: 200, locationY: 80, pageX: 40, pageY: 60 } });
    fireEvent(surface, 'responderMove', { nativeEvent: { locationX: 200, locationY: 80, pageX: 40, pageY: 60 } });

    await waitFor(() => {
      expect(ctxRef?.pointer?.inside).toBe(true);
      expect(ctxRef?.activeTarget?.kind).toBe('band');
      expect(ctxRef?.activeTarget?.label).toBe('R0');
    });

    fireEvent(surface, 'responderRelease', { nativeEvent: {} });
    await waitFor(() => {
      expect(ctxRef?.activeTarget).toBeNull();
    });
  });
});
