import { Block, Button, Row, Switch, useHaptics, useHapticsSettings } from '@plocks/ui';

export function Demo() {
  const { enabled, setEnabled, temporarilyDisable } = useHapticsSettings();
  const { notifySuccess } = useHaptics();

  return (
    <Block align="flex-start">
      <Switch label="Haptics" checked={enabled} onChange={setEnabled} />

      <Row gap="sm" wrap="wrap">
        <Button onPress={notifySuccess}>Buzz</Button>
        <Button variant="outline" disabled={!enabled} onPress={() => temporarilyDisable(3000)}>
          Pause 3s
        </Button>
      </Row>
    </Block>
  );
}
