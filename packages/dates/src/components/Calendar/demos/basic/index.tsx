import { useState } from 'react';
import { Block, Text } from '@plocks/ui';
import { Calendar } from '@plocks/dates';

const formatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });

export function Demo() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  return (
    <Block fullWidth>
      <Calendar
        value={selectedDate}
        onChange={(date) => setSelectedDate(date as Date | null)}
        highlightToday
      />
      <Text size="sm" c="secondary">
        Selected date: {selectedDate ? formatter.format(selectedDate) : 'none'}
      </Text>
    </Block>
  );
}
