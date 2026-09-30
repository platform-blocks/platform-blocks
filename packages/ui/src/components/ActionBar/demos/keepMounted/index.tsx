import { useState } from 'react';
import { ActionBar, Block, Button, Checkbox } from '@plocks/ui';

export function Demo() {
  const [opened, setOpened] = useState(false);
  return (
    <Block fullWidth>
      <Button onPress={() => setOpened((value) => !value)}>Toggle bar</Button>
      <ActionBar opened={opened} onClose={() => setOpened(false)} keepMounted>
        <Checkbox label="Keep this choice" />
      </ActionBar>
    </Block>
  );
}
