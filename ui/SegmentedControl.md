# SegmentedControl

SegmentedControl lets users choose one option from a small set of segments.

## Metadata

- Import: `import { SegmentedControl } from '@plocks/ui';`
- Status: beta
- Tags: input, segmentation, toggle, selection
- Docs: https://plocks.dev/components/SegmentedControl
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/SegmentedControl

## Props

- `data` (required): SegmentedControlData[] — Data that defines the segments
- `value`: string — Controlled value
- `defaultValue`: string — Uncontrolled initial value
- `onChange`: (value: string) => void — Called when value changes
- `size`: SizeValue — Control size, maps to height and font size
- `color`: ColorProp — Indicator color: palette token, `'primary.6'` shade syntax, or CSS color
- `orientation`: 'horizontal' | 'vertical' — Layout orientation
- `fullWidth`: boolean — Stretch across available width
- `disabled`: boolean — Disable entire control
- `readOnly`: boolean — Prevent user interaction but keep visual state
- `autoContrast`: boolean — Adjust text color automatically for filled/outline variants
- `withItemsBorders`: boolean — Render dividers between items
- `transitionDuration`: number — Indicator transition duration (ms)
- `transitionTimingFunction`: string — Indicator transition easing
- `name`: string — Radio group name; also the group's accessible name when there is no label
- `variant`: 'default' | 'filled' | 'outline' | 'ghost' — Visual style variant
- `indicatorStyle`: StyleProp<ViewStyle> — Custom style for indicator
- `itemStyle`: StyleProp<ViewStyle> — Custom style applied to every item
- `accessibilityLabel`: string — Accessibility label for the entire control
- `label`: ReactNode — Optional label rendered alongside the control
- `description`: ReactNode — Supplementary description text rendered with the label
- `labelPosition`: 'left' | 'right' | 'top' | 'bottom' — Placement of the label relative to the control (`left` / `right` follow the reading direction)
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), `radius`, visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export type SegmentedControlData = string | SegmentedControlItem;

export interface SegmentedControlItem {
  /** Unique value returned in change events */
  value: string;
  /** Item label, string will be rendered with Text component */
  label: ReactNode;
  /** Disable this specific segment */
  disabled?: boolean;
  /** Screen reader label override (required when `label` isn't a string) */
  ariaLabel?: string;
  /** Optional test identifier for automation */
  testID?: string;
}
```

## Examples

### Basics

Set `defaultValue` to preselect a segment and let the control manage focus and selection state internally.

```tsx
import { SegmentedControl } from '@plocks/ui';

const frameworks = [
  { label: 'React', value: 'react' },
  { label: 'Angular', value: 'angular' },
  { label: 'Vue', value: 'vue' },
];

export function Demo() {
  return (
    <SegmentedControl defaultValue="react" data={frameworks} />
  );
}
```

### Controlled Value

Provide `value` and `onChange` to synchronize the selected segment with external state or companion controls.

```tsx
import { useState } from 'react';
import { Block, SegmentedControl, Text } from '@plocks/ui';

export function Demo() {
  const [value, setValue] = useState('React');

  return (
    <Block>
      <SegmentedControl value={value} onChange={setValue} data={['React', 'Angular', 'Vue']} />
      <Text size="xs" c="secondary">
        Selected value: {value}
      </Text>
    </Block>
  );
}
```

### Sizes

Use the `size` prop to match dense toolbars or spacious layouts without changing the underlying data.

```tsx
import { Block, SegmentedControl, Text } from '@plocks/ui';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

export function Demo() {
  return (
    <Block>
      {SIZES.map((size) => (
        <Block key={size}>
          <Text variant="small" c="secondary">{size}</Text>
          <SegmentedControl size={size} data={['React', 'Angular', 'Vue']} defaultValue="React" />
        </Block>
      ))}
    </Block>
  );
}
```

### Full Width

Apply `fullWidth` to let segments expand and distribute evenly across the available horizontal space.

```tsx
import { SegmentedControl } from '@plocks/ui';

export function Demo() {
  return (
    <SegmentedControl fullWidth defaultValue="Preview" data={['Preview', 'Code', 'Export']} />
  );
}
```

### Orientation

Toggle the `orientation` prop to rotate the control vertically for sidebars or keep it horizontal for toolbars.

```tsx
import { Row, SegmentedControl } from '@plocks/ui';

const data = ['React', 'Angular', 'Vue'];

export function Demo() {
  return (
    <Row gap="lg" align="flex-start" wrap="wrap">
      <SegmentedControl
        label="Horizontal (default)"
        orientation="horizontal"
        defaultValue="React"
        data={data}
      />
      <SegmentedControl
        label="Vertical"
        orientation="vertical"
        defaultValue="React"
        data={data}
      />
    </Row>
  );
}
```

### Custom Colors

Set the `color` prop to pull semantic tokens or pass custom values, and enable `autoContrast` when you need readable labels on vivid fills.

```tsx
import { Block, SegmentedControl } from '@plocks/ui';

const data = ['React', 'Angular', 'Vue'];

export function Demo() {
  return (
    <Block>
      <SegmentedControl color="primary" defaultValue="React" data={data} />
      <SegmentedControl color="success" defaultValue="React" data={data} />
      <SegmentedControl color="purple" defaultValue="React" data={data} />
      <SegmentedControl color="#FF6B6B" autoContrast defaultValue="React" data={data} />
    </Block>
  );
}
```

### Interaction States

Combine `disabled`, `readOnly`, or per-item `disabled` flags to signal availability without changing layout or selection rules.

```tsx
import { Block, SegmentedControl } from '@plocks/ui';

const data = ['React', 'Angular', 'Vue'];

export function Demo() {
  return (
    <Block>
      <SegmentedControl label="Disabled" disabled defaultValue="React" data={data} />
      <SegmentedControl label="Read only" readOnly defaultValue="React" data={data} />
      <SegmentedControl
        label="Single option disabled"
        defaultValue="React"
        data={['React', 'Angular', { label: 'Vue', value: 'Vue', disabled: true }]}
      />
    </Block>
  );
}
```

### Visual Variants

Choose between `default`, `filled`, `outline`, or `ghost` variants and pair them with semantic `color` tokens to match the surrounding surface.

```tsx
import { Block, SegmentedControl } from '@plocks/ui';

const data = ['React', 'Angular', 'Vue'];

export function Demo() {
  return (
    <Block>
      <SegmentedControl label="Default" variant="default" defaultValue="React" data={data} />
      <SegmentedControl label="Filled" variant="filled" defaultValue="React" data={data} />
      <SegmentedControl label="Outline" variant="outline" color="secondary" defaultValue="React" data={data} />
      <SegmentedControl label="Ghost" variant="ghost" color="success" defaultValue="React" data={data} />
    </Block>
  );
}
```
