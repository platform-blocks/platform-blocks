import React from 'react';
import { act, render } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { ShimmerText } from '../ShimmerText';

const mockLinearGradientCalls: Array<Record<string, any>> = [];

jest.mock('../../../utils/optionalDependencies', () => {
  const React = require('react');
  const { View } = require('react-native');

  const MockLinearGradient = ({ children, ...props }: any) => {
    mockLinearGradientCalls.push(props);
    return React.createElement(View, { testID: 'shimmer-linear-gradient', ...props }, children);
  };

  return {
    resolveLinearGradient: () => ({
      LinearGradient: MockLinearGradient,
      hasLinearGradient: true,
    }),
  };
});

jest.mock('@react-native-masked-view/masked-view', () => {
  const React = require('react');
  const { View } = require('react-native');
  return ({ children, ...props }: any) => React.createElement(View, { testID: 'shimmer-masked-view', ...props }, children);
});

const originalPlatformOS = Platform.OS;

beforeEach(() => {
  mockLinearGradientCalls.length = 0;
});

afterEach(() => {
  (Platform as any).OS = originalPlatformOS;
});

const measure = (node: any, width: number, height: number) => {
  act(() => {
    node.props.onLayout?.({ nativeEvent: { layout: { width, height } } });
  });
};

const flattenStyle = (value: any): Record<string, any> =>
  Object.assign({}, ...[].concat(value ?? []).filter(Boolean).map((entry: any) => ({ ...entry })));

/** Flattened style of the first node in the rendered tree matching `predicate`. */
const findStyle = (
  tree: any,
  predicate: (style: Record<string, any>) => boolean,
): Record<string, any> | null => {
  if (!tree || typeof tree !== 'object') return null;
  const style = flattenStyle(tree.props?.style);
  if (predicate(style)) return style;
  for (const child of tree.children ?? []) {
    const found = findStyle(child, predicate);
    if (found) return found;
  }
  return null;
};

const findShimmerStyle = (tree: any) => findStyle(tree, (style) => Boolean(style.backgroundImage));

describe('ShimmerText - behavior', () => {
  it('renders only the base text before layout has been measured', () => {
    const { getByText, queryByTestId } = render(<ShimmerText text="Loading data" color="#333333" />);

    expect(getByText('Loading data')).toBeTruthy();
    expect(queryByTestId('shimmer-masked-view')).toBeNull();
  });

  it('creates a masked gradient overlay once layout is measured', () => {
    const { getByTestId } = render(
      <ShimmerText
        testID="shimmer"
        text="Revenue"
        colors={['#111111', '#777777', '#eeeeee']}
        direction="rtl"
      />
    );

    measure(getByTestId('shimmer'), 180, 28);

    expect(getByTestId('shimmer-masked-view')).toBeTruthy();
    expect(getByTestId('shimmer-linear-gradient')).toBeTruthy();
    expect(mockLinearGradientCalls.length).toBeGreaterThan(0);

    const latestCall = mockLinearGradientCalls[mockLinearGradientCalls.length - 1];
    expect(latestCall.colors).toEqual(['#111111', '#777777', '#eeeeee']);
    expect(latestCall.start).toEqual({ x: 1, y: 0.5 });
    expect(latestCall.end).toEqual({ x: 0, y: 0.5 });
  });

  it('sizes the native band to spread x the measured text width', () => {
    const view = render(<ShimmerText testID="shimmer" text="Revenue" spread={2.5} />);

    measure(view.getByTestId('shimmer'), 180, 28);

    // The band is the absolutely positioned layer that carries the sweep; it is
    // spread x the measured width so it clears the box at both ends of the loop.
    const band = findStyle(view.toJSON(), (style) => Array.isArray(style.transform));
    expect(band?.width).toBe(450);
  });

  it('forwards onLayout callbacks supplied via props', () => {
    const handleLayout = jest.fn();
    const { getByTestId } = render(<ShimmerText testID="shimmer" text="Docs" onLayout={handleLayout} />);

    measure(getByTestId('shimmer'), 120, 18);

    expect(handleLayout).toHaveBeenCalled();
  });
});

describe('ShimmerText - web sweep geometry', () => {
  beforeEach(() => {
    (Platform as any).OS = 'web';
  });

  /**
   * The band must never tile: `background-repeat: repeat` is what made the old
   * implementation snap sideways by a full text width on every wrap.
   */
  it('never tiles the highlight band', () => {
    const view = render(<ShimmerText testID="shimmer" text="Live preview" />);
    measure(view.getByTestId('shimmer'), 200, 24);

    const style = findShimmerStyle(view.toJSON());
    expect(style?.backgroundRepeat).toBe('no-repeat');
  });

  /**
   * `background-size` and `--pb-shimmer-band` have to agree, because the
   * keyframes derive both sweep endpoints from the custom property. If they
   * drift apart the band stops parking fully off-box and the seam returns.
   */
  it('keeps background-size and the sweep variable in agreement', () => {
    const view = render(<ShimmerText testID="shimmer" text="Live preview" spread={2.5} />);
    measure(view.getByTestId('shimmer'), 200, 24);

    const style = findShimmerStyle(view.toJSON());
    expect(style?.backgroundSize).toBe('500px 100%');
    expect(style?.['--pb-shimmer-band']).toBe('500px');
  });

  it('runs one uninterrupted CSS animation per cycle', () => {
    const view = render(
      <ShimmerText testID="shimmer" text="Live preview" duration={2} repeatDelay={0.5} />
    );
    measure(view.getByTestId('shimmer'), 200, 24);

    const style = findShimmerStyle(view.toJSON());
    // repeatDelay is folded into the cycle as a hold, not a separate timer.
    expect(style?.animationName).toBe('pb-shimmer-sweep-hold-20');
    expect(style?.animationDuration).toBe('2500ms');
    expect(style?.animationIterationCount).toBe('infinite');
    expect(style?.animationDirection).toBe('normal');
  });

  it('keeps a fractional hold rather than rounding the sweep short', () => {
    const view = render(
      <ShimmerText testID="shimmer" text="Live preview" duration={1.8} repeatDelay={0.5} />
    );
    measure(view.getByTestId('shimmer'), 200, 24);

    // 0.5s of a 2.3s cycle is 21.739...%, so whole-percent rounding would cost
    // the sweep several milliseconds every cycle.
    const style = findShimmerStyle(view.toJSON());
    expect(style?.animationName).toBe('pb-shimmer-sweep-hold-21-7');
    expect(style?.animationDuration).toBe('2300ms');
  });

  it('plays the same keyframes in reverse for rtl', () => {
    const view = render(<ShimmerText testID="shimmer" text="Live preview" direction="rtl" />);
    measure(view.getByTestId('shimmer'), 200, 24);

    const style = findShimmerStyle(view.toJSON());
    expect(style?.animationName).toBe('pb-shimmer-sweep');
    expect(style?.animationDirection).toBe('reverse');
  });

  it('stops after a single pass when once is set', () => {
    const view = render(<ShimmerText testID="shimmer" text="Live preview" once />);
    measure(view.getByTestId('shimmer'), 200, 24);

    const style = findShimmerStyle(view.toJSON());
    expect(style?.animationIterationCount).toBe('1');
    expect(style?.animationFillMode).toBe('both');
  });

  it('leaves the text unanimated when animation is disabled', () => {
    const view = render(<ShimmerText testID="shimmer" text="Live preview" repeat={false} />);
    measure(view.getByTestId('shimmer'), 200, 24);

    const style = findShimmerStyle(view.toJSON());
    expect(style?.animationName).toBeUndefined();
    expect(style?.backgroundColor).toBe('#999999');
  });
});
