import { useState } from 'react';
import { Block, Switch, Text } from '@plocks/ui';

export function Demo() {
  const [enabled, setEnabled] = useState<boolean>(true);

  return (
    <Block>
      <Switch
        checked={enabled}
        onChange={setEnabled}
        label="Enable live score alerts"
        description="Send push notifications when the match score changes."
      />
      <Text variant="small" c="muted">
        Notices are {enabled ? 'enabled' : 'disabled'}.
      </Text>
    </Block>
  );
}