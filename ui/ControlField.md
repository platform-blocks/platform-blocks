# ControlField

ControlField combines a label, description, and a control (Switch, Checkbox, or Radio) into a single pressable row.

## Metadata

- Import: `import { ControlField } from '@plocks/ui';`
- Tags: control, field, checkbox, switch, radio, toggle, form, selection, row
- Docs: https://plocks.dev/components/ControlField
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/ControlField

## Props

- `checked`: boolean — Controlled on/selected state.
- `defaultChecked`: boolean — Initial state for uncontrolled usage.
- `onChange`: (checked: boolean) => void — Called with the next state.
- `disabled`: boolean — Disables the row.
- `required`: boolean — Marks the field required (asterisk on the label, announced).
- `variant`: 'checkbox' | 'radio' | 'switch' — Which built-in control renders in the indicator slot. Default `'switch'`.
- `label`: React.ReactNode — Primary label.
- `description`: React.ReactNode — Supporting text shown beneath the label.
- `error`: React.ReactNode — Error shown below the row; marks the field invalid. `true` marks it invalid without a message.
- `color`: ThemeColor — Indicator color: a palette token, `'primary.6'` shade syntax, or any CSS color.
- `size`: SizeValue — Indicator + label size. Inherits from `ControlField.Group`.
- `indicatorPosition`: 'left' | 'right' — Which side the indicator sits on (logical: `right` = end). Default `'right'`.
- `control`: React.ReactElement<{ checked?: boolean; disabled?: boolean }> — Custom control element used instead of the built-in `variant` indicator. `checked` / `disabled` are injected automatically when not already set.
- `labelProps`: Omit<TextProps, 'children'> — Props applied to the label `<Text>`.
- `descriptionProps`: Omit<TextProps, 'children'> — Props applied to the description `<Text>`.
- `children`: React.ReactNode — Compound composition. When provided, children replace the built-in label/description/indicator layout. Use `ControlField.Label`, `ControlField.Description`, `ControlField.Indicator` and `ControlField.Error`.
- `accessibilityLabel`: string — Accessible name when there is no visible text label (overrides the label).
- `accessibilityHint`: string — Extra native hint.
- `id`: string — Base id: the row gets it, the label/description/error get `${id}-label` etc.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Sub-components

`import { ControlFieldGroup } from '@plocks/ui';`

### ControlFieldGroup

- `children` (required): React.ReactNode — ControlField rows.
- `variant`: 'default' | 'bordered' | 'flush' — Surface treatment. - `default` — filled surface, no border - `bordered` — filled surface with a hairline border - `flush` — no surface; just the dividers between rows
- `dividers`: boolean — Insert a divider between rows. Defaults to `true`.
- `insetDividers`: boolean — Inset the divider from the leading edge to align under the row content.
- `radius`: RadiusValue — Corner radius token or pixel value. Defaults to `lg`.
- `size`: SizeValue — Default size applied to every child field (and the row padding scale).
- `title`: React.ReactNode — Optional section title rendered above the surface.
- `titleProps`: Omit<TextProps, 'children'> — Override props for the title `<Text>`; the theme's `sectionLabel` text role by default.
- `footer`: React.ReactNode — Optional footer/help text rendered below the surface.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### ControlField.Description

- `children`: React.ReactNode
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Plus the `Text` props (`tx` `txParams` `variant` `textRole` `size` `c` `fw` `ta` `lh` `lts` `tt` `fs` `td` `ff` `flex` `shrink` `position` `top` `right` `bottom` `left` `as` `selectable` `onPress` `onLayout` `value` `numberOfLines` `ellipsizeMode` `id` `nativeID`): https://plocks.dev/llms/components/Text.md

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### ControlField.Group

- `children` (required): React.ReactNode — ControlField rows.
- `variant`: 'default' | 'bordered' | 'flush' — Surface treatment. - `default` — filled surface, no border - `bordered` — filled surface with a hairline border - `flush` — no surface; just the dividers between rows
- `dividers`: boolean — Insert a divider between rows. Defaults to `true`.
- `insetDividers`: boolean — Inset the divider from the leading edge to align under the row content.
- `radius`: RadiusValue — Corner radius token or pixel value. Defaults to `lg`.
- `size`: SizeValue — Default size applied to every child field (and the row padding scale).
- `title`: React.ReactNode — Optional section title rendered above the surface.
- `titleProps`: Omit<TextProps, 'children'> — Override props for the title `<Text>`; the theme's `sectionLabel` text role by default.
- `footer`: React.ReactNode — Optional footer/help text rendered below the surface.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### ControlField.Indicator

- `variant`: 'checkbox' | 'radio' | 'switch' — Override the field's variant for this indicator.
- `children`: React.ReactElement<{ checked?: boolean; disabled?: boolean }> — Custom control element (checked/disabled injected from context).
- `style`: StyleProp<ViewStyle>
- `testID`: string

### ControlField.Label

- `children`: React.ReactNode
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Plus the `Text` props (`tx` `txParams` `variant` `textRole` `size` `c` `fw` `ta` `lh` `lts` `tt` `fs` `td` `ff` `flex` `shrink` `position` `top` `right` `bottom` `left` `as` `selectable` `onPress` `onLayout` `value` `numberOfLines` `ellipsizeMode` `id` `nativeID`): https://plocks.dev/llms/components/Text.md

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Related hooks

- `useControlField(): ControlFieldContextValue` — Returns the enclosing `ControlField`'s state (`checked`, `onChange`, `disabled`, `invalid`, `required`, `size`, `ids`, …) for custom controls and compound parts, and throws outside a `<ControlField>` — use `useControlFieldContext()` for a non-throwing read.
- `useControlFieldContext(): ControlFieldContextValue | null` — Returns the enclosing `ControlField`'s state, or `null` outside one — the non-throwing variant of `useControlField()`, for controls that also work on their own.
- `useControlFieldGroup(): ControlFieldGroupContextValue | null` — Returns the shared config of the enclosing `ControlField.Group` (its default `size` for child rows), or `null` outside a group — never throws.

## Examples

### Basics

A controlled switch row — the whole row is a single tap target.

```tsx
import { useState } from 'react';
import { ControlField } from '@plocks/ui';

export function Demo() {
  const [enabled, setEnabled] = useState(true);

  return (
    <ControlField
      label="Push notifications"
      description="Get notified when something happens"
      checked={enabled}
      onChange={setEnabled}
    />
  );
}
```

### Checkbox with validation

A consent row using the `checkbox` variant. When left unchecked the field shows an error message below the row.

```tsx
import { useState } from 'react';
import { ControlField } from '@plocks/ui';

export function Demo() {
  const [agreed, setAgreed] = useState(false);

  return (
    <ControlField
      variant="checkbox"
      indicatorPosition="left"
      label="I agree to the Terms of Service"
      description="You must accept before continuing"
      required
      checked={agreed}
      onChange={setAgreed}
      error={!agreed ? 'This field is required' : undefined}
    />
  );
}
```

### Variants

Compare the switch, checkbox, and radio indicators inside the same pressable field row.

```tsx
import { Column, ControlField } from '@plocks/ui';

const variants = ['switch', 'checkbox', 'radio'] as const;

export function Demo() {
  return (
    <Column gap="sm" fullWidth>
      {variants.map(variant => (
        <ControlField key={variant} variant={variant} label={`${variant} control`} description="Tap the row to change its value" defaultChecked={variant === 'switch'} />
      ))}
    </Column>
  );
}
```

### Custom control

Compose the row explicitly with `ControlField.Indicator` to drop in a custom control — here a warning-colored checkbox.

```tsx
import { useState } from 'react';
import { Block, Checkbox, ControlField } from '@plocks/ui';

export function Demo() {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <ControlField checked={subscribed} onChange={setSubscribed}>
      <Block style={{ flex: 1 }} fullWidth={false}>
        <ControlField.Label>Subscribe to newsletter</ControlField.Label>
        <ControlField.Description>
          One email a week, unsubscribe anytime
        </ControlField.Description>
      </Block>
      <ControlField.Indicator>
        <Checkbox color="warning" />
      </ControlField.Indicator>
    </ControlField>
  );
}
```

### Grouped surface

Wrap rows in `ControlField.Group` to get an iOS-style settings surface — a rounded, filled background with hairline dividers between rows. The group can carry an optional title and footer, and sets a shared size for its children.

```tsx
import { useState } from 'react';
import { ControlField } from '@plocks/ui';

export function Demo() {
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(false);
  const [airplane, setAirplane] = useState(false);

  return (
    <ControlField.Group
      variant="bordered"
      title="Connectivity"
      footer="Airplane mode disables all wireless radios."
    >
      <ControlField label="Wi-Fi" checked={wifi} onChange={setWifi} />
      <ControlField
        label="Bluetooth"
        checked={bluetooth}
        onChange={setBluetooth}
      />
      <ControlField
        label="Airplane mode"
        description="Turn off all connections"
        checked={airplane}
        onChange={setAirplane}
      />
    </ControlField.Group>
  );
}
```
