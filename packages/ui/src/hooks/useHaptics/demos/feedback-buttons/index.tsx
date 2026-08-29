import { Block, Button, Row, Text, useHaptics } from '@platform-blocks/ui';

export function Demo() {
  const { impactPressIn, impactPressOut, notifySuccess, notifyWarning, notifyError, selection } = useHaptics({ throttleMs: 80 });

  return (
    <Block align="flex-start">
      <Row gap="sm" wrap="wrap">
        <Button onPressIn={impactPressIn} onPressOut={impactPressOut}>Press feedback</Button>
        <Button variant="outline" onPress={selection}>Selection feedback</Button>
      </Row>
      <Text size="sm" weight="semibold">Notifications</Text>
      <Row gap="sm" wrap="wrap">
        <Button size="sm" color="success" onPress={notifySuccess}>Success</Button>
        <Button size="sm" color="warning" onPress={notifyWarning}>Warning</Button>
        <Button size="sm" color="error" onPress={notifyError}>Error</Button>
      </Row>
    </Block>
  );
}
