import React from 'react';
import { render } from '@testing-library/react-native';

import { Overlay } from '../Overlay';

const mockTheme = {
  colors: {
    primary: ['#000000', '#111111', '#222222', '#333333', '#444444', '#555555', '#666666', '#777777'],
  },
  backgrounds: {
    dim: '#123456',
  },
  text: {
    primary: '#000000',
  },
};

jest.mock('../../../core/theme/ThemeProvider', () => ({
  useTheme: () => mockTheme,
}));

describe('Overlay - rendering snapshots', () => {
  it('renders centered overlay with children', () => {
    const tree = render(
      <Overlay center testID="overlay">
        <Overlay>
          <></>
        </Overlay>
      </Overlay>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('renders a gradient + blur overlay (native: color fallback)', () => {
    {
      const tree = render(
        <Overlay
          gradient="linear-gradient(180deg, rgba(0,0,0,0.5), rgba(0,0,0,0.9))"
          blur="16"
          fixed
          zIndex={20}
        >
          <Overlay radius={12} />
        </Overlay>
      ).toJSON();

      expect(tree).toMatchSnapshot();
    }
  });
});
