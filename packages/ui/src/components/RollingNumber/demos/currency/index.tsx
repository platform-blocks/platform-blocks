import { useState } from 'react';
import { Button, Flex, RollingNumber } from '@platform-blocks/react-ui-library';

export function Demo() {
  const [total, setTotal] = useState(1299.99);

  return (
    <Flex direction="column" align="center" gap="md">
      <RollingNumber
        value={total}
        prefix="$ "
        suffix=" USD"
        decimalScale={2}
        fixedDecimalScale
        thousandSeparator
        size={36}
        weight="semibold"
      />
      <Button variant="outline" onPress={() => setTotal((current) => current + 149.5)}>
        Add item
      </Button>
    </Flex>
  );
}
