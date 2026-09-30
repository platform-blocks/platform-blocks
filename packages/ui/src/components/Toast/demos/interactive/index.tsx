import { Block, Button, useToast } from '@plocks/ui';

export function Demo() {
  const toast = useToast();

  const showActionToast = () => {
    toast.show({
      title: 'File uploaded',
      message: 'Your file has been uploaded successfully.',
      actions: [
        {
          label: 'Undo',
          onPress: () => toast.info('Upload reverted'),
        },
      ],
    });
  };

  const showPersistentToast = () => {
    toast.show({
      title: 'Important notice',
      message: 'This toast stays visible until dismissed.',
      persistent: true,
    });
  };

  const showTimedToast = () => {
    toast.show({
      title: 'Quick message',
      message: 'This one hides after two seconds.',
      autoHide: 2000,
    });
  };

  return (
    <Block>
      <Button onPress={showActionToast}>Toast with action</Button>
      <Button variant="outline" onPress={showPersistentToast}>
        Persistent toast
      </Button>
      <Button variant="outline" onPress={showTimedToast}>
        Quick toast (2s)
      </Button>
    </Block>
  );
}
