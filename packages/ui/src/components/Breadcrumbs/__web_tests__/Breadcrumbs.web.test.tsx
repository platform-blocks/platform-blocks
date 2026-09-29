import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';

import { PlatformBlocksProvider } from '../../../core/theme/PlatformBlocksProvider';
import { Breadcrumbs } from '../Breadcrumbs';
import type { BreadcrumbsProps } from '../types';

function renderBreadcrumbs(props: Partial<BreadcrumbsProps> = {}) {
  return render(
    <PlatformBlocksProvider>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Products', onPress: props.items ? undefined : jest.fn() },
          { label: 'Desk' },
        ]}
        {...props}
      />
    </PlatformBlocksProvider>
  );
}

describe('Breadcrumbs (react-native-web DOM)', () => {
  it('renders a labelled navigation landmark containing a list', () => {
    renderBreadcrumbs();
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    const list = within(nav).getByRole('list');
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
  });

  it('marks the last item aria-current="page" and makes the trail links', () => {
    renderBreadcrumbs();
    const current = screen.getByText('Desk').closest('[aria-current]');
    expect(current?.getAttribute('aria-current')).toBe('page');

    const home = screen.getByRole('link', { name: 'Home' });
    expect(home.getAttribute('href')).toBe('/');
    expect(screen.getByRole('link', { name: 'Products' })).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Desk' })).toBeNull();
  });

  it('hides separators from assistive technology', () => {
    renderBreadcrumbs({ separator: '>' });
    const separators = screen.getAllByText('>');
    expect(separators).toHaveLength(2);
    separators.forEach((sep) => expect(sep.closest('[aria-hidden="true"]')).not.toBeNull());
  });

  it('fires onPress for a trail item', () => {
    const onPress = jest.fn();
    render(
      <PlatformBlocksProvider>
        <Breadcrumbs items={[{ label: 'Home', onPress }, { label: 'Here' }]} />
      </PlatformBlocksProvider>
    );
    fireEvent.click(screen.getByRole('link', { name: 'Home' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
