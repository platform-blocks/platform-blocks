import React, { useState } from 'react';
import { Block, Text, TimePicker } from '@platform-blocks/ui';
import type { TimePickerValue } from '@platform-blocks/ui';

export default function WithSecondsTimePickerDemo() {
  const [value, setValue] = useState<TimePickerValue>({ hours: 9, minutes: 5, seconds: 30 });

  const formatted = `${String(value.hours).padStart(2, '0')}:${String(value.minutes).padStart(2, '0')}:${String(value.seconds || 0).padStart(2, '0')}`;

  return (
    <Block fullWidth>
      <TimePicker value={value} onChange={setValue} withSeconds />
      <Text size="sm" colorVariant="secondary">{`Selected: ${formatted}`}</Text>
    </Block>
  );
}
