import { useState } from 'react';
import { ActionBar, Block, Button, Text } from '@plocks/ui';

export function Demo() {
  const [opened, setOpened] = useState(false);
  return (
    <Block fullWidth>
      <Button onPress={() => setOpened(true)}>Show top bar</Button>
      <ActionBar
        opened={opened}
        onClose={() => setOpened(false)}
        position={{ top: 24, end: 24 }}
        transition="slide-up"
        closeOnEscape
      >
        <Text>Top end</Text>
        <ActionBar.CloseButton />
      </ActionBar>
    </Block>
  );
}
