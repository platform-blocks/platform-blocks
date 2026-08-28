import { useState } from 'react';
import { Button, Flex, RollingNumber } from '@platform-blocks/ui';

export default function Demo() {
  const [value, setValue] = useState(1234);

  return (
    <Flex direction="column" align="center" gap="md">
      <RollingNumber value={value} size={48} weight="bold" thousandSeparator />
      <Flex gap="sm">
        <Button variant="outline" onPress={() => setValue((current) => current - 1)}>-1</Button>
        <Button variant="outline" onPress={() => setValue((current) => current + 1)}>+1</Button>
        <Button onPress={() => setValue(Math.floor(Math.random() * 100000))}>Random</Button>
      </Flex>
    </Flex>
  );
}
