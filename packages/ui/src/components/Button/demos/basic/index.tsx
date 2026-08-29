import { Block, Button, useToast } from '@platform-blocks/ui';

export function Demo() {
  const toast = useToast();

  return (
    <Block align="flex-start">
      <Button
        title="Launch mission"
        onPress={() => toast.success('Launch command sent')}
      />
      <Button
        title="Abort"
        onPress={() => toast.error('Sequence aborted')}
      />
    </Block>
  );
}
