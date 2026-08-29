import React, { useState } from 'react';
import { Block, Text, YearPicker } from '@platform-blocks/ui';

export function Demo() {
  const [value, setValue] = useState<Date | null>(new Date());

  return (
    <Block fullWidth>
      <YearPicker value={value} onChange={setValue} totalYears={20} />
      <Text size="sm" color="secondary">
        {value ? `Selected: ${value.getFullYear()}` : 'No year selected'}
      </Text>
    </Block>
  );
}
