import React from 'react';
import { Text, View } from 'react-native';
import { render } from '@testing-library/react-native';

import { Indicator } from '../Indicator';

const mockTheme = {
  backgrounds: { surface: '#FFFFFF' },
  colors: {
    success: ['#E6F4EA', '#C1EAC5', '#A3D9A5', '#7BC47F', '#57AE5B', '#3F9142', '#2F8132', '#207227'],
    surface: ['#FFFFFF', '#F5F5F5'],
  },
  shadows: {
    xs: '0px 1px 2px rgba(16, 24, 40, 0.1)',
  },
};

jest.mock('../../../core/theme/ThemeProvider', () => {
  const actual = jest.requireActual('../../../core/theme/ThemeProvider');
  return {
    ...actual,
    useTheme: () => mockTheme,
  };
});

describe('Indicator - rendering', () => {
  it('matches snapshot for default indicator with inline content', () => {
    const { toJSON } = render(
      <Indicator>
        <Text>3</Text>
      </Indicator>
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot for decorated indicator with offset and border', () => {
    const { toJSON } = render(
      <View style={{ width: 80, height: 80 }}>
        <Indicator
          size="md"
          color="#7F56D9"
          borderColor="#101828"
          borderWidth={2}
          placement="top-right"
          offset={10}
        />
      </View>
    );

    expect(toJSON()).toMatchSnapshot();
  });
});
