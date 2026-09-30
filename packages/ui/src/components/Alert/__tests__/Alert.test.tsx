import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { Alert } from '../Alert';
import { announce } from '../../../core/accessibility/announce';

jest.mock('../../../core/accessibility/announce', () => ({ announce: jest.fn() }));

const mockIconSpy = jest.fn();

jest.mock('../../../core/theme/ThemeProvider', () => ({
  useTheme: () => ({
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
  }),
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

describe('Alert', () => {
  beforeEach(() => {
    mockIconSpy.mockClear();
  });

  it('calls onClose when close button is pressed', () => {
    const handleClose = jest.fn();
    const { getByLabelText } = render(
      <Alert title="Heads up" withCloseButton onClose={handleClose} />
    );

    fireEvent.press(getByLabelText('Close'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('gives the close button a button role and a 44pt native target', () => {
    const { getByLabelText } = render(<Alert title="Heads up" withCloseButton />);
    const close = getByLabelText('Close');
    expect(close.props.role).toBe('button');
    const style = require('react-native').StyleSheet.flatten(close.props.style);
    expect(style.minWidth).toBeGreaterThanOrEqual(44);
    expect(style.minHeight).toBeGreaterThanOrEqual(44);
  });

  it('is an urgent alert for error/warning, a polite status otherwise', () => {
    const { getByTestId, rerender } = render(<Alert severity="error" title="Failed" testID="a" />);
    expect(getByTestId('a').props.role).toBe('alert');

    rerender(<Alert color="warning" title="Careful" testID="a" />);
    expect(getByTestId('a').props.role).toBe('alert');

    rerender(<Alert severity="success" title="Saved" testID="a" />);
    expect(getByTestId('a').props.role).toBe('status');

    rerender(<Alert title="Note" testID="a" />);
    expect(getByTestId('a').props.role).toBe('status');
    expect(getByTestId('a').props.accessibilityRole).toBeUndefined();
  });

  it('announces urgent alerts on native when they appear', () => {
    const mockAnnounce = announce as jest.Mock;
    mockAnnounce.mockClear();
    render(<Alert severity="error" title="Payment failed">Card declined</Alert>);
    expect(mockAnnounce).toHaveBeenCalledWith('Payment failed. Card declined', { politeness: 'assertive' });

    mockAnnounce.mockClear();
    render(<Alert severity="info" title="FYI" />);
    expect(mockAnnounce).not.toHaveBeenCalled();
  });

  it('applies custom accessibility label for close button', () => {
    const { getByLabelText } = render(
      <Alert title="Heads up" withCloseButton closeButtonLabel="Dismiss message" />
    );

    expect(getByLabelText('Dismiss message')).toBeTruthy();
  });

  it('renders severity icon when severity is provided', () => {
    render(<Alert severity="success" title="Saved" />);

    expect(mockIconSpy).toHaveBeenCalledWith(expect.objectContaining({ name: 'success' }));
  });

  it('honors icon={false} and renders no leading icon', () => {
    render(<Alert icon={false} title="Plain" />);

    const leadingIconCalls = mockIconSpy.mock.calls.filter(call => call[0].name !== 'x');
    expect(leadingIconCalls.length).toBe(0);
  });

  it('supports string icon overrides', () => {
    render(<Alert icon="alert-circle" title="Custom" />);

    expect(mockIconSpy).toHaveBeenCalledWith(expect.objectContaining({ name: 'alert-circle' }));
  });
});
