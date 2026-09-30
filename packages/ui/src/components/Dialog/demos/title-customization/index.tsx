import { Block, Button, Text, useDialog, type DialogConfig } from '@plocks/ui';

export function Demo() {
  const { openDialog } = useDialog();

  const open = (titleProps: DialogConfig['titleProps']) => {
    openDialog({
      variant: 'modal',
      title: 'Welcome aboard',
      titleProps,
      content: <Text>Dialog title styled via `titleProps`.</Text>,
    });
  };

  return (
    <Block>
      <Button onPress={() => open(undefined)}>Default</Button>
      <Button
        onPress={() =>
          open({
            tt: 'uppercase',
            lts: 1.5,
            fw: '700',
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
            fw: '600',
          })
        }
      >
        Serif headline
      </Button>
      <Button
        onPress={() =>
          open({
            c: 'primary',
            fw: '700',
            ff: 'monospace',
          })
        }
      >
        Brand-coloured monospace
      </Button>
    </Block>
  );
}
