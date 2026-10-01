import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ChartThemeProvider } from '../../src/theme/ChartThemeContext';
import { ChartInteractionProvider, useChartInteractionContext, useChartInteractionVolatile } from '../../src/interaction/ChartInteractionContext';
import { RadarChart } from '../../src/components/RadarChart/RadarChart';

const InteractionSpy: React.FC<{ onRender?: (ctx: ReturnType<typeof useChartInteractionContext>) => void }> = ({ onRender }) => {
  const ctx = useChartInteractionContext();
  const __vol = useChartInteractionVolatile();
  onRender?.({ ...ctx, ...__vol });
  return <Text testID="interaction-spy" />;
};

const SERIES = [
  { id: 's1', name: 'S1', color: '#6366f1', data: [{ axis: 'A', value: 40 }, { axis: 'B', value: 30 }, { axis: 'C', value: 20 }] },
  { id: 's2', name: 'S2', color: '#22c55e', data: [{ axis: 'A', value: 25 }, { axis: 'B', value: 45 }, { axis: 'C', value: 35 }] },
];

// 300×300 → center (150,150). The axis tester matches by angle only, so any off-centre
// point resolves to the nearest spoke; (150,40) is straight up (spoke A / angle 0).
const renderChart = (onContext?: (ctx: ReturnType<typeof useChartInteractionContext>) => void) =>
  render(
    <ChartThemeProvider>
      <ChartInteractionProvider config={{ liveTooltip: true, multiTooltip: true, pointerRAF: false }}>
        <InteractionSpy onRender={onContext} />
        <RadarChart series={SERIES} w={300} h={300} />
      </ChartInteractionProvider>
    </ChartThemeProvider>
  );

describe('RadarChart (axis hit-test engine)', () => {
  it('resolves the nearest spoke by angle', async () => {
    let ctxRef: ReturnType<typeof useChartInteractionContext> | null = null;
    renderChart((ctx) => { ctxRef = ctx; });

    await waitFor(() => {
      const target = ctxRef?.hitTest({ px: 150, py: 40 });
      expect(target).not.toBeNull();
      expect(target?.kind).toBe('axis');
      expect(['s1', 's2']).toContain(String(target?.seriesId));
      expect(target?.axisIndex).toBe(0);
    });
  });

  it('produces an axis slice (all series at the spoke) on pointer move', async () => {
    let ctxRef: ReturnType<typeof useChartInteractionContext> | null = null;
    const { getByTestId } = renderChart((ctx) => { ctxRef = ctx; });
    const surface = getByTestId('radar-gesture-surface');

    fireEvent(surface, 'responderGrant', { nativeEvent: { locationX: 150, locationY: 40, pageX: 40, pageY: 60 } });
    fireEvent(surface, 'responderMove', { nativeEvent: { locationX: 150, locationY: 40, pageX: 40, pageY: 60 } });

    await waitFor(() => {
      expect(ctxRef?.pointer?.inside).toBe(true);
      // slice() returns every visible series' value at the nearest spoke.
      expect(ctxRef?.activeSlice?.length).toBe(2);
      const ids = (ctxRef?.activeSlice ?? []).map((t) => String(t.seriesId)).sort();
      expect(ids).toEqual(['s1', 's2']);
      (ctxRef?.activeSlice ?? []).forEach((t) => expect(t.kind).toBe('axis'));
    });

    fireEvent(surface, 'responderRelease', { nativeEvent: {} });
    await waitFor(() => {
      expect(ctxRef?.activeTarget).toBeNull();
      expect(ctxRef?.activeSlice?.length).toBe(0);
    });
  });

  it('keeps a touched spoke selected briefly after release', async () => {
    let ctxRef: ReturnType<typeof useChartInteractionContext> | null = null;
    const { getByTestId } = renderChart((ctx) => { ctxRef = ctx; });
    const surface = getByTestId('radar-gesture-surface');
    const touch = { nativeEvent: { locationX: 150, locationY: 40, pageX: 150, pageY: 40, touches: [] } };

    fireEvent(surface, 'responderGrant', touch);
    fireEvent(surface, 'responderRelease', touch);

    await waitFor(() => {
      expect(ctxRef?.activeTarget?.axisIndex).toBe(0);
      expect(ctxRef?.activeSlice?.length).toBe(2);
    });
  });
});

describe('RadarChart compact spoke labels', () => {
  const longSeries = [{
    name: 'Guild',
    data: [
      'Code quality', 'Delivery speed', 'Testing coverage',
      'Observability', 'Collaboration', 'Innovation',
    ].map((axis, index) => ({ axis, value: index + 2 })),
  }];

  it('shows a numbered key with complete axis names when labels would shrink a phone plot', () => {
    const chart = render(
      <ChartThemeProvider>
        <RadarChart series={longSeries} w={280} h={400} />
      </ChartThemeProvider>
    );
    expect(chart.getByTestId('radar-axis-key')).toBeTruthy();
    expect(chart.getByText('1.')).toBeTruthy();
    expect(chart.getByText('Code quality')).toBeTruthy();
    expect(chart.getByText('Testing coverage')).toBeTruthy();
  });

  it('allows full labels to be kept on a narrow chart', () => {
    const chart = render(
      <ChartThemeProvider>
        <RadarChart series={longSeries} w={280} h={400} radialGrid={{ showFullLabelsOnNarrow: true }} />
      </ChartThemeProvider>
    );
    expect(chart.queryByTestId('radar-axis-key')).toBeNull();
  });
});
