import { useState } from 'react';

import { Block, Button, Card, Spoiler, Text } from '@platform-blocks/react-ui-library';

export function Demo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card p="md">
      <Block>
        <Text size="sm" color="secondary">
          Drive the spoiler state yourself to sync analytics or a sibling component. Use renderControl when you need a bespoke trigger.
        </Text>
        <Spoiler
          maxHeight={80}
          opened={isOpen}
          onToggle={setIsOpen}
          renderControl={({ opened, toggle }) => (
            <Button size="xs" variant="outline" onPress={toggle}>
              {opened ? 'Collapse content' : 'Expand content'}
            </Button>
          )}
        >
          <Block>
            <Text size="sm">Open state: {String(isOpen)}</Text>
            <Text size="sm">You can render any React node as the control.</Text>
            <Text size="sm">
              Because the component is controlled, you can track expansion analytics or sync other UI elements when content is revealed.
            </Text>
          </Block>
        </Spoiler>
      </Block>
    </Card>
  );
}
