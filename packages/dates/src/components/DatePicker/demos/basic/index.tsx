import React, { useState } from 'react';
import { Block, Text } from '@plocks/ui';
import { DatePicker } from '@plocks/dates';

export function Demo() {
  const [value, setValue] = useState<Date | null>(null);

  return (
    <Block fullWidth>
      <DatePicker
        value={value}
        onChange={(next) => setValue(next as Date | null)}
        calendarProps={{ numberOfMonths: 1, highlightToday: true }}
      />
      <Text size="sm" c="secondary">
        {value ? `Selected: ${value.toLocaleDateString()}` : 'No date selected'}
      </Text>
    </Block>
  );
}
