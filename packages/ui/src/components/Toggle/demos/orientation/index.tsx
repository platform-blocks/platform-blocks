import { useState } from 'react';

import { Block, Row, Text, ToggleButton, ToggleGroup } from '@platform-blocks/ui';

export default function Demo() {
  const [view, setView] = useState('list');

  const handleChange = (value: string | number | (string | number)[]) => {
    if (typeof value === 'string') {
      setView(value);
    }
  };

  return (
    <Block>
      <Block>
        <Text weight="semibold">Toggle orientations</Text>
        <Text size="xs" colorVariant="secondary">
          Swap the `orientation` prop to lay buttons out horizontally or vertically.
        </Text>
      </Block>

      <Row gap="lg" align="flex-start" wrap="wrap">
        <Block>
          <Text size="sm" weight="semibold">
            Horizontal (default)
          </Text>
          <ToggleGroup value={view} exclusive onChange={handleChange} orientation="horizontal">
            <ToggleButton value="list">List</ToggleButton>
            <ToggleButton value="grid">Grid</ToggleButton>
            <ToggleButton value="card">Card</ToggleButton>
          </ToggleGroup>
        </Block>

        <Block>
          <Text size="sm" weight="semibold">
            Vertical
          </Text>
          <ToggleGroup value={view} exclusive onChange={handleChange} orientation="vertical">
            <ToggleButton value="list">List</ToggleButton>
            <ToggleButton value="grid">Grid</ToggleButton>
            <ToggleButton value="card">Card</ToggleButton>
          </ToggleGroup>
        </Block>
      </Row>

      <Text size="xs" colorVariant="secondary">
        Selected view: {view}
      </Text>
    </Block>
  );
}
