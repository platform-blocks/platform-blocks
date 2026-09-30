import { useState } from 'react';
import { Block, Button, Text, useFloating } from '@plocks/ui';

export function Demo() {
  const [opened, setOpened] = useState(false);
  const floating = useFloating({
    opened,
    onDismiss: () => setOpened(false),
    placement: 'bottom-start',
  });

  return (
    <>
      <Button {...floating.getReferenceProps()} onPress={() => setOpened((current) => !current)}>
        {opened ? 'Close' : 'Open'}
      </Button>

      {floating.renderFloating(
        <Block {...floating.getFloatingProps()} p="md" radius="md" bg="elevated" shadow="md" maw={260}>
          <Text fw="600">Anchored panel</Text>
          <Text size="sm" ff="monospace">
            {floating.placement}
          </Text>
        </Block>
      )}
    </>
  );
}
