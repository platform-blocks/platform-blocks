import { Block, Card, Row, Surface, Text } from '@platform-blocks/react-ui-library';

export function Demo() {
  return (
    <Block fullWidth>
      <Surface level={1} padding="md" radius="lg" fullWidth>
        <Row align="center" justify="space-between">
          <Text size="sm">Surface — elevation only</Text>
          <Text size="sm" color="muted">
            level 1
          </Text>
        </Row>
      </Surface>

      <Card variant="elevated" padding="md" radius="lg" fullWidth>
        <Row align="center" justify="space-between">
          <Text size="sm">Card — Surface + padding + sections</Text>
          <Text size="sm" color="muted">
            level 2
          </Text>
        </Row>
      </Card>
    </Block>
  );
}
