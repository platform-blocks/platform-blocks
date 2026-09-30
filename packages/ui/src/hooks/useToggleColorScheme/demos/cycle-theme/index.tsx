import { Block, Button, DataList, KeyCap, Row, Text, useThemeMode, useToggleColorScheme } from '@plocks/ui';

export function Demo() {
  const { mode, cycleMode, actualColorScheme } = useThemeMode();

  useToggleColorScheme(cycleMode);

  return (
    <Block align="flex-start" maw={420}>
      <DataList
        labelWidth={130}
        data={[
          { label: 'Current mode', value: mode },
          { label: 'Active scheme', value: actualColorScheme }
        ]}
      />
      <Button onPress={cycleMode}>Toggle theme</Button>
      <Row gap="xs" align="center">
        <Text size="xs" c="muted">Or press</Text>
        <KeyCap keyCode="J" modifiers={['cmd']} size="sm">⌘</KeyCap>
        <KeyCap keyCode="J" modifiers={['cmd']} size="sm">J</KeyCap>
        <Text size="xs" c="muted">anywhere in the docs.</Text>
      </Row>
    </Block>
  );
}
