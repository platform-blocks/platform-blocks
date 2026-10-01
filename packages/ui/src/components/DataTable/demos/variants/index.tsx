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
