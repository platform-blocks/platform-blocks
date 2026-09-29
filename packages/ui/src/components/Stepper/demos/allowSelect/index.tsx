import { useState } from 'react';
import { Block, Stepper } from '@platform-blocks/ui';

export function Demo() {
  const [active, setActive] = useState(0);

  return (
    <Block fullWidth>
      <Stepper active={active} onStepClick={setActive}>
        <Stepper.Step label="Account" />
        <Stepper.Step label="Verification" />
        <Stepper.Step label="Preferences" allowStepSelect={false} />
      </Stepper>
    </Block>
  );
}
