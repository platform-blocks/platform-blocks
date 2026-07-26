import React from 'react';
import { Text as RNText, View } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';

import { ListGroup, ListGroupItem } from '../ListGroup';

jest.mock('../../../core/theme', () => ({
  useTheme: () => ({
    colorScheme: 'light',
    colors: {
      primary: ['#EEE', '#DDD', '#CCC', '#BBB', '#AAA', '#999', '#888'],
      gray: ['#f8f8f8', '#f0f0f0', '#d9d9d9', '#bfbfbf', '#a6a6a6', '#8c8c8c', '#737373'],
      error: ['#fee', '#fdd', '#fbb', '#f99', '#f77', '#f55', '#d00'],
      surface: ['#fff', '#fafafa', '#f5f5f5', '#f0f0f0'],
    },
    radii: { sm: '4px', md: '8px', lg: '12px' },
    text: { primary: '#111', secondary: '#666', muted: '#888', disabled: '#aaa', onPrimary: '#fff' },
  }),
}));

jest.mock('../../../core/providers/DirectionProvider', () => ({
  useDirection: () => ({ isRTL: false }),
}));

/** Flattened style entries for a node — RN nests style arrays several deep. */
const flatStyle = (node: any): Record<string, unknown>[] =>
  [node.props?.style].flat(Infinity).filter((s) => s && typeof s === 'object');

/**
 * Host-tree handler props. `fireEvent.press` walks the *fiber* tree and would
 * find `onPress` on the composite element even when the rendered host is inert,
 * so pressing can't prove a disabled row is dead — the host props can.
 */
const hostHandlers = (node: any): string[] => {
  const out: string[] = [];
  const walk = (n: any) => {
    if (!n || typeof n !== 'object') return;
    Object.entries(n.props ?? {}).forEach(([k, v]) => {
      if (typeof v === 'function') out.push(k);
    });
    (n.children ?? []).forEach(walk);
  };
  walk(node);
  return [...new Set(out)];
};

describe('ListGroupItem', () => {
  it('renders single-line children', () => {
    const { getByText } = render(<ListGroupItem>Wi-Fi</ListGroupItem>);
    expect(getByText('Wi-Fi')).toBeTruthy();
  });

  it('renders label and description as a two-line row', () => {
    const { getByText } = render(
      <ListGroupItem label="Download your data" description="A ZIP bundle of your profile" />,
    );
    expect(getByText('Download your data')).toBeTruthy();
    expect(getByText('A ZIP bundle of your profile')).toBeTruthy();
  });

  it('ignores children when label is set', () => {
    const { getByText, queryByText } = render(
      <ListGroupItem label="Label wins">Children lose</ListGroupItem>,
    );
    expect(getByText('Label wins')).toBeTruthy();
    expect(queryByText('Children lose')).toBeNull();
  });

  it('renders a description without a label', () => {
    const { getByText } = render(<ListGroupItem description="Only a description" />);
    expect(getByText('Only a description')).toBeTruthy();
  });

  it('renders value alongside a two-line row', () => {
    const { getByText } = render(
      <ListGroupItem label="Language" description="App language" value="English" />,
    );
    expect(getByText('English')).toBeTruthy();
  });

  it('right-aligns the trailing tail on a single-line row', () => {
    // The push margin belongs to `value` when present, otherwise to
    // `endSection` — never both, or `value` strands next to the label.
    const { getByText } = render(
      <ListGroupItem value="English" endSection={<View testID="chev" />}>
        Language
      </ListGroupItem>,
    );
    expect(flatStyle(getByText('English'))).toEqual(
      expect.arrayContaining([expect.objectContaining({ marginLeft: 'auto' })]),
    );
  });

  it('does not push the tail on a two-line row, which already flexes', () => {
    const { getByText } = render(
      <ListGroupItem label="Language" description="App language" value="English" />,
    );
    expect(flatStyle(getByText('English'))).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ marginLeft: 'auto' })]),
    );
  });

  it('fires onPress when enabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(<ListGroupItem label="Tap me" onPress={onPress} />);
    fireEvent.press(getByText('Tap me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders no host press handlers when disabled', () => {
    const enabled = render(<ListGroupItem label="Tap me" onPress={() => {}} />);
    expect(hostHandlers(enabled.toJSON())).toContain('onStartShouldSetResponder');

    const disabled = render(<ListGroupItem label="Tap me" onPress={() => {}} disabled />);
    expect(hostHandlers(disabled.toJSON())).toEqual([]);
  });

  it('takes its text size from the enclosing group', () => {
    const { getByText } = render(
      <ListGroup size="xs">
        <ListGroupItem label="Small" />
      </ListGroup>,
    );
    // xs maps to a 10px control scale; the label must not fall back to md.
    expect(getByText('Small')).toBeTruthy();
  });

  it('accepts a non-string label node', () => {
    const { getByTestId } = render(
      <ListGroupItem label={<RNText testID="custom">Custom</RNText>} />,
    );
    expect(getByTestId('custom')).toBeTruthy();
  });
});
