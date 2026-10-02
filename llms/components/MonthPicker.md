# MonthPicker

Interactive grid for selecting a month within a given year. Renders a responsive layout that adapts to screen width and respects locale formatting as well as min/max date constraints.

## Metadata

- Import: `import { MonthPicker } from '@plocks/dates';`
- Install: `npm install @plocks/dates` — a separate package from `@plocks/ui`
- Tags: date, month, picker, calendar
- Docs: https://plocks.dev/components/MonthPicker
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/dates/src/components/MonthPicker

## Props

- `value`: Date | null — Currently selected date (uses the first day of the month)
- `onChange`: (date: Date | null) => void — Called when user picks a new month
- `year`: number — Force a specific year to render
- `onYearChange`: (year: number) => void — Called when the visible year changes
- `minDate`: Date — Minimum selectable date (inclusive)
- `maxDate`: Date — Maximum selectable date (inclusive)
- `locale`: string = 'en-US' — Locale used for month labels
- `size`: ComponentSizeValue = 'md' — Size token that influences typography weight
- `monthLabelFormat`: 'short' | 'long' = 'long' — Format of month labels
- `hideHeader`: boolean = false — Hide navigation header (used when embedded in Calendar)
- `monthsPerRow`: ResponsiveProp<number> — Responsive override for the number of months rendered per row (breakpoints from `theme.breakpoints`).
- `fullWidth`: boolean = false — Stretch to fill the container instead of sizing to the natural grid width. Default `false`.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Examples

### Basics

Interactive grid for selecting a month within a given year. Renders a responsive layout that adapts to screen width and respects locale formatting as well as min/max date constraints.

```tsx
import React, { useState } from 'react';
import { Block, Text } from '@plocks/ui';
import { MonthPicker } from '@plocks/dates';

export function Demo() {
  const [value, setValue] = useState<Date | null>(new Date());

  return (
    <Block fullWidth>
      <MonthPicker value={value} onChange={setValue} monthLabelFormat="long" />
      <Text size="sm" c="secondary">
        {value
          ? value.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
          : 'No month selected'}
      </Text>
    </Block>
  );
}
```
