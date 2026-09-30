import { useState } from 'react';
import { Button, FloatingWindow, Text } from '@plocks/ui';

export function Demo() {
  const [opened, setOpened] = useState(false);
  const [size, setSize] = useState({ width: 240, height: 140 });
  return (
    <>
      <Button onPress={() => setOpened(true)}>Open window</Button>
      {opened && (
        <FloatingWindow
          initialPosition={{ top: 110, left: 60 }}
          dimensions={{ initialWidth: 240, initialHeight: 140 }}
          onSizeChange={setSize}
          p="md"
        >
          <FloatingWindow.DragHandle>
            <Text fw="600">Resize me</Text>
          </FloatingWindow.DragHandle>
          <Text>
            {Math.round(size.width)} × {Math.round(size.height)}
          </Text>
          <FloatingWindow.ResizeHandle />
        </FloatingWindow>
      )}
    </>
  );
}
