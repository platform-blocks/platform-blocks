import { Block, Row, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Row gap="sm" wrap="wrap">
      <Block bg="primary" p="sm" radius="md">
        <Text>primary</Text>
      </Block>
      <Block bg="success" p="sm" radius="md">
        <Text>success</Text>
      </Block>
      <Block bg="warning" p="sm" radius="md">
        <Text>warning</Text>
      </Block>
      <Block bg="error" p="sm" radius="md">
        <Text>error</Text>
      </Block>
      <Block bg="primary.6" p="sm" radius="md">
        <Text c="white">primary.6</Text>
      </Block>
      <Block bg="gray.2" p="sm" radius="md">
        <Text>gray.2</Text>
      </Block>
      <Block bg="surface" p="sm" radius="md" borderWidth={1} borderColor="#ddd">
        <Text>surface</Text>
      </Block>
      <Block bg="subtle" p="sm" radius="md">
        <Text>subtle</Text>
      </Block>
      <Block bg="#a855f7" p="sm" radius="md">
        <Text c="white">#a855f7</Text>
      </Block>
    </Row>
  );
}
