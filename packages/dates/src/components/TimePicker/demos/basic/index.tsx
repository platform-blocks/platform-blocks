import React, { useState } from 'react';
import { Block, Text } from '@plocks/ui';
import { TimePicker } from '@plocks/dates';
import type { TimePickerValue } from '@plocks/dates';

export function Demo() {
  const [value, setValue] = useState<TimePickerValue>({ hours: 13, minutes: 30 });

  const formatted = `${String(value.hours).padStart(2, '0')}:${String(value.minutes).padStart(2, '0')}`;

  return (
    <Block fullWidth>
      <TimePicker value={value} onChange={setValue} />
      <Text size="sm" c="secondary">{`Selected: ${formatted}`}</Text>
    </Block>
  );
}
