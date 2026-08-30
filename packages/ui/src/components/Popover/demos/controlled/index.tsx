import { useState } from 'react';
import { Block, Button, Checkbox, Input, Popover, Text } from '@platform-blocks/react-ui-library';

export function Demo() {
  const [opened, setOpened] = useState(false);
  const [email, setEmail] = useState('team@example.com');

  return (
    <Block>
      <Checkbox
        label="Show popover"
        checked={opened}
        onChange={setOpened}
      />
      <Popover opened={opened} onChange={setOpened} trapFocus>
        <Popover.Target>
          <Button>
            Invite teammate
          </Button>
        </Popover.Target>
        <Popover.Dropdown>
          <Block p="sm" >
            <Text weight="semibold">Invite team member</Text>
            <Input
              label="Email"
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
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
