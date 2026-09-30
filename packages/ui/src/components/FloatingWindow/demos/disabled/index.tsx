import { useState } from 'react';
import { Button, FloatingWindow, Text } from '@plocks/ui';

export function Demo() {
  const [opened, setOpened] = useState(false);
  return (
    <>
      <Button onPress={() => setOpened(!opened)}>Toggle static window</Button>
      {opened && (
        <FloatingWindow enabled={false} w={220} p="md">
          <Text>This window stays put.</Text>
        </FloatingWindow>
      )}
    </>
  );
}
