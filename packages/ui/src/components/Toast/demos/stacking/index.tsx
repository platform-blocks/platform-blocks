import { useRef } from 'react';

import { Block, Button, Text, useToast } from '@platform-blocks/react-ui-library';

export function Demo() {
  const toast = useToast();
  const counter = useRef(0);

  const push = () => {
    counter.current += 1;
    const n = counter.current;
    toast.show({
      title: `Message ${n}`,
      message: 'Dismiss one from the middle to watch the stack close the gap.',
      severity: (['info', 'success', 'warning', 'error'] as const)[n % 4],
      autoHide: 6000,
    });
  };

  const pushBurst = () => {
    toast.batch(
      Array.from({ length: 5 }, (_, index) => ({
        title: `Burst ${index + 1}`,
        message: 'Five at once — the limit retires the oldest.',
        severity: 'info' as const,
      }))
    );
  };

  return (
    <Block>
      <Button onPress={push}>Add a toast</Button>
      <Button variant="outline" onPress={pushBurst}>
        Add five at once
      </Button>
      <Button variant="outline" onPress={() => toast.hideAll()}>
        Dismiss all
      </Button>
      <Text size="xs" color="secondary">
        Hover the stack to hold every toast open.
      </Text>
    </Block>
  );
}
