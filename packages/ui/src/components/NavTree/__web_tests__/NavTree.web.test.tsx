import React from 'react';
import { fireEvent, render as rtlRender, screen } from '@testing-library/react';

import { PlatformBlocksProvider } from '../../../core/theme/PlatformBlocksProvider';
import { NavTree } from '../NavTree';
import type { NavTreeItem } from '../types';

const render = (ui: React.ReactElement) => rtlRender(<PlatformBlocksProvider>{ui}</PlatformBlocksProvider>);

const ITEMS: NavTreeItem<{ badge: number }>[] = [
  { label: 'Getting Started', href: '/getting-started' },
  { label: 'Select', href: '/components/Select', group: ['Components', 'Input'], data: { badge: 1 } },
  { label: 'Button', href: '/components/Button', group: ['Components', 'Input'], data: { badge: 2 } },
  { label: 'Card', href: '/components/Card', group: ['Components', 'Display'] },
];

describe('NavTree (react-native-web DOM)', () => {
  it('renders a labelled tree whose active route is aria-current="page"', () => {
    render(<NavTree items={ITEMS} activeHref="/components/Button" accessibilityLabel="Docs" />);

    expect(screen.getByRole('tree', { name: 'Docs' })).toBeTruthy();
    const button = screen.getByRole('treeitem', { name: 'Button' });
    expect(button.getAttribute('aria-current')).toBe('page');
    expect(button.getAttribute('href')).toBe('/components/Button');
    expect(screen.getByRole('treeitem', { name: 'Select' }).hasAttribute('aria-current')).toBe(false);
    // Groups above the active route are open; a nav tree has no selection state.
    expect(screen.getByRole('treeitem', { name: 'Input' }).getAttribute('aria-expanded')).toBe('true');
    expect(button.hasAttribute('aria-selected')).toBe(false);
  });

  it('hands the original item (with its typed data) to onNavigate on a plain click', () => {
    const onNavigate = jest.fn();
    render(<NavTree items={ITEMS} activeHref="/components/Button" onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole('treeitem', { name: 'Select' }));

    expect(onNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ href: '/components/Select', data: { badge: 1 } }),
      expect.objectContaining({ id: '/components/Select' })
    );
  });

  it('renders the collapsed rail as a navigation landmark with the current group marked', () => {
    render(<NavTree items={ITEMS} collapsed activeHref="/components/Card" accessibilityLabel="Docs" />);

    expect(screen.getByRole('navigation', { name: 'Docs' })).toBeTruthy();
    const components = screen.getByRole('link', { name: 'Components' });
    expect(components.getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: 'Getting Started' }).hasAttribute('aria-current')).toBe(false);
  });

  it('infers the item payload type from `items` (docs-site usage compiles)', () => {
    // Mirrors apps/platform-blocks.com: a typed handler and a group decorator.
    const badges: number[] = [];
    const handleNavigate = (item: NavTreeItem<{ badge: number }>) => {
      if (item.data) badges.push(item.data.badge);
    };
    const getGroupNode = ({ label, depth }: { label: string; depth: number }) =>
      depth === 0 && label === 'Components' ? { href: '/components' } : {};

    render(
      <NavTree
        items={ITEMS}
        activeHref="/components/Button"
        onNavigate={handleNavigate}
        getGroupNode={getGroupNode}
        disclosure="nested"
        openDepth={0}
      />
    );
    fireEvent.click(screen.getByRole('treeitem', { name: 'Button' }));
    expect(badges).toEqual([2]);
    expect(screen.getByRole('treeitem', { name: 'Components' }).getAttribute('href')).toBe('/components');
  });

  it('forwards its ref to the root element', () => {
    const ref = React.createRef<HTMLElement>();
    render(<NavTree ref={ref as never} items={ITEMS} collapsed accessibilityLabel="Docs" />);
    expect(ref.current).toBe(screen.getByRole('navigation'));
  });
});
