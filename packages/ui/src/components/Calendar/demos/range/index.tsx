import { useMemo, useState } from 'react';
import { Block, Calendar, Text } from '@platform-blocks/ui';

const formatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });

export function Demo() {
  const [selectedRange, setSelectedRange] = useState<[Date | null, Date | null]>([null, null]);

  const summary = useMemo(() => {
    const [start, end] = selectedRange;
    if (!start) {
      return 'No dates selected yet.';
    }
    if (!end) {
      return `Start date chosen: ${formatter.format(start)} — pick an end date.`;
    }
    return `${formatter.format(start)} → ${formatter.format(end)}`;
  }, [selectedRange]);

  return (
    <Block fullWidth>
      <Calendar
        type="range"
        value={selectedRange}
        onChange={(range) => setSelectedRange(range as [Date | null, Date | null])}
        highlightToday
      />
      <Text size="sm" color="secondary">
        {summary}
      </Text>
    </Block>
  );
}