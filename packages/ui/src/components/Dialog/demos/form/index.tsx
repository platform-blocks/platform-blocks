import { useRef } from 'react';
import { TextInput } from 'react-native';

import { Block, Button, Input, Row, useDialog } from '@platform-blocks/ui';

export function Demo() {
  const { openDialog, closeDialog } = useDialog();
  const nameRef = useRef<TextInput>(null);

  const showFormDialog = () => {
    const formData = { name: '', email: '' };

    const dialogId = openDialog({
      variant: 'modal',
      title: 'Create Account',
      // Focus the name field once the open transition settles. `autoFocus: true`
      // picks the first focusable field automatically, but only on web — a ref
      // works on every platform.
      autoFocus: nameRef,
      content: (
        <Block>
          <Input
            inputRef={nameRef}
            placeholder="Your name"
            label="Name"
            onChangeText={(text) => {
              formData.name = text;
            }}
          />

          <Input
            placeholder="your@email.com"
            label="Email"
            keyboardType="email-address"
            onChangeText={(text) => {
              formData.email = text;
            }}
          />

          <Row gap="sm" justify="flex-end" mt="sm">
            <Button variant="secondary" onPress={() => closeDialog(dialogId)}>
              Cancel
            </Button>
            <Button
              variant="filled"
              onPress={() => {
                if (!formData.name || !formData.email) return;
                closeDialog(dialogId);
              }}
            >
              Create account
            </Button>
          </Row>
        </Block>
      )
    });
  };

  return (
    <Button onPress={showFormDialog}>Open Form Dialog</Button>
  );
}
