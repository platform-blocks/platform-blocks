import React from 'react';
import { render } from '@testing-library/react-native';
import { ShimmerText } from '../ShimmerText';

jest.mock('../../../utils/optionalDependencies', () => {
  const React = require('react');
  const { View } = require('react-native');

  const MockLinearGradient = ({ children, ...props }: any) => (
    React.createElement(View, { testID: 'shimmer-linear-gradient', ...props }, children)
  );

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

describe('ShimmerText - rendering', () => {
  it('matches snapshot for the initial native render before layout is measured', () => {
    const tree = render(
      <ShimmerText text="Loading" c="#444444" repeat={false} />
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  // Web snapshots live in __web_tests__/ShimmerText.web.test.tsx.
});
