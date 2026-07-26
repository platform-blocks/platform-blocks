import React, { useState } from 'react';
import { Block, Text, TimePicker } from '@platform-blocks/ui';
import type { TimePickerValue } from '@platform-blocks/ui';

export default function Format12hTimePickerDemo() {
  const [value, setValue] = useState<TimePickerValue>({ hours: 0, minutes: 15 });

  const formatted = `${String(value.hours).padStart(2, '0')}:${String(value.minutes).padStart(2, '0')}`;

  return (
    <Block fullWidth>
      <TimePicker value={value} onChange={setValue} format={12} />
      <Text size="sm" colorVariant="secondary">
        {`Internal (24h): ${formatted}`}
      </Text>
    </Block>
  );
}
