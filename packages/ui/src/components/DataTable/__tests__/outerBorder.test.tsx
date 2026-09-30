import React from 'react';
import { View } from 'react-native';
import TestRenderer from 'react-test-renderer';

// FlashList ships untranspiled ESM and is only used for the `virtual` path.
jest.mock('@shopify/flash-list', () => ({ FlashList: () => null }));

import { DataTable } from '../DataTable';
import { ThemeScope } from '../../../core/theme/ThemeProvider';
import { OverlayProvider } from '../../../core/providers/OverlayProvider';

const columns = [{ key: 'name', title: 'Name' }];
const data = [{ name: 'Ada' }];

function renderTable(props: Record<string, unknown> = {}) {
  let tree: TestRenderer.ReactTestRenderer;
  TestRenderer.act(() => {
    tree = TestRenderer.create(
      <ThemeScope>
        <OverlayProvider>
          <DataTable columns={columns as any} data={data} {...props} />
        </OverlayProvider>
      </ThemeScope>
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

function tableFrameStyle(tree: TestRenderer.ReactTestRenderer) {
  return viewStyles(tree).find((style: any) => style.width === '100%' && style.overflow === 'hidden' && style.borderRadius !== undefined);
}

describe('DataTable outer border', () => {
  it('draws an outer border by default', () => {
    expect(tableFrameStyle(renderTable())).toMatchObject({ borderWidth: 1, borderRadius: 8 });
  });

  it('can still be turned off', () => {
    expect(tableFrameStyle(renderTable({ showOuterBorder: false }))).toMatchObject({ borderWidth: 0, borderRadius: 0 });
  });
});
