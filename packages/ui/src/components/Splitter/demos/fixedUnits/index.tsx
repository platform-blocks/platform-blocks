import { Block, Splitter, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Splitter h={160}>
        <Splitter.Pane defaultSize="180px" min="120px" bg="subtle" p="md">
          <Text>Fixed sidebar</Text>
        </Splitter.Pane>
        <Splitter.Pane defaultSize={100} bg="surface" p="md">
          <Text>Flexible content</Text>
        </Splitter.Pane>
      </Splitter>
    </Block>
  );
}
