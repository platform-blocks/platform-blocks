/**
 * Expandable-row tests.
 *
 * The `Collapse` wrapper around `expandableRowRender` output was fed
 * `isCollapsed={isExpanded}` — inverted — so expanded content was visible while
 * the row was collapsed and clipped once it was expanded.
 */

import React from 'react';
import { View } from 'react-native';
import TestRenderer from 'react-test-renderer';

// FlashList ships untranspiled ESM and is only used for the `virtual` path.
jest.mock('@shopify/flash-list', () => ({ FlashList: () => null }));

import { DataTable } from '../DataTable';
import { Collapse } from '../../Collapse';
import { PlatformBlocksThemeProvider } from '../../../core/theme/ThemeProvider';
import { OverlayProvider } from '../../../core/providers/OverlayProvider';

const columns = [
  { key: 'name', title: 'Name' },
  { key: 'role', title: 'Role' },
];
const data = [
  { id: 'ada', name: 'Ada', role: 'Engineer' },
  { id: 'grace', name: 'Grace', role: 'Admiral' },
];

const DETAIL = 'expanded-detail';

function renderTable(props: Record<string, unknown> = {}) {
  let tree: TestRenderer.ReactTestRenderer;
  TestRenderer.act(() => {
    tree = TestRenderer.create(
      <PlatformBlocksThemeProvider>
        <OverlayProvider>
          <DataTable
            columns={columns as any}
            data={data}
            getRowId={(row: any) => row.id}
            expandableRowRender={(row: any) => <View testID={`${DETAIL}-${row.id}`} />}
            {...props}
          />
        </OverlayProvider>
      </PlatformBlocksThemeProvider>
    );
  });
  return tree!;
}

/** `isCollapsed` as passed to each rendered Collapse, in row order. */
function collapseStates(tree: TestRenderer.ReactTestRenderer) {
  return tree.root.findAllByType(Collapse as any).map((node) => node.props.isCollapsed);
}

describe('DataTable expandable rows', () => {
  it('clips expanded content for rows that are not expanded', () => {
    const tree = renderTable();
    expect(collapseStates(tree)).toEqual([true, true]);
  });

  it('releases the clip only for the expanded row', () => {
    const tree = renderTable({ expandedRows: ['ada'] });
    expect(collapseStates(tree)).toEqual([false, true]);
  });

  it('honours initialExpandedRows', () => {
    const tree = renderTable({ initialExpandedRows: ['grace'] });
    expect(collapseStates(tree)).toEqual([true, false]);
  });

  it('expands every listed row when allowMultipleExpanded', () => {
    const tree = renderTable({ expandedRows: ['ada', 'grace'], allowMultipleExpanded: true });
    expect(collapseStates(tree)).toEqual([false, false]);
  });

  it('still renders the row detail content in both states', () => {
    const tree = renderTable({ expandedRows: ['ada'] });
    expect(tree.root.findAllByProps({ testID: `${DETAIL}-ada` }).length).toBeGreaterThan(0);
    expect(tree.root.findAllByProps({ testID: `${DETAIL}-grace` }).length).toBeGreaterThan(0);
  });
});
