import { Block, Splitter, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Splitter orientation="vertical" h={220}>
        <Splitter.Pane defaultSize={50} bg="surface" p="md">
          <Text>Top</Text>
        </Splitter.Pane>
        <Splitter.Pane defaultSize={50} bg="subtle" p="md">
          <Text>Bottom</Text>
        </Splitter.Pane>
      </Splitter>
    </Block>
  );
}
