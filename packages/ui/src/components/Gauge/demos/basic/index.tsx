import { useState } from 'react';
import { Block, Button, Gauge, Row } from '@plocks/ui';

export function Demo() {
  const [value, setValue] = useState(65);

  return (
    <Block align="center" gap="md">
      <Gauge
        value={value}
        size={220}
        aria-label="Completion"
        ticks={{ major: 5 }}
        labels={{ show: true, formatter: (current) => `${current}%` }}
      />
      <Row gap="sm">
        <Button variant="outline" onPress={() => setValue(Math.max(0, value - 10))}>
          -10%
        </Button>
        <Button onPress={() => setValue(Math.min(100, value + 10))}>+10%</Button>
      </Row>
    </Block>
  );
}
