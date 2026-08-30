import React, { useState } from 'react';
import { Block, DatePicker, Text } from '@platform-blocks/react-ui-library';

export function Demo() {
  const [value, setValue] = useState<Date[]>([]);

  return (
    <Block fullWidth>
      <DatePicker
        type="multiple"
        value={value}
        onChange={(next) => setValue((next as Date[]) ?? [])}
        calendarProps={{ numberOfMonths: 2, withCellSpacing: true }}
      />
      <Text size="sm" color="secondary">
        {value.length > 0
          ? value.map((date) => date.toLocaleDateString()).join(', ')
          : 'Select one or more dates'}
      </Text>
    </Block>
  );
}
