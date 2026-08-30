import { useState } from 'react';
import { Block, DataTable, Text } from '@platform-blocks/react-ui-library';
import type { DataTableColumn } from '@platform-blocks/react-ui-library';

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
          <Text color="muted">{project.summary}</Text>
        </Block>
      )}
      searchable={false}
    />
  );
}
