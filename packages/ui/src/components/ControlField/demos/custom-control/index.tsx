import { useState } from 'react';
import { Block, Checkbox, ControlField } from '@platform-blocks/react-ui-library';

export function Demo() {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <ControlField isSelected={subscribed} onSelectedChange={setSubscribed}>
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
