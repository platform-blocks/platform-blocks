# YearPicker

Grid-based selector for choosing a year within a configurable range. Supports responsive layouts, decade navigation, and min/max constraints for simplified year selection flows.

## Metadata

- Canonical name: `YearPicker`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { YearPicker } from '@platform-blocks/react-ui-library';`
- Status: beta
- Since: 0.1.0
- Category: dates
- Docs: https://react-ui-library.com/components/YearPicker
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/YearPicker

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | Date \| null | No |  | Currently selected date |
| `onChange` | (date: Date \| null) => void | No |  | Called when a year is selected |
| `decade` | number | No |  | Decade anchor that should be displayed |
| `onDecadeChange` | (decade: number) => void | No |  | Called when the visible decade changes |
| `minDate` | Date | No |  | Minimum selectable date (inclusive) |
| `maxDate` | Date | No |  | Maximum selectable date (inclusive) |
| `size` | SizeValue | No |  | Typography size token |
| `yearsPerRow` | ResponsiveProp<number> | No |  | Responsive override for number of years per row |
| `hideHeader` | boolean | No |  | Hide navigation header when embedding the picker |
| `totalYears` | number | No |  | Total number of years to render (defaults to 20) |
| `fullWidth` | boolean | No |  | Stretch to fill the container instead of sizing to the natural grid width. Default `false`. |

## Examples

### Basic
ID: `YearPicker.basic` • Category: general

```tsx
const [value, setValue] = useState<Date | null>(new Date());
  return (
    <Block fullWidth>
      <YearPicker value={value} onChange={setValue} totalYears={20} />
      <Text size="sm" color="secondary">
        {value ? `Selected: ${value.getFullYear()}` : 'No year selected'}
      </Text>
    </Block>
  );
}
```
