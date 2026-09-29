import { useState } from 'react';
import { Block, Button, Tooltip } from '@platform-blocks/ui';

export function Demo() {
  const [opened, setOpened] = useState(false);

  return (
    <Block>
      <Tooltip
        label="Shown programmatically"
        opened={opened}
        events={{ hover: false, focus: false, touch: false }}
      >
        <Button size="sm" variant="outline">
          Controlled tooltip
        </Button>
      </Tooltip>
      <Button size="xs" onPress={() => setOpened((value) => !value)}>
        {opened ? 'Hide tooltip' : 'Show tooltip'}
      </Button>
    </Block>
  );
}
