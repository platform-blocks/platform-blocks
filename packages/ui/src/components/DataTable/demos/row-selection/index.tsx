import { useState } from 'react';
import { Block, DataTable, Text } from '@platform-blocks/ui';
import type { DataTableColumn, DataTablePagination } from '@platform-blocks/ui';

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
