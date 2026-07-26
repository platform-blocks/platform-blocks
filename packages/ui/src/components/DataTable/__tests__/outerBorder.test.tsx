import React from 'react';
import { View } from 'react-native';
import TestRenderer from 'react-test-renderer';

// FlashList ships untranspiled ESM and is only used for the `virtual` path.
jest.mock('@shopify/flash-list', () => ({ FlashList: () => null }));

import { DataTable } from '../DataTable';
import { PlatformBlocksThemeProvider } from '../../../core/theme/ThemeProvider';
import { OverlayProvider } from '../../../core/providers/OverlayProvider';

const columns = [{ key: 'name', title: 'Name' }];
const data = [{ name: 'Ada' }];

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

describe('DataTable outer border', () => {
  it('draws an outer border by default', () => {
    const styles = viewStyles(renderTable());
    expect(styles.some((s: any) => s.borderWidth === 1 && s.borderRadius === 8)).toBe(true);
  });

  it('can still be turned off', () => {
    const styles = viewStyles(renderTable({ showOuterBorder: false }));
    expect(styles.some((s: any) => s.borderWidth === 1 && s.borderRadius === 8)).toBe(false);
  });
});
