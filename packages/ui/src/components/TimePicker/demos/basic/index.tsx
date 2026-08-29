import React, { useState } from 'react';
import { Block, Text, TimePicker } from '@platform-blocks/ui';
import type { TimePickerValue } from '@platform-blocks/ui';

export function Demo() {
  const [value, setValue] = useState<TimePickerValue>({ hours: 13, minutes: 30 });

  const formatted = `${String(value.hours).padStart(2, '0')}:${String(value.minutes).padStart(2, '0')}`;

  return (
    <Block fullWidth>
      <TimePicker value={value} onChange={setValue} />
      <Text size="sm" color="secondary">{`Selected: ${formatted}`}</Text>
    </Block>
  );
}
