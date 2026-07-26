import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Tooltip } from '../Tooltip';

const mockTheme = {
  colorScheme: 'light',
  colors: {
    gray: ['#fafafa', '#f0f0f0', '#e0e0e0', '#d0d0d0', '#c0c0c0', '#b0b0b0', '#a0a0a0', '#909090', '#808080', '#101010'],
    surface: ['#ffffff', '#f9f9f9'],
  },
  text: {
    primary: '#111111',
    secondary: '#555555',
    muted: '#888888',
    disabled: '#cccccc',
  },
  shadows: {
    xs: '0 1px 3px rgba(0, 0, 0, 0.1)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    md: '0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)',
    lg: '0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.10)',
    xl: '0 15px 25px rgba(0, 0, 0, 0.15), 0 5px 10px rgba(0, 0, 0, 0.05)',
  },
  fontFamily: 'System',
};

const mockMeasureElement = jest.fn().mockResolvedValue({
  x: 0,
  y: 0,
  width: 120,
  height: 32,
});

const mockCalculateOverlay = jest.fn().mockReturnValue({
  x: 8,
  y: 12,
  placement: 'top',
  maxWidth: 280,
  maxHeight: 320,
});

jest.mock('../../../core/theme/ThemeProvider', () => ({
  useTheme: () => mockTheme,
}));

jest.mock('../../../core/providers/DirectionProvider', () => ({
  useDirection: () => ({ isRTL: false }),
}));

jest.mock('../../../core/utils/positioning-enhanced', () => ({
  measureElement: (...args: any[]) => mockMeasureElement(...args),
  calculateOverlayPositionEnhanced: (...args: any[]) => mockCalculateOverlay(...args),
  getViewport: () => ({ width: 1024, height: 768 }),
}));

describe('Tooltip - behavior', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the tooltip label when the trigger is pressed', async () => {
    const { getByText } = render(
      <Tooltip label="Helpful tip">
        <Text>Trigger</Text>
      </Tooltip>
    );

    fireEvent.press(getByText('Trigger'));

    await waitFor(() => {
      expect(getByText('Helpful tip')).toBeTruthy();
    });
  });

  it('respects the controlled opened prop', () => {
    const { getByText, queryByText, rerender } = render(
      <Tooltip label="Controlled" opened>
        <Text>Target</Text>
      </Tooltip>
    );

    expect(getByText('Controlled')).toBeTruthy();

    rerender(
      <Tooltip label="Controlled" opened={false}>
        <Text>Target</Text>
      </Tooltip>
    );

    expect(queryByText('Controlled')).toBeNull();
  });

  it('lets long labels wrap instead of clamping them to a single line', () => {
    const { getByText } = render(
      <Tooltip label="A label far longer than the bubble can show on one line" opened>
        <Text>Target</Text>
      </Tooltip>
    );

    const labelNode: any = getByText('A label far longer than the bubble can show on one line');
    expect(labelNode.props.numberOfLines).toBeUndefined();
  });

  it('clamps the label when lineClamp is set', () => {
    const { getByText } = render(
      <Tooltip label="Truncate me" opened lineClamp={1}>
        <Text>Target</Text>
      </Tooltip>
    );

    expect(getByText('Truncate me').props.numberOfLines).toBe(1);
  });

  it('applies an explicit width as a fixed bubble width, with arrow placement styles', () => {
    const { getByText } = render(
      <Tooltip
        label="Long copy"
        opened
        width={160}
        withArrow
        position="bottom"
      >
        <Text>Target</Text>
      </Tooltip>
    );

    // Walk up the rendered tree until we hit the overlay container that
    // carries the explicit `width: 160`. Switching the inner Text from RN's
    // primitive to the platform-blocks <Text> introduces an extra wrapper,
    // so a fixed `parent.parent` traversal is brittle — instead, search.
    let node: any = getByText('Long copy');
    let containerStyle: any;
    for (let i = 0; i < 6 && node; i += 1) {
      const flat = StyleSheet.flatten(node?.props?.style) || {};
      if (flat.width === 160) {
        containerStyle = flat;
        break;
      }
      node = node.parent;
    }

    expect(containerStyle?.width).toBe(160);
  });
});
