import { useState } from 'react';
import { Button, FloatingWindow, Text } from '@plocks/ui';

export function Demo() {
  const [opened, setOpened] = useState(false);
  return (
    <>
      <Button onPress={() => setOpened(!opened)}>Toggle window</Button>
      {opened && (
        <FloatingWindow w={240} p="md" constrainToViewport={false}>
          <Text>Drag beyond the viewport.</Text>
        </FloatingWindow>
      )}
    </>
  );
}
