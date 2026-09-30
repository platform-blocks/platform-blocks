import React from 'react';
import { act, fireEvent, render as rtlRender, screen } from '@testing-library/react';

import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { Tree } from '../Tree';
import type { TreeNode } from '../types';

const render = (ui: React.ReactElement) => rtlRender(<PlocksProvider>{ui}</PlocksProvider>);

const DATA: TreeNode[] = [
  {
    id: 'docs',
    label: 'Docs',
    children: [
      { id: 'intro', label: 'Intro' },
      { id: 'api', label: 'API' },
    ],
  },
  { id: 'blog', label: 'Blog' },
];

const item = (name: string) => screen.getByRole('treeitem', { name });

describe('Tree (react-native-web DOM)', () => {
  it('renders a tree of treeitems with level, position and expansion state', () => {
    render(<Tree data={DATA} accessibilityLabel="Files" />);

    const tree = screen.getByRole('tree', { name: 'Files' });
    const items = screen.getAllByRole('treeitem');
    expect(items.map((el) => el.getAttribute('aria-label'))).toEqual(['Docs', 'Blog']);

    expect(item('Docs').getAttribute('aria-expanded')).toBe('false');
    expect(item('Docs').getAttribute('aria-level')).toBe('1');
    expect(item('Docs').getAttribute('aria-posinset')).toBe('1');
    expect(item('Docs').getAttribute('aria-setsize')).toBe('2');
    // A leaf is not expandable, so it carries no aria-expanded at all.
    expect(item('Blog').hasAttribute('aria-expanded')).toBe(false);
    // No selection mode: aria-selected would promise something the tree doesn't do.
    expect(item('Blog').hasAttribute('aria-selected')).toBe(false);

    // One tab stop: the tree itself. Rows are reached with the arrow keys.
    expect(tree.getAttribute('tabindex')).toBe('0');
    expect(items.every((el) => el.getAttribute('tabindex') === '-1')).toBe(true);
  });

  it('focuses the first row on entry, then moves with the arrows and expands with ArrowRight', () => {
    render(<Tree data={DATA} accessibilityLabel="Files" />);
    const tree = screen.getByRole('tree');

    act(() => tree.focus());
    expect(tree.getAttribute('aria-activedescendant')).toBe(item('Docs').id);

    fireEvent.keyDown(tree, { key: 'ArrowRight' });
    expect(item('Docs').getAttribute('aria-expanded')).toBe('true');
    expect(item('Intro').getAttribute('aria-level')).toBe('2');

    // ArrowRight on an open branch steps into it; ArrowDown walks visible rows.
    fireEvent.keyDown(tree, { key: 'ArrowRight' });
    expect(tree.getAttribute('aria-activedescendant')).toBe(item('Intro').id);
    fireEvent.keyDown(tree, { key: 'ArrowDown' });
    expect(tree.getAttribute('aria-activedescendant')).toBe(item('API').id);

    // ArrowLeft on a leaf goes to its parent, then collapses it.
    fireEvent.keyDown(tree, { key: 'ArrowLeft' });
    expect(tree.getAttribute('aria-activedescendant')).toBe(item('Docs').id);
    fireEvent.keyDown(tree, { key: 'ArrowLeft' });
    expect(item('Docs').getAttribute('aria-expanded')).toBe('false');

    // End / Home, and type-ahead.
    fireEvent.keyDown(tree, { key: 'End' });
    expect(tree.getAttribute('aria-activedescendant')).toBe(item('Blog').id);
    fireEvent.keyDown(tree, { key: 'd' });
    expect(tree.getAttribute('aria-activedescendant')).toBe(item('Docs').id);
  });

  it('reports selection through aria-selected and selects the focused row with Enter', () => {
    const onSelectionChange = jest.fn();
    render(
      <Tree
        data={DATA}
        selectionMode="multiple"
        onSelectionChange={onSelectionChange}
        useAnimations={false}
        accessibilityLabel="Files"
      />
    );
    const tree = screen.getByRole('tree');
    expect(tree.getAttribute('aria-multiselectable')).toBe('true');
    expect(item('Blog').getAttribute('aria-selected')).toBe('false');

    act(() => tree.focus());
    fireEvent.keyDown(tree, { key: 'End' });
    fireEvent.keyDown(tree, { key: 'Enter' });

    expect(onSelectionChange).toHaveBeenLastCalledWith(['blog'], expect.objectContaining({ id: 'blog' }));
    expect(item('Blog').getAttribute('aria-selected')).toBe('true');
    expect(item('Docs').getAttribute('aria-selected')).toBe('false');
  });

  it('exposes checkbox state as aria-checked, mixed for a partly checked branch', () => {
    render(
      <Tree data={DATA} checkboxes defaultCheckedIds={['intro']} expandAll useAnimations={false} />
    );

    expect(item('Intro').getAttribute('aria-checked')).toBe('true');
    expect(item('API').getAttribute('aria-checked')).toBe('false');
    expect(item('Docs').getAttribute('aria-checked')).toBe('mixed');

    // Space toggles the focused row's check (the box itself is decorative).
    const tree = screen.getByRole('tree');
    act(() => tree.focus());
    fireEvent.keyDown(tree, { key: ' ' });
    expect(item('Docs').getAttribute('aria-checked')).toBe('true');
    expect(item('API').getAttribute('aria-checked')).toBe('true');
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
  });

  it('marks the active row with aria-current="page" and renders href rows as links', () => {
    const nav: TreeNode[] = [
      {
        id: 'guides',
        label: 'Guides',
        children: [
          { id: 'install', label: 'Install', href: '/install' },
          { id: 'theming', label: 'Theming', href: '/theming' },
        ],
      },
    ];
    render(<Tree data={nav} activeHref="/theming" onNavigate={() => {}} />);

    // activeHref opened the branch above the active row.
    expect(item('Guides').getAttribute('aria-expanded')).toBe('true');
    expect(item('Theming').getAttribute('aria-current')).toBe('page');
    expect(item('Install').hasAttribute('aria-current')).toBe(false);
    // Still a treeitem for assistive tech, but a real anchor with an href.
    expect(item('Install').tagName).toBe('A');
    expect(item('Install').getAttribute('href')).toBe('/install');
  });

  it('forwards its ref to the root element', () => {
    const ref = React.createRef<HTMLElement>();
    render(<Tree ref={ref as never} data={DATA} accessibilityLabel="Files" />);
    expect(ref.current).toBe(screen.getByRole('tree'));
  });
});
