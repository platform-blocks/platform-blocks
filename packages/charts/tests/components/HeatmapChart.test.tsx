import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ChartThemeProvider } from '../../src/theme/ChartThemeContext';
import { ChartInteractionProvider, useChartInteractionContext, useChartInteractionVolatile } from '../../src/interaction/ChartInteractionContext';
import { HeatmapChart } from '../../src/components/HeatmapChart/HeatmapChart';

const InteractionSpy: React.FC<{ onRender?: (ctx: ReturnType<typeof useChartInteractionContext>) => void }> = ({ onRender }) => {
  const ctx = useChartInteractionContext();
  const __vol = useChartInteractionVolatile();
  onRender?.({ ...ctx, ...__vol });
  return <Text testID="interaction-spy" />;
};

const DATA = {
  rows: ['r0', 'r1'],
  cols: ['c0', 'c1', 'c2'],
  values: [
    [1, 2, 3],
    [4, 5, 6],
  ],
};

// padding {top:40,left:80}. 400×300 with 3 cols × 2 rows → cell (0,0) spans roughly
// [80,178]×[40,138], so (100,60) is inside it; (10,10) is outside every cell.
const renderChart = (onContext?: (ctx: ReturnType<typeof useChartInteractionContext>) => void) =>
  render(
    <ChartThemeProvider>
      <ChartInteractionProvider config={{ liveTooltip: true, pointerRAF: false }}>
        <InteractionSpy onRender={onContext} />
        <HeatmapChart data={DATA} width={400} height={300} />
      </ChartInteractionProvider>
    </ChartThemeProvider>
  );

// react-native-svg is mocked to plain Views, so SvgText renders its value as a raw
// string child rather than a queryable <Text>. Walk the tree for string leaves.
const collectTextLeaves = (node: any, out: string[] = []): string[] => {
  if (node == null) return out;
  if (Array.isArray(node)) {
    node.forEach((child) => collectTextLeaves(child, out));
    return out;
  }
  if (typeof node === 'string') {
    out.push(node);
    return out;
  }
  collectTextLeaves(node.children, out);
  return out;
};

const countLabel = (tree: any, label: string) =>
  collectTextLeaves(tree).filter((text) => text === label).length;

describe('HeatmapChart (cell hit-test engine)', () => {
  it('resolves a cell by rect membership; a point outside the grid resolves to nothing', async () => {
    let ctxRef: ReturnType<typeof useChartInteractionContext> | null = null;
    renderChart((ctx) => { ctxRef = ctx; });

    await waitFor(() => {
      const target = ctxRef?.hitTest({ px: 100, py: 60 });
      expect(target).not.toBeNull();
      expect(target?.kind).toBe('cell');
      expect(target?.cell).toEqual({ row: 0, col: 0 });
      expect(typeof target?.formattedValue).toBe('string');
    });

    // Left of the grid (in the y-axis padding) → no cell.
    expect(ctxRef?.hitTest({ px: 10, py: 10 })).toBeNull();
  });

  it('sets the active cell on pointer move and clears it on release', async () => {
    let ctxRef: ReturnType<typeof useChartInteractionContext> | null = null;
    const { getByTestId } = renderChart((ctx) => { ctxRef = ctx; });
    const surface = getByTestId('heatmap-gesture-surface');

    fireEvent(surface, 'responderGrant', { nativeEvent: { locationX: 100, locationY: 60, pageX: 40, pageY: 60 } });
    fireEvent(surface, 'responderMove', { nativeEvent: { locationX: 100, locationY: 60, pageX: 40, pageY: 60 } });

    await waitFor(() => {
      expect(ctxRef?.pointer?.inside).toBe(true);
      expect(ctxRef?.activeTarget?.kind).toBe('cell');
      expect(ctxRef?.activeTarget?.cell).toEqual({ row: 0, col: 0 });
    });

    fireEvent(surface, 'responderRelease', { nativeEvent: {} });
    await waitFor(() => {
      expect(ctxRef?.activeTarget).toBeNull();
    });
  });

  // Hovering used to draw a second, larger copy of the value on top of the label
  // the cell already renders, so the emphasised text read as doubled.
  it('draws the hovered cell label once instead of stacking a second copy on it', async () => {
    let ctxRef: ReturnType<typeof useChartInteractionContext> | null = null;
    const { getByTestId, toJSON } = renderChart((ctx) => { ctxRef = ctx; });
    const surface = getByTestId('heatmap-gesture-surface');

    // Cell (0,0) holds the value 1; no axis tick or legend renders that string.
    expect(countLabel(toJSON(), '1')).toBe(1);

    fireEvent(surface, 'responderGrant', { nativeEvent: { locationX: 100, locationY: 60, pageX: 40, pageY: 60 } });
    fireEvent(surface, 'responderMove', { nativeEvent: { locationX: 100, locationY: 60, pageX: 40, pageY: 60 } });

    await waitFor(() => {
      expect(ctxRef?.activeTarget?.cell).toEqual({ row: 0, col: 0 });
    });

    expect(countLabel(toJSON(), '1')).toBe(1);
  });
});
