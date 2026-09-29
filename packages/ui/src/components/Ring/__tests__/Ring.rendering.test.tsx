import React from 'react';
import { Text as RNText } from 'react-native';
import { render } from '@testing-library/react-native';

import { Ring } from '../Ring';

jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');

  const Svg = ({ children }: any) => React.createElement(View, null, children);
  const Circle = ({ children }: any) => React.createElement(View, null, children);

  return {
    __esModule: true,
    default: Svg,
    Circle,
  };
});

const mockTheme = {
  colorScheme: 'light',
  colors: {
    primary: { 5: '#2563eb' },
    gray: { 4: '#cbd5f5', 5: '#94a3b8' },
  },
  text: {
    secondary: '#475569',
    muted: '#94a3b8',
  },
  backgrounds: {
    border: '#e2e8f0',
  },
};

jest.mock('../../../core/theme/ThemeProvider', () => ({
  useTheme: () => mockTheme,
}));

describe('Ring - rendering', () => {
  it('matches snapshot for a labeled performance ring', () => {
    const tree = render(
      <Ring
        value={72}
        label="New customers"
        subLabel="Goal 80%"
        caption="Weekly KPI"
        size={160}
        thickness={18}
        colorStops={[
          { value: 0, color: '#38bdf8' },
          { value: 70, color: '#22c55e' },
        ]}
      />
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot for a compact neutral ring with custom center content', () => {
    const tree = render(
      <Ring value={35} min={0} max={60} neutral showValue={false} size={96} thickness={12}>
        {({ value }) => <RNText>{value} files</RNText>}
      </Ring>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });
});
