import React, { useState } from 'react';
import { Block, DatePickerInput, Text } from '@platform-blocks/ui';

export default function Demo() {
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
      <Text size="sm" colorVariant="secondary">
        {value ? `Selected: ${value.toLocaleDateString()}` : 'No date selected'}
      </Text>
    </Block>
  );
}
