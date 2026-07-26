import { useState } from 'react';
import { ControlField } from '@platform-blocks/ui';

export default function Demo() {
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
