import React from 'react';
import { View } from 'react-native';
import TestRenderer from 'react-test-renderer';

// FlashList ships untranspiled ESM and is only used for the `virtual` path.
jest.mock('@shopify/flash-list', () => ({ FlashList: () => null }));

import { DataTable } from '../DataTable';
import { PlatformBlocksThemeProvider } from '../../../core/theme/ThemeProvider';
import { OverlayProvider } from '../../../core/providers/OverlayProvider';

const columns = [
  { key: 'name', title: 'Name' },
  { key: 'role', title: 'Role' },
];
const data = [{ name: 'Ada', role: 'Engineer' }];

function renderTable(props: Record<string, unknown> = {}) {
  let tree: TestRenderer.ReactTestRenderer;
  TestRenderer.act(() => {
    tree = TestRenderer.create(
      <PlatformBlocksThemeProvider>
        <OverlayProvider>
          <DataTable columns={columns as any} data={data} {...props} />
        </OverlayProvider>
      </PlatformBlocksThemeProvider>
    );
  });
  return tree!;
}

/** Flattened styles of every View in the tree, for border assertions. */
function viewStyles(tree: TestRenderer.ReactTestRenderer) {
  return tree.root.findAllByType(View).map((node) => {
    const style = node.props.style;
    return Array.isArray(style) ? Object.assign({}, ...style.flat(3).filter(Boolean)) : (style || {});
  });
}

// Column rules sit on the logical end edge (right in LTR, left in RTL).
const withEndBorder = (tree: TestRenderer.ReactTestRenderer) =>
  viewStyles(tree).filter((s: any) => s.borderEndWidth > 0);

const withRowDivider = (tree: TestRenderer.ReactTestRenderer) =>
  viewStyles(tree).filter((s: any) => s.borderBottomWidth === 1 && s.minHeight);

describe('DataTable column dividers', () => {
  it('draws none unless columnBorderWidth is set', () => {
    expect(withEndBorder(renderTable({ variant: 'bordered' }))).toHaveLength(0);
  });

  it('spans header and body, skipping the trailing column', () => {
    const cells = withEndBorder(renderTable({ columnBorderWidth: 1 }));
    // One header cell + one body cell — the second (last) column is skipped.
    expect(cells).toHaveLength(2);
    // Solid is the platform default, so no per-side style is emitted.
    expect(cells.every((s: any) => s.borderStyle === undefined)).toBe(true);
  });

  it('honors columnBorderStyle', () => {
    const cells = withEndBorder(renderTable({ columnBorderWidth: 1, columnBorderStyle: 'dashed' }));
    expect(cells).toHaveLength(2);
    // Native styles the whole cell (its only border is the rule); web uses border-inline-end-style.
    expect(cells.every((s: any) => s.borderStyle === 'dashed')).toBe(true);
  });

  it('keeps the trailing rule when an actions column follows', () => {
    const cells = withEndBorder(
      renderTable({ columnBorderWidth: 1, rowActions: () => [{ key: 'edit', label: 'Edit' }] })
    );
    expect(cells).toHaveLength(4);
  });
});

describe('DataTable row dividers', () => {
  it('follows the bordered variant by default', () => {
    expect(withRowDivider(renderTable({ variant: 'bordered' })).length).toBeGreaterThan(0);
    expect(withRowDivider(renderTable({ variant: 'default' }))).toHaveLength(0);
  });

  it('can be forced on or off with showRowDividers', () => {
    expect(withRowDivider(renderTable({ showRowDividers: true })).length).toBeGreaterThan(0);
    expect(withRowDivider(renderTable({ variant: 'bordered', showRowDividers: false }))).toHaveLength(0);
  });

  it('lets rowBorderWidth={0} switch them off', () => {
    expect(withRowDivider(renderTable({ variant: 'bordered', rowBorderWidth: 0 }))).toHaveLength(0);
  });
});
