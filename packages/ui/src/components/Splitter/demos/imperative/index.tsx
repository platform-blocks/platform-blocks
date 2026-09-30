import { useRef } from 'react';
import { Block, Button, Flex, Splitter, Text } from '@plocks/ui';
import type { SplitterHandle } from '@plocks/ui';

export function Demo() {
  const splitterRef = useRef<SplitterHandle>(null);
  return (
    <Block fullWidth>
      <Flex gap="sm">
        <Button onPress={() => splitterRef.current?.collapse(0)}>Collapse</Button>
        <Button onPress={() => splitterRef.current?.expand(0)}>Expand</Button>
      </Flex>
      <Splitter h={160} splitterRef={splitterRef} mt="sm">
        <Splitter.Pane defaultSize={35} collapsible bg="subtle" p="md">
          <Text>Sidebar</Text>
        </Splitter.Pane>
        <Splitter.Pane defaultSize={65} bg="surface" p="md">
          <Text>Content</Text>
        </Splitter.Pane>
      </Splitter>
    </Block>
  );
}
