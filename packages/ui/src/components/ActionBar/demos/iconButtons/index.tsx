import { useState } from 'react';
import { ActionBar, Block, Button, IconButton, Tooltip } from '@plocks/ui';

export function Demo() {
  const [opened, setOpened] = useState(false);
  return (
    <Block fullWidth>
      <Button onPress={() => setOpened(true)}>Show actions</Button>
      <ActionBar opened={opened} onClose={() => setOpened(false)}>
        <Tooltip label="Archive">
          <IconButton icon="archive" accessibilityLabel="Archive" variant="ghost" />
        </Tooltip>
        <ActionBar.Divider />
        <Tooltip label="Delete">
          <IconButton icon="trash" accessibilityLabel="Delete" variant="ghost" />
        </Tooltip>
        <ActionBar.CloseButton />
      </ActionBar>
    </Block>
  );
}
