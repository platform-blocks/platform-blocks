import { Block, Row, Text } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Block>
      <Block>
        <Text size="sm" color="muted">Palette names → subtle tint (shade-1)</Text>
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
        </Row>
      </Block>

      <Block>
        <Text size="sm" color="muted">
          Specific shade with `palette.shade` syntax
        </Text>
        <Row gap="sm" wrap="wrap">
          <Block bg="primary.6" p="sm" radius="md">
            <Text c="dimmed" style={{ color: '#fff' }}>primary.6</Text>
          </Block>
          <Block bg="gray.2" p="sm" radius="md">
            <Text>gray.2</Text>
          </Block>
        </Row>
      </Block>

      <Block>
        <Text size="sm" color="muted">Theme background keys</Text>
        <Row gap="sm" wrap="wrap">
          <Block bg="surface" p="sm" radius="md" borderWidth={1} borderColor="#ddd">
            <Text>surface</Text>
          </Block>
          <Block bg="subtle" p="sm" radius="md">
            <Text>subtle</Text>
          </Block>
        </Row>
      </Block>

      <Block>
        <Text size="sm" color="muted">Plain CSS color string still works</Text>
        <Block bg="#a855f7" p="sm" radius="md">
          <Text style={{ color: '#fff' }}>Custom hex</Text>
        </Block>
      </Block>
    </Block>
  );
}
