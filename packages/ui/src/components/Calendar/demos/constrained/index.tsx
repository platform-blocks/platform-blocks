import { useMemo, useState } from 'react';
import { Block, Calendar, Text } from '@platform-blocks/react-ui-library';

const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });

export function Demo() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const { minDate, maxDate, monthLabel } = useMemo(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { minDate: start, maxDate: end, monthLabel: monthFormatter.format(start) };
  }, []);

  return (
    <Block fullWidth>
      <Calendar
        value={selectedDate}
        onChange={(date) => setSelectedDate(date as Date | null)}
        minDate={minDate}
        maxDate={maxDate}
        highlightToday
      />
      <Text size="sm" color="secondary">
        Selected date: {selectedDate ? dateFormatter.format(selectedDate) : 'none'}
      </Text>
      <Text size="xs" color="secondary">
        Only dates in {monthLabel} are enabled.
      </Text>
    </Block>
  );
}