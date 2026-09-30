import React, { useState } from 'react';
import { Block, Text } from '@plocks/ui';
import { MonthPickerInput } from '@plocks/dates';

export function Demo() {
  const [value, setValue] = useState<Date | null>(null);

  return (
    <Block fullWidth>
      <MonthPickerInput
        value={value}
        onChange={setValue}
        label="Billing cycle"
        placeholder="Select a month"
        clearable
        fullWidth
      />
      <Text size="sm" c="secondary">
        {value
          ? value.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
          : 'No month selected'}
      </Text>
    </Block>
  );
}
