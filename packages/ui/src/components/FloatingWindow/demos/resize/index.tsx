import { useState } from 'react';
import { Button, FloatingWindow, Text } from '@plocks/ui';

export function Demo() {
  const [opened, setOpened] = useState(false);
  return (
    <>
      <Button onPress={() => setOpened(true)}>Open resizable window</Button>
      {opened && (
        <FloatingWindow
          initialPosition={{ top: 110, left: 60 }}
          dimensions={{
            initialWidth: 230,
            initialHeight: 130,
            minWidth: 160,
            minHeight: 90,
            maxWidth: 360,
            maxHeight: 280,
          }}
          p="md"
        >
          <FloatingWindow.DragHandle>
            <Text fw="600">Resizable window</Text>
          </FloatingWindow.DragHandle>
          <FloatingWindow.ResizeHandle />
        </FloatingWindow>
      )}
    </>
  );
}
