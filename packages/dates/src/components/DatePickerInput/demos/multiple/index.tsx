import React, { useState } from 'react';
import { Block, Text } from '@plocks/ui';
import { DatePickerInput } from '@plocks/dates';

export function Demo() {
  const [value, setValue] = useState<Date[]>([]);

  return (
    <Block fullWidth>
      <DatePickerInput
        type="multiple"
        value={value}
        onChange={(next) => setValue((next as Date[]) || [])}
        label="Multiple dates"
        placeholder="Select dates"
        fullWidth
      />
      <Text size="sm" c="secondary">
        {value.length > 0
          ? `Selected: ${value.map((date) => date.toLocaleDateString()).join(', ')}`
          : 'Select one or more dates'}
      </Text>
    </Block>
  );
}
