import { useState } from 'react';
import { Block, Button, Card, Text, useEscapeKey } from '@platform-blocks/ui';

export function Demo() {
  const [open, setOpen] = useState(true);

  // The listener is only registered while the panel is visible.
  useEscapeKey(() => setOpen(false), open);

  return (
    <Block align="flex-start">
      {open ? (
        <Card p="md" maxW={360}>
          <Block>
            <Text size="sm" weight="semibold">Escape-enabled panel</Text>
            <Text size="sm" color="muted">
              Press Escape to close this panel without touching the mouse.
            </Text>
            <Button size="sm" onPress={() => setOpen(false)}>Close</Button>
          </Block>
        </Card>
      ) : (
        <Button variant="outline" onPress={() => setOpen(true)}>Reopen panel</Button>
      )}
    </Block>
  );
}
