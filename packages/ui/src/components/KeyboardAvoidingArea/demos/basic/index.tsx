import { Block, Input, KeyboardAvoidingArea } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth h={220}>
      <KeyboardAvoidingArea flex={1} p="md">
        <Input label="Message" placeholder="Type a message" />
      </KeyboardAvoidingArea>
    </Block>
  );
}
