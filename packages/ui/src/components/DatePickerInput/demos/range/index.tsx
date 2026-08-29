import React, { useState } from 'react';
import { Block, DatePickerInput, Text } from '@platform-blocks/ui';

export function Demo() {
  const [value, setValue] = useState<[Date | null, Date | null] | null>(null);

  return (
    <Block fullWidth>
      <DatePickerInput
        type="range"
        value={value}
        onChange={(next) => setValue((next as [Date | null, Date | null]) || null)}
        label="Date range"
        placeholder="Select range"
        closeOnSelect
        fullWidth
      />
      <Text size="sm" color="secondary">
        {value && value[0] && value[1]
          ? `${value[0].toLocaleDateString()} – ${value[1].toLocaleDateString()}`
          : 'Select a start and end date'}
      </Text>
    </Block>
  );
}
