import { useState } from 'react';
import { Button, Flex, RollingNumber } from '@plocks/ui';

export function Demo() {
  const [value, setValue] = useState(1234);

  return (
    <Flex direction="column" align="center" gap="md">
      <RollingNumber value={value} size={48} fw="bold" />
      <Button variant="outline" onPress={() => setValue((current) => current + 1)}>+1</Button>
    </Flex>
  );
}
