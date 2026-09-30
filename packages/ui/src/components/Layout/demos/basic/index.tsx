import { Block, Column, Row, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Column gap="md" fullWidth>
      <Row gap="sm">
        <Block bg="subtle" p="sm">
          <Text>First</Text>
        </Block>
        <Block bg="subtle" p="sm">
          <Text>Second</Text>
        </Block>
      </Row>
      <Text>Rows place items side by side; columns stack them.</Text>
    </Column>
  );
}
