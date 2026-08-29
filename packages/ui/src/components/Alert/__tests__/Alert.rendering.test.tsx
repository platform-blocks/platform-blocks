import React from 'react';
import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { Alert } from '../Alert';

const mockIconSpy = jest.fn();

const getStyle = (node: any) => StyleSheet.flatten(node.props.style) || {};

const mockTheme = {
  colors: {
    primary: ['#E6F4FF', '#CDE8FF', '#9CD3FF', '#6BBEFF', '#3AA9FF', '#1890FF', '#096DD9', '#0050B3'],
    secondary: ['#f5f5f5', '#e5e5e5', '#d4d4d4', '#b4b4b4', '#949494', '#757575', '#5c5c5c', '#404040'],
    success: ['#F0FFF4', '#C6F6D5', '#9AE6B4', '#68D391', '#48BB78', '#38A169', '#2F855A', '#276749'],
    warning: ['#FFFBEB', '#FEF3C7', '#FDE68A', '#FCD34D', '#FBBF24', '#F59E0B', '#D97706', '#B45309'],
    error: ['#FEF2F2', '#FEE2E2', '#FECACA', '#FCA5A5', '#F87171', '#EF4444', '#DC2626', '#B91C1C'],
    gray: ['#F9FAFB', '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF', '#6B7280', '#4B5563', '#374151'],
  },
  text: {
    primary: '#111',
    secondary: '#666',
    muted: '#999',
    disabled: '#aaa',
    onPrimary: '#fff',
  },
  fontFamily: 'System',
};

jest.mock('../../../core/theme/ThemeProvider', () => ({
  useTheme: () => mockTheme,
}));

jest.mock('../../Icon', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Icon: (props: { name: string; color?: string }) => {
      mockIconSpy(props);
      return React.createElement(Text, { testID: `icon-${props.name}` }, props.name);
    },
  };
});

describe('Alert - rendering', () => {
  beforeEach(() => {
    mockIconSpy.mockClear();
  });

  it('renders title and message content', () => {
    const { getByText } = render(<Alert title="Server down">Try again later</Alert>);

    expect(getByText('Server down')).toBeTruthy();
    expect(getByText('Try again later')).toBeTruthy();
  });

  it('applies light variant severity colors', () => {
    const { getByTestId } = render(
      <Alert severity="warning" title="Check" testID="alert-warning" />
    );

    // Colors come from the shared variant system (alpha tint composited over the
    // surface), so `light` fills/borders are translucent rgba of the color's [5] shade.
    expect(getStyle(getByTestId('alert-warning'))).toMatchObject({
      backgroundColor: 'rgba(245, 158, 11, 0.14)',
      borderColor: 'rgba(245, 158, 11, 0.3)',
    });
  });

  it('uses filled variant contrast for severity alerts', () => {
    const { getByText } = render(
      <Alert severity="error" variant="filled" title="Failed" />
    );

    // Filled uses measured contrast against the strong fill → readable white.
    expect(getStyle(getByText('Failed'))).toMatchObject({ color: '#FFFFFF' });
    expect(mockIconSpy).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'error', color: '#FFFFFF' })
    );
  });

  it('keeps outline variant transparent with custom colors', () => {
    const { getByTestId, getByText } = render(
      <Alert variant="outline" color="#336699" title="Note" testID="outline-alert" />
    );

    expect(getStyle(getByTestId('outline-alert'))).toMatchObject({
      backgroundColor: 'transparent',
      borderColor: '#336699',
    });
    expect(getStyle(getByText('Note'))).toMatchObject({ color: '#336699' });
  });

  it('uses a legible tinted text and icon for subtle variant', () => {
    const { getByText } = render(
      <Alert variant="subtle" severity="info" title="Heads up" />
    );

    // Text and icon share the measured-contrast color for the variant (info → primary[6]).
    expect(getStyle(getByText('Heads up'))).toMatchObject({ color: '#096DD9' });
    expect(mockIconSpy).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'info', color: '#096DD9' })
    );
  });

  it('stretches to full width when requested', () => {
    const { getByTestId } = render(
      <Alert fullWidth title="Edge case" testID="full-width-alert" />
    );

    expect(getStyle(getByTestId('full-width-alert'))).toMatchObject({ width: '100%' });
  });

  it('applies radius tokens to its container', () => {
    const { getByTestId } = render(
      <Alert radius="lg" title="Rounded" testID="rounded-alert" />
    );

    expect(getStyle(getByTestId('rounded-alert'))).toMatchObject({ borderRadius: 8 });
  });

  it('applies translucent fills for custom light variant colors', () => {
    const { getByTestId } = render(
      <Alert color="#336699" title="Custom" testID="custom-color-alert" />
    );

    // Custom colors flow through the same alpha-tint path → translucent rgba.
    expect(getStyle(getByTestId('custom-color-alert'))).toMatchObject({
      backgroundColor: 'rgba(51, 102, 153, 0.14)',
      borderColor: 'rgba(51, 102, 153, 0.3)',
    });
  });

  it('forwards titleProps.style and weight to the title Text', () => {
    const { getByText } = render(
      <Alert
        title="Slot test"
        titleProps={{ weight: '700', style: { letterSpacing: 2 } }}
      >
        body
      </Alert>
    );

    const titleStyle = getStyle(getByText('Slot test'));
    expect(titleStyle).toMatchObject({ fontWeight: '700', letterSpacing: 2 });
  });

  it('forwards bodyProps to the body Text', () => {
    const { getByText } = render(
      <Alert title="t" bodyProps={{ size: 'xs', style: { fontStyle: 'italic' } }}>
        body content
      </Alert>
    );

    expect(getStyle(getByText('body content'))).toMatchObject({
      fontSize: 10, // size 'xs' resolves to 10
      fontStyle: 'italic',
    });
  });
});
