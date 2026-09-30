import { useState } from 'react';
import { ActionBar, Block, Button, Text } from '@plocks/ui';

export function Demo() {
  const [opened, setOpened] = useState(false);
  return (
    <Block fullWidth>
      <Button onPress={() => setOpened(true)}>Select items</Button>
      <ActionBar opened={opened} onClose={() => setOpened(false)}>
        <Text>3 selected</Text>
        <ActionBar.Divider />
        <Button size="sm">Delete</Button>
        <ActionBar.CloseButton />
      </ActionBar>
    </Block>
  );
}
