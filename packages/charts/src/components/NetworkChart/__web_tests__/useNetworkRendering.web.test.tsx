import { act, renderHook } from '@testing-library/react';
import { useNetworkSimulation } from '../useNetworkSimulation';
import { useAnimatedNetworkRendering } from '../useAnimatedNetworkRendering';
import type { NetworkLayoutMode } from '../types';

const nodes = [{ id: 'a', x: 0, y: 0 }, { id: 'b', x: 10, y: 10 }];
const links = [{ source: 'a', target: 'b', weight: 2 }];
const palette = ['#123456'];

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test.each<NetworkLayoutMode>(['circular', 'radial', 'coordinate', 'force'])(
  '%s renders without a running simulation and updates on every resize',
  (layout) => {
    const { result, rerender } = renderHook(({ width }) => {
      const simulation = useNetworkSimulation({
        nodes, links, palette, layout, width, height: 300, disabled: true,
      });
      return useAnimatedNetworkRendering(simulation);
    }, { initialProps: { width: 320 } });

    for (const width of [320, 390, 480]) {
      rerender({ width });
      act(() => jest.advanceTimersByTime(100));
      expect(result.current.renderNodes.map(node => node.id)).toEqual(['a', 'b']);
      expect(result.current.renderLinks).toHaveLength(1);
      if (layout === 'circular') {
        expect(result.current.renderNodes[0].x).toBe(width / 2 + 120);
      }
    }
  },
);

test('renders replaced data and clears removed nodes and links', () => {
  const { result, rerender } = renderHook(({ data }) => {
    const simulation = useNetworkSimulation({
      nodes: data, links, palette, layout: 'circular', width: 320, height: 300,
    });
    return useAnimatedNetworkRendering(simulation);
  }, { initialProps: { data: nodes } });

  act(() => jest.advanceTimersByTime(100));
  expect(result.current.renderNodes).toHaveLength(2);
  rerender({ data: [{ id: 'c', x: 5, y: 5 }] });
  act(() => jest.advanceTimersByTime(100));
  expect(result.current.renderNodes.map(node => node.id)).toEqual(['c']);
  expect(result.current.renderLinks).toEqual([]);
  rerender({ data: [] });
  act(() => jest.advanceTimersByTime(100));
  expect(result.current.renderNodes).toEqual([]);
});
