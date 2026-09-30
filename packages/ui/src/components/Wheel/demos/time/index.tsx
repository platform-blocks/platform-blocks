import { useState } from 'react';
import { Block, Row, Text, Wheel } from '@plocks/ui';

const hours = Array.from({ length: 12 }, (_, index) => ({
  value: index + 1,
  label: String(index + 1).padStart(2, '0'),
}));

const minutes = [0, 15, 30, 45].map((value) => ({
  value,
  label: String(value).padStart(2, '0'),
}));

export function Demo() {
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(30);

  return (
    <Block align="center" gap="sm">
      <Row gap="sm">
        <Wheel items={hours} value={hour} onChange={setHour} label="Hour" h={180} itemHeight={36} />
        <Wheel
          items={minutes}
          value={minute}
          onChange={setMinute}
          label="Minute"
          h={180}
          itemHeight={36}
        />
      </Row>
      <Text>
        Time: {hour}:{String(minute).padStart(2, '0')}
      </Text>
    </Block>
  );
}
