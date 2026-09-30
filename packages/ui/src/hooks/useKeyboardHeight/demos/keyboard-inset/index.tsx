import { Block, Input, Text, useKeyboardHeight } from '@plocks/ui';

export function Demo() {
  const keyboardHeight = useKeyboardHeight();

  return (
    <Block fullWidth gap="sm">
      <Input placeholder="Focus to open the keyboard" />
      <Text c="muted">Keyboard: {keyboardHeight}px</Text>
    </Block>
  );
}
