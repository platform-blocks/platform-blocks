import React, { useState } from 'react';
import { Block, Text } from '@plocks/ui';
import { DatePickerInput } from '@plocks/dates';

export function Demo() {
  const [value, setValue] = useState<Date | null>(null);

  return (
    <Block fullWidth>
      <DatePickerInput
        value={value}
        onChange={(next) => setValue(next as Date | null)}
        placeholder="Select a date"
        label="Date"
        clearable
        fullWidth
      />
      <Text size="sm" c="secondary">
        {value ? `Selected: ${value.toLocaleDateString()}` : 'No date selected'}
      </Text>
    </Block>
  );
}
