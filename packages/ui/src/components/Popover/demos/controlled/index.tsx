import { useState } from 'react';
import { Block, Button, Checkbox, Input, Popover, Text } from '@plocks/ui';

export function Demo() {
  const [opened, setOpened] = useState(false);

  return (
    <Block>
      <Checkbox
        label="Show popover"
        checked={opened}
        onChange={setOpened}
      />
      <Popover opened={opened} onChange={setOpened}>
        <Popover.Target>
          <Button>
            Invite teammate
          </Button>
        </Popover.Target>
        <Popover.Dropdown>
          <Block p="sm">
            <Text fw="semibold">Invite team member</Text>
            <Input
              label="Email"
              placeholder="name@example.com"
              size="sm"
              fullWidth
            />
            <Button size="xs" onPress={() => setOpened(false)}>
              Send invite
            </Button>
          </Block>
        </Popover.Dropdown>
      </Popover>
    </Block>
  );
}
