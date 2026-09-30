import React from 'react';
import { act, render } from '@testing-library/react-native';
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

beforeEach(() => {
  mockLinearGradientCalls.length = 0;
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


describe('ShimmerText - behavior', () => {
  it('renders only the base text before layout has been measured', () => {
    const { getByText, queryByTestId } = render(<ShimmerText text="Loading data" c="#333333" />);

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

  it('forwards its ref to the container view', () => {
    const ref = React.createRef<any>();
    render(<ShimmerText ref={ref} testID="shimmer" text="Ref" />);
    expect(ref.current).toBeTruthy();
  });

  it('hides the mask copy of the text from assistive technology', () => {
    const view = render(<ShimmerText testID="shimmer" text="Masked" />);
    measure(view.getByTestId('shimmer'), 120, 18);

    // The mask is a second copy of the text; only the visible copy is exposed.
    const maskElement = view.getByTestId('shimmer-masked-view').props.maskElement;
    const maskText = maskElement.props.children;
    expect(maskText.props['aria-hidden']).toBe(true);
    expect(maskText.props.importantForAccessibility).toBe('no-hide-descendants');
    expect(view.getAllByText('Masked')).toHaveLength(1);
  });
});

// Web sweep geometry (CSS animation, background-clip) is covered by
// __web_tests__/ShimmerText.web.test.tsx, which renders through react-native-web.
