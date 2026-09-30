import { Block, Row, Text, ToggleButton, ToggleGroup } from '@plocks/ui';

export function Demo() {
  return (
    <Row gap="lg" align="flex-start" wrap="wrap">
      <Block>
        <Text variant="small" c="secondary">Horizontal</Text>
        <ToggleGroup defaultValue="list" exclusive orientation="horizontal">
          <ToggleButton value="list">List</ToggleButton>
          <ToggleButton value="grid">Grid</ToggleButton>
          <ToggleButton value="card">Card</ToggleButton>
        </ToggleGroup>
      </Block>

      <Block>
        <Text variant="small" c="secondary">Vertical</Text>
        <ToggleGroup defaultValue="list" exclusive orientation="vertical">
          <ToggleButton value="list">List</ToggleButton>
          <ToggleButton value="grid">Grid</ToggleButton>
          <ToggleButton value="card">Card</ToggleButton>
        </ToggleGroup>
      </Block>
    </Row>
  );
}
