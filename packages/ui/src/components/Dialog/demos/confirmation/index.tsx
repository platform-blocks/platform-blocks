import { Block, Button, Row, Text, useDialog } from '@plocks/ui';

export function Demo() {
  const { openDialog, closeDialog } = useDialog();

  const showConfirmationDialog = () => {
    const dialogId = openDialog({
      variant: 'modal',
      title: 'Confirm Action',
      content: (
        <Block>
          <Text>Are you sure you want to delete this item?</Text>
          <Text size="sm" c="secondary">
            This action cannot be undone.
          </Text>
          <Row gap="sm" justify="flex-end" mt="sm">
            <Button variant="subtle" onPress={() => closeDialog(dialogId)}>
              Cancel
            </Button>
            <Button variant="filled" color="error" onPress={() => closeDialog(dialogId)}>
              Delete
            </Button>
          </Row>
        </Block>
      )
    });
  };

  return (
    <Button onPress={showConfirmationDialog}>Show Confirmation</Button>
  );
}
