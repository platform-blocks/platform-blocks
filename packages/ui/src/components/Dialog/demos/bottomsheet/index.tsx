import { Block, Button, Input, Text, useDialog } from '@platform-blocks/ui';

export function Demo() {
  const { openDialog, closeDialog } = useDialog();

  const showBottomSheetDialog = () => {
    const dialogId = openDialog({
      variant: 'bottomsheet',
      // title: 'Bottom Sheet with Gestures',
      content: (
        <Block>
          <Text>This dialog slides up from the bottom with theme-aware styling.</Text>
          <Block>
            <Text size="sm" color="secondary">
              Drag the handle or surface to move it.
            </Text>
            <Text size="sm" color="secondary">
              Swipe down to dismiss with velocity thresholds.
            </Text>
            <Text size="sm" color="secondary">
              Rubber-band resistance keeps the sheet anchored.
            </Text>
          </Block>
          <Input placeholder="Try typing while dragging..." />
          <Button variant="subtle" onPress={() => closeDialog(dialogId)}>
            Close programmatically
          </Button>
        </Block>
      )
    });
  };

  return (
    <Button onPress={showBottomSheetDialog}>Open Bottom Sheet</Button>
  );
}
