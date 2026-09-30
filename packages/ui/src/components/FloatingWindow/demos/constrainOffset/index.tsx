import { useState } from 'react';
import { Button, FloatingWindow, Text } from '@plocks/ui';

export function Demo() {
  const [opened, setOpened] = useState(false);
  return (
    <>
      <Button onPress={() => setOpened(!opened)}>Toggle inset window</Button>
      {opened && (
        <FloatingWindow constrainOffset={30} w={220} p="md">
          <Text>30 px from the edge.</Text>
        </FloatingWindow>
      )}
    </>
  );
}
