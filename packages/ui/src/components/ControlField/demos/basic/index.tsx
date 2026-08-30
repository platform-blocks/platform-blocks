import { useState } from 'react';
import { ControlField } from '@platform-blocks/react-ui-library';

export function Demo() {
  const [enabled, setEnabled] = useState(true);

  return (
    <ControlField
      label="Push notifications"
      description="Get notified when something happens"
      isSelected={enabled}
      onSelectedChange={setEnabled}
    />
  );
}
