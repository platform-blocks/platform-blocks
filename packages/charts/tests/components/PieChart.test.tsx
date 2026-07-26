import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ChartThemeProvider } from '../../src/theme/ChartThemeContext';
import { ChartInteractionProvider, useChartInteractionContext, useChartInteractionVolatile } from '../../src/interaction/ChartInteractionContext';
import { PieChart } from '../../src/components/PieChart/PieChart';

const InteractionSpy: React.FC<{ onRender?: (ctx: ReturnType<typeof useChartInteractionContext>) => void }> = ({ onRender }) => {
  const ctx = useChartInteractionContext();
  const __vol = useChartInteractionVolatile();
  onRender?.({ ...ctx, ...__vol });
  return <Text testID="interaction-spy" />;
};

// Full pie (start 0 → end 360). Slice A (50%) spans 0..180 with centerAngle 90 (right).
const DATA = [
  { id: 'a', label: 'A', value: 50, color: '#6366f1' },
  { id: 'b', label: 'B', value: 30, color: '#22c55e' },
  { id: 'c', label: 'C', value: 20, color: '#f97316' },
];

// 320×320 with no title/legend → plot box is the whole container, center (160,160). The
// radius is what's left after the outside-label gutter (160 - 320*0.22 ≈ 90), innerR 0.
// Slice A's right point ≈ (222,160) still lands well inside it.
const renderChart = (onContext?: (ctx: ReturnType<typeof useChartInteractionContext>) => void) =>
  render(
    <ChartThemeProvider>
      <ChartInteractionProvider config={{ liveTooltip: true, pointerRAF: false }}>
        <InteractionSpy onRender={onContext} />
        <PieChart data={DATA} width={320} height={320} />
      </ChartInteractionProvider>
    </ChartThemeProvider>
  );

const renderWithLegend = () =>
  render(
    <ChartThemeProvider>
      <ChartInteractionProvider config={{ liveTooltip: true, pointerRAF: false }}>
        <PieChart data={DATA} width={320} height={320} legend={{ show: true }} />
      </ChartInteractionProvider>
    </ChartThemeProvider>
  );

describe('PieChart legend toggling', () => {
  it('restores every slice when the last visible one is switched off', async () => {
    const { getByText, queryAllByLabelText } = renderWithLegend();
    // Each rendered wedge carries an accessibility label of the form "A: 50.0%".
    const sliceCount = () => queryAllByLabelText(/^[ABC]: /).length;

    expect(sliceCount()).toBe(3);

    fireEvent.press(getByText('A'));
    await waitFor(() => expect(sliceCount()).toBe(2));

    fireEvent.press(getByText('B'));
    await waitFor(() => expect(sliceCount()).toBe(1));

    // Hiding the last one would empty the chart — all three come back instead.
    fireEvent.press(getByText('C'));
    await waitFor(() => expect(sliceCount()).toBe(3));
  });
});

describe('PieChart (angular hit-test engine)', () => {
  it('resolves the slice under the pointer; a point outside the radius resolves to nothing', async () => {
    let ctxRef: ReturnType<typeof useChartInteractionContext> | null = null;
    renderChart((ctx) => { ctxRef = ctx; });

    await waitFor(() => {
      const target = ctxRef?.hitTest({ px: 222, py: 160 });
      expect(target).not.toBeNull();
      expect(target?.kind).toBe('slice');
      expect(target?.label).toBe('A');
    });

    // Outside the pie radius → no slice.
    expect(ctxRef?.hitTest({ px: 300, py: 300 })).toBeNull();
  });

  it('feeds the store pointer on hover over a slice (drives the built-in tooltip)', async () => {
    let ctxRef: ReturnType<typeof useChartInteractionContext> | null = null;
    const { getByTestId } = renderChart((ctx) => { ctxRef = ctx; });
    const surface = getByTestId('pie-gesture-surface');

    fireEvent(surface, 'responderGrant', { nativeEvent: { locationX: 222, locationY: 160, pageX: 40, pageY: 60 } });
    fireEvent(surface, 'responderMove', { nativeEvent: { locationX: 222, locationY: 160, pageX: 40, pageY: 60 } });

    // onPointer manually feeds the store pointer (feedStore is off to avoid a second
    // ChartActiveTooltip) and drives the built-in tooltip via hoveredSlice.
    await waitFor(() => {
      expect(ctxRef?.pointer?.inside).toBe(true);
      expect(ctxRef?.pointer?.x).toBeGreaterThan(0);
    });

    fireEvent(surface, 'responderRelease', { nativeEvent: {} });
    await waitFor(() => {
      expect(ctxRef?.pointer?.inside).toBe(false);
    });
  });
});
