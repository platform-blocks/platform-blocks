import { useState } from 'react';
import { PinInput } from '@platform-blocks/react-ui-library';

export function Demo() {
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
