import { useState } from 'react';
import { PinInput } from '@plocks/ui';

export function Demo() {
  const [value, setValue] = useState('');

  return <PinInput value={value} onChange={setValue} label="PIN code" />;
}
