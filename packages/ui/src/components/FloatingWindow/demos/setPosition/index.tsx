import { useRef, useState } from 'react';
import { Button, FloatingWindow, Text } from '@plocks/ui';
import type { FloatingWindowHandle } from '@plocks/ui';

export function Demo() {
  const [opened, setOpened] = useState(false);
  const windowRef = useRef<FloatingWindowHandle>(null);
  return (
    <>
      <Button onPress={() => setOpened(true)}>Open window</Button>
      {opened && (
        <FloatingWindow
          setPositionRef={windowRef}
          initialPosition={{ top: 100, left: 40 }}
          dimensions={{ initialWidth: 240, initialHeight: 140 }}
          p="md"
        >
          <FloatingWindow.DragHandle>
            <Text fw="600">Move me</Text>
          </FloatingWindow.DragHandle>
          <Button onPress={() => windowRef.current?.setPosition({ top: 60, right: 60 })}>
            Move to top right
          </Button>
        </FloatingWindow>
      )}
    </>
  );
}
