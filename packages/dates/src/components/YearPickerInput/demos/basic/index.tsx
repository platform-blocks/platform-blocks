import React, { useState } from 'react';
import { Block, Text } from '@plocks/ui';
import { YearPickerInput } from '@plocks/dates';

export function Demo() {
  const [value, setValue] = useState<Date | null>(null);

  return (
    <Block fullWidth>
      <YearPickerInput
        value={value}
        onChange={setValue}
        label="Fiscal year"
        placeholder="Select a year"
        clearable
        fullWidth
      />
      <Text size="sm" c="secondary">
        {value ? `Selected: ${value.getFullYear()}` : 'No year selected'}
      </Text>
    </Block>
  );
}
