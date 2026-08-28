/**
 * NavTree behavioral tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { NavTree } from '../NavTree';
import { buildNavTree, isGroupNodeId } from '../buildNavTree';
import type { NavTreeItem } from '../types';

jest.mock('../../../core/theme', () => ({
  useTheme: () => ({
    colorScheme: 'light',
    colors: {
      primary: ['#E6F3FF', '#CCE7FF', '#99CFFF', '#66B7FF', '#339FFF', '#2684FF', '#1A5FDB', '#12408C', '#0B2C61', '#071F45'],
      gray: ['#F2F2F7', '#E5E5EA', '#D1D1D6', '#C7C7CC', '#AEAEB2', '#8E8E93', '#6D6D70', '#48484A', '#3A3A3C', '#1C1C1E'],
    },
    text: { primary: '#1C1C1E', secondary: '#6D6D70', muted: '#AEAEB2', disabled: '#C7C7CC' },
  }),
}));

// `Search` wraps `Input`, whose style resolver wants a fuller theme than this
// suite mocks. Standing in a bare TextInput with the same contract keeps these
// tests about NavTree's query wiring rather than about Input's styling.
jest.mock('../../Search', () => {
  const React = require('react');
  const { TextInput } = require('react-native');
  const MockSearch = ({ value, onChange, accessibilityLabel, placeholder }: any) =>
    React.createElement(TextInput, {
      value,
      onChangeText: onChange,
      accessibilityLabel,
      placeholder,
    });
  return { Search: MockSearch };
});

jest.mock('../../Icon', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { Icon: ({ name }: { name: string }) => React.createElement(View, { accessibilityLabel: `icon-${name}` }) };
});

const ITEMS: NavTreeItem[] = [
  { label: 'Getting Started', href: '/getting-started' },
  { label: 'Select', href: '/components/Select', group: ['Components', 'Input'] },
  { label: 'Button', href: '/components/Button', group: ['Components', 'Input'] },
  { label: 'Card', href: '/components/Card', group: ['Components', 'Display'] },
];

describe('buildNavTree', () => {
  it('nests items by their group path and namespaces the group ids', () => {
    const tree = buildNavTree(ITEMS);

    const components = tree.find(node => node.label === 'Components')!;
    expect(isGroupNodeId(components.id)).toBe(true);
    expect(components.children?.map(child => child.label)).toEqual(['Display', 'Input']);

    const input = components.children!.find(child => child.label === 'Input')!;
    expect(input.children?.map(child => child.label)).toEqual(['Button', 'Select']);
  });

  it('puts groups before loose items, and honours a partial group order', () => {
    // 'Display' is named, 'Input' is not — the named one leads, the rest fall
    // in alphabetically, so adding a category never means editing the order.
    const tree = buildNavTree(ITEMS, { groupOrder: ['Display'] });
    const components = tree.find(node => node.label === 'Components')!;

    expect(components.children?.map(child => child.label)).toEqual(['Display', 'Input']);
    expect(tree.map(node => node.label)).toEqual(['Components', 'Getting Started']);
  });

  it('lets a path-qualified entry outrank a bare one of the same name', () => {
    // 'Input' names a group in two different branches. Only the qualified entry
    // should move the one under 'Components'.
    const items: NavTreeItem[] = [
      { label: 'Button', href: '/c/Button', group: ['Components', 'Input'] },
      { label: 'Card', href: '/c/Card', group: ['Components', 'Display'] },
      { label: 'useInput', href: '/h/useInput', group: ['Hooks', 'Input'] },
      { label: 'useState', href: '/h/useState', group: ['Hooks', 'State'] },
    ];
    const tree = buildNavTree(items, { groupOrder: ['Components', 'Hooks', 'Hooks/State', 'Input'] });

    const [components, hooks] = tree;
    expect(components.children?.map(c => c.label)).toEqual(['Input', 'Display']);
    // 'Hooks/State' is ranked ahead of the bare 'Input', so State leads here
    // even though 'Input' would win on the bare list alone.
    expect(hooks.children?.map(c => c.label)).toEqual(['State', 'Input']);
  });

  it('keeps the given order when leaves are not sorted', () => {
    const tree = buildNavTree(ITEMS, { sortLeaves: 'none' });
    const input = tree
      .find(node => node.label === 'Components')!
      .children!.find(child => child.label === 'Input')!;

    expect(input.children?.map(child => child.label)).toEqual(['Select', 'Button']);
  });

  it('opens groups above openDepth and leaves the rest closed', () => {
    const tree = buildNavTree(ITEMS);
    const components = tree.find(node => node.label === 'Components')!;

    expect(components.startOpen).toBe(true);
    expect(components.children?.every(child => !child.startOpen)).toBe(true);
  });

  it('drops blank group levels rather than nesting under an unnamed branch', () => {
    const tree = buildNavTree([{ label: 'Loose', href: '/loose', group: ['', '  '] }]);

    expect(tree.map(node => node.label)).toEqual(['Loose']);
    expect(tree[0].href).toBe('/loose');
  });

  it('hands each group to getGroupNode with the items beneath it', () => {
    const tree = buildNavTree(ITEMS, {
      getGroupNode: ({ label, items }) => ({ label: `${label} (${items.length})` }),
    });

    expect(tree.find(node => node.label.startsWith('Components'))?.label).toBe('Components (3)');
  });
});

describe('NavTree', () => {
  it('opens the groups above the active route and marks its row', () => {
    const { queryByText, getByLabelText } = render(
      <NavTree items={ITEMS} activeHref="/components/Button" />
    );

    // Nothing below the top level is open by default, so 'Button' being on
    // screen means activeHref opened 'Components' → 'Input' to reach it.
    expect(queryByText('Button')).not.toBeNull();
    expect(getByLabelText('Button').props.accessibilityRole).toBe('link');
  });

  it('reports the original item back to onNavigate', () => {
    const onNavigate = jest.fn();
    const { getByLabelText } = render(
      <NavTree items={ITEMS} activeHref="/components/Button" onNavigate={onNavigate} />
    );

    fireEvent.press(getByLabelText('Select'));

    expect(onNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ href: '/components/Select', label: 'Select' }),
      expect.objectContaining({ id: '/components/Select' })
    );
  });

  it('does not treat a group press as navigation', () => {
    const onNavigate = jest.fn();
    const { getByLabelText } = render(<NavTree items={ITEMS} onNavigate={onNavigate} />);

    fireEvent.press(getByLabelText('Components'));

    expect(onNavigate).not.toHaveBeenCalled();
  });

  describe('collapsed rail', () => {
    it('renders only the top level', () => {
      const { queryByLabelText } = render(<NavTree items={ITEMS} collapsed />);

      expect(queryByLabelText('Components')).not.toBeNull();
      expect(queryByLabelText('Input')).toBeNull();
      expect(queryByLabelText('Button')).toBeNull();
    });

    it('sends a group press to the first route inside it', () => {
      const onNavigate = jest.fn();
      const { getByLabelText } = render(
        <NavTree items={ITEMS} collapsed onNavigate={onNavigate} />
      );

      fireEvent.press(getByLabelText('Components'));

      expect(onNavigate).toHaveBeenCalledWith(
        expect.objectContaining({ href: '/components/Card' }),
        expect.anything()
      );
    });

    it('marks the group holding the active route', () => {
      const { getByLabelText } = render(
        <NavTree items={ITEMS} collapsed activeHref="/components/Button" />
      );

      expect(getByLabelText('Components').props.accessibilityState.selected).toBe(true);
      expect(getByLabelText('Getting Started').props.accessibilityState.selected).toBe(false);
    });
  });

  describe('search', () => {
    it('filters to matches and opens the branches above them', () => {
      const { getByLabelText, queryByText } = render(
        <NavTree items={ITEMS} searchable accessibilityLabel="Docs" />
      );

      fireEvent.changeText(getByLabelText('Filter docs'), 'card');

      expect(queryByText('Card')).not.toBeNull();
      expect(queryByText('Button')).toBeNull();
      expect(queryByText('Getting Started')).toBeNull();
    });

    it('takes a query from outside when one is given', () => {
      const { queryByText } = render(<NavTree items={ITEMS} searchable filterQuery="select" />);

      expect(queryByText('Select')).not.toBeNull();
      expect(queryByText('Card')).toBeNull();
    });

    it('has no field in the collapsed rail, where there is no room', () => {
      const { queryByLabelText } = render(<NavTree items={ITEMS} searchable collapsed />);

      expect(queryByLabelText('Filter navigation')).toBeNull();
    });
  });
});