import { Alert } from 'react-native';

import { Block, Button, Row, Text, useDialog } from '@platform-blocks/ui';

export function Demo() {
  const { openDialog, closeDialog } = useDialog();

  const showConfirmationDialog = () => {
    const dialogId = openDialog({
      variant: 'modal',
      title: 'Confirm Action',
      content: (
        <Block p="md">
          <Text>Are you sure you want to delete this item?</Text>
          <Text size="sm" color="secondary">
            This action cannot be undone.
          </Text>

          <Row gap="sm" mt="sm">
            <Block grow={1}>
              <Button fullWidth variant="subtle" onPress={() => closeDialog(dialogId)}>
                Cancel
              </Button>
            </Block>
            <Block grow={1}>
              <Button
                fullWidth
                variant="filled"
                color="error"
                onPress={() => {
                  Alert.alert('Deleted', 'Item has been deleted');
                  closeDialog(dialogId);
                }}
              >
                Delete
              </Button>
            </Block>
          </Row>
        </Block>
      )
    });
  };

  return (
    <Button onPress={showConfirmationDialog}>Show Confirmation</Button>
  );
}
