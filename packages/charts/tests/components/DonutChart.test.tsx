import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ChartThemeProvider } from '../../src/theme/ChartThemeContext';
import { ChartInteractionProvider, useChartInteractionContext, useChartInteractionVolatile } from '../../src/interaction/ChartInteractionContext';
import { DonutChart } from '../../src/components/DonutChart/DonutChart';

const InteractionSpy: React.FC<{ onRender?: (ctx: ReturnType<typeof useChartInteractionContext>) => void }> = ({ onRender }) => {
  const ctx = useChartInteractionContext();
  const __vol = useChartInteractionVolatile();
  onRender?.({ ...ctx, ...__vol });
  return <Text testID="interaction-spy" />;
};

// 50 / 30 / 20 → slice A spans the top half (start -90 → end +90, centerAngle 0 = top).
const DATA = [
  { id: 'a', label: 'A', value: 50, color: '#6366f1' },
  { id: 'b', label: 'B', value: 30, color: '#22c55e' },
  { id: 'c', label: 'C', value: 20, color: '#f97316' },
];

// padding 20 all sides, 340×340 → plot 300×300, center (150,150), container-origin
// center (170,170), outerR 150, innerR 82.5, ring mid ≈116. Slice A's top point ≈ (170, 54).
const renderChart = (onContext?: (ctx: ReturnType<typeof useChartInteractionContext>) => void) =>
  render(
    <ChartThemeProvider>
      <ChartInteractionProvider config={{ liveTooltip: true, pointerRAF: false }}>
        <InteractionSpy onRender={onContext} />
        <DonutChart data={DATA} w={340} h={340} padding={{ top: 20, right: 20, bottom: 20, left: 20 }} />
      </ChartInteractionProvider>
    </ChartThemeProvider>
  );

describe('DonutChart (angular hit-test engine)', () => {
  it('resolves the slice under the pointer and nothing in the center hole', async () => {
    let ctxRef: ReturnType<typeof useChartInteractionContext> | null = null;
    renderChart((ctx) => { ctxRef = ctx; });

    await waitFor(() => {
      const target = ctxRef?.hitTest({ px: 170, py: 54 });
      expect(target).not.toBeNull();
      expect(target?.kind).toBe('slice');
      expect(target?.label).toBe('A');
      expect(typeof target?.formattedValue).toBe('string');
    });

    // Center of the donut is a hole (radius < innerRadius) → no slice.
    expect(ctxRef?.hitTest({ px: 170, py: 170 })).toBeNull();
  });

  it('sets the active target on pointer move over a slice and clears it on release', async () => {
    let ctxRef: ReturnType<typeof useChartInteractionContext> | null = null;
    const { getByTestId } = renderChart((ctx) => { ctxRef = ctx; });
    const surface = getByTestId('donut-gesture-surface');

    fireEvent(surface, 'responderGrant', { nativeEvent: { locationX: 170, locationY: 54, pageX: 40, pageY: 60 } });
    fireEvent(surface, 'responderMove', { nativeEvent: { locationX: 170, locationY: 54, pageX: 40, pageY: 60 } });

    await waitFor(() => {
      expect(ctxRef?.pointer?.inside).toBe(true);
      expect(ctxRef?.activeTarget?.kind).toBe('slice');
      expect(ctxRef?.activeTarget?.label).toBe('A');
    });

    fireEvent(surface, 'responderRelease', { nativeEvent: {} });
    await waitFor(() => {
      expect(ctxRef?.activeTarget).toBeNull();
    });
  });
});
