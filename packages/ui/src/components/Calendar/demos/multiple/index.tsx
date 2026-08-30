import { useMemo, useState } from 'react';
import { Block, Calendar, Text } from '@platform-blocks/react-ui-library';

const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

export function Demo() {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  const summary = useMemo(() => {
    if (selectedDates.length === 0) return 'No dates picked yet.';
    if (selectedDates.length === 1) {
      return `1 date picked: ${formatter.format(selectedDates[0])}`;
    }
    return `${selectedDates.length} dates picked: ${selectedDates.map((date) => formatter.format(date)).join(', ')}`;
  }, [selectedDates]);

  return (
    <Block fullWidth>
      <Calendar
        type="multiple"
        value={selectedDates}
        onChange={(dates) => setSelectedDates(dates as Date[])}
        highlightToday
      />
      <Text size="sm" color="secondary">
        {summary}
      </Text>
    </Block>
  );
}