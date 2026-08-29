import { useState } from 'react';
import { DataTable } from '@platform-blocks/ui';
import type { DataTableColumn, DataTableFilter } from '@platform-blocks/ui';

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
