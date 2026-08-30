import { Button, useToast } from '@platform-blocks/react-ui-library';

export function Demo() {
  const toast = useToast();

  const handlePress = () => {
    toast.success({
      title: 'Success!',
      message: 'The operation finished without issues.',
      autoHide: 4000,
    });
  };

  return <Button onPress={handlePress}>Show success toast</Button>;
}
