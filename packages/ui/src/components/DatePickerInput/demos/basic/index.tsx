import React, { useState } from 'react';
import { Block, DatePickerInput, Text } from '@platform-blocks/react-ui-library';

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
      <Text size="sm" color="secondary">
        {value ? `Selected: ${value.toLocaleDateString()}` : 'No date selected'}
      </Text>
    </Block>
  );
}
