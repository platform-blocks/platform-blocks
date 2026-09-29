import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react';

import { PlatformBlocksProvider } from '../../../core/theme/PlatformBlocksProvider';
import { Accordion } from '../Accordion';

const ITEMS = [
  { key: 'one', title: 'Shipping', content: <Text>Ships in 2 days</Text> },
  { key: 'two', title: 'Returns', content: <Text>30-day returns</Text> },
  { key: 'three', title: 'Warranty', content: <Text>1 year</Text>, disabled: true },
];

describe('Accordion (react-native-web DOM)', () => {
  it('headers are buttons wired to labelled regions via aria-expanded / aria-controls', () => {
    render(
      <PlatformBlocksProvider>
        <Accordion items={ITEMS} autoPersist={false} transitionDuration={0} />
      </PlatformBlocksProvider>
    );
    const header = screen.getByRole('button', { name: 'Shipping' });
    expect(header.getAttribute('aria-expanded')).toBe('false');
    const panel = document.getElementById(header.getAttribute('aria-controls')!);
    expect(panel?.getAttribute('role')).toBe('region');
    expect(panel?.getAttribute('aria-labelledby')).toBe(header.id);

    fireEvent.click(header);
    expect(screen.getByRole('button', { name: 'Shipping' }).getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('region', { name: 'Shipping' }).textContent).toContain('Ships in 2 days');
  });

  it('marks disabled headers aria-disabled and ignores presses', () => {
    const onExpandedChange = jest.fn();
    render(
      <PlatformBlocksProvider>
        <Accordion items={ITEMS} autoPersist={false} onExpandedChange={onExpandedChange} />
      </PlatformBlocksProvider>
    );
    const warranty = screen.getByRole('button', { name: 'Warranty' });
    expect(warranty.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(warranty);
    expect(onExpandedChange).not.toHaveBeenCalled();
  });
});
