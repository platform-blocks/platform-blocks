import { useState } from 'react';
import { Slider, Text, Row, Card, Block } from '@platform-blocks/react-ui-library';

export function Demo() {
  const [value, setValue] = useState(60);

  return (
    <Card>
      <Row gap={16} align="center">
        <Block style={{ height: 200 }}>
          <Slider
            value={value}
            onChange={setValue}
            min={0}
            max={100}
            step={1}
            orientation="vertical"
          />
        </Block>
        <Block>
          <Text size="lg" weight="semibold">Vertical Slider</Text>
          <Text size="sm" style={{ color: '#666' }}>
            Value: {value}
          </Text>
        </Block>
      </Row>
    </Card>
  );
}


