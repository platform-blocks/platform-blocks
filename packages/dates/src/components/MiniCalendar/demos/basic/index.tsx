import { useState } from 'react';
import { Block, Text } from '@plocks/ui';
import { MiniCalendar } from '@plocks/dates';

export function Demo() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  return (
    <Block fullWidth>
      <MiniCalendar
        value={selectedDate}
        onChange={(date: Date | null) => setSelectedDate(date)}
        numberOfDays={7}
      />
      <Text size="sm" c="secondary">
        {selectedDate ? `Selected: ${selectedDate.toLocaleDateString()}` : 'No date selected'}
      </Text>
    </Block>
  );
}
