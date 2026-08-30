import { DataTable } from '@platform-blocks/react-ui-library';
import type { DataTableColumn } from '@platform-blocks/react-ui-library';

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
