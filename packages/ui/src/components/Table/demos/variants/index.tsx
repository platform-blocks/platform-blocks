import { Column, Table, Text } from '@plocks/ui';

const data = { head: ['Name', 'Status'], body: [['Avery', 'Active'], ['Jordan', 'Pending']] };
const variants = ['default', 'vertical'] as const;

export function Demo() {
  return (
    <Column gap="lg" fullWidth>
      {variants.map(variant => (
        <Column key={variant} gap="xs" fullWidth>
          <Text fw="semibold">{variant}</Text>
          <Table variant={variant} data={data} withTableBorder fullWidth />
        </Column>
      ))}
    </Column>
  );
}
