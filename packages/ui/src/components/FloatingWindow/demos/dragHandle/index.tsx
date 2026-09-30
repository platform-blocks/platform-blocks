import { useState } from 'react';
import { Button, FloatingWindow, Text } from '@plocks/ui';

export function Demo() {
  const [opened, setOpened] = useState(false);
  return (
    <>
      <Button onPress={() => setOpened(true)}>Open window</Button>
      {opened && (
        <FloatingWindow w={260} p="md">
          <FloatingWindow.DragHandle>
            <Text fw="600">Drag here</Text>
          </FloatingWindow.DragHandle>
          <Button size="sm" onPress={() => setOpened(false)}>
            Close
          </Button>
        </FloatingWindow>
      )}
    </>
  );
}
