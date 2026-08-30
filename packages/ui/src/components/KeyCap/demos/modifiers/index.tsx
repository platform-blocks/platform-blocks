import { Block, KeyCap, Row, Text } from '@platform-blocks/react-ui-library';

export function Demo() {
  return (
    <Block>
      <Row gap="xs" align="center">
        <Text>Copy</Text>
        <KeyCap keyCode="C" modifiers={['cmd']} size="sm">⌘</KeyCap>
        <Text>+</Text>
        <KeyCap keyCode="C" modifiers={['cmd']} size="sm">C</KeyCap>
      </Row>
      <Row gap="xs" align="center">
        <Text>Save</Text>
        <KeyCap keyCode="S" modifiers={['cmd']} size="sm">⌘</KeyCap>
        <Text>+</Text>
        <KeyCap keyCode="S" modifiers={['cmd']} size="sm">S</KeyCap>
      </Row>
      <Row gap="xs" align="center">
        <Text>Undo</Text>
        <KeyCap keyCode="Z" modifiers={['cmd']} size="sm">⌘</KeyCap>
        <Text>+</Text>
        <KeyCap keyCode="Z" modifiers={['cmd']} size="sm">Z</KeyCap>
      </Row>
    </Block>
  );
}


