import { useRef } from 'react';
import { Block, Button, Splitter, Text } from '@plocks/ui';
import type { SplitterHandle } from '@plocks/ui';

export function Demo() {
  const splitterRef = useRef<SplitterHandle>(null);
  return (
    <Block fullWidth>
      <Button size="sm" onPress={() => splitterRef.current?.toggleCollapse(0)}>
        Toggle sidebar
      </Button>
      <Splitter splitterRef={splitterRef} h={150} mt="sm">
        <Splitter.Pane defaultSize={30} collapsible bg="subtle" p="md">
          <Text>Sidebar</Text>
        </Splitter.Pane>
        <Splitter.Pane defaultSize={70} bg="surface" p="md">
          <Text>Content</Text>
        </Splitter.Pane>
      </Splitter>
    </Block>
  );
}
