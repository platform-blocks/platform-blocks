import { Button, useToast } from '@platform-blocks/ui';

export function Demo() {
  const toast = useToast();

  return (
    <Button
      onPress={() =>
        toast.success({
          title: 'Success!',
          message: 'The operation finished without issues.',
        })
      }
    >
      Show success toast
    </Button>
  );
}
