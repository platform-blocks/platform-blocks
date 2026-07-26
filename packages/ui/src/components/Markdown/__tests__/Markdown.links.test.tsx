import React from 'react';
import { render } from '@testing-library/react-native';

const mockTheme = {
  colorScheme: 'light',
  primaryColor: 'primary',
  colors: {
    primary: ['#E6F4FF', '#CDE8FF', '#9CD3FF', '#6BBEFF', '#3AA9FF', '#1890FF', '#096DD9', '#0050B3'],
    secondary: ['#f5f5f5', '#e5e5e5', '#d4d4d4', '#b4b4b4', '#949494', '#757575', '#5c5c5c', '#404040'],
    gray: ['#F9FAFB', '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF', '#6B7280', '#4B5563', '#374151'],
  },
  text: { primary: '#111', secondary: '#666', muted: '#999', disabled: '#aaa', link: '#096DD9' },
  backgrounds: { base: '#fff', surface: '#fafafa', border: '#e5e5e5', subtle: '#f5f5f5' },
  fontFamily: 'System',
};

jest.mock('../../../core/theme/ThemeProvider', () => ({
  useTheme: () => mockTheme,
}));

jest.mock('../../CodeBlock', () => ({
  CodeBlock: ({ children }: { children: string }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, null, children);
  },
}));

import { Markdown } from '../Markdown';

describe('Markdown inline links', () => {
  it('keeps a link inline instead of wrapping it in a view', () => {
    const { UNSAFE_root } = render(
      <Markdown>{'See [TimePicker](/components/TimePicker) for the time variant.'}</Markdown>
    );

    // The paragraph renders one View (the Markdown root). A link that renders a
    // Pressable/View adds another, and that block-level box is what forced a
    // line break around every link.
    const views = UNSAFE_root.findAllByType('View' as any);
    expect(views.length).toBeLessThanOrEqual(1);
  });

  it('calls onLinkPress with the href when a link is pressed', () => {
    const onLinkPress = jest.fn();
    const { getByText } = render(
      <Markdown onLinkPress={onLinkPress}>
        {'See [TimePicker](/components/TimePicker) for the time variant.'}
      </Markdown>
    );

    getByText('TimePicker').props.onPress();
    expect(onLinkPress).toHaveBeenCalledWith('/components/TimePicker');
  });

  it('renders the surrounding paragraph text alongside the link', () => {
    const { getByText } = render(
      <Markdown>{'See [TimePicker](/components/TimePicker) for the time variant.'}</Markdown>
    );

    expect(getByText('TimePicker')).toBeTruthy();
    expect(getByText(/See/)).toBeTruthy();
  });
});
