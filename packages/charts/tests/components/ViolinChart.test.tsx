import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ChartThemeProvider } from '../../src/theme/ChartThemeContext';
import { ChartInteractionProvider, useChartInteractionContext, useChartInteractionVolatile } from '../../src/interaction/ChartInteractionContext';
import { ViolinChart } from '../../src/components/ViolinChart/ViolinChart';

const InteractionSpy: React.FC<{ onRender?: (ctx: ReturnType<typeof useChartInteractionContext>) => void }> = ({ onRender }) => {
  const ctx = useChartInteractionContext();
  const __vol = useChartInteractionVolatile();
  onRender?.({ ...ctx, ...__vol });
  return <Text testID="interaction-spy" />;
};

const SERIES = [
  { id: 'v0', name: 'V0', values: [1, 2, 3, 4, 5, 3, 2, 4] },
  { id: 'v1', name: 'V1', values: [3, 4, 5, 6, 7, 5, 4, 6] },
  { id: 'v2', name: 'V2', values: [5, 6, 7, 8, 9, 7, 6, 8] },
];

// Vertical violins → category axis is x; each violin occupies a column band.
const renderChart = (onContext?: (ctx: ReturnType<typeof useChartInteractionContext>) => void) =>
  render(
    <ChartThemeProvider>
      <ChartInteractionProvider config={{ liveTooltip: true, pointerRAF: false }}>
        <InteractionSpy onRender={onContext} />
        <ViolinChart series={SERIES} w={500} h={300} />
      </ChartInteractionProvider>
    </ChartThemeProvider>
  );

describe('ViolinChart (band-summary hit-test engine)', () => {
  it('resolves which violin the pointer is over (band orientation x)', async () => {
    let ctxRef: ReturnType<typeof useChartInteractionContext> | null = null;
    renderChart((ctx) => { ctxRef = ctx; });

    await waitFor(() => {
      const left = ctxRef?.hitTest({ px: 100, py: 150 });
      const right = ctxRef?.hitTest({ px: 400, py: 150 });
      expect(left?.kind).toBe('band');
      expect(right?.kind).toBe('band');
      // Distinct columns resolve to distinct violin marks.
      expect(String(left?.markId)).not.toBe(String(right?.markId));
      expect(typeof left?.formattedValue).toBe('string');
    });
  });

  it('sets the active violin on pointer move and clears it on release', async () => {
    let ctxRef: ReturnType<typeof useChartInteractionContext> | null = null;
    const { getByTestId } = renderChart((ctx) => { ctxRef = ctx; });
    const surface = getByTestId('violin-gesture-surface');

    fireEvent(surface, 'responderGrant', { nativeEvent: { locationX: 100, locationY: 150, pageX: 40, pageY: 60 } });
    fireEvent(surface, 'responderMove', { nativeEvent: { locationX: 100, locationY: 150, pageX: 40, pageY: 60 } });

    await waitFor(() => {
      expect(ctxRef?.pointer?.inside).toBe(true);
      expect(ctxRef?.activeTarget?.kind).toBe('band');
      expect(['V0', 'V1', 'V2']).toContain(ctxRef?.activeTarget?.label);
    });

    fireEvent(surface, 'responderRelease', { nativeEvent: {} });
    await waitFor(() => {
      expect(ctxRef?.activeTarget).toBeNull();
    });
  });
});
