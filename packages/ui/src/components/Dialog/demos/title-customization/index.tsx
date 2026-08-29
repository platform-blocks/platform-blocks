import { Block, Button, Text, useDialog } from '@platform-blocks/ui';

export function Demo() {
  const { openDialog, closeDialog } = useDialog();

  const open = (titleProps: any) => {
    const id = openDialog({
      variant: 'modal',
      title: 'Welcome aboard',
      titleProps,
      content: (
        <Block p="md">
          <Text>Dialog title styled via `titleProps`.</Text>
          <Button onPress={() => closeDialog(id)}>Close</Button>
        </Block>
      ),
    });
  };

  return (
    <Block>
      <Button onPress={() => open(undefined)}>Default</Button>
      <Button
        onPress={() =>
          open({
            uppercase: true,
            tracking: 1.5,
            weight: '700',
            size: 'sm',
          })
        }
      >
        Uppercase tracked
      </Button>
      <Button
        onPress={() =>
          open({
            ff: 'Georgia, serif',
            size: 'xl',
            weight: '600',
          })
        }
      >
        Serif headline
      </Button>
      <Button
        onPress={() =>
          open({
            color: 'primary',
            weight: '700',
            ff: 'monospace',
          })
        }
      >
        Brand-coloured monospace
      </Button>
    </Block>
  );
}
