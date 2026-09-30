import React, { useState } from 'react';
import { Block, Text } from '@plocks/ui';
import { TimePickerInput } from '@plocks/dates';
import type { TimePickerValue } from '@plocks/dates';

const withinBusiness = (v: TimePickerValue) => {
  const totalMinutes = v.hours * 60 + v.minutes;
  return totalMinutes >= 9 * 60 && totalMinutes <= 17 * 60; // 09:00 - 17:00 inclusive
};

export function Demo() {
  const [value, setValue] = useState<TimePickerValue | null>({ hours: 8, minutes: 45 });
  const [error, setError] = useState<string | undefined>(undefined);

  const handleChange = (next: TimePickerValue | null) => {
    setValue(next);
    if (!next) {
      setError(undefined);
      return;
    }

    if (!withinBusiness(next)) {
      setError('Select a time between 09:00 and 17:00');
    } else {
      setError(undefined);
    }
  };

  return (
    <Block fullWidth>
      <TimePickerInput
        value={value}
        onChange={handleChange}
        label="Meeting time"
        error={error}
        helperText="Business hours only"
        clearable
        fullWidth
      />
      {value && (
        <Text size="sm" c="secondary">
          Selected: {value.hours.toString().padStart(2, '0')}:{value.minutes.toString().padStart(2, '0')}
        </Text>
      )}
    </Block>
  );
}
