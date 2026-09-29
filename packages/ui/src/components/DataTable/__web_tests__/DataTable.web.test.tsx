import React, { useState } from 'react';
import { act, fireEvent, render as rtlRender, screen, within } from '@testing-library/react';

import { PlatformBlocksProvider } from '../../../core/theme/PlatformBlocksProvider';
import { DataTable } from '../DataTable';
import type { DataTableColumn, DataTableSort } from '../types';

// FlashList is only used for the `virtual` path.
jest.mock('@shopify/flash-list', () => ({ FlashList: () => null }));

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

const columns: DataTableColumn<Person>[] = [
  { key: 'name', header: 'Name', accessor: 'name', sortable: true },
  { key: 'role', header: 'Role', accessor: 'role' },
];

const getRowId = (row: Person) => row.id;

const render = (ui: React.ReactElement) => rtlRender(<PlatformBlocksProvider>{ui}</PlatformBlocksProvider>);

describe('DataTable (react-native-web DOM)', () => {
  it('exposes table semantics with aria-sort on sortable headers', () => {
    render(
      <DataTable
        data={people}
        columns={columns}
        getRowId={getRowId}
        sortBy={[{ column: 'name', direction: 'asc' }]}
        onSortChange={() => {}}
        searchable={false}
        showColumnVisibilityManager={false}
        ariaLabel="People"
      />
    );

    const table = screen.getByRole('table', { name: 'People' });
    expect(table.getAttribute('aria-rowcount')).toBe('4');
    expect(table.getAttribute('aria-colcount')).toBe('2');

    const headers = within(table).getAllByRole('columnheader');
    expect(headers).toHaveLength(2);
    expect(headers[0].getAttribute('aria-sort')).toBe('ascending');
    // Unsortable columns carry no aria-sort.
    expect(headers[1].getAttribute('aria-sort')).toBeNull();

    // The sortable header's label is a button named by the header text.
    expect(within(headers[0]).getByRole('button', { name: 'Name' })).toBeTruthy();

    const rows = within(table).getAllByRole('row');
    // Header row + 3 body rows, 1-indexed with the header first.
    expect(rows).toHaveLength(4);
    expect(rows[1].getAttribute('aria-rowindex')).toBe('2');
    expect(within(rows[1]).getAllByRole('cell')).toHaveLength(2);
    expect(within(rows[1]).getByText('Ada')).toBeTruthy();
  });

  it('cycles aria-sort through the sort button', () => {
    function Sortable() {
      const [sortBy, setSortBy] = useState<DataTableSort[]>([]);
      return (
        <DataTable
          data={people}
          columns={columns}
          getRowId={getRowId}
          sortBy={sortBy}
          onSortChange={setSortBy}
          searchable={false}
          showColumnVisibilityManager={false}
        />
      );
    }
    render(<Sortable />);

    const header = screen.getAllByRole('columnheader')[0];
    expect(header.getAttribute('aria-sort')).toBe('none');
    fireEvent.click(within(header).getByRole('button', { name: 'Name' }));
    expect(screen.getAllByRole('columnheader')[0].getAttribute('aria-sort')).toBe('ascending');
    fireEvent.click(within(screen.getAllByRole('columnheader')[0]).getByRole('button', { name: 'Name' }));
    expect(screen.getAllByRole('columnheader')[0].getAttribute('aria-sort')).toBe('descending');
  });

  it('labels the selection checkboxes and reports the mixed state', () => {
    function Selectable() {
      const [selected, setSelected] = useState<(string | number)[]>([]);
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
    render(<Selectable />);

    const selectAll = screen.getByRole('checkbox', { name: 'Select all rows' });
    const first = screen.getByRole('checkbox', { name: 'Select row 1' });
    expect(screen.getByRole('checkbox', { name: 'Select row 3' })).toBeTruthy();
    expect(selectAll.getAttribute('aria-checked')).toBe('false');
    expect(first.getAttribute('aria-checked')).toBe('false');

    fireEvent.click(first);
    expect(screen.getByRole('checkbox', { name: 'Select row 1' }).getAttribute('aria-checked')).toBe('true');
    expect(screen.getByRole('checkbox', { name: 'Select all rows' }).getAttribute('aria-checked')).toBe('mixed');

    fireEvent.click(screen.getByRole('checkbox', { name: 'Select all rows' }));
    expect(screen.getByRole('checkbox', { name: 'Select all rows' }).getAttribute('aria-checked')).toBe('true');
    expect(screen.getByRole('checkbox', { name: 'Select row 3' }).getAttribute('aria-checked')).toBe('true');
  });

  it('selects rows without a controlled selectedRows prop', () => {
    const onSelectionChange = jest.fn();
    render(
      <DataTable
        data={people}
        columns={columns}
        getRowId={getRowId}
        selectable
        onSelectionChange={onSelectionChange}
        searchable={false}
        showColumnVisibilityManager={false}
      />
    );
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select row 2' }));
    expect(onSelectionChange).toHaveBeenLastCalledWith(['grace']);
    expect(screen.getByRole('checkbox', { name: 'Select row 2' }).getAttribute('aria-checked')).toBe('true');
  });

  it('is an ARIA grid with one roving tab stop when rows are clickable', () => {
    const onRowClick = jest.fn();
    render(
      <DataTable
        data={people}
        columns={columns}
        getRowId={getRowId}
        onRowClick={onRowClick}
        searchable={false}
        showColumnVisibilityManager={false}
      />
    );

    const grid = screen.getByRole('grid');
    const cells = within(grid).getAllByRole('gridcell');
    expect(cells).toHaveLength(6);
    // Exactly one cell is in the tab order.
    expect(cells.filter((cell) => cell.getAttribute('tabindex') === '0')).toEqual([cells[0]]);
    expect(cells.slice(1).every((cell) => cell.getAttribute('tabindex') === '-1')).toBe(true);

    // Arrow keys move DOM focus and the tab stop.
    act(() => cells[0].focus());
    fireEvent.keyDown(cells[0], { key: 'ArrowRight' });
    expect(document.activeElement).toBe(cells[1]);
    fireEvent.keyDown(cells[1], { key: 'ArrowDown' });
    expect(document.activeElement).toBe(cells[3]);
    expect(cells[3].getAttribute('tabindex')).toBe('0');
    expect(cells[0].getAttribute('tabindex')).toBe('-1');

    // Space activates the row; so does a click.
    fireEvent.keyDown(cells[3], { key: ' ' });
    expect(onRowClick).toHaveBeenLastCalledWith(people[1], 1);
    fireEvent.click(cells[4]);
    expect(onRowClick).toHaveBeenLastCalledWith(people[2], 2);
  });

  it('names icon-only header controls', () => {
    render(
      <DataTable
        data={people}
        columns={[{ ...columns[0], filterable: true }, columns[1]]}
        getRowId={getRowId}
        searchable={false}
        showColumnVisibilityManager={false}
      />
    );
    expect(screen.getByRole('button', { name: 'Filter Name' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Name options' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Role options' })).toBeTruthy();
  });

  it('does not report column visibility on mount', () => {
    const onColumnVisibilityChange = jest.fn();
    render(
      <DataTable
        data={people}
        columns={columns}
        getRowId={getRowId}
        initialHiddenColumns={['role']}
        onColumnVisibilityChange={onColumnVisibilityChange}
        searchable={false}
      />
    );
    expect(onColumnVisibilityChange).not.toHaveBeenCalled();
    expect(screen.getAllByRole('columnheader')).toHaveLength(1);
  });

  it('exports the current view as CSV through onExport', () => {
    const onExport = jest.fn();
    render(
      <DataTable
        data={people}
        columns={columns}
        getRowId={getRowId}
        sortBy={[{ column: 'name', direction: 'desc' }]}
        exportable
        onExport={onExport}
        searchable={false}
        showColumnVisibilityManager={false}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Export as CSV' }));
    expect(onExport).toHaveBeenCalledTimes(1);
    const [csv, rows] = onExport.mock.calls[0];
    expect(csv).toBe(['Name,Role', 'Linus,Maintainer', 'Grace,Admiral', 'Ada,Engineer'].join('\r\n'));
    expect(rows).toHaveLength(3);
  });
});
