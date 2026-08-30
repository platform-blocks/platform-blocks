import React, { useMemo, useState } from 'react';
import { Block, MiniCalendar, Text } from '@platform-blocks/react-ui-library';

export function Demo() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const { minDate, maxDate } = useMemo(() => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    return { minDate: today, maxDate: nextWeek };
  }, []);

  return (
    <Block fullWidth>
      <MiniCalendar
        value={selectedDate}
        onChange={(date: Date | null) => setSelectedDate(date)}
        numberOfDays={7}
        minDate={minDate}
        maxDate={maxDate}
      />
      <Text size="sm" color="secondary">
        {selectedDate ? `Selected: ${selectedDate.toLocaleDateString()}` : 'No date selected'}
      </Text>
      <Text size="xs" color="secondary">
        Only the next seven days are enabled
      </Text>
    </Block>
  );
}