import { Block, Card, Row, Surface, Text } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Surface padding="md" radius="lg" fullWidth>
        <Row align="center" justify="space-between">
          <Text size="sm">Surface</Text>
          <Text size="sm" c="muted">
            level 1
          </Text>
        </Row>
      </Surface>

      <Card variant="elevated" radius="lg" fullWidth>
        <Row align="center" justify="space-between">
          <Text size="sm">Card</Text>
          <Text size="sm" c="muted">
            level 2
          </Text>
        </Row>
      </Card>
    </Block>
  );
}
