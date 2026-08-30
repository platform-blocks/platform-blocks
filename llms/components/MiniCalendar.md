# MiniCalendar

A compact calendar component for displaying a month view with selectable dates.

## Metadata

- Canonical name: `MiniCalendar`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { MiniCalendar } from '@platform-blocks/react-ui-library';`
- Category: dates
- Docs: https://react-ui-library.com/components/MiniCalendar
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/MiniCalendar

## Props

_No documented props yet._

## Examples

### Basic MiniCalendar
ID: `MiniCalendar.basic` • Category: general

Compact calendar showing a week view with date selection.

```tsx
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
```

### Custom Day Count
ID: `MiniCalendar.customDays` • Category: general

MiniCalendar with configurable number of days displayed.

```tsx
const DAY_OPTIONS = [3, 5, 7];
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
      <Text size="sm" color="secondary">
        {selectedDate ? `Selected: ${selectedDate.toLocaleDateString()}` : 'No date selected'}
      </Text>
    </Block>
  );
}
```

### Date Constraints
ID: `MiniCalendar.constrained` • Category: general

MiniCalendar with minimum and maximum date restrictions.

```tsx
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
```
