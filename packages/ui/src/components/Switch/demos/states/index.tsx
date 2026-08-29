import { useState } from 'react';
import { Block, Switch, Text } from '@platform-blocks/ui';

export function Demo() {
  const [homeAlerts, setHomeAlerts] = useState(true);
  const [awayAlerts, setAwayAlerts] = useState(false);

  return (
    <Block>
      <Block>
        <Text variant="small" color="muted">
          Interactive states
        </Text>
        <Switch
          checked={homeAlerts}
          onChange={setHomeAlerts}
          label="Home team alerts"
        />
        <Switch
          checked={awayAlerts}
          onChange={setAwayAlerts}
          label="Away team alerts"
        />
      </Block>
      <Block>
        <Text variant="small" color="muted">
          Disabled states
        </Text>
        <Switch defaultChecked label="Lineup lock" disabled />
        <Switch label="Sound effects" disabled />
      </Block>
      <Block>
        <Text variant="small" color="muted">
          Validation helpers
        </Text>
        <Switch
          label="Require broadcast approval"
          required
          error="Approval is needed before publishing."
        />
        <Switch
          defaultChecked
          label="Send pre-game summary"
          description="Dispatch an email recap to coaches and analysts."
        />
      </Block>
    </Block>
  );
}
