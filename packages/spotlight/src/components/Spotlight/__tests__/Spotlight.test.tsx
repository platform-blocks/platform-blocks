import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Spotlight } from '../Spotlight';
import { SpotlightProvider, spotlight } from '../SpotlightStore';
import type { SpotlightActionData, SpotlightItem } from '../SpotlightTypes';


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

describe('Spotlight - behavior', () => {
  it('filters actions by query and executes the selected action on Enter', async () => {
    const actionSpy = jest.fn();
    const actions: SpotlightActionData[] = [
      { id: 'docs', label: 'View Docs' },
      { id: 'settings', label: 'Open Settings', description: 'Navigate to app settings', onPress: actionSpy },
    ];

    const { getByPlaceholderText, getByText } = renderSpotlight({
      actions,
      nothingFound: 'No results',
    });

    act(() => {
      spotlight.open();
    });

    const searchInput = getByPlaceholderText('Search');
    fireEvent.changeText(searchInput, 'settings');

    expect(getByText('Open Settings')).toBeTruthy();

    fireEvent(searchInput, 'onKeyPress', {
      nativeEvent: { key: 'Enter' },
      preventDefault: jest.fn(),
    });

    expect(actionSpy).toHaveBeenCalledTimes(1);
  });

  it('honors the limit prop by flattening actions and omitting group headers', () => {
    const groupedActions: SpotlightItem[] = [
      {
        group: 'Guides',
        actions: [
          { id: 'intro', label: 'Getting Started' },
          { id: 'theme', label: 'Theme Overview' },
        ],
      },
      { id: 'cta', label: 'Jump to CTA' },
    ];

    const { getByText, queryByText } = renderSpotlight({ actions: groupedActions, limit: 2 });

    act(() => {
      spotlight.open();
    });

    expect(getByText('Getting Started')).toBeTruthy();
    expect(getByText('Theme Overview')).toBeTruthy();
    expect(queryByText('Guides')).toBeNull();
    expect(queryByText('Jump to CTA')).toBeNull();
  });
});
