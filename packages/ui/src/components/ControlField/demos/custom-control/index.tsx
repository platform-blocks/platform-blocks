import { useState } from 'react';
import { Block, Checkbox, ControlField } from '@plocks/ui';

export function Demo() {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <ControlField checked={subscribed} onChange={setSubscribed}>
      <Block style={{ flex: 1 }} fullWidth={false}>
        <ControlField.Label>Subscribe to newsletter</ControlField.Label>
        <ControlField.Description>
          One email a week, unsubscribe anytime
        </ControlField.Description>
      </Block>
      <ControlField.Indicator>
        <Checkbox color="warning" />
      </ControlField.Indicator>
    </ControlField>
  );
}
