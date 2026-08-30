import React from 'react';
import { ScrollView } from 'react-native';
import {
  Block,
  Calendar,
  Card,
  Chip,
  DatePicker,
  DatePickerInput,
  Divider,
  MiniCalendar,
  MonthPicker,
  MonthPickerInput,
  Row,
  Text,
  TimePicker,
  TimePickerInput,
  Title,
  YearPicker,
  YearPickerInput,
} from '@platform-blocks/react-ui-library';
import type { TimePickerValue } from '@platform-blocks/react-ui-library';

const formatDate = (value: Date | null): string => {
  if (!value) return '—';
  return value.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatRange = (value: [Date | null, Date | null]): string => {
  const [start, end] = value;
  if (!start && !end) {
    return 'Range: —';
  }
  return `Range: ${formatDate(start)} → ${formatDate(end)}`;
};

const formatTime = (value: TimePickerValue | null, includeSeconds = false): string => {
  if (!value) return '—';
  const hours24 = value.hours ?? 0;
  const minutes = value.minutes ?? 0;
  const seconds = value.seconds ?? 0;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = ((hours24 + 11) % 12) + 1;
  const base = `${hours12.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}`;
  if (includeSeconds) {
    return `${base}:${seconds.toString().padStart(2, '0')} ${period}`;
  }
  return `${base} ${period}`;
};

const DatesPlayground: React.FC = () => {
  const [calendarDate, setCalendarDate] = React.useState<Date | null>(new Date());
  const [calendarRange, setCalendarRange] = React.useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [inlinePickerValue, setInlinePickerValue] = React.useState<Date | null>(new Date());
  const [rangePickerValue, setRangePickerValue] = React.useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [monthValue, setMonthValue] = React.useState<Date | null>(new Date());
  const [yearValue, setYearValue] = React.useState<Date | null>(new Date());
  const [monthInputValue, setMonthInputValue] = React.useState<Date | null>(null);
  const [yearInputValue, setYearInputValue] = React.useState<Date | null>(null);
  const [dateInputValue, setDateInputValue] = React.useState<Date | null>(null);
  const [timeValue, setTimeValue] = React.useState<TimePickerValue | null>(null);
  const [timeInputValue, setTimeInputValue] = React.useState<TimePickerValue | null>({
    hours: 9,
    minutes: 30,
  });
  const [meetingDate, setMeetingDate] = React.useState<Date | null>(new Date());
  const [meetingTime, setMeetingTime] = React.useState<TimePickerValue | null>({
    hours: 14,
    minutes: 0,
  });

  const handleCalendarChange = (next: unknown) => {
    if (next instanceof Date) {
      setCalendarDate(next);
      return;
    }
    if (Array.isArray(next)) {
      const [first] = next;
      setCalendarDate(first instanceof Date ? first : null);
      return;
    }
    setCalendarDate(null);
  };

  const handleCalendarRangeChange = (next: unknown) => {
    if (Array.isArray(next)) {
      const [start, end] = next as [Date | null, Date | null];
      setCalendarRange([start ?? null, end ?? null]);
      return;
    }
    setCalendarRange([null, null]);
  };

  const handleRangePickerChange = (next: unknown) => {
    if (Array.isArray(next)) {
      const [start, end] = next as [Date | null, Date | null];
      setRangePickerValue([start ?? null, end ?? null]);
      return;
    }
    setRangePickerValue([null, null]);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Block gap="lg">
        <Card padding={20}>
          <Block gap="md">
            <Title order={3} size={24} weight="semibold">
              Calendar surfaces
            </Title>
            <Text size="sm" color="secondary">
              Compare inline calendars, compact timelines, and range selection in one place.
            </Text>
            <Row gap="lg" wrap="wrap">
              <Block gap="sm" style={{ minWidth: 280, flex: 1 }}>
                <Text size="sm" weight="medium">
                  Single date calendar
                </Text>
                <Calendar
                  value={calendarDate}
                  onChange={handleCalendarChange}
                  highlightToday
                />
                <Chip size="sm" variant="subtle">
                  Selected: {formatDate(calendarDate)}
                </Chip>
              </Block>
              <Block gap="sm" style={{ minWidth: 220, flex: 1 }}>
                <Text size="sm" weight="medium">
                  Mini calendar overview
                </Text>
                <MiniCalendar
                  value={calendarDate}
                  onChange={setCalendarDate}
                  numberOfDays={14}
                />
                <Chip size="sm" variant="outline">
                  Next up: {formatDate(calendarDate)}
                </Chip>
              </Block>
              <Block gap="sm" style={{ minWidth: 320, flex: 1 }}>
                <Text size="sm" weight="medium">
                  Two month range
                </Text>
                <Calendar
                  type="range"
                  value={calendarRange}
                  onChange={handleCalendarRangeChange}
                  highlightToday
                  numberOfMonths={2}
                  withCellSpacing
                />
                <Chip size="sm" variant="subtle">
                  {formatRange(calendarRange)}
                </Chip>
              </Block>
            </Row>
          </Block>
        </Card>

        <Card padding={20}>
          <Block gap="md">
            <Title order={3} size={24} weight="semibold">
              Date pickers
            </Title>
            <Text size="sm" color="secondary">
              Stateful examples of the inline picker and multi-month range flows.
            </Text>
            <Row gap="lg" wrap="wrap">
              <Block gap="sm" style={{ minWidth: 280, flex: 1 }}>
                <Text size="sm" weight="medium">
                  Inline date picker
                </Text>
                <DatePicker
                  value={inlinePickerValue}
                  onChange={(next) => {
                    setInlinePickerValue(next instanceof Date ? next : null);
                  }}
                  calendarProps={{ highlightToday: true }}
                />
                <Chip size="sm" variant="outline">
                  {formatDate(inlinePickerValue)}
                </Chip>
              </Block>
              <Block gap="sm" style={{ minWidth: 320, flex: 1 }}>
                <Text size="sm" weight="medium">
                  Range picker with quick context
                </Text>
                <DatePicker
                  type="range"
                  value={rangePickerValue}
                  onChange={handleRangePickerChange}
                  calendarProps={{
                    numberOfMonths: 2,
                    highlightToday: true,
                    withCellSpacing: true,
                  }}
                />
                <Chip size="sm" variant="outline">
                  {formatRange(rangePickerValue)}
                </Chip>
              </Block>
            </Row>
          </Block>
        </Card>

        <Card padding={20}>
          <Block gap="md">
            <Title order={3} size={24} weight="semibold">
              Month and year grids
            </Title>
            <Text size="sm" color="secondary">
              Responsive pickers map to the same date helpers used in Calendar flows.
            </Text>
            <Row gap="lg" wrap="wrap">
              <Block gap="sm" style={{ minWidth: 260, flex: 1 }}>
                <Text size="sm" weight="medium">
                  Month picker
                </Text>
                <MonthPicker
                  value={monthValue}
                  onChange={setMonthValue}
                  monthLabelFormat="short"
                  monthsPerRow={{ base: 3, md: 4 }}
                />
                <Chip size="sm" variant="subtle">
                  {formatDate(monthValue)}
                </Chip>
              </Block>
              <Block gap="sm" style={{ minWidth: 260, flex: 1 }}>
                <Text size="sm" weight="medium">
                  Year picker
                </Text>
                <YearPicker
                  value={yearValue}
                  onChange={setYearValue}
                  yearsPerRow={{ base: 3, lg: 4 }}
                />
                <Chip size="sm" variant="subtle">
                  {formatDate(yearValue)}
                </Chip>
              </Block>
            </Row>
          </Block>
        </Card>

        <Card padding={20}>
          <Block gap="md">
            <Title order={3} size={24} weight="semibold">
              Dialog inputs
            </Title>
            <Text size="sm" color="secondary">
              Inputs wrap the same pickers in modal flows with formatting helpers.
            </Text>
            <Row gap="lg" wrap="wrap">
              <Block gap="sm" style={{ minWidth: 260, flex: 1 }}>
                <Text size="sm" weight="medium">
                  Date input
                </Text>
                <DatePickerInput
                  label="Launch date"
                  placeholder="Select a date"
                  value={dateInputValue}
                  onChange={(next) => {
                    setDateInputValue(next instanceof Date ? next : null);
                  }}
                  clearable
                />
                <Text size="xs" color="secondary">
                  Selected: {formatDate(dateInputValue)}
                </Text>
              </Block>
              <Block gap="sm" style={{ minWidth: 260, flex: 1 }}>
                <Text size="sm" weight="medium">
                  Month input
                </Text>
                <MonthPickerInput
                  label="Billing cycle"
                  placeholder="Pick a month"
                  value={monthInputValue}
                  onChange={setMonthInputValue}
                  clearable
                  monthPickerProps={{
                    monthLabelFormat: 'long',
                    monthsPerRow: { base: 3, md: 4 },
                  }}
                />
                <Text size="xs" color="secondary">
                  Selected: {formatDate(monthInputValue)}
                </Text>
              </Block>
              <Block gap="sm" style={{ minWidth: 260, flex: 1 }}>
                <Text size="sm" weight="medium">
                  Year input
                </Text>
                <YearPickerInput
                  label="Fiscal year"
                  placeholder="Choose a year"
                  value={yearInputValue}
                  onChange={setYearInputValue}
                  clearable
                />
                <Text size="xs" color="secondary">
                  Selected: {formatDate(yearInputValue)}
                </Text>
              </Block>
            </Row>
            <Divider />
            <Row gap="lg" wrap="wrap">
              <Block gap="sm" style={{ minWidth: 260, flex: 1 }}>
                <Text size="sm" weight="medium">
                  Time picker panel
                </Text>
                <TimePicker
                  value={timeValue}
                  onChange={(next) => setTimeValue(next)}
                  format={12}
                  withSeconds
                  minuteStep={5}
                />
                <Text size="xs" color="secondary">
                  Scheduled: {formatTime(timeValue, true)}
                </Text>
              </Block>
              <Block gap="sm" style={{ minWidth: 260, flex: 1 }}>
                <Text size="sm" weight="medium">
                  Time input (24h)
                </Text>
                <TimePickerInput
                  label="Deployment window"
                  value={timeInputValue}
                  onChange={(next) => setTimeInputValue(next)}
                  format={24}
                  minuteStep={15}
                  fullWidth
                  clearable
                />
                <Text size="xs" color="secondary">
                  Scheduled: {formatTime(timeInputValue)}
                </Text>
              </Block>
            </Row>
          </Block>
        </Card>

        <Card padding={20}>
          <Block gap="md">
            <Title order={3} size={24} weight="semibold">
              Meeting builder
            </Title>
            <Text size="sm" color="secondary">
              Combine date and time inputs to assemble a quick event summary.
            </Text>
            <Row gap="lg" wrap="wrap">
              <Block gap="sm" style={{ minWidth: 260, flex: 1 }}>
                <DatePickerInput
                  label="Meeting date"
                  value={meetingDate}
                  onChange={(next) => {
                    setMeetingDate(next instanceof Date ? next : null);
                  }}
                  placeholder="Choose a day"
                  clearable
                />
              </Block>
              <Block gap="sm" style={{ minWidth: 260, flex: 1 }}>
                <TimePickerInput
                  label="Start time"
                  value={meetingTime}
                  onChange={(next) => setMeetingTime(next)}
                  format={12}
                  minuteStep={10}
                  clearable
                />
              </Block>
            </Row>
            <Chip size="sm" variant="outline">
              Next session: {formatDate(meetingDate)} at {formatTime(meetingTime)}
            </Chip>
          </Block>
        </Card>
      </Block>
    </ScrollView>
  );
};

export default DatesPlayground;
