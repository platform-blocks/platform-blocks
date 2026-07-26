import { Alert } from 'react-native';

import { Block, Button, Row, Text, useDialog } from '@platform-blocks/ui';

export default function Demo() {
  const { openDialog, closeDialog } = useDialog();

  const showBasicDialog = () => {
    const dialogId = openDialog({
      variant: 'modal',
      title: 'Basic Dialog',
      content: (
        <Block p="md">
          <Text>This is a basic modal dialog with theme-aware styling.</Text>
          <Text size="sm" colorVariant="secondary">
            Works in both light and dark mode.
          </Text>
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
                  Alert.alert('Action', 'OK button pressed!');
                  closeDialog(dialogId);
                }}
                variant="filled"
              >
                OK
              </Button>
            </Block>
          </Row>
        </Block>
      )
    });
  };

  return (
    <Button onPress={showBasicDialog}>Open Basic Dialog</Button>
  );
}
