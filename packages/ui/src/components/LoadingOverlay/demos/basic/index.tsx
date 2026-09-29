import { useState } from 'react';
import { Block, Card, Input, LoadingOverlay, Switch } from '@platform-blocks/ui';

export function Demo() {
  const [visible, setVisible] = useState(true);

  return (
    <Block fullWidth maw={480}>
      <Card>
        <Block>
          <Input label="Name" placeholder="Jane Doe" disabled={visible} />
          <Input label="Email" placeholder="jane@platform-blocks.com" disabled={visible} />
        </Block>
        <LoadingOverlay visible={visible} overlayProps={{ radius: 'md' }} />
      </Card>

      <Switch label="Loading" checked={visible} onChange={setVisible} />
    </Block>
  );
}
