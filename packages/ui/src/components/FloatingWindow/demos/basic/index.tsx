import { useState } from 'react';
import { Button, FloatingWindow, Text } from '@plocks/ui';

export function Demo() {
  const [opened, setOpened] = useState(false);
  return (
    <>
      <Button onPress={() => setOpened((value) => !value)}>
        {opened ? 'Hide window' : 'Show window'}
      </Button>
      {opened && (
        <FloatingWindow
          dimensions={{ initialWidth: 260, initialHeight: 160 }}
          initialPosition={{ top: 90, left: 40 }}
          p="md"
        >
          <FloatingWindow.DragHandle>
            <Text fw="600">Drag this header</Text>
          </FloatingWindow.DragHandle>
          <Text>Move or resize this window.</Text>
          <FloatingWindow.ResizeHandle />
        </FloatingWindow>
      )}
    </>
  );
}
