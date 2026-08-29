import { Block, Button, Collapse, Text } from '@platform-blocks/ui';
import { useState } from 'react';
export function Demo() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <Block>
      <Button onPress={() => setIsCollapsed(!isCollapsed)}>
        {isCollapsed ? 'Show' : 'Hide'}
      </Button>
      <Collapse isCollapsed={isCollapsed}>
        <Text>
          This is some content inside the Collapse component. It will be shown or hidden based on the isCollapsed prop.
        </Text>
      </Collapse>
    </Block>
  );
}
