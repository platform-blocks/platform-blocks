import React from 'react';
import { render } from '@testing-library/react-native';
import { BrandIcon } from '../BrandIcon';

const pathCalls: Array<Record<string, any>> = [];
const stopCalls: Array<Record<string, any>> = [];
const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

jest.mock('../brands', () => ({
  brandIcons: {
    google: {
      content: [
        { d: 'M1 1', fill: '#111111' },
        { d: 'M2 2', fill: '#222222' },
      ],
      viewBox: '0 0 24 24',
    },
    facebook: {
      full: [{ d: 'M0 0', fill: '#123456' }],
      mono: [{ d: 'M0 1', fill: '#654321', allowOverride: true }],
      viewBox: '0 0 24 24',
    },
    'galaxy-store': {
      defs: {
        linearGradients: [
          {
            id: 'galaxy',
            stops: [
              { offset: '0%', stopColor: '#000000' },
              { offset: '100%', stopColor: '#000000' },
            ],
          },
        ],
      },
      content: [{ d: 'M5 5', fill: 'url(#galaxy)' }],
      viewBox: '0 0 24 24',
    },
    apple: {
      content: [{ d: 'M4 4', fill: '#000000' }],
      viewBox: '0 0 24 24',
      supportsDarkMode: true,
    },
  },
}));

jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    __esModule: true,
    default: ({ children, ...props }: any) => React.createElement(View, props, children),
    Path: ({ children, ...props }: any) => {
      pathCalls.push(props);
      return React.createElement(View, null, children);
    },
    Circle: ({ children, ...props }: any) => React.createElement(View, null, children),
    Defs: ({ children }: any) => React.createElement(View, null, children),
    LinearGradient: ({ children, ...props }: any) => React.createElement(View, props, children),
    Stop: ({ children, ...props }: any) => {
      stopCalls.push(props);
      return React.createElement(View, null, children);
    },
  };
});

let mockColorScheme: 'light' | 'dark' = 'light';

jest.mock('../../../core/theme/ThemeProvider', () => ({
  useTheme: () => ({
    colorScheme: mockColorScheme,
  }),
}));

describe('BrandIcon', () => {
  beforeEach(() => {
    pathCalls.length = 0;
    stopCalls.length = 0;
    warnSpy.mockClear();
    mockColorScheme = 'light';
  });

  afterAll(() => {
    warnSpy.mockRestore();
  });

  it('overrides multi-shape icon colors when falling back to mono variant', () => {
    render(<BrandIcon brand="google" color="#ff00ff" />);

    expect(pathCalls).toHaveLength(2);
    expect(pathCalls.every((call) => call.fill === '#ff00ff')).toBe(true);
  });

  it('keeps original colors when explicitly requesting the full variant', () => {
    render(<BrandIcon brand="facebook" variant="full" color="#00ff00" />);

    expect(pathCalls[0].fill).toBe('#123456');
  });

  it('uses mono variant when color override is present and variant not provided', () => {
    render(<BrandIcon brand="facebook" color="#00ff00" />);

    expect(pathCalls).toHaveLength(1);
    expect(pathCalls[0].fill).toBe('#00ff00');
  });

  it('inverts supported brand colors in dark mode automatically', () => {
    render(<BrandIcon brand="apple" colorScheme="dark" />);

    expect(pathCalls[0].fill).toBe('#ffffff');
  });

  it('transforms gradient stops when invertInDarkMode is enabled for dark scheme', () => {
    render(<BrandIcon brand="galaxy-store" invertInDarkMode colorScheme="dark" />);

    expect(stopCalls).not.toHaveLength(0);
    expect(stopCalls.every((call) => call.stopColor === '#ffffff')).toBe(true);
  });

  it('returns null and warns when brand does not exist', () => {
    const { toJSON } = render(<BrandIcon brand={'missing' as any} />);
    expect(toJSON()).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith('Brand icon "missing" not found in registry');
  });

  it('assigns an accessibility label when not decorative', () => {
    const { getByLabelText } = render(<BrandIcon brand="google" />);
    expect(getByLabelText('google logo')).toBeTruthy();
  });
});
