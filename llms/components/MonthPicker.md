# MonthPicker

Interactive grid for selecting a month within a given year. Renders a responsive layout that adapts to screen width and respects locale formatting as well as min/max date constraints.

## Metadata

- Canonical name: `MonthPicker`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { MonthPicker } from '@platform-blocks/react-ui-library';`
- Category: dates
- Tags: date, month, picker, calendar
- Docs: https://react-ui-library.com/components/MonthPicker
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/MonthPicker

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | Date \| null | No |  | Currently selected date (uses the first day of the month) |
| `onChange` | (date: Date \| null) => void | No |  | Called when user picks a new month |
| `year` | number | No |  | Force a specific year to render |
| `onYearChange` | (year: number) => void | No |  | Called when the visible year changes |
| `minDate` | Date | No |  | Minimum selectable date (inclusive) |
| `maxDate` | Date | No |  | Maximum selectable date (inclusive) |
| `locale` | string | No |  | Locale used for month labels |
| `size` | ComponentSizeValue | No |  | Size token that influences typography weight |
| `monthLabelFormat` | 'short' \| 'long' | No |  | Format of month labels |
| `hideHeader` | boolean | No |  | Hide navigation header (used when embedded in Calendar) |
| `monthsPerRow` | ResponsiveProp<number> | No |  | Responsive override for the number of months rendered per row |
| `fullWidth` | boolean | No |  | Stretch to fill the container instead of sizing to the natural grid width. Default `false`. |

## Examples

### Basic
ID: `MonthPicker.basic` • Category: general

```tsx
const [value, setValue] = useState<Date | null>(new Date());
  return (
    <Block fullWidth>
      <MonthPicker value={value} onChange={setValue} monthLabelFormat="long" />
      <Text size="sm" color="secondary">
        {value
          ? value.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
          : 'No month selected'}
      </Text>
    </Block>
  );
}
```
