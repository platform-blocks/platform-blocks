import { useState } from 'react';
import { Block, Splitter, Text } from '@plocks/ui';

export function Demo() {
  const [sizes, setSizes] = useState<[number, number]>([40, 60]);
  return (
    <Block fullWidth>
      <Splitter h={160} sizes={sizes} onSizeChange={(next) => setSizes(next as [number, number])}>
        <Splitter.Pane bg="subtle" p="md">
          <Text>First ({Math.round(sizes[0])}%)</Text>
        </Splitter.Pane>
        <Splitter.Pane bg="surface" p="md">
          <Text>Second</Text>
        </Splitter.Pane>
      </Splitter>
    </Block>
  );
}
