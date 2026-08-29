import React, { useMemo, useState } from 'react';
import { Block, DatePickerInput, Text } from '@platform-blocks/ui';

export function Demo() {
  const [value, setValue] = useState<Date | null>(null);
  const [error, setError] = useState<string | undefined>();

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const handleChange = (next: Date | [Date | null, Date | null] | Date[] | null) => {
    const dateValue = next as Date | null;
    setValue(dateValue);

    if (dateValue && dateValue < today) {
      setError('Date cannot be in the past');
    } else {
      setError(undefined);
    }
  };

  return (
    <Block fullWidth>
      <DatePickerInput
        value={value}
        onChange={handleChange}
        placeholder="Select a future date"
        label="Future date"
        error={error}
        clearable
        fullWidth
        calendarProps={{
          minDate: today,
          highlightToday: true,
        }}
      />
      <Text size="sm" color="secondary">
        Past dates show the validation state
      </Text>
    </Block>
  );
}
