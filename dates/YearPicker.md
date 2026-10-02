# YearPicker

Grid-based selector for choosing a year within a configurable range. Supports responsive layouts, decade navigation, and min/max constraints for simplified year selection flows.

## Metadata

- Import: `import { YearPicker } from '@plocks/dates';`
- Install: `npm install @plocks/dates` — a separate package from `@plocks/ui`
- Status: beta
- Docs: https://plocks.dev/components/YearPicker
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/dates/src/components/YearPicker

## Props

- `value`: Date | null — Currently selected date
- `onChange`: (date: Date | null) => void — Called when a year is selected
- `decade`: number — Decade anchor that should be displayed
- `onDecadeChange`: (decade: number) => void — Called when the visible decade changes
- `minDate`: Date — Minimum selectable date (inclusive)
- `maxDate`: Date — Maximum selectable date (inclusive)
- `size`: SizeValue = 'md' — Typography size token
- `yearsPerRow`: ResponsiveProp<number> — Responsive override for number of years per row (breakpoints from `theme.breakpoints`).
- `hideHeader`: boolean = false — Hide navigation header when embedding the picker
- `totalYears`: number = 20 — Total number of years to render (defaults to 20)
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

Grid-based selector for choosing a year within a configurable range. Supports responsive layouts, decade navigation, and min/max constraints for simplified year selection flows.

```tsx
import React, { useState } from 'react';
import { Block, Text } from '@plocks/ui';
import { YearPicker } from '@plocks/dates';

export function Demo() {
  const [value, setValue] = useState<Date | null>(new Date());

  return (
    <Block fullWidth>
      <YearPicker value={value} onChange={setValue} totalYears={20} />
      <Text size="sm" c="secondary">
        {value ? `Selected: ${value.getFullYear()}` : 'No year selected'}
      </Text>
    </Block>
  );
}
```
