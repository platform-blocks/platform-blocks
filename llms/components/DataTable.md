# DataTable

The DataTable component provides a feature-rich interface for displaying tabular data with sorting, pagination, row selection, and customizable columns.

## Metadata

- Canonical name: `DataTable`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { DataTable } from '@platform-blocks/react-ui-library';`
- Status: stable
- Category: data
- Docs: https://react-ui-library.com/components/DataTable
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/DataTable

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | string | No |  | Stable id for user preference persistence |
| `data` | T[] | Yes |  | Data rows |
| `columns` | DataTableColumn<T>[] | Yes |  | Column definitions |
| `loading` | boolean | No |  | Loading state |
| `error` | string \| null | No |  | Error message (when defined overrides table body) |
| `emptyMessage` | string | No |  | Message to display when there is no data |
| `searchable` | boolean | No |  | Enable global search input |
| `searchPlaceholder` | string | No |  | Placeholder text for global search |
| `searchValue` | string | No |  | Controlled global search value |
| `onSearchChange` | (value: string) => void | No |  | Global search change handler |
| `sortBy` | DataTableSort[] | No |  | Current sorting state |
| `onSortChange` | (sort: DataTableSort[]) => void | No |  | Sorting change callback |
| `filters` | DataTableFilter[] | No |  | Active column filters |
| `onFilterChange` | (filters: DataTableFilter[]) => void | No |  | Filter change callback |
| `showColumnFilters` | boolean | No |  | Render an always-visible filter row directly beneath the column headers. Each `filterable` column gets an inline control — a text input for text/number/date columns and a dropdown for `select`/`boolean` columns (options auto-derived from the data when `filterOptions` is omitted). This is separate from the per-header filter popover and can be used alongside it. |
| `pagination` | DataTablePagination | No |  | Pagination state |
| `onPaginationChange` | (pagination: DataTablePagination) => void | No |  | Pagination change handler |
| `manualPagination` | boolean | No |  | Server-side (manual) pagination for API-backed tables. When true the `data` prop is treated as the already-fetched current page: the table performs no client-side slicing, filtering, sorting, or search, and uses `pagination.total` as the authoritative row count for the page count and "X-Y of N" summary. The sort / filter / search controls still fire their respective callbacks so you can refetch — use them in controlled mode (`sortBy`+`onSortChange`, `filters`+`onFilterChange`, `searchValue`+ `onSearchChange`). Requires `pagination.total` to be set. |
| `paginationProps` | Omit<PaginationProps, 'current' \| 'total' \| 'onChange'> | No |  | Props forwarded to the underlying `Pagination` component in the footer (e.g. `siblings`, `boundaries`, `variant`, `size`, `color`, `showFirst`, `showPrevNext`, `labels`). Values here override the DataTable defaults, so you can also disable the built-in total (`showTotal={false}`) or size changer (`showSizeChanger={false}`). |
| `selectable` | boolean | No |  | Enable row selection |
| `selectedRows` | (string \| number)[] | No |  | Selected row identifiers |
| `onSelectionChange` | (selected: (string \| number)[]) => void | No |  | Selection change handler |
| `getRowId` | (row: T, index: number) => string \| number | No |  | Function to extract a stable id for each row |
| `onRowClick` | (row: T, index: number) => void | No |  | Row click handler |
| `editMode` | boolean | No |  | Whether table is in edit mode |
| `onEditModeChange` | (editMode: boolean) => void | No |  | Edit mode toggle callback |
| `onCellEdit` | (rowIndex: number, columnKey: string, newValue: any) => void | No |  | Commit cell edit |
| `bulkActions` | Array<{ key: string; label: string; icon?: React.ReactNode; action: (selectedRows: (string \| number)[], data: T[]) => void; }> | No |  | Bulk action definitions |
| `variant` | 'default' \| 'striped' \| 'bordered' | No |  | Visual table variant |
| `density` | 'compact' \| 'normal' \| 'comfortable' | No |  | Row density |
| `height` | number | No |  | Fixed table height (enables internal scroll) |
| `virtual` | boolean | No |  | Enable FlashList-powered virtualization for large datasets |
| `style` | any | No |  | Container style override |
| `enableColumnResizing` | boolean | No |  | Enable interactive column resizing |
| `rowFeatureToggle` | (row: T, index: number) => ({ selectable?: boolean; editable?: boolean; sortable?: boolean; filterable?: boolean; searchable?: boolean; } \| null \| undefined) | No |  | Per-row feature overrides |
| `initialHiddenColumns` | string[] | No |  | Initially hidden column keys |
| `onColumnVisibilityChange` | (hidden: string[]) => void | No |  | Hidden column change callback |
| `showColumnVisibilityManager` | boolean | No |  | Show built-in column visibility manager button |
| `rowsPerPageOptions` | number[] | No |  | Pagination size choices |
| `showRowsPerPageControl` | boolean | No |  | Show rows-per-page selector |
| `rowActions` | (row: T, index: number) => Array<{ key: string; icon?: React.ReactNode; label?: string; onPress?: (row: T, index: number) => void; disabled?: boolean; hidden?: boolean; tooltip?: TooltipPropValue; }> | No |  | Per-row action icon buttons (renders trailing actions column when provided) |
| `actionsColumnWidth` | number | No |  | Width of the actions column |
| `striped` | boolean | No |  | Force striped row backgrounds regardless of variant |
| `headerBackgroundColor` | string | No |  | Custom header background color |
| `enhancedLoading` | boolean | No |  | Show enhanced loading skeletons instead of basic loading text |
| `enhancedEmptyState` | boolean | No |  | Show enhanced empty state with icon and description |
| `enhancedHover` | boolean | No |  | Enable enhanced hover effects |
| `hoverColor` | string | No |  | Custom row hover color |
| `enhancedSelection` | boolean | No |  | Enable enhanced selection styling |
| `showRowDividers` | boolean | No |  | Horizontal hairlines between rows. Defaults to on for `variant="bordered"` and off otherwise; set explicitly to override either way. `rowBorderWidth` takes precedence when provided. |
| `borderColor` | string | No |  | Custom border color for enhanced styling |
| `hoverHighlight` | boolean | No |  | Enable simple row background hover highlight |
| `fullWidth` | boolean | No |  | Make table take full width of container |
| `rowBorderWidth` | number | No |  | Row border width. Overrides `showRowDividers` / the variant default, including at 0. |
| `rowBorderColor` | string | No |  | Custom row border color |
| `rowBorderStyle` | 'solid' \| 'dashed' \| 'dotted' | No |  | Row border style |
| `columnBorderWidth` | number | No |  | Vertical rules between columns, off unless set — `variant="bordered"` only draws row dividers and the outer border. The rule spans the header, filter row, body, and group/footer rows. |
| `columnBorderColor` | string | No |  | Custom column border color |
| `columnBorderStyle` | 'solid' \| 'dashed' \| 'dotted' | No |  | Column border style |
| `showOuterBorder` | boolean | No |  | Whether to show outer border around entire table. Defaults to `true`. |
| `outerBorderWidth` | number | No |  | Outer border width |
| `outerBorderColor` | string | No |  | Outer border color |
| `expandableRowRender` | (row: T, index: number) => React.ReactNode | No |  | Function to render expanded row content |
| `initialExpandedRows` | (string \| number)[] | No |  | Initially expanded row identifiers |
| `expandedRows` | (string \| number)[] | No |  | Controlled expanded rows |
| `onExpandedRowsChange` | (expanded: (string \| number)[]) => void | No |  | Expanded rows change handler |
| `allowMultipleExpanded` | boolean | No |  | Allow multiple rows to be expanded at once |
| `expandIcon` | React.ReactNode | No |  | Custom expand/collapse icons |
| `collapseIcon` | React.ReactNode | No |  |  |
| `headerTextProps` | Omit<TextProps, 'children'> | No |  | Override props applied to every column header `<Text>` (style, weight, ff, size, color). |
| `cellTextProps` | Omit<TextProps, 'children'> | No |  | Override props applied to default-rendered cell text (cells without a custom `cell` renderer). |
| `ariaLabel` | string | No |  | Accessible name for the grid, exposed as `aria-label` on web (screen readers announce it when entering the table). Defaults to "Data table". |
| `exportable` | boolean | No |  | Show a CSV export button in the toolbar. Exports the current view (filtered + sorted, all pages) using the visible columns. |
| `exportFileName` | string | No |  | File name for the downloaded CSV (default: "data.csv"). |
| `onExport` | (csv: string, rows: T[]) => void | No |  | Called with the generated CSV string and the exported rows. When provided it replaces the built-in web download (use it to handle export on native or to post the data elsewhere). |
| `enableColumnReordering` | boolean | No |  | Enable drag-to-reorder of column headers (web). |
| `columnOrder` | string[] | No |  | Controlled column order (array of column keys). |
| `onColumnOrderChange` | (order: string[]) => void | No |  | Called with the new key order after a drag-reorder. |
| `groupBy` | string | No |  | Group rows by this column key. Renders a collapsible group-header row before each group (showing the value, count, and per-column aggregates). Grouping spans all filtered rows, so client pagination is bypassed while active, and it is not applied in `virtual` mode. |
| `groupsDefaultExpanded` | boolean | No |  | Whether groups start expanded (default: true). |
| `renderGroupHeader` | (info: { value: any; rows: T[]; count: number; expanded: boolean; toggle: () => void; }) => React.ReactNode | No |  | Custom renderer for the group-header label cell. |
| `showFooterTotals` | boolean | No |  | Render a footer row with grand-total aggregates for aggregate columns. |
| `footerLabel` | string | No |  | Label shown in the first cell of the footer totals row (default: "Total"). |
| `m` | number | No |  | Margin applied to all sides |
| `mt` | number | No |  | Margin applied to the top side |
| `mr` | number | No |  | Margin applied to the right side |
| `mb` | number | No |  | Margin applied to the bottom side |
| `ml` | number | No |  | Margin applied to the left side |
| `mx` | number | No |  | Horizontal margin applied to left and right sides |
| `my` | number | No |  | Vertical margin applied to top and bottom sides |
| `p` | number | No |  | Padding applied to all sides |
| `pt` | number | No |  | Padding applied to the top side |
| `pr` | number | No |  | Padding applied to the right side |
| `pb` | number | No |  | Padding applied to the bottom side |
| `pl` | number | No |  | Padding applied to the left side |
| `px` | number | No |  | Horizontal padding applied to left and right sides |
| `py` | number | No |  | Vertical padding applied to top and bottom sides |

## Examples

### Getting Started
ID: `DataTable.basic` • Tags: datatable • Category: usage • Status: stable • Since: 1.0.0

Define columns, feed the dataset, and let `DataTable` handle search, sorting, and pagination out of the box.

```tsx
const columns: DataTableColumn<Person>[] = [
  { key: 'name', header: 'Name', accessor: 'name', sortable: true },
  { key: 'email', header: 'Email', accessor: 'email', sortable: true, minWidth: 200 },
  { key: 'title', header: 'Role', accessor: 'title', sortable: true },
  { key: 'department', header: 'Department', accessor: 'department', sortable: true },
];
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

### Column Filters
ID: `DataTable.advanced-filtering` • Tags: datatable, filters • Category: behavior • Status: stable • Since: 1.0.0

Mark columns `filterable` and set `filterType` to pick the control: an input for `text`/`number`/`date`, a dropdown for `select`/`boolean` (options auto-derived from the data when `filterOptions` is omitted). `showColumnFilters` renders those controls as a persistent row under the headers; omit it to keep them in each header's filter menu.

```tsx
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

### Row Selection
ID: `DataTable.row-selection` • Tags: datatable, selection • Category: behavior • Status: stable • Since: 1.0.0

Set `selectable` and wire `selectedRows` / `onSelectionChange` to track checked rows. Give `getRowId` so selection survives sorting and paging.

```tsx
const columns: DataTableColumn<Person>[] = [
  { key: 'name', header: 'Name', accessor: 'name', sortable: true },
  { key: 'email', header: 'Email', accessor: 'email', sortable: true, minWidth: 200 },
  { key: 'role', header: 'Role', accessor: 'role', sortable: true },
];
  const [pagination, setPagination] = useState<DataTablePagination>({
    page: 1,
    pageSize: 5,
    total: people.length,
  });
  const [selectedRows, setSelectedRows] = useState<(string | number)[]>([]);
  return (
    <Block fullWidth>
      <Text size="sm" color={selectedRows.length ? 'primary' : 'muted'}>
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

### Rich Cells
ID: `DataTable.enhanced-styling` • Tags: datatable, styling • Category: appearance • Status: stable • Since: 1.0.0

Combine avatars, chips, and status cues inside custom `cell` renderers to create a readable, on-brand table.

```tsx
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
        label={<Text weight="semibold">{row.name}</Text>}
        description={<Text variant="small" color="muted">{row.title}</Text>}
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
        color={value === 'inactive' ? 'error' : value === 'pending' ? 'warning' : 'success'}
        weight="semibold"
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
    cell: (value) => <Text weight="semibold">{value.toFixed(1)}</Text>,
  },
];
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

### Expandable Rows
ID: `DataTable.expandable-rows` • Tags: datatable, expand • Category: behavior • Status: stable • Since: 1.0.0

Provide `expandedRows`, update them via `onExpandedRowsChange`, and use `expandableRowRender` to reveal supporting context.

```tsx
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
          <Text color="muted">{project.summary}</Text>
        </Block>
      )}
      searchable={false}
    />
  );
}
```

### Grouping & Totals
ID: `DataTable.grouping` • Tags: datatable, grouping, aggregation, totals, footer • Category: behavior • Status: stable • Since: 1.0.0

Set `groupBy` to a column key to group rows under collapsible group-header rows. Add `aggregate` (`sum`, `avg`, `min`, `max`, `count`, or a function) to any column to show its per-group total in the group header, and set `showFooterTotals` for a grand-total footer row aligned to the same columns. Grouping spans all filtered rows, so client pagination is bypassed while it is active.

```tsx
const columns: DataTableColumn<Sale>[] = [
  { key: 'region', header: 'Region', accessor: 'region' },
  { key: 'rep', header: 'Rep', accessor: 'rep', aggregate: 'count' },
  { key: 'product', header: 'Product', accessor: 'product' },
  { key: 'units', header: 'Units', accessor: 'units', dataType: 'number', align: 'right', aggregate: 'sum' },
  { key: 'revenue', header: 'Revenue', accessor: 'revenue', dataType: 'currency', align: 'right', aggregate: 'sum' },
];
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

### Fixed height & sticky columns
ID: `DataTable.fixed-height` • Tags: datatable, height, scroll, sticky-header, sticky, pinned, columns • Category: layout • Status: stable • Since: 1.0.0

Pass a fixed `height` to cap the table's size — the header row stays pinned while the body scrolls, so a long list fits a constrained panel without paginating. Pin columns to the edges with `sticky: 'left'` or `sticky: 'right'` so they stay put while the rest scroll horizontally; give each pinned column an explicit numeric `width` so its frozen offset lines up. Sticky positioning is web-only (a no-op on native).

```tsx
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
  return (
    <DataTable
      data={rows}
      columns={columns}
      getRowId={(row) => row.id}
      height={320}
      fullWidth={false}
      searchable={false}
    />
  );
}
```

### Server-side pagination
ID: `DataTable.server-side` • Tags: datatable, pagination, server, api, manual • Category: usage • Status: stable • Since: 1.0.0

Set `manualPagination` when the data comes from a paginated API. The `data` prop is treated as the already-fetched current page — the table does no client-side slicing, filtering, or sorting — and `pagination.total` drives the page count and "X-Y of N" summary. The sort, filter, search, and page controls still fire their callbacks (`onSortChange`, `onFilterChange`, `onSearchChange`, `onPaginationChange`) so you can refetch. Pair it with `loading` to show the skeleton during each fetch.

```tsx
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
