import { useState } from 'react';
import { Button, FloatingWindow, Text } from '@plocks/ui';

export function Demo() {
  const [opened, setOpened] = useState(false);
  return (
    <>
      <Button onPress={() => setOpened(!opened)}>Toggle horizontal window</Button>
      {opened && (
        <FloatingWindow axis="x" w={220} p="md">
          <Text>Drag horizontally.</Text>
        </FloatingWindow>
      )}
    </>
  );
}
