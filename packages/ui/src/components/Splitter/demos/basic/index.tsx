import { Block, Splitter, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Splitter h={200}>
        <Splitter.Pane defaultSize={35} min={20} bg="surface" p="md">
          <Text>Sidebar</Text>
        </Splitter.Pane>
        <Splitter.Pane defaultSize={65} min={20} bg="subtle" p="md">
          <Text>Content</Text>
        </Splitter.Pane>
      </Splitter>
    </Block>
  );
}
