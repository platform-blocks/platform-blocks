import { useState } from 'react';
import { Block, SegmentedControl, Text } from '@platform-blocks/ui';

export function Demo() {
  const [value, setValue] = useState('React');

  return (
    <Block>
      <SegmentedControl value={value} onChange={setValue} data={['React', 'Angular', 'Vue']} />
      <Text size="xs" c="secondary">
        Selected value: {value}
      </Text>
    </Block>
  );
}
