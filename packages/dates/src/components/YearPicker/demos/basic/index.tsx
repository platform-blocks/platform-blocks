import React, { useState } from 'react';
import { Block, Text } from '@plocks/ui';
import { YearPicker } from '@plocks/dates';

export function Demo() {
  const [value, setValue] = useState<Date | null>(new Date());

  return (
    <Block fullWidth>
      <YearPicker value={value} onChange={setValue} totalYears={20} />
      <Text size="sm" c="secondary">
        {value ? `Selected: ${value.getFullYear()}` : 'No year selected'}
      </Text>
    </Block>
  );
}
