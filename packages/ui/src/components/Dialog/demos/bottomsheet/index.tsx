import { Block, Button, Text, useDialog } from '@plocks/ui';

export function Demo() {
  const { openDialog, closeDialog } = useDialog();

  const showBottomSheetDialog = () => {
    const dialogId = openDialog({
      variant: 'bottomsheet',
      content: (
        <Block>
          <Text>This dialog slides up from the bottom with theme-aware styling.</Text>
          <Button variant="subtle" onPress={() => closeDialog(dialogId)}>
            Close
          </Button>
        </Block>
      )
    });
  };

  return (
    <Button onPress={showBottomSheetDialog}>Open Bottom Sheet</Button>
  );
}
