import { Block, Button, Row, Text, useDialog } from '@platform-blocks/ui';

export function Demo() {
  const { openDialog, closeDialog } = useDialog();

  const showBasicDialog = () => {
    const dialogId = openDialog({
      variant: 'modal',
      title: 'Basic Dialog',
      content: (
        <Block>
          <Text>This is a basic modal dialog with theme-aware styling.</Text>
          <Row gap="sm" justify="flex-end" mt="sm">
            <Button variant="secondary" onPress={() => closeDialog(dialogId)}>
              Cancel
            </Button>
            <Button variant="filled" onPress={() => closeDialog(dialogId)}>
              OK
            </Button>
          </Row>
        </Block>
      )
    });
  };

  return (
    <Button onPress={showBasicDialog}>Open Basic Dialog</Button>
  );
}
