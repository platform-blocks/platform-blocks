import React, { useState } from 'react';
import { Block, Text, TimePicker } from '@platform-blocks/react-ui-library';
import type { TimePickerValue } from '@platform-blocks/react-ui-library';

export function Demo() {
  const [value, setValue] = useState<TimePickerValue>({ hours: 9, minutes: 5, seconds: 30 });

  const formatted = `${String(value.hours).padStart(2, '0')}:${String(value.minutes).padStart(2, '0')}:${String(value.seconds || 0).padStart(2, '0')}`;

  return (
    <Block fullWidth>
      <TimePicker value={value} onChange={setValue} withSeconds />
      <Text size="sm" color="secondary">{`Selected: ${formatted}`}</Text>
    </Block>
  );
}
