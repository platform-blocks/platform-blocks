/**
 * Tree component behavioral tests
 */

import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';

import { Tree } from '../Tree';
import { Collapse } from '../../Collapse/Collapse';
import { ancestorIds, filterTree, findNodeByHref, idRange, toggleCheckedIds } from '../treeUtils';
import type { TreeNode } from '../types';

// One theme object for the whole suite, like a real provider: a fresh object per
// `useTheme()` call would change every memo keyed on the theme on each render.
jest.mock('../../../core/theme/ThemeProvider', () => {
  const theme = {
    colorScheme: 'light',
    colors: {
      primary: [
        '#E6F3FF',
        '#CCE7FF',
        '#99CFFF',
        '#66B7FF',
        '#339FFF',
        '#2684FF',
        '#1A5FDB',
        '#12408C',
        '#0B2C61',
        '#071F45'
      ],
      gray: [
        '#F2F2F7',
        '#E5E5EA',
        '#D1D1D6',
        '#C7C7CC',
        '#AEAEB2',
        '#8E8E93',
        '#6D6D70',
        '#48484A',
        '#3A3A3C',
        '#1C1C1E'
      ],
      textPrimary: '#1C1C1E'
    },
    text: {
      primary: '#1C1C1E',
      secondary: '#6D6D70',
      muted: '#AEAEB2',
      disabled: '#C7C7CC'
    }
  };
  return {
    ...jest.requireActual('../../../core/theme/ThemeProvider'),
    useTheme: () => theme,
  };
});

jest.mock('../../Icon/Icon', () => {
  const React = require('react');
  const { View } = require('react-native');

  const MockIcon = ({ name }: { name: string }) =>
    React.createElement(View, { accessibilityLabel: `icon-${name}` });

  return { Icon: MockIcon };
});

jest.mock('../../Checkbox/Checkbox', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');

  const MockCheckbox = ({ onChange, checked }: { onChange: () => void; checked: boolean }) => (
    React.createElement(
      Pressable,
      { onPress: onChange, testID: 'tree-checkbox' },
      React.createElement(Text, null, checked ? 'checked' : 'unchecked')
    )
  );

  return { Checkbox: MockCheckbox };
});

const basicTree: TreeNode[] = [
  {
    id: 'root',
    label: 'Root Folder',
    children: [
      {
        id: 'child-1',
        label: 'Child Node'
      }
    ]
  }
];

const rowStyle = (element: any) => StyleSheet.flatten(element.props.style) as Record<string, any>;

describe('Tree component', () => {
  it('expands and collapses branches with the disclosure control', () => {
    const { queryByText, getByLabelText } = render(<Tree data={basicTree} />);

    expect(queryByText('Child Node')).toBeNull();
    fireEvent.press(getByLabelText('Expand'));

    expect(queryByText('Child Node')).not.toBeNull();
    expect(getByLabelText('Collapse')).toBeTruthy();

    fireEvent.press(getByLabelText('Collapse'));
    expect(getByLabelText('Expand')).toBeTruthy();
  });

  it('collapses the branch it hides and expands the one it shows', () => {
    // The disclosure test above cannot catch this: an animated branch stays mounted at
    // height 0, so its labels are queryable whether or not they are actually visible.
    // Reading `Collapse`'s own state is what tells the two apart.
    const utils = render(<Tree data={basicTree} />);
    const collapsedStates = () =>
      utils.UNSAFE_getAllByType(Collapse).map((node) => node.props.isCollapsed);

    fireEvent.press(utils.getByLabelText('Expand'));
    expect(collapsedStates()).toEqual([false]);

    fireEvent.press(utils.getByLabelText('Collapse'));
    expect(collapsedStates()).toEqual([true]);
  });

  it('invokes onSelectionChange when a node is pressed in single-selection mode', () => {
    const onSelectionChange = jest.fn();
    const { getByLabelText } = render(
      <Tree data={basicTree} selectionMode="single" onSelectionChange={onSelectionChange} />
    );

    fireEvent.press(getByLabelText('Root Folder'));

    expect(onSelectionChange).toHaveBeenCalledWith(
      ['root'],
      expect.objectContaining({ id: 'root', label: 'Root Folder' })
    );
  });

  it('calls onCheckedChange when a checkbox is toggled', () => {
    const onCheckedChange = jest.fn();
    const checkboxTree: TreeNode[] = [
      {
        id: 'folder',
        label: 'Folder',
        startOpen: true,
        children: [
          {
            id: 'leaf',
            label: 'Leaf'
          }
        ]
      }
    ];

    const { getAllByTestId } = render(
      <Tree data={checkboxTree} checkboxes onCheckedChange={onCheckedChange} />
    );

    // The box is a decorative picture of the row's checked state (the row
    // carries it for assistive tech), so it is hidden from the a11y tree.
    const [, leafCheckbox] = getAllByTestId('tree-checkbox', { includeHiddenElements: true });
    fireEvent.press(leafCheckbox);

    expect(onCheckedChange).toHaveBeenCalledWith(
      expect.arrayContaining(['leaf']),
      expect.objectContaining({ id: 'leaf' })
    );
  });

  it('reports the checked state on the row itself', () => {
    const { getByLabelText } = render(
      <Tree data={basicTree} checkboxes expandAll defaultCheckedIds={['child-1']} />
    );

    expect(getByLabelText('Child Node').props.accessibilityState.checked).toBe(true);
    // Cascading: every descendant checked reads as checked on the branch too.
    expect(getByLabelText('Root Folder').props.accessibilityState.checked).toBe(true);
  });

  it('offers expanding and checking as accessibility actions on the row', () => {
    // A native screen reader treats the row as one element, so its caret and
    // checkbox are not separately reachable — the actions are how it gets them.
    const onCheckedChange = jest.fn();
    const { getByLabelText, queryByText } = render(
      <Tree data={basicTree} checkboxes onCheckedChange={onCheckedChange} />
    );
    const row = getByLabelText('Root Folder');
    expect(row.props.accessibilityActions.map((action: { name: string }) => action.name)).toEqual([
      'toggle',
      'check',
    ]);

    fireEvent(row, 'accessibilityAction', { nativeEvent: { actionName: 'toggle' } });
    expect(queryByText('Child Node')).not.toBeNull();

    fireEvent(getByLabelText('Root Folder'), 'accessibilityAction', { nativeEvent: { actionName: 'check' } });
    expect(onCheckedChange).toHaveBeenCalledWith(
      expect.arrayContaining(['root', 'child-1']),
      expect.objectContaining({ id: 'root' })
    );
  });

  it('re-renders only the rows whose state changed', () => {
    // Every callback the tree hands its memoized rows keeps its identity, so a
    // selection change reaches the rows it flips and no others.
    const flat: TreeNode[] = [
      { id: 'a', label: 'Alpha' },
      { id: 'b', label: 'Beta' },
      { id: 'c', label: 'Gamma' },
    ];
    const renderLabel = jest.fn((node: TreeNode) => <Text>{node.label}</Text>);
    const { getByLabelText } = render(
      <Tree data={flat} selectionMode="single" renderLabel={renderLabel} />
    );
    const renderedIds = () => renderLabel.mock.calls.map(([node]) => node.id).sort();

    renderLabel.mockClear();
    fireEvent.press(getByLabelText('Alpha'));
    expect(renderedIds()).toEqual(['a']);

    renderLabel.mockClear();
    fireEvent.press(getByLabelText('Beta'));
    expect(renderedIds()).toEqual(['a', 'b']);
  });

  describe('row geometry', () => {
    it('does not change a row size when it becomes selected', () => {
      const { getByLabelText } = render(<Tree data={basicTree} selectionMode="single" />);

      const before = rowStyle(getByLabelText('Root Folder'));
      fireEvent.press(getByLabelText('Root Folder'));
      const after = rowStyle(getByLabelText('Root Folder'));

      // The border is always drawn and only recolored; toggling `borderWidth`
      // is what used to make selected rows 2px taller than their neighbours.
      expect(before.borderWidth).toBe(1);
      expect(after.borderWidth).toBe(1);
      expect(after.minHeight).toBe(before.minHeight);
      expect(after.paddingHorizontal).toBe(before.paddingHorizontal);
    });

    it('gives branch rows and leaf rows the same height floor', () => {
      const { getByLabelText } = render(<Tree data={basicTree} expandAll />);

      const branch = rowStyle(getByLabelText('Root Folder'));
      const leaf = rowStyle(getByLabelText('Child Node'));

      expect(branch.minHeight).toBeGreaterThan(0);
      expect(leaf.minHeight).toBe(branch.minHeight);
    });

    it('scales row height with the size prop', () => {
      const small = render(<Tree data={basicTree} size="xs" />);
      const large = render(<Tree data={basicTree} size="xl" />);

      expect(rowStyle(large.getByLabelText('Root Folder')).minHeight).toBeGreaterThan(
        rowStyle(small.getByLabelText('Root Folder')).minHeight
      );
    });

    it('bounds a virtualized tree at 320 unless `h` sizes it', () => {
      const fallback = render(<Tree data={basicTree} virtualized testID="tree" />);
      expect(rowStyle(fallback.getByTestId('tree')).height).toBe(320);

      const sized = render(<Tree data={basicTree} virtualized h={200} testID="tree" />);
      expect(rowStyle(sized.getByTestId('tree')).height).toBe(200);
    });
  });

  describe('activation', () => {
    it('fires onNavigate for a leaf that has no href', () => {
      const onNavigate = jest.fn();
      const { getByLabelText } = render(
        <Tree data={basicTree} expandAll onNavigate={onNavigate} />
      );

      fireEvent.press(getByLabelText('Child Node'));

      expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({ id: 'child-1' }));
    });

    it('fires onNavigate for a branch only when it carries an href', () => {
      const onNavigate = jest.fn();
      const linked: TreeNode[] = [
        { id: 'a', label: 'Plain branch', children: [{ id: 'a1', label: 'Leaf' }] },
        { id: 'b', label: 'Linked branch', href: '/b', children: [{ id: 'b1', label: 'Leaf B' }] },
      ];
      const { getByLabelText } = render(<Tree data={linked} onNavigate={onNavigate} />);

      fireEvent.press(getByLabelText('Plain branch'));
      expect(onNavigate).not.toHaveBeenCalled();

      fireEvent.press(getByLabelText('Linked branch'));
      expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({ id: 'b' }));
    });
  });

  describe('expansion', () => {
    it('reacts to expandAll changing after mount', () => {
      const { queryByText, rerender } = render(<Tree data={basicTree} expandAll={false} />);
      expect(queryByText('Child Node')).toBeNull();

      rerender(<Tree data={basicTree} expandAll />);
      expect(queryByText('Child Node')).not.toBeNull();
    });

    it('keeps ancestors open when accordion closes a sibling', () => {
      const nested: TreeNode[] = [
        {
          id: 'parent',
          label: 'Parent',
          startOpen: true,
          children: [
            { id: 'first', label: 'First', children: [{ id: 'first-leaf', label: 'First leaf' }] },
            { id: 'second', label: 'Second', children: [{ id: 'second-leaf', label: 'Second leaf' }] },
          ],
        },
      ];

      const onExpandedIdsChange = jest.fn();
      const { getByLabelText } = render(
        <Tree data={nested} accordion onExpandedIdsChange={onExpandedIdsChange} />
      );

      fireEvent.press(getByLabelText('First'));
      fireEvent.press(getByLabelText('Second'));

      const expanded = onExpandedIdsChange.mock.calls.at(-1)?.[0] as string[];
      // Closing every open branch — the old behaviour — also closed 'parent',
      // which hid the very branch that was just opened.
      expect(expanded).toContain('parent');
      expect(expanded).toContain('second');
      expect(expanded).not.toContain('first');
    });

    it('opens the branches leading to a filter match', () => {
      const { queryByText, rerender } = render(<Tree data={basicTree} filterQuery="" />);
      expect(queryByText('Child Node')).toBeNull();

      rerender(<Tree data={basicTree} filterQuery="child" />);
      expect(queryByText('Child Node')).not.toBeNull();
    });
  });

  describe('selection', () => {
    const flat: TreeNode[] = [
      { id: 'a', label: 'Alpha' },
      { id: 'b', label: 'Beta' },
      { id: 'c', label: 'Gamma' },
    ];

    it('keeps a row selected when it is pressed again in multiple mode', () => {
      const onSelectionChange = jest.fn();
      const { getByLabelText } = render(
        <Tree data={flat} selectionMode="multiple" onSelectionChange={onSelectionChange} />
      );

      fireEvent.press(getByLabelText('Alpha'));
      fireEvent.press(getByLabelText('Alpha'));

      expect(onSelectionChange.mock.calls.at(-1)?.[0]).toEqual(['a']);
    });

    it('selects a range between the anchor and a shift-pressed row', () => {
      const onSelectionChange = jest.fn();
      const { getByLabelText } = render(
        <Tree data={flat} selectionMode="multiple" onSelectionChange={onSelectionChange} />
      );

      fireEvent.press(getByLabelText('Alpha'));
      fireEvent.press(getByLabelText('Gamma'), { nativeEvent: { shiftKey: true } });

      expect(onSelectionChange.mock.calls.at(-1)?.[0]).toEqual(['a', 'b', 'c']);
    });

    it('never ranges over rows a filter has hidden', () => {
      const onSelectionChange = jest.fn();
      const mixed: TreeNode[] = [
        { id: 'a', label: 'Alpha' },
        { id: 'b', label: 'Zulu' },
        { id: 'c', label: 'Gamma' },
      ];
      const { getByLabelText, queryByText } = render(
        <Tree
          data={mixed}
          selectionMode="multiple"
          filterQuery="a"
          onSelectionChange={onSelectionChange}
        />
      );

      // 'Zulu' does not match, so it is not on screen and must not be swept up
      // by a range taken across it — the old range walked the unfiltered data.
      expect(queryByText('Zulu')).toBeNull();
      fireEvent.press(getByLabelText('Alpha'));
      fireEvent.press(getByLabelText('Gamma'), { nativeEvent: { shiftKey: true } });

      expect(onSelectionChange.mock.calls.at(-1)?.[0]).toEqual(['a', 'c']);
    });
  });
});

describe('tree utilities', () => {
  const tree: TreeNode[] = [
    {
      id: 'root',
      label: 'Root',
      children: [
        { id: 'one', label: 'One' },
        { id: 'two', label: 'Two' },
      ],
    },
  ];

  it('marks matches, their ancestors, and nothing else', () => {
    const result = filterTree(tree, 'two');

    expect(Array.from(result.matched)).toEqual(['two']);
    expect(result.visible.has('root')).toBe(true);
    expect(result.visible.has('one')).toBe(false);
    expect(Array.from(result.ancestors)).toEqual(['root']);
  });

  it('checks a branch and its descendants in a single step', () => {
    const branch = tree[0];
    const descendants = ['one', 'two'];

    const checked = toggleCheckedIds(branch, [], descendants, true);
    expect(checked.sort()).toEqual(['one', 'root', 'two']);

    // …and clears the whole subtree on the next press, with no "parent only"
    // stop in between.
    expect(toggleCheckedIds(branch, checked, descendants, true)).toEqual([]);
  });

  it('returns an inclusive range in visible order', () => {
    expect(idRange(['a', 'b', 'c', 'd'], 'c', 'b')).toEqual(['b', 'c']);
    expect(idRange(['a', 'b'], 'a', 'missing')).toEqual([]);
  });

  describe('active node', () => {
    const navTree: TreeNode[] = [
      {
        id: 'components',
        label: 'Components',
        children: [
          {
            id: 'input',
            label: 'Input',
            children: [
              { id: 'button', label: 'Button', href: '/components/Button' },
              { id: 'select', label: 'Select', href: '/components/Select' },
            ],
          },
        ],
      },
    ];

    it('opens the branches above the active node so it is reachable', () => {
      // Nothing here is `startOpen`; only `activeHref` can have gotten the leaf
      // on screen, and it had to open two levels to do it.
      const { queryByText } = render(<Tree data={navTree} activeHref="/components/Button" />);

      expect(queryByText('Button')).not.toBeNull();
    });

    it('marks the active row without spending a selection', () => {
      const onSelectionChange = jest.fn();
      const { getByLabelText } = render(
        <Tree data={navTree} activeHref="/components/Select" onSelectionChange={onSelectionChange} />
      );

      const active = getByLabelText('Select');
      const inactive = getByLabelText('Button');

      expect(rowStyle(active).backgroundColor).not.toEqual(rowStyle(inactive).backgroundColor);
      expect(onSelectionChange).not.toHaveBeenCalled();
    });

    it('leaves a branch the reader collapsed alone while they move within it', () => {
      const { getAllByLabelText, rerender, UNSAFE_getAllByType } = render(
        <Tree data={navTree} activeHref="/components/Button" />
      );

      // Close the innermost branch the auto-expand opened, then navigate to a
      // sibling leaf. Both leaves share the same ancestors, so re-opening would
      // mean the tree fighting the reader on every click.
      const controls = getAllByLabelText('Collapse');
      fireEvent.press(controls[controls.length - 1]);
      rerender(<Tree data={navTree} activeHref="/components/Select" />);

      const collapsedStates = UNSAFE_getAllByType(Collapse).map(node => node.props.isCollapsed);
      expect(collapsedStates).toContain(true);
    });

    it('gives a node with an href the link role', () => {
      const { getByLabelText } = render(<Tree data={navTree} activeHref="/components/Button" />);

      // Native has no tree roles, so a row is the link or button it acts as.
      expect(getByLabelText('Button').props.role).toBe('link');
      expect(getByLabelText('Components').props.role).toBe('button');
    });
  });

  it('walks a parent map back to the root, and survives a cycle in one', () => {
    expect(ancestorIds({ leaf: 'branch', branch: 'root' }, 'leaf')).toEqual(['branch', 'root']);
    expect(ancestorIds({ a: 'b', b: 'a' }, 'a')).toEqual(['b']);
  });

  it('finds a node by href, at any depth', () => {
    const nodes: TreeNode[] = [
      { id: 'a', label: 'A', children: [{ id: 'b', label: 'B', href: '/b' }] },
    ];

    expect(findNodeByHref(nodes, '/b')?.id).toBe('b');
    expect(findNodeByHref(nodes, '/missing')).toBeUndefined();
  });
});