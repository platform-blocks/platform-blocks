import { Badge, Block, Button, Input, Row, Text, useKeyboardManager } from '@plocks/ui';

export function Demo() {
  const { isKeyboardVisible, keyboardHeight, dismissKeyboard, refocus } = useKeyboardManager();

  return (
    <Block fullWidth maw={360}>
      <Input label="Message" keyboardFocusId="message" />

      <Row gap="sm" align="center">
        <Badge c={isKeyboardVisible ? 'success' : 'gray'}>
          {isKeyboardVisible ? 'Visible' : 'Hidden'}
        </Badge>
        <Text ff="monospace">{Math.round(keyboardHeight)}px</Text>
      </Row>

      <Row gap="sm">
        <Button onPress={() => refocus('message')}>Focus</Button>
        <Button variant="outline" onPress={dismissKeyboard}>
          Dismiss
        </Button>
      </Row>
    </Block>
  );
}
