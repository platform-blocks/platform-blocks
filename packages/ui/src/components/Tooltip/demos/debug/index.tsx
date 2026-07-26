import { useState } from 'react';
import { Block, Button, Card, Text, Tooltip } from '@platform-blocks/ui';

export default function Demo() {
  const [opened, setOpened] = useState(false);

  return (
    <Card p="md">
      <Block>
        <Text size="sm" colorVariant="secondary">
          Control `opened` manually when tooltips should sync with another piece of UI state.
        </Text>
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
    </Card>
  );
}
