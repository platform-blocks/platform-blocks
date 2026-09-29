import { Button, useToast } from '@platform-blocks/ui';

export function Demo() {
  const toast = useToast();

  return (
    <Button
      onPress={() =>
        toast.show({
          title: 'Bold uppercase title',
          message: 'Title rendered with monospace + tracking.',
          severity: 'success',
          titleProps: {
            ff: 'monospace',
            fw: '700',
            tt: 'uppercase',
            lts: 1,
            size: 'sm',
          },
          bodyProps: { size: 'sm' },
        })
      }
    >
      Show custom toast
    </Button>
  );
}
