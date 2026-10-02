# Checkbox

Checkbox lets users select options individually or in a group.

## Metadata

- Import: `import { Checkbox } from '@plocks/ui';`
- Tags: checkbox, input, form, selection, toggle
- Docs: https://plocks.dev/components/Checkbox
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Checkbox

## Props

- `checked`: boolean — Controlled checked state.
- `defaultChecked`: boolean = false — Initial checked state for uncontrolled usage.
- `onChange`: (checked: boolean) => void — Called with the next checked state.
- `indeterminate`: boolean = false — Mixed state for partial selections (`aria-checked="mixed"`). Pressing it checks the box.
- `color`: ThemeColor — Indicator color: a palette token (`'success'`), `'primary.6'` shade syntax, or any CSS color.
- `icon`: React.ReactNode — Icon shown when checked.
- `indeterminateIcon`: React.ReactNode — Icon shown when indeterminate.
- `labelPosition`: CheckboxLabelPosition = 'right' — Label position relative to the box. `left` / `right` follow the reading direction (`right` = after the box). Default `'right'`.
- `transitionDuration`: number = 160 — Length of the check/uncheck animation in ms; the fill and mark phases scale against it. `0` applies the state instantly. Always 0 under reduced motion.
- `children`: React.ReactNode — Label content (alternative to `label`; wins when both are set).
- `id`: string — Base id: the control gets it, the label/description/error get `${id}-label` etc.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — field (`label` `description` `error` `helperText` `required` `withAsterisk` `disabled` `readOnly` `size` `radius` `name` `accessibilityLabel` `accessibilityHint` `labelProps` `descriptionProps` `onFocus` `onBlur`), base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), sizing (`fullWidth`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`), disclaimer (`disclaimer` `disclaimerProps`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export type CheckboxLabelPosition = ChoiceLabelPosition;
```

## Examples

### Basics

Controlled checkbox example with a helper message that reacts to user selection.

```tsx
import { useState } from 'react';
import { Block, Checkbox } from '@plocks/ui';

export function Demo() {
  const [checked, setChecked] = useState(false);

  return (
    <Block w={600}>
      <Checkbox
        label="Accept terms and conditions"
        description={checked ? 'Thanks! You can proceed to the next step.' : 'Check the box to continue.'}
        checked={checked}
        onChange={setChecked}
      />
    </Block>
  );
}
```

### Sizes

Choose a `size` token (`xs` through `3xl`) to scale the checkbox.

```tsx
import { Block, Checkbox, Row, Text } from '@plocks/ui';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

export function Demo() {
  return (
    <Row align="center" gap="lg" wrap="wrap">
      {SIZES.map((size) => (
        <Block key={size} align="center">
          <Checkbox accessibilityLabel={`Checkbox ${size}`} size={size} defaultChecked />
          <Text variant="small">{size}</Text>
        </Block>
      ))}
    </Row>
  );
}
```

### Colors

Pass a semantic `color` token (`primary`, `secondary`, `success`, `warning`, `error`) to match the checkbox accent to the message intent.

```tsx
import { Block, Checkbox } from '@plocks/ui';

const COLORS = ['primary', 'secondary', 'success', 'warning', 'error'] as const;

export function Demo() {
  return (
    <Block>
      {COLORS.map((color) => (
        <Checkbox key={color} color={color} label={color} defaultChecked />
      ))}
    </Block>
  );
}
```

### States

Highlight enabled, disabled, required, and error states to cover validation scenarios.

```tsx
import { Block, Checkbox } from '@plocks/ui';

export function Demo() {
  return (
    <Block>
      <Checkbox label="Enabled" defaultChecked />
      <Checkbox label="Disabled" disabled />
      <Checkbox label="Required" required defaultChecked />
      <Checkbox label="With error" error="Selection required" />
    </Block>
  );
}
```

### Indeterminate

Demonstrates a parent checkbox that toggles a group and reflects partial selection with `indeterminate`.

```tsx
import { useState } from 'react';
import { Block, Checkbox } from '@plocks/ui';

const ITEMS = [
  { id: 1, label: 'Email notifications' },
  { id: 2, label: 'SMS alerts' },
  { id: 3, label: 'Push notifications' },
];

export function Demo() {
  const [selected, setSelected] = useState<number[]>([1]);
  const allIds = ITEMS.map((item) => item.id);
  const allChecked = selected.length === ITEMS.length;
  const someChecked = selected.length > 0 && !allChecked;

  const toggleAll = () => {
    setSelected((current) => (current.length === ITEMS.length ? [] : allIds));
  };

  const toggleItem = (id: number) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id]
    );
  };

  return (
    <Block>
      <Checkbox
        label="Select all"
        checked={allChecked}
        indeterminate={someChecked}
        onChange={toggleAll}
      />
      <Block pl="md">
        {ITEMS.map(({ id, label }) => (
          <Checkbox
            key={id}
            label={label}
            checked={selected.includes(id)}
            onChange={() => toggleItem(id)}
          />
        ))}
      </Block>
    </Block>
  );
}
```

### Descriptions

Use `description` for supporting copy under the label, and pair it with `error` to surface validation details.

```tsx
import { Block, Checkbox } from '@plocks/ui';

export function Demo() {
  return (
    <Block style={{ maxWidth: 400 }}>
      <Checkbox
        label="Receive product updates"
        description="Get occasional emails about new features and improvements."
      />
      <Checkbox
        label="Accept terms of service"
        description="Required before creating an account."
        error="Please accept to continue."
        required
      />
    </Block>
  );
}
```
