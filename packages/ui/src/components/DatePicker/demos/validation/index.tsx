import React, { useMemo, useState } from 'react';
import { Block, DatePicker, Text } from '@platform-blocks/ui';

export default function Demo() {
  const [value, setValue] = useState<Date | null>(null);
  const [inlineError, setInlineError] = useState('');

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const handleChange = (next: Date | [Date | null, Date | null] | Date[] | null) => {
    const dateValue = next as Date | null;
    setValue(dateValue);
    setInlineError(dateValue && dateValue < today ? 'Date cannot be in the past' : '');
  };

  return (
    <Block fullWidth>
      <DatePicker
        value={value}
        onChange={handleChange}
        calendarProps={{ minDate: today, highlightToday: true }}
      />
      <Text size="sm" colorVariant={inlineError ? 'error' : 'secondary'}>
        {inlineError || 'Only dates today or later are enabled'}
      </Text>
    </Block>
  );
}
