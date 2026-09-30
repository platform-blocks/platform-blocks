import { useState } from 'react';

import { Input } from '@plocks/ui';

export function Demo() {
  const [value, setValue] = useState('');

  return (
    <Input
      label="Full name"
      placeholder="Enter your full name"
      value={value}
      onChangeText={setValue}
    />
  );
}
