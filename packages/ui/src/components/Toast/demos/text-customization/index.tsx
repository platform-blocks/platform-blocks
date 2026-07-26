import { Block, Button, useToast } from '@platform-blocks/ui';

export default function Demo() {
  const toast = useToast();

  return (
    <Block>
      <Button
        onPress={() => {
          toast.show({
            title: 'Default styling',
            message: 'No custom title or body props.',
            sev: 'info',
            autoHide: 4000,
          });
        }}
      >
        Default toast
      </Button>

      <Button
        onPress={() => {
          toast.show({
            title: 'Bold uppercase title',
            message: 'Title rendered with monospace + tracking.',
            sev: 'success',
            autoHide: 4000,
            titleProps: {
              ff: 'monospace',
              weight: '700',
              uppercase: true,
              tracking: 1,
              size: 'sm',
            },
            bodyProps: { size: 'sm' },
          });
        }}
      >
        Tracked uppercase title
      </Button>

      <Button
        onPress={() => {
          toast.show({
            title: 'Brand serif title',
            message: 'Title in Georgia, body in default font.',
            sev: 'warning',
            autoHide: 4000,
            titleProps: { ff: 'Georgia, serif', size: 'lg' },
          });
        }}
      >
        Custom font on title
      </Button>
    </Block>
  );
}
