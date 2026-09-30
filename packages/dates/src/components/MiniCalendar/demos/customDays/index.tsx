import React, { useState } from 'react';
import { Block, Button, Row, Text } from '@plocks/ui';
import { MiniCalendar } from '@plocks/dates';

const DAY_OPTIONS = [3, 5, 7];

export function Demo() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [numberOfDays, setNumberOfDays] = useState(5);

  return (
    <Block fullWidth>
      <Row gap="xs">
        {DAY_OPTIONS.map((days) => (
          <Button
            key={days}
            size="sm"
            variant={numberOfDays === days ? 'filled' : 'outline'}
            onPress={() => setNumberOfDays(days)}
          >
            {days} days
          </Button>
        ))}
      </Row>
      <MiniCalendar
        value={selectedDate}
        onChange={(date: Date | null) => setSelectedDate(date)}
        numberOfDays={numberOfDays}
      />
      <Text size="sm" c="secondary">
        {selectedDate ? `Selected: ${selectedDate.toLocaleDateString()}` : 'No date selected'}
      </Text>
    </Block>
  );
}