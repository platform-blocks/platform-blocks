import { useState } from 'react';
import { Block, Calendar, Text } from '@platform-blocks/ui';

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
      <Text size="sm" color="secondary">
        Selected date: {selectedDate ? formatter.format(selectedDate) : 'none'}
      </Text>
    </Block>
  );
}
