import React from 'react';
import { View } from 'react-native';
import { render } from '@testing-library/react-native';
import { Skeleton } from '../Skeleton';

const mockTheme = {
  colors: {
    gray: ['#f5f5f5', '#e0e0e0', '#cccccc'],
  },
  backgrounds: {
    border: '#e0e0e0',
    borderStrong: '#cccccc',
  },
};

jest.mock('../../../core/theme/ThemeProvider', () => ({
  useTheme: () => mockTheme,
}));

describe('Skeleton - rendering', () => {
  it('matches snapshot for stacked text placeholders', () => {
    const tree = render(
      <View>
        <Skeleton shape="text" size="sm" mt="sm" />
        <Skeleton shape="text" size="sm" w="90%" mt="xs" />
        <Skeleton shape="text" size="sm" w="70%" mt="xs" />
      </View>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot for avatar and chip placeholders', () => {
    const tree = render(
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Skeleton shape="avatar" size="lg" />
        <Skeleton shape="chip" size="md" w={140} />
        <Skeleton shape="button" size="sm" w={110} />
      </View>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });
});
