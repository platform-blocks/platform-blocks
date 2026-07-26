import { useState } from 'react';
import { Block, Button, Ring, Row } from '@platform-blocks/ui';

export default function Demo() {
  const [value, setValue] = useState(72);

  return (
    <Block align="center" gap="md">
      <Row gap="lg" align="center">
        <Ring value={value} caption="Completion" />
        <Ring value={value} size={72} thickness={8} caption="Compact" />
      </Row>
      <Row gap="sm">
        <Button variant="outline" onPress={() => setValue(Math.max(0, value - 10))}>
          -10%
        </Button>
        <Button onPress={() => setValue(Math.min(100, value + 10))}>+10%</Button>
      </Row>
    </Block>
  );
}
