import { Block, Button, DataList, KeyCap, Row, Text, useThemeMode, useToggleColorScheme } from '@platform-blocks/ui';

export default function Demo() {
  const { mode, cycleMode, actualColorScheme } = useThemeMode();

  useToggleColorScheme(cycleMode);

  return (
    <Block align="flex-start" maxW={420}>
      <DataList
        labelWidth={130}
        data={[
          { label: 'Current mode', value: mode },
          { label: 'Active scheme', value: actualColorScheme }
        ]}
      />
      <Button onPress={cycleMode}>Toggle theme</Button>
      <Row gap="xs" align="center">
        <Text size="xs" colorVariant="muted">Or press</Text>
        <KeyCap keyCode="J" modifiers={['cmd']} size="sm">⌘</KeyCap>
        <KeyCap keyCode="J" modifiers={['cmd']} size="sm">J</KeyCap>
        <Text size="xs" colorVariant="muted">anywhere in the docs.</Text>
      </Row>
    </Block>
  );
}
