import React, { useState } from 'react';
import { Block, Text, TimePickerInput } from '@platform-blocks/ui';
import type { TimePickerValue } from '@platform-blocks/ui';

export function Demo() {
  const [value, setValue] = useState<TimePickerValue | null>({ hours: 9, minutes: 30 });

  const formatted = value
    ? `${((value.hours + 11) % 12) + 1}:${String(value.minutes).padStart(2, '0')} ${value.hours >= 12 ? 'PM' : 'AM'}`
    : null;

  return (
    <Block fullWidth>
      <TimePickerInput
        value={value}
        onChange={setValue}
        label="Meeting time"
        format={12}
        fullWidth
      />
      <Text size="sm" color="secondary">
        {formatted ? `Selected: ${formatted}` : 'No time selected'}
      </Text>
    </Block>
  );
}
