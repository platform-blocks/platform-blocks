import { Block, Chip, Table, Text } from '@platform-blocks/ui';
import { rows } from './data';

export default function Demo() {
  return (
    <Block>
      <Text size="sm" colorVariant="secondary">
        Compose tables manually for rich cells, spanning, or custom headers.
      </Text>
      <Table withTableBorder fullWidth>
        <Table.Caption>Manually composed table with rich cell content</Table.Caption>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Stack</Table.Th>
            <Table.Th align="center">Status</Table.Th>
            <Table.Th align="right">Stars</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((row) => (
            <Table.Tr key={row.name}>
              <Table.Td>{row.name}</Table.Td>
              <Table.Td>{row.stack}</Table.Td>
              <Table.Td align="center">
                <Chip size="xs" color={row.status === 'stable' ? 'success' : 'primary'} variant="light">
                  {row.status}
                </Chip>
              </Table.Td>
              <Table.Td align="right" widthStrategy="min-content">
                {row.stars.toLocaleString()}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Block>
  );
}
