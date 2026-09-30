import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ChartThemeProvider } from '../../src/theme/ChartThemeContext';
import { ChartInteractionProvider, useChartInteractionContext, useChartInteractionVolatile } from '../../src/interaction/ChartInteractionContext';
import { RadialBarChart } from '../../src/components/RadialBarChart/RadialBarChart';

const InteractionSpy: React.FC<{ onRender?: (ctx: ReturnType<typeof useChartInteractionContext>) => void }> = ({ onRender }) => {
  const ctx = useChartInteractionContext();
  const __vol = useChartInteractionVolatile();
  onRender?.({ ...ctx, ...__vol });
  return <Text testID="interaction-spy" />;
};

const DATA = [
  { id: 'a', label: 'A', value: 80, max: 100, color: '#6366f1' },
  { id: 'b', label: 'B', value: 60, max: 100, color: '#22c55e' },
  { id: 'c', label: 'C', value: 40, max: 100, color: '#f97316' },
];

// 300×300 → center (150,150), maxRadius = 150 - 24 = 126. Ring 0 (outermost) sits
// at maxRadius - barThickness/2 = 126 - 8 = 118, so its top point is (150, 32).
const renderChart = (onContext?: (ctx: ReturnType<typeof useChartInteractionContext>) => void) =>
  render(
    <ChartThemeProvider>
      <ChartInteractionProvider config={{ liveTooltip: true, pointerRAF: false }}>
        <InteractionSpy onRender={onContext} />
        <RadialBarChart data={DATA} w={300} h={300} barThickness={16} gap={6} />
      </ChartInteractionProvider>
    </ChartThemeProvider>
  );

describe('RadialBarChart (angular hit-test engine)', () => {
  it('registers an angular hit-tester whose sectors resolve by annular membership', async () => {
    let ctxRef: ReturnType<typeof useChartInteractionContext> | null = null;
    renderChart((ctx) => { ctxRef = ctx; });

    await waitFor(() => {
      // Point on the outermost ring (top). Should resolve to series 'a'.
      const target = ctxRef?.hitTest({ px: 150, py: 32 });
      expect(target).not.toBeNull();
      expect(target?.kind).toBe('slice');
      expect(String(target?.seriesId)).toBe('a');
      expect(typeof target?.formattedValue).toBe('string');
    });

    // A point far outside every ring resolves to nothing.
    expect(ctxRef?.hitTest({ px: 150, py: 150 })).toBeNull();
  });

  it('sets the active target on pointer move over a ring and clears it on release', async () => {
    let ctxRef: ReturnType<typeof useChartInteractionContext> | null = null;
    const { getByTestId } = renderChart((ctx) => { ctxRef = ctx; });
    const surface = getByTestId('radial-bar-gesture-surface');

    fireEvent(surface, 'responderGrant', { nativeEvent: { locationX: 150, locationY: 32, pageX: 40, pageY: 60 } });
    fireEvent(surface, 'responderMove', { nativeEvent: { locationX: 150, locationY: 32, pageX: 40, pageY: 60 } });

    await waitFor(() => {
      expect(ctxRef?.pointer?.inside).toBe(true);
      expect(String(ctxRef?.activeTarget?.seriesId)).toBe('a');
      expect(ctxRef?.activeTarget?.kind).toBe('slice');
      expect(typeof ctxRef?.activeTarget?.formattedValue).toBe('string');
    });

    fireEvent(surface, 'responderRelease', { nativeEvent: {} });
    await waitFor(() => {
      expect(ctxRef?.activeTarget).toBeNull();
    });
  });
});
