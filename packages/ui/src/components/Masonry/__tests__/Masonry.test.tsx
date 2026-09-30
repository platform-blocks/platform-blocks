import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { render } from '@testing-library/react-native';

import { Masonry } from '../Masonry';
import type { MasonryItem } from '../types';

// @shopify/flash-list is an optional peer that isn't installed here, so these
// cover the non-virtualized column fallback.

const items: MasonryItem[] = Array.from({ length: 5 }, (_, i) => ({
  id: `item-${i}`,
  content: <Text>{`Item ${i}`}</Text>,
  style: [{ opacity: 0.9 }, { borderWidth: 1 }],
}));

describe('Masonry', () => {
  // The missing optional peer logs a one-time dev warning.
  let warn: jest.SpyInstance;
  beforeAll(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterAll(() => warn.mockRestore());

  it('lays items out round-robin across the columns', () => {
    const { getByText } = render(<Masonry data={items} numColumns={2} />);
    for (let i = 0; i < items.length; i += 1) {
      expect(getByText(`Item ${i}`)).toBeTruthy();
    }
  });

  it('merges array item styles with the gap padding', () => {
    const { getByText } = render(<Masonry data={items} gap={8} />);
    const itemView = getByText('Item 0').parent?.parent;
    const flat = StyleSheet.flatten(itemView?.props.style);
    expect(flat.padding).toBe(4);
    expect(flat.opacity).toBe(0.9);
    expect(flat.borderWidth).toBe(1);
  });

  it('puts ref, testID, spacing and style on the root', () => {
    const ref = React.createRef<View>();
    const { getByTestId } = render(
      <Masonry ref={ref} data={items} testID="masonry" mt={10} style={{ opacity: 0.5 }} />
    );
    expect(ref.current).not.toBeNull();
    const flat = StyleSheet.flatten(getByTestId('masonry').props.style);
    expect(flat.marginTop).toBe(10);
    expect(flat.opacity).toBe(0.5);
  });

  it('renders the empty state and custom empty content', () => {
    const { getByText, rerender } = render(<Masonry data={[]} />);
    expect(getByText('No items to display')).toBeTruthy();
    rerender(<Masonry data={[]} emptyContent={<Text>Nothing yet</Text>} />);
    expect(getByText('Nothing yet')).toBeTruthy();
  });

  it('marks the loading state busy', () => {
    const { getByTestId } = render(<Masonry data={items} loading testID="masonry" />);
    expect(getByTestId('masonry').props['aria-busy']).toBe(true);
  });

  it('uses a custom renderItem', () => {
    const { getByText } = render(
      <Masonry data={items} renderItem={(item, index) => <Text>{`Custom ${index} ${item.id}`}</Text>} />
    );
    expect(getByText('Custom 3 item-3')).toBeTruthy();
  });
});
