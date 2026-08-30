import React, { useState } from 'react';
import { Block, Text, YearPickerInput } from '@platform-blocks/react-ui-library';

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
      <Text size="sm" color="secondary">
        {value ? `Selected: ${value.getFullYear()}` : 'No year selected'}
      </Text>
    </Block>
  );
}
