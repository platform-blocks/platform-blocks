import React, { useState } from 'react';
import { Block, MonthPicker, Text } from '@platform-blocks/react-ui-library';

export function Demo() {
  const [value, setValue] = useState<Date | null>(new Date());

  return (
    <Block fullWidth>
      <MonthPicker value={value} onChange={setValue} monthLabelFormat="long" />
      <Text size="sm" color="secondary">
        {value
          ? value.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
          : 'No month selected'}
      </Text>
    </Block>
  );
}
