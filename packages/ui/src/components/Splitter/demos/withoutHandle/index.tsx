import { Block, Splitter, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Splitter h={160} withHandle={false} lineSize={4}>
        <Splitter.Pane defaultSize={50} bg="surface" p="md">
          <Text>One</Text>
        </Splitter.Pane>
        <Splitter.Pane defaultSize={50} bg="subtle" p="md">
          <Text>Two</Text>
        </Splitter.Pane>
      </Splitter>
    </Block>
  );
}
