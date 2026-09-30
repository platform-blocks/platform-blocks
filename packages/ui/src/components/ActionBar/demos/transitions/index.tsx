import { useState } from 'react';
import { ActionBar, Block, Button, Text } from '@plocks/ui';

export function Demo() {
  const [opened, setOpened] = useState(false);
  return (
    <Block fullWidth>
      <Button onPress={() => setOpened(true)}>Show slide transition</Button>
      <ActionBar
        opened={opened}
        onClose={() => setOpened(false)}
        transition="slide-up"
        transitionDuration={300}
      >
        <Text>Sliding actions</Text>
        <ActionBar.CloseButton />
      </ActionBar>
    </Block>
  );
}
