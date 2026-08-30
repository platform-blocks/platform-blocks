import { useState } from 'react';
import { Block, MiniCalendar, Text } from '@platform-blocks/react-ui-library';

export function Demo() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  return (
    <Block fullWidth>
      <MiniCalendar
        value={selectedDate}
        onChange={(date: Date | null) => setSelectedDate(date)}
        numberOfDays={7}
      />
      <Text size="sm" color="secondary">
        {selectedDate ? `Selected: ${selectedDate.toLocaleDateString()}` : 'No date selected'}
      </Text>
    </Block>
  );
}
