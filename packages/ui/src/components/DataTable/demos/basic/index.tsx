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
