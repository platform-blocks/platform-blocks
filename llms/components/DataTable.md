# DataTable

DataTable displays tabular data with sorting, pagination, selection, and editable cells.

## Metadata

- Import: `import { DataTable } from '@plocks/ui';`
- Docs: https://plocks.dev/components/DataTable
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/DataTable

## Props

- `id`: string — Stable id for user preference persistence
- `data` (required): T[] — Data rows
- `columns` (required): DataTableColumn<T>[] — Column definitions
- `loading`: boolean = false — Loading state
- `error`: string | null = null — Error message (when defined overrides table body)
- `emptyMessage`: string = 'No data available' — Message to display when there is no data
- `searchable`: boolean = true — Enable global search input
- `searchPlaceholder`: string = 'Search...' — Placeholder text for global search
- `searchValue`: string — Controlled global search value
- `onSearchChange`: (value: string) => void — Global search change handler
- `sortBy`: DataTableSort[] = NO_SORT — Current sorting state
- `onSortChange`: (sort: DataTableSort[]) => void — Sorting change callback
- `filters`: DataTableFilter[] = NO_FILTERS — Active column filters
- `onFilterChange`: (filters: DataTableFilter[]) => void — Filter change callback
- `showColumnFilters`: boolean = false — Render an always-visible filter row directly beneath the column headers. Each `filterable` column gets an inline control — a text input for text/number/date columns and a dropdown for `select`/`boolean` columns (options auto-derived from the data when `filterOptions` is omitted). This is separate from the per-header filter popover and can be used alongside it.
- `pagination`: DataTablePagination — Pagination state
- `onPaginationChange`: (pagination: DataTablePagination) => void — Pagination change handler
- `manualPagination`: boolean = false — Server-side (manual) pagination for API-backed tables. When true the `data` prop is treated as the already-fetched current page: the table performs no client-side slicing, filtering, sorting, or search, and uses `pagination.total` as the authoritative row count for the page count and "X-Y of N" summary. The sort / filter / search controls still fire their respective callbacks so you can refetch — use them in controlled mode (`sortBy`+`onSortChange`, `filters`+`onFilterChange`, `searchValue`+ `onSearchChange`). Requires `pagination.total` to be set.
- `paginationProps`: Omit<PaginationProps, 'value' | 'defaultValue' | 'current' | 'total' | 'onChange'> — Props forwarded to the underlying `Pagination` component in the footer (e.g. `siblings`, `boundaries`, `variant`, `size`, `color`, `showFirst`, `showPrevNext`, `labels`). Values here override the DataTable defaults, so you can also disable the built-in total (`showTotal={false}`) or size changer (`showSizeChanger={false}`).
- `selectable`: boolean = false — Enable row selection
- `showColumnMenu`: boolean = true — Show the per-column options menu in each header.
- `selectedRows`: DataTableRowId[] — Selected row identifiers (controlled). Leave undefined to let the table manage selection itself; `onSelectionChange` fires in both modes.
- `onSelectionChange`: (selected: DataTableRowId[]) => void — Selection change handler
- `getRowId`: (row: T, index: number) => DataTableRowId = defaultGetRowId — Stable row ID; required for selection, expansion, and edit mode.
- `onRowClick`: (row: T, index: number) => void — Row activation handler: fires when a body cell is pressed / clicked, or activated with Enter / Space from the keyboard (web). In edit mode an editable cell starts editing instead.
- `editMode`: boolean = false — Whether table is in edit mode
- `onEditModeChange`: (editMode: boolean) => void — Edit mode toggle callback
- `onCellEdit`: (rowIndex: number, columnKey: string, newValue: DataTableValue, rowId: DataTableRowId, row: T) => void — Commit cell edit. The index is the current visible index; rowId and row identify the record.
- `bulkActions`: DataTableBulkAction<T>[] = NO_BULK_ACTIONS — Bulk action definitions
- `variant`: 'default' | 'striped' | 'bordered' = 'default' — Visual table variant
- `density`: 'compact' | 'normal' | 'comfortable' = 'normal' — Row density
- `h`: number — Height of the table frame in px; the body scrolls inside it. The toolbar and pagination sit outside it, so it does not size the root.
- `virtual`: boolean = false — Enable FlashList-powered virtualization for large datasets. The list is bounded by `h` (420 by default), so only the visible rows mount.
- `enableColumnResizing`: boolean = false — Enable interactive column resizing
- `rowFeatureToggle`: (row: T, index: number) => DataTableRowFeatures | null | undefined — Per-row feature overrides
- `initialHiddenColumns`: string[] = NO_KEYS — Initially hidden column keys
- `onColumnVisibilityChange`: (hidden: string[]) => void — Called with the hidden column keys whenever the set changes (not on mount).
- `showColumnVisibilityManager`: boolean = true — Show built-in column visibility manager button
- `rowsPerPageOptions`: number[] = DEFAULT_PAGE_SIZES — Pagination size choices
- `showRowsPerPageControl`: boolean = true — Show rows-per-page selector
- `rowActions`: (row: T, index: number) => DataTableRowAction<T>[] — Per-row action icon buttons (renders trailing actions column when provided)
- `actionsColumnWidth`: number = 100 — Width of the actions column
- `striped`: boolean — Force striped row backgrounds regardless of variant
- `headerBackgroundColor`: string — Header row background. Defaults to `theme.backgrounds.subtle`.
- `enhancedLoading`: boolean = true — Show skeleton rows while `loading` (default). `false` shows a single "Loading…" row instead.
- `enhancedEmptyState`: boolean = true — Show the illustrated empty state (icon, title and `emptyMessage`) — default. `false` shows `emptyMessage` as a plain row.
- `hoverColor`: string — Row hover fill. Defaults to `theme.backgrounds.hover`.
- `enhancedSelection`: boolean = true — Draw an accent bar on the leading edge of selected rows (default). `false` marks selection with the row fill only.
- `showRowDividers`: boolean — Horizontal hairlines between rows. Defaults to on for `variant="bordered"` and off otherwise; set explicitly to override either way. `rowBorderWidth` takes precedence when provided.
- `borderColor`: string — Default color for the outer border, row dividers and column dividers (each can still be overridden by its own `*BorderColor` prop).
- `hoverHighlight`: boolean = true — Enable simple row background hover highlight
- `fullWidth`: boolean = true — Make table take full width of container
- `rowBorderWidth`: number — Row border width. Overrides `showRowDividers` / the variant default, including at 0.
- `rowBorderColor`: string — Custom row border color
- `rowBorderStyle`: 'solid' | 'dashed' | 'dotted' = 'solid' — Row border style
- `columnBorderWidth`: number — Vertical rules between columns, off unless set — `variant="bordered"` only draws row dividers and the outer border. The rule spans the header, filter row, body, and group/footer rows.
- `columnBorderColor`: string — Custom column border color
- `columnBorderStyle`: 'solid' | 'dashed' | 'dotted' = 'solid' — Column border style
- `showOuterBorder`: boolean = true — Whether to show outer border around entire table. Defaults to `true`.
- `outerBorderWidth`: number = 1 — Outer border width
- `outerBorderColor`: string — Outer border color
- `expandableRowRender`: (row: T, index: number) => React.ReactNode — Function to render expanded row content
- `initialExpandedRows`: DataTableRowId[] = NO_EXPANDED — Initially expanded row identifiers
- `expandedRows`: DataTableRowId[] — Controlled expanded rows
- `onExpandedRowsChange`: (expanded: DataTableRowId[]) => void — Expanded rows change handler
- `allowMultipleExpanded`: boolean = true — Allow multiple rows to be expanded at once
- `expandIcon`: React.ReactNode — Custom expand/collapse icons
- `collapseIcon`: React.ReactNode
- `headerTextProps`: Omit<TextProps, 'children'> — Override props applied to every column header `<Text>` (style, weight, ff, size, color).
- `cellTextProps`: Omit<TextProps, 'children'> — Override props applied to default-rendered cell text (cells without a custom `cell` renderer).
- `ariaLabel`: string — Accessible name for the table, exposed as `aria-label` (screen readers announce it when entering the table). No name is set when omitted.
- `exportable`: boolean = false — Show a CSV export button in the toolbar. Exports the current view (filtered + sorted, all pages) using the visible columns.
- `exportFileName`: string = 'data.csv' — File name for the downloaded CSV (default: "data.csv").
- `onExport`: (csv: string, rows: T[]) => void — Called with the generated CSV string and the exported rows. When provided it replaces the built-in web download (use it to handle export on native or to post the data elsewhere).
- `enableColumnReordering`: boolean = false — Enable drag-to-reorder of column headers (web).
- `columnOrder`: string[] — Controlled column order (array of column keys).
- `onColumnOrderChange`: (order: string[]) => void — Called with the new key order after a drag-reorder.
- `groupBy`: string — Group rows by this column key. Renders a collapsible group-header row before each group (showing the value, count, and per-column aggregates). Grouping spans all filtered rows, so client pagination is bypassed while active, and it is not applied in `virtual` mode.
- `groupsDefaultExpanded`: boolean = true — Whether groups start expanded (default: true).
- `renderGroupHeader`: (info: DataTableGroupHeaderInfo<T>) => React.ReactNode — Custom renderer for the group-header label cell.
- `showFooterTotals`: boolean = false — Render a footer row with grand-total aggregates for aggregate columns.
- `footerLabel`: string = 'Total' — Label shown in the first cell of the footer totals row (default: "Total").
- `w`: DimensionProp — Width
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface DataTableColumn<T = DataTableValue> {
  /** Unique identifier for the column */
  key: string;
  /** Display header for the column */
  header: React.ReactNode;
  /** Accessor function or key path */
  accessor: keyof T | ((row: T) => DataTableValue);
  /** Custom cell renderer */
  cell?: (value: DataTableValue, row: T, index: number) => React.ReactNode;
  /** Whether column is sortable */
  sortable?: boolean;
  /** Optional custom comparison function overriding default sorting */
  compare?: (a: DataTableValue, b: DataTableValue, rowA: T, rowB: T) => number;
  /** Whether column is filterable */
  filterable?: boolean;
  /** Filter type for this column */
  filterType?: FilterType;
  /** Filter options for select filter type */
  filterOptions?: Array<{ label: string; value: DataTableValue }>;
  /** Preferred width */
  width?: number | string;
  /** Minimum width */
  minWidth?: number;
  /** Maximum width */
  maxWidth?: number;
  /** Whether the user can resize this column */
  resizable?: boolean;
  /** Whether cells in this column are editable (when table in edit mode) */
  editable?: boolean;
  /** Validation function returning an error message or null */
  validate?: (value: DataTableValue) => string | null;
  /** Data type for formatting & validation */
  dataType?: ColumnDataType;
  /**
   * Content alignment. `left` / `right` are the leading / trailing edges, so
   * they follow the layout direction in RTL.
   */
  align?: 'left' | 'center' | 'right';
  /**
   * Pin the column during horizontal scroll (web). `left` pins it to the
   * leading edge and `right` to the trailing edge (mirrored in RTL).
   */
  sticky?: 'left' | 'right';
  /**
   * Aggregation for this column, shown in group-header rows (per group) and the
   * footer totals row (grand total). Numeric results are formatted with the
   * column's `dataType`; pass a function for custom aggregates.
   */
  aggregate?: AggregateType<T>;
  /** Custom formatter for this column's aggregate value. */
  aggregateFormat?: (value: number | string) => React.ReactNode;
}

export interface DataTableSort {
  column: string;
  direction: SortDirection;
}

export interface DataTableFilter {
  column: string;
  value: DataTableValue;
  operator: 'eq' | 'ne' | 'lt' | 'lte' | 'gt' | 'gte' | 'contains' | 'startsWith' | 'endsWith';
}

export interface DataTablePagination {
  page: number;
  pageSize: number;
  total: number;
}

export type DataTableRowId = string | number;

export type DataTableValue = any;

export interface DataTableBulkAction<T = DataTableValue> {
  /** Unique key */
  key: string;
  /** Button label */
  label: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Action invoked with selected row ids & full data */
  action: (selectedRows: DataTableRowId[], data: T[]) => void;
}

export interface DataTableRowFeatures {
  selectable?: boolean;
  editable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  searchable?: boolean;
}
```

## Examples

### Basics

Define columns, feed the dataset, and let `DataTable` handle search, sorting, and pagination out of the box.

```tsx
import { useState } from 'react';
import { DataTable } from '@plocks/ui';
import type { DataTableColumn, DataTablePagination, DataTableSort } from '@plocks/ui';

import { people, type Person } from '../data';

const columns: DataTableColumn<Person>[] = [
  { key: 'name', header: 'Name', accessor: 'name', sortable: true },
  { key: 'email', header: 'Email', accessor: 'email', sortable: true, minWidth: 200 },
  { key: 'title', header: 'Role', accessor: 'title', sortable: true },
  { key: 'department', header: 'Department', accessor: 'department', sortable: true, minWidth: 160 },
];

export function Demo() {
  const [sortBy, setSortBy] = useState<DataTableSort[]>([]);
  const [pagination, setPagination] = useState<DataTablePagination>({
    page: 1,
    pageSize: 5,
    total: people.length,
  });

  return (
    <DataTable
      data={people}
      columns={columns}
      sortBy={sortBy}
      onSortChange={setSortBy}
      pagination={pagination}
      onPaginationChange={setPagination}
      searchable
      searchPlaceholder="Search teammates"
    />
  );
}
```

`data.ts`

```ts
/**
 * Shared fixtures for the DataTable demos.
 *
 * `Person` is deliberately wider than any single demo needs: each demo picks the
 * columns that illustrate its feature, so one directory of people can stand in
 * for a team roster, an access-control list, and a payroll table at once.
 */

export type Person = {
  id: number;
  name: string;
  email: string;
  /** Job title — what the person does. */
  title: string;
  /** Access level — what the person may do. Drives the select-filter demos. */
  role: 'Admin' | 'Editor' | 'Viewer';
  department: 'Engineering' | 'Design' | 'Marketing' | 'Sales';
  team: string;
  location: string;
  phone: string;
  startDate: string;
  lastLogin: string;
  status: 'active' | 'inactive' | 'pending';
  remote: boolean;
  salary: number;
  /** 1–5 review score, for demos that render a numeric cell. */
  performance: number;
};

export const people: Person[] = [
  { id: 1, name: 'Dana Moss', email: 'dana@example.com', title: 'Staff Engineer', role: 'Admin', department: 'Engineering', team: 'Platform', location: 'Berlin', phone: '+49 30 1234567', startDate: '2019-04-02', lastLogin: '2025-03-04', status: 'active', remote: true, salary: 148_000, performance: 4.7 },
// … 95 more lines — full file: https://github.com/platform-blocks/plocks/blob/main/packages/ui/src/components/DataTable/demos/data.ts
```

### Column Filters

Mark columns `filterable` and set `filterType` to pick the control: an input for `text`/`number`/`date`, a dropdown for `select`/`boolean` (options auto-derived from the data when `filterOptions` is omitted). `showColumnFilters` renders those controls as a persistent row under the headers; omit it to keep them in each header's filter menu.

```tsx
import { useState } from 'react';
import { DataTable } from '@plocks/ui';
import type { DataTableColumn, DataTableFilter } from '@plocks/ui';

import { departmentFilterOptions, people, statusFilterOptions, type Person } from '../data';

const columns: DataTableColumn<Person>[] = [
  // text → inline text input
  { key: 'name', header: 'Name', accessor: 'name', sortable: true, filterable: true, filterType: 'text' },
  // select with explicit options → dropdown
  {
    key: 'department',
    header: 'Department',
    accessor: 'department',
    sortable: true,
    filterable: true,
    filterType: 'select',
    filterOptions: departmentFilterOptions,
  },
  {
    key: 'status',
    header: 'Status',
    accessor: 'status',
    sortable: true,
    filterable: true,
    filterType: 'select',
    filterOptions: statusFilterOptions,
  },
  // boolean → Yes / No / All dropdown
  { key: 'remote', header: 'Remote', accessor: 'remote', filterable: true, filterType: 'boolean', cell: (v) => (v ? 'Yes' : 'No') },
  // number → inline numeric input
  {
    key: 'salary',
    header: 'Salary',
    accessor: 'salary',
    sortable: true,
    filterable: true,
    filterType: 'number',
    dataType: 'currency',
    align: 'right',
  },
];

export function Demo() {
  const [filters, setFilters] = useState<DataTableFilter[]>([]);

  return (
    <DataTable
      data={people}
      columns={columns}
      filters={filters}
      onFilterChange={setFilters}
      showColumnFilters
      searchable={false}
    />
  );
}
```

`data.ts` is the same file shown under “Basics” above.

### Variants

Compare the default, striped, and bordered table treatments using the same rows.

```tsx
import { Column, DataTable, Text } from '@plocks/ui';

const rows = [
  { id: 1, name: 'Avery', role: 'Designer' },
  { id: 2, name: 'Jordan', role: 'Engineer' },
];
const columns = [
  { key: 'name', header: 'Name', accessor: 'name' as const },
  { key: 'role', header: 'Role', accessor: 'role' as const },
];
const variants = ['default', 'striped', 'bordered'] as const;

export function Demo() {
  return (
    <Column gap="lg" fullWidth>
      {variants.map(variant => (
        <Column key={variant} gap="xs" fullWidth>
          <Text fw="semibold">{variant}</Text>
          <DataTable data={rows} columns={columns} variant={variant} />
        </Column>
      ))}
    </Column>
  );
}
```

### Row Selection

Set `selectable` and wire `selectedRows` / `onSelectionChange` to track checked rows. Pass a stable `getRowId` so selection survives sorting and paging; the table requires it for selection.

```tsx
import { useState } from 'react';
import { Block, DataTable, Text } from '@plocks/ui';
import type { DataTableColumn, DataTablePagination } from '@plocks/ui';

import { people, type Person } from '../data';

const columns: DataTableColumn<Person>[] = [
  { key: 'name', header: 'Name', accessor: 'name', sortable: true },
  { key: 'email', header: 'Email', accessor: 'email', sortable: true, minWidth: 200 },
  { key: 'role', header: 'Role', accessor: 'role', sortable: true },
];

export function Demo() {
  const [pagination, setPagination] = useState<DataTablePagination>({
    page: 1,
    pageSize: 5,
    total: people.length,
  });
  const [selectedRows, setSelectedRows] = useState<(string | number)[]>([]);

  return (
    <Block fullWidth>
      <Text size="sm" c={selectedRows.length ? 'primary' : 'muted'}>
        {selectedRows.length ? `${selectedRows.length} selected` : 'No rows selected'}
      </Text>

      <DataTable
        data={people}
        columns={columns}
        pagination={pagination}
        onPaginationChange={setPagination}
        selectable
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        getRowId={(row) => row.id}
        searchable={false}
      />
    </Block>
  );
}
```

`data.ts` is the same file shown under “Basics” above.

### Rich Cells

Combine avatars, chips, and status cues inside custom `cell` renderers to create a readable, on-brand table.

```tsx
import { Avatar, Chip, DataTable, Text } from '@plocks/ui';
import type { DataTableColumn } from '@plocks/ui';

import { people, type Person } from '../data';

const rows = people.slice(0, 5);

const columns: DataTableColumn<Person>[] = [
  {
    key: 'name',
    header: 'Teammate',
    accessor: 'name',
    sortable: true,
    cell: (_value, row) => (
      <Avatar
        size="sm"
        fallback={row.name
          .split(' ')
          .map((part) => part[0])
          .join('')}
        label={<Text fw="semibold">{row.name}</Text>}
        description={<Text variant="small" c="muted">{row.title}</Text>}
        gap={8}
      />
    ),
  },
  {
    key: 'team',
    header: 'Team',
    accessor: 'team',
    sortable: true,
    cell: (value) => (
      <Chip size="xs" color="primary" variant="light">
        {value}
      </Chip>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    accessor: 'status',
    sortable: true,
    cell: (value: Person['status']) => (
      <Text
        c={value === 'inactive' ? 'error' : value === 'pending' ? 'warning' : 'success'}
        fw="semibold"
      >
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </Text>
    ),
  },
  {
    key: 'performance',
    header: 'Score',
    accessor: 'performance',
    sortable: true,
    align: 'right',
    cell: (value) => <Text fw="semibold">{value.toFixed(1)}</Text>,
  },
];

export function Demo() {
  return (
    <DataTable
      data={rows}
      columns={columns}
      density="comfortable"
      variant="striped"
      searchable={false}
    />
  );
}
```

`data.ts` is the same file shown under “Basics” above.

### Expandable Rows

Provide `expandedRows`, update them via `onExpandedRowsChange`, and use `expandableRowRender` to reveal supporting context.

```tsx
import { useState } from 'react';
import { Block, DataTable, Text } from '@plocks/ui';
import type { DataTableColumn } from '@plocks/ui';

import { projects, type Project } from '../data';

const columns: DataTableColumn<Project>[] = [
  { key: 'name', header: 'Project', accessor: 'name', sortable: true },
  { key: 'owner', header: 'Owner', accessor: 'owner', sortable: true },
  {
    key: 'budget',
    header: 'Budget',
    accessor: 'budget',
    align: 'right',
    sortable: true,
    dataType: 'currency',
  },
];

export function Demo() {
  const [expandedRows, setExpandedRows] = useState<(string | number)[]>([projects[0].id]);

  return (
    <DataTable
      data={projects}
      columns={columns}
      getRowId={(row) => row.id}
      expandedRows={expandedRows}
      onExpandedRowsChange={setExpandedRows}
      expandableRowRender={(project) => (
        <Block p="md">
          <Text c="muted">{project.summary}</Text>
        </Block>
      )}
      searchable={false}
    />
  );
}
```

`data.ts` is the same file shown under “Basics” above.

### Grouping & Totals

Set `groupBy` to a column key to group rows under collapsible group-header rows. Add `aggregate` (`sum`, `avg`, `min`, `max`, `count`, or a function) to any column to show its per-group total in the group header, and set `showFooterTotals` for a grand-total footer row aligned to the same columns. Grouping spans all filtered rows, so client pagination is bypassed while it is active.

```tsx
import { DataTable } from '@plocks/ui';
import type { DataTableColumn } from '@plocks/ui';

import { sales as rows, type Sale } from '../data';

const columns: DataTableColumn<Sale>[] = [
  { key: 'region', header: 'Region', accessor: 'region' },
  { key: 'rep', header: 'Rep', accessor: 'rep', aggregate: 'count' },
  { key: 'product', header: 'Product', accessor: 'product' },
  { key: 'units', header: 'Units', accessor: 'units', dataType: 'number', align: 'right', aggregate: 'sum' },
  { key: 'revenue', header: 'Revenue', accessor: 'revenue', dataType: 'currency', align: 'right', aggregate: 'sum' },
];

export function Demo() {
  return (
    <DataTable
      data={rows}
      columns={columns}
      groupBy="region"
      showFooterTotals
      footerLabel="All regions"
      searchable={false}
      showColumnVisibilityManager={false}
    />
  );
}
```

`data.ts` is the same file shown under “Basics” above.

### Fixed height & sticky columns

Pass a fixed `h` to cap the table's size — the header row stays pinned while the body scrolls, so a long list fits a constrained panel without paginating. Pin columns to the edges with `sticky: 'left'` or `sticky: 'right'` so they stay put while the rest scroll horizontally; give each pinned column an explicit numeric `width` so its frozen offset lines up. Sticky positioning is web-only (a no-op on native).

```tsx
import { DataTable } from '@plocks/ui';
import type { DataTableColumn } from '@plocks/ui';

type Server = {
  id: number;
  host: string;
  region: string;
  cpu: string;
  memory: string;
  uptime: string;
  status: 'healthy' | 'degraded' | 'offline';
};

const REGIONS = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-south-1'];
const STATUSES: Server['status'][] = ['healthy', 'degraded', 'offline'];

const rows: Server[] = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  host: `node-${String(i + 1).padStart(2, '0')}.cluster.internal`,
  region: REGIONS[i % REGIONS.length],
  cpu: `${((i * 7) % 90) + 5}%`,
  memory: `${((i * 13) % 80) + 10}%`,
  uptime: `${(i % 30) + 1}d`,
  status: STATUSES[i % STATUSES.length],
}));

const columns: DataTableColumn<Server>[] = [
  // Pinned left, so the host stays visible while the rest scroll horizontally.
  { key: 'host', header: 'Host', accessor: 'host', sticky: 'left', width: 240, sortable: true },
  { key: 'region', header: 'Region', accessor: 'region', width: 160, sortable: true },
  { key: 'cpu', header: 'CPU', accessor: 'cpu', width: 120, align: 'right', sortable: true },
  { key: 'memory', header: 'Memory', accessor: 'memory', width: 120, align: 'right', sortable: true },
  { key: 'uptime', header: 'Uptime', accessor: 'uptime', width: 120, align: 'right' },
  { key: 'status', header: 'Status', accessor: 'status', sticky: 'right', width: 140, sortable: true },
];

export function Demo() {
  return (
    <DataTable
      data={rows}
      columns={columns}
      getRowId={(row) => row.id}
      h={320}
      fullWidth={false}
      searchable={false}
    />
  );
}
```

### Server-side pagination

Set `manualPagination` when the data comes from a paginated API. The `data` prop is treated as the already-fetched current page — the table does no client-side slicing, filtering, or sorting — and `pagination.total` drives the page count and "X-Y of N" summary. The sort, filter, search, and page controls still fire their callbacks (`onSortChange`, `onFilterChange`, `onSearchChange`, `onPaginationChange`) so you can refetch. Pair it with `loading` to show the skeleton during each fetch.

```tsx
import { useEffect, useState } from 'react';
import { DataTable } from '@plocks/ui';
import type { DataTableColumn, DataTablePagination, DataTableSort } from '@plocks/ui';

type Order = {
  id: number;
  customer: string;
  product: string;
  amount: number;
};

// Pretend this table lives on a server; the component only ever sees one page.
const DB: Order[] = Array.from({ length: 137 }, (_, i) => ({
  id: i + 1,
  customer: `Customer ${String(i + 1).padStart(3, '0')}`,
  product: ['Starter', 'Pro', 'Team', 'Enterprise'][i % 4],
  amount: Math.round(((i * 37) % 900) + 100),
}));

// Simulate an API endpoint: GET /orders?page&pageSize&sort
function fetchOrders(
  page: number,
  pageSize: number,
  sort?: DataTableSort
): Promise<{ rows: Order[]; total: number }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const sorted = [...DB];
      if (sort?.direction) {
        sorted.sort((a, b) => {
          const av = a[sort.column as keyof Order];
          const bv = b[sort.column as keyof Order];
          const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
          return sort.direction === 'desc' ? -cmp : cmp;
        });
      }
      const start = (page - 1) * pageSize;
      resolve({ rows: sorted.slice(start, start + pageSize), total: DB.length });
    }, 500);
  });
}

const columns: DataTableColumn<Order>[] = [
  { key: 'id', header: 'Order', accessor: 'id', sortable: true, dataType: 'number' },
  { key: 'customer', header: 'Customer', accessor: 'customer', sortable: true },
  { key: 'product', header: 'Plan', accessor: 'product', sortable: true },
  { key: 'amount', header: 'Amount', accessor: 'amount', sortable: true, dataType: 'currency' },
];

export function Demo() {
  const [rows, setRows] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<DataTableSort[]>([]);
  const [pagination, setPagination] = useState<DataTablePagination>({ page: 1, pageSize: 10, total: 0 });

  // Refetch whenever the page, page size, or sort changes.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchOrders(pagination.page, pagination.pageSize, sortBy[0]).then((res) => {
      if (cancelled) return;
      setRows(res.rows);
      setPagination((p) => (p.total === res.total ? p : { ...p, total: res.total }));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [pagination.page, pagination.pageSize, sortBy]);

  return (
    <DataTable
      data={rows}
      columns={columns}
      loading={loading}
      manualPagination
      pagination={pagination}
      onPaginationChange={setPagination}
      sortBy={sortBy}
      onSortChange={setSortBy}
      getRowId={(row) => row.id}
      searchable={false}
    />
  );
}
```
