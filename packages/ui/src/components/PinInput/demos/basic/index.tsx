import { useState } from 'react';
import { PinInput } from '@platform-blocks/ui';

export default function Demo() {
  const [value, setValue] = useState('');

  return (
    <PinInput
      value={value}
      onChange={setValue}
      label="PIN code"
      keyboardFocusId="pin-demo-basic"
    />
  );
}
