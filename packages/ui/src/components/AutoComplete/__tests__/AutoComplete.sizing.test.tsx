import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { OverlayProvider } from '../../../core/providers/OverlayProvider';
import { getFontSize } from '../../../core/theme/sizes';
import { AutoComplete } from '../AutoComplete';

const data = [
  { label: 'Apple', value: 'apple' },
  { label: 'Apricot', value: 'apricot' },
];

/**
 * Suggestion rows used to render at a hardcoded `sm`, so a large AutoComplete
 * opened a popover of small text. The label is a `Highlight` rather than the
 * menu item's own `<Text>`, so it needs the size handed to it explicitly.
 */
const openSuggestions = (size: 'sm' | 'md' | 'lg') => {
  const utils = render(
    <OverlayProvider>
      <AutoComplete
        data={data}
        size={size}
        showSuggestionsOnFocus
        useModal={false}
        usePortal={false}
        testID="ac-input"
      />
    </OverlayProvider>
  );
  // Focus with an empty query opens the full list synchronously; typing would
  // route through the debounced search instead.
  fireEvent(utils.getByTestId('ac-input'), 'focus');
  return utils;
};

const fontSizeOf = (node: any): number | undefined => {
  const flat = (Array.isArray(node.props.style) ? node.props.style.flat(4) : [node.props.style])
    .filter(Boolean);
  const entry = flat.find((s: any) => typeof s === 'object' && s.fontSize);
  return entry?.fontSize;
};

describe('AutoComplete suggestion sizing', () => {
  it.each(['sm', 'md', 'lg'] as const)('renders %s suggestions at the field font size', (size) => {
    const { getByText } = openSuggestions(size);
    expect(fontSizeOf(getByText('Apple'))).toBe(getFontSize(size));
  });

  it('scales suggestions with the field rather than pinning them', () => {
    const small = fontSizeOf(openSuggestions('sm').getByText('Apple'));
    const large = fontSizeOf(openSuggestions('lg').getByText('Apple'));
    expect(large).toBeGreaterThan(small!);
  });
});
