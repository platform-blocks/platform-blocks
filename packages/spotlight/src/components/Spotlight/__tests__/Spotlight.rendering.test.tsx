import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { Spotlight } from '../Spotlight';
import { SpotlightProvider, spotlight } from '../SpotlightStore';
import type { SpotlightItem } from '../SpotlightTypes';


jest.mock('@plocks/ui', () => {
  const React = require('react');
  const { Text, View } = require('react-native');
  const actual = jest.requireActual('@plocks/ui');
  return {
    ...actual,
    useTheme: () => actual.DEFAULT_THEME,
    useKeyboardManagerOptional: () => null,
    useGlobalHotkeys: jest.fn(),
    useHotkeys: jest.fn(),
    useEscapeKey: jest.fn(),
    // `autoFocus` carries the search field's ref (not serialisable).
    Dialog: ({ children, autoFocus: _autoFocus, opened, ...props }: any) => (
      opened ? <View role="dialog" {...props}>{children}</View> : null
    ),
    Block: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    Icon: ({ children, ...props }: any) => <View accessibilityRole="image" {...props}>{children}</View>,
    Text: ({ children, ...props }: any) => <Text {...props}>{children}</Text>,
    Highlight: ({ children, style }: any) => <Text style={style}>{children}</Text>,
  };
});

const ensureWindow = () => {
  if (typeof window === 'undefined') {
    (global as any).window = {};
  }

  if (!window.addEventListener) {
    window.addEventListener = jest.fn();
  }

  if (!window.removeEventListener) {
    window.removeEventListener = jest.fn();
  }
};

ensureWindow();

if (typeof global.requestAnimationFrame === 'undefined') {
  (global as any).requestAnimationFrame = (cb: (...args: any[]) => void) => setTimeout(cb, 0);
}

const renderSpotlight = (props: { actions: SpotlightItem[] } & Partial<React.ComponentProps<typeof Spotlight>>) => (
  render(
    <SpotlightProvider>
      <Spotlight {...props} />
    </SpotlightProvider>
  )
);

afterEach(() => {
  act(() => {
    spotlight.close();
  });
});

describe('Spotlight - rendering', () => {
  it('matches snapshot for grouped actions in a modal layout', async () => {
    const actions: SpotlightItem[] = [
      {
        group: 'Navigation',
        actions: [
          { id: 'home', label: 'Go Home' },
          { id: 'reports', label: 'View Reports' },
        ],
      },
      { id: 'users', label: 'Manage Users' },
    ];

    const { toJSON } = renderSpotlight({ actions });

    act(() => {
      spotlight.open();
    });

    await waitFor(() => expect(toJSON()).toBeTruthy());
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot for the empty state when no actions are provided', async () => {
    const { toJSON } = renderSpotlight({
      actions: [],
      nothingFound: 'Try another keyword',
    });

    act(() => {
      spotlight.open();
    });

    await waitFor(() => expect(toJSON()).toBeTruthy());
    expect(toJSON()).toMatchSnapshot();
  });
});
