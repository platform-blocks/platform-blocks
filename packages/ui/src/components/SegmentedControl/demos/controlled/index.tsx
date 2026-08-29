import { useState } from 'react';
import { Block, Button, Card, Row, SegmentedControl, Text } from '@platform-blocks/ui';

import { frameworks } from '../data';

export function Demo() {
  const [value, setValue] = useState('react');

  return (
    <Card p="md">
      <Block>
        <Text size="sm" color="secondary">
          Drive the segmented control from external state to synchronize its value with other inputs.
        </Text>
        <SegmentedControl value={value} onChange={setValue} data={frameworks} />
        <Text size="xs" color="secondary">
          Selected value: <Text as="span" weight="600">{value}</Text>
        </Text>
        <Row gap="sm" wrap="wrap">
          <Button size="xs" onPress={() => setValue('react')}>
            Select React
          </Button>
          <Button size="xs" variant="outline" onPress={() => setValue('angular')}>
            Select Angular
          </Button>
          <Button size="xs" variant="outline" onPress={() => setValue('vue')}>
            Select Vue
          </Button>
        </Row>
      </Block>
    </Card>
  );
}
