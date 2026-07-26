import { useRef } from 'react';
import { Alert, TextInput } from 'react-native';

import { Block, Button, Input, Row, Text, useDialog } from '@platform-blocks/ui';

export default function Demo() {
  const { openDialog, closeDialog } = useDialog();
  const nameRef = useRef<TextInput>(null);

  const showFormDialog = () => {
    let formData = { name: '', email: '' };

    const dialogId = openDialog({
      variant: 'modal',
      title: 'Create Account',
      // Focus the name field once the open transition settles. `autoFocus: true`
      // picks the first focusable field automatically, but only on web — a ref
      // works on every platform.
      autoFocus: nameRef,
      content: (
        <Block p="md">
          <Text size="sm" colorVariant="secondary">
            Fill in your details to create an account.
          </Text>

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

          <Row gap="sm" mt="sm">
            <Block grow={1}>
              <Button fullWidth variant="secondary" onPress={() => closeDialog(dialogId)}>
                Cancel
              </Button>
            </Block>
            <Block grow={1}>
              <Button
                fullWidth
                onPress={() => {
                  if (!formData.name || !formData.email) {
                    Alert.alert('Error', 'Please fill in all fields');
                    return;
                  }

                  Alert.alert('Success', `Account created for ${formData.name}`);
                  closeDialog(dialogId);
                }}
                variant="filled"
              >
                Create account
              </Button>
            </Block>
          </Row>
        </Block>
      )
    });
  };

  return (
    <Button onPress={showFormDialog}>Open Form Dialog</Button>
  );
}
