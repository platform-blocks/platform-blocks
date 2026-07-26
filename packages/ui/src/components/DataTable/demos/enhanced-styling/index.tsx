import { Avatar, Chip, DataTable, Text } from '@platform-blocks/ui';
import type { DataTableColumn } from '@platform-blocks/ui';

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
        label={<Text weight="semibold">{row.name}</Text>}
        description={<Text variant="small" colorVariant="muted">{row.title}</Text>}
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
        colorVariant={value === 'inactive' ? 'error' : value === 'pending' ? 'warning' : 'success'}
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

export default function Demo() {
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
