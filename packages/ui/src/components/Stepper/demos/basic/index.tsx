import { useState } from 'react';
import { Block, Button, Row, Stepper } from '@platform-blocks/ui';

export function Demo() {
  const [active, setActive] = useState(1);

  return (
    <Block fullWidth>
      <Stepper active={active} onStepClick={setActive}>
        <Stepper.Step label="Account" description="Create your credentials">
          Set up your sign-in information.
        </Stepper.Step>
        <Stepper.Step label="Verification" description="Confirm your email">
          Check your inbox for a verification link.
        </Stepper.Step>
        <Stepper.Step label="Preferences" description="Adjust defaults">
          Choose your notification defaults.
        </Stepper.Step>
        <Stepper.Completed>All steps complete.</Stepper.Completed>
      </Stepper>
      <Row gap="sm" justify="space-between">
        <Button variant="outline" onPress={() => setActive(active - 1)} disabled={active === 0}>
          Back
        </Button>
        <Button onPress={() => setActive(active + 1)} disabled={active === 3}>
          Next
        </Button>
      </Row>
    </Block>
  );
}
