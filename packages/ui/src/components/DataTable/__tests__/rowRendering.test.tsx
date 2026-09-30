/**
 * Render-cost regression tests.
 *
 * `useRowSelection` used to return a fresh object every render and every row
 * was rebuilt from one `buildRow` callback that depended on it, so selecting a
 * single row re-rendered every row and every cell. Rows are now memoized on
 * their own props; these tests count cell-renderer calls to pin that down.
 */

import React, { useState } from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

// FlashList ships untranspiled ESM; capture its props instead of rendering it.
const mockFlashListProps: Array<Record<string, unknown>> = [];
jest.mock('@shopify/flash-list', () => ({
  FlashList: (props: Record<string, unknown>) => {
    mockFlashListProps.push(props);
    return null;
  },
}));

import { DataTable } from '../DataTable';
import { ThemeScope } from '../../../core/theme/ThemeProvider';
import { OverlayProvider } from '../../../core/providers/OverlayProvider';
import type { DataTableColumn, DataTableRowId } from '../types';

interface Person {
  id: string;
  name: string;
  role: string;
}

const people: Person[] = [
  { id: 'ada', name: 'Ada', role: 'Engineer' },
  { id: 'grace', name: 'Grace', role: 'Admiral' },
  { id: 'linus', name: 'Linus', role: 'Maintainer' },
];

const cellRenders = new Map<string, number>();
const countRender = (id: string) => cellRenders.set(id, (cellRenders.get(id) ?? 0) + 1);

const columns: DataTableColumn<Person>[] = [
  {
    key: 'name',
    header: 'Name',
    accessor: 'name',
    width: 120,
    resizable: true,
    cell: (value, row) => {
      countRender(row.id);
      return <Text>{value}</Text>;
    },
  },
  { key: 'role', header: 'Role', accessor: 'role' },
];

const getRowId = (row: Person) => row.id;

const flat = (style: unknown) =>
  [style].flat(Infinity).reduce<Record<string, unknown>>((acc, s) => ({ ...acc, ...((s as object) || {}) }), {});

function wrap(ui: React.ReactElement) {
  return (
    <ThemeScope>
      <OverlayProvider>{ui}</OverlayProvider>
    </ThemeScope>
  );
}

function SelectableTable() {
  const [selected, setSelected] = useState<DataTableRowId[]>([]);
  return (
    <DataTable
      data={people}
      columns={columns}
      getRowId={getRowId}
      selectable
      selectedRows={selected}
      onSelectionChange={setSelected}
      searchable={false}
      showColumnVisibilityManager={false}
    />
  );
}

beforeEach(() => {
  cellRenders.clear();
  mockFlashListProps.length = 0;
});

describe('DataTable row rendering', () => {
  it('adapts toolbar actions to the table width while keeping search visible', () => {
    render(wrap(<DataTable data={people} columns={columns} testID="people" exportable
      onExport={() => {}} showColumnVisibilityManager searchable />));
    expect(screen.getByLabelText('Search')).toBeTruthy();
    expect(screen.getByText('Export')).toBeTruthy();
    fireEvent(screen.getByTestId('people-frame'), 'layout', { nativeEvent: { layout: { width: 480 } } });
    expect(screen.getByLabelText('Search')).toBeTruthy();
    expect(screen.getByText('More')).toBeTruthy();
  });

  it('re-renders only the toggled row when selecting', () => {
    render(wrap(<SelectableTable />));
    expect(cellRenders.get('ada')).toBeGreaterThan(0);

    cellRenders.clear();
    fireEvent.press(screen.getByLabelText('Select row 2'));

    expect(Object.fromEntries(cellRenders)).toEqual({ grace: 1 });
  });

  it('re-renders only the toggled row when expanding', () => {
    render(
      wrap(
        <DataTable
          data={people}
          columns={columns}
          getRowId={getRowId}
          expandableRowRender={(row) => <Text>{row.role}</Text>}
          searchable={false}
          showColumnVisibilityManager={false}
        />
      )
    );
    cellRenders.clear();
    fireEvent.press(screen.getAllByLabelText('Expand row')[2]);

    expect(Object.fromEntries(cellRenders)).toEqual({ linus: 1 });
  });

  it('coalesces column-resize moves into one width update per frame', () => {
    const frames: FrameRequestCallback[] = [];
    const raf = jest.spyOn(global, 'requestAnimationFrame').mockImplementation((cb) => {
      frames.push(cb);
      return frames.length;
    });
    try {
      render(
        wrap(
          <DataTable
            data={people}
            columns={columns}
            getRowId={getRowId}
            enableColumnResizing
            searchable={false}
            showColumnVisibilityManager={false}
          />
        )
      );
      // The resize grip: an absolutely positioned 8px strip on the header's end edge.
      const handle = screen.UNSAFE_root.findAll(
        (node) =>
          typeof node.type === 'string' &&
          typeof node.props.onResponderGrant === 'function' &&
          flat(node.props.style).position === 'absolute' &&
          flat(node.props.style).width === 8
      )[0];
      cellRenders.clear();

      act(() => {
        handle.props.onResponderGrant({ nativeEvent: { pageX: 100 } });
        for (let x = 101; x <= 130; x += 1) handle.props.onResponderMove({ nativeEvent: { pageX: x } });
      });
      // Thirty moves, one scheduled frame, no re-render yet.
      expect(frames).toHaveLength(1);
      expect(cellRenders.size).toBe(0);

      act(() => frames.shift()?.(0));
      // One width update → each row renders once.
      expect(Object.fromEntries(cellRenders)).toEqual({ ada: 1, grace: 1, linus: 1 });

      act(() => handle.props.onResponderRelease());
      const headerWidths = screen.UNSAFE_root
        .findAll((node) => node.props.role === 'columnheader' && typeof node.type === 'string')
        .map((node) => flat(node.props.style).width);
      expect(headerWidths).toContain(150);
    } finally {
      raf.mockRestore();
    }
  });

  it('bounds the virtualized list to the table height', () => {
    render(
      wrap(
        <DataTable
          testID="people"
          data={people}
          columns={columns}
          getRowId={getRowId}
          virtual
          searchable={false}
          showColumnVisibilityManager={false}
        />
      )
    );
    expect(mockFlashListProps.length).toBeGreaterThan(0);

    // The list sits in a flex:1 viewport inside a frame of fixed height, so
    // FlashList measures a finite window instead of its full content height.
    const viewport = screen.getByTestId('people-virtual-viewport');
    expect(flat(viewport.props.style).flex).toBe(1);

    let node = viewport.parent;
    let boundedHeight: unknown;
    while (node && boundedHeight === undefined) {
      if (typeof node.type === 'string') boundedHeight = flat(node.props.style).height;
      node = node.parent;
    }
    expect(boundedHeight).toBe(420);
  });
});
