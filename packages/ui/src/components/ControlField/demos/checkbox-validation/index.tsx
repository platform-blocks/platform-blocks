import { useState } from 'react';
import { ControlField } from '@platform-blocks/ui';

export function Demo() {
  const [agreed, setAgreed] = useState(false);

  return (
    <ControlField
      variant="checkbox"
      indicatorPosition="left"
      label="I agree to the Terms of Service"
      description="You must accept before continuing"
      isRequired
      isSelected={agreed}
      onSelectedChange={setAgreed}
      isInvalid={!agreed}
      error={!agreed ? 'This field is required' : undefined}
    />
  );
}
