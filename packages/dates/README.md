<p align="center">
  <a href="https://plocks.dev/" rel="noopener" target="_blank"><img height="64" src="https://raw.githubusercontent.com/platform-blocks/plocks/main/brand/png/mark.png" alt="plocks"/></a>
</p>

<h1 align="center">@plocks/dates</h1>

<div align="center">

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/platform-blocks/plocks/blob/HEAD/LICENSE)
[![npm](https://img.shields.io/npm/v/@plocks/dates)](https://www.npmjs.com/package/@plocks/dates)

</div>

Calendars and date, month, year and time pickers for plocks. Part of [plocks](https://plocks.dev/): it builds on `@plocks/ui` and reads the same theme.

Contains `Calendar`, `MiniCalendar`, `DatePicker`, `DatePickerInput`, `MonthPicker`, `MonthPickerInput`, `YearPicker`, `YearPickerInput`, `TimePicker` and `TimePickerInput`.

## Installation

```bash
npm install @plocks/ui @plocks/dates
```

## Usage

Render inside the `PlocksProvider` from `@plocks/ui`:

```tsx
import { DatePickerInput } from '@plocks/dates';

<DatePickerInput label="Start date" value={date} onChange={setDate} />
```

See [plocks.dev](https://plocks.dev/) for every component, prop and example.

## License

[MIT](https://github.com/platform-blocks/plocks/blob/main/LICENSE) © [Josh Stovall](https://github.com/joshstovall)
