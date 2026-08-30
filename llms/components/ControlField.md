# ControlField

ControlField combines a label, description, and a control (Switch, Checkbox, or Radio) into a single pressable row.

## Metadata

- Canonical name: `ControlField`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { ControlField } from '@platform-blocks/react-ui-library';`
- Category: input
- Tags: control, field, checkbox, switch, radio, toggle, form, selection, row
- Docs: https://react-ui-library.com/components/ControlField
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/ControlField

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `isSelected` | boolean | No |  | Controlled selected state |
| `checked` | boolean | No |  | Alias for `isSelected` to match other controls in the library |
| `defaultSelected` | boolean | No |  | Initial selected state for uncontrolled usage |
| `onSelectedChange` | (selected: boolean) => void | No |  | Change handler — fires with the next selected value |
| `onChange` | (selected: boolean) => void | No |  | Alias for `onSelectedChange` to match other controls in the library |
| `isDisabled` | boolean | No |  | Whether the field is disabled |
| `disabled` | boolean | No |  | Alias for `isDisabled` |
| `isInvalid` | boolean | No |  | Whether the field is in an invalid state (defaults to true when `error` is set) |
| `isRequired` | boolean | No |  | Whether the field is required (renders an asterisk on the label) |
| `required` | boolean | No |  | Alias for `isRequired` |
| `variant` | ControlFieldVariant | No |  | Which built-in control renders in the indicator slot |
| `label` | React.ReactNode | No |  | Primary label text |
| `description` | React.ReactNode | No |  | Helper text shown beneath the label |
| `error` | string | No |  | Error message shown below the row when invalid |
| `color` | ColorValue | No |  | Indicator color. A palette token, `'primary.6'` shade syntax, or any CSS color. |
| `size` | SizeValue | No |  | Indicator + label size |
| `indicatorPosition` | 'left' \| 'right' | No |  | Which side the indicator sits on. Defaults to `right`. |
| `control` | React.ReactElement | No |  | Custom control element used instead of the built-in `variant` indicator. `checked` / `disabled` are injected automatically when not already set. |
| `labelProps` | Omit<TextProps, 'children'> | No |  | Override props applied to the label `<Text>` |
| `descriptionProps` | Omit<TextProps, 'children'> | No |  | Override props applied to the description `<Text>` |
| `children` | React.ReactNode | No |  | Compound composition. When provided, children replace the built-in label/description/indicator layout. Use `ControlField.Label`, `ControlField.Description`, `ControlField.Indicator` and `ControlField.Error`. |
| `accessibilityLabel` | string | No |  | Accessibility label, used when there is no visible text label |
| `testID` | string | No |  | Component test ID for testing |
| `style` | any | No |  | Additional CSS styles |
| `m` | number | No |  | Margin applied to all sides |
| `mt` | number | No |  | Margin applied to the top side |
| `mr` | number | No |  | Margin applied to the right side |
| `mb` | number | No |  | Margin applied to the bottom side |
| `ml` | number | No |  | Margin applied to the left side |
| `mx` | number | No |  | Horizontal margin applied to left and right sides |
| `my` | number | No |  | Vertical margin applied to top and bottom sides |
| `p` | number | No |  | Padding applied to all sides |
| `pt` | number | No |  | Padding applied to the top side |
| `pr` | number | No |  | Padding applied to the right side |
| `pb` | number | No |  | Padding applied to the bottom side |
| `pl` | number | No |  | Padding applied to the left side |
| `px` | number | No |  | Horizontal padding applied to left and right sides |
| `py` | number | No |  | Vertical padding applied to top and bottom sides |

## Examples

### Basics
ID: `ControlField.basic` • Tags: control-field, switch • Category: basics • Status: stable • Since: 1.0.0

A controlled switch row — the whole row is a single tap target.

```tsx
const [enabled, setEnabled] = useState(true);
  return (
    <ControlField
      label="Push notifications"
      description="Get notified when something happens"
      isSelected={enabled}
      onSelectedChange={setEnabled}
    />
  );
}
```

### Checkbox with validation
ID: `ControlField.checkbox-validation` • Tags: control-field, checkbox, validation • Category: basics • Status: stable • Since: 1.0.0

A consent row using the `checkbox` variant. When left unchecked the field shows an error message below the row.

```tsx
const [agreed, setAgreed] = useState(false);
  return (
    <ControlField
      variant="checkbox"
      indicatorPosition="left"
      label="I agree to the Terms of Service"
      description="You must accept before continuing"
      isRequired
      isSelected={agreed}
      onSelectedChange={setAgreed}
      isInvalid={!agreed}
      error={!agreed ? 'This field is required' : undefined}
    />
  );
}
```

### Custom control
ID: `ControlField.custom-control` • Tags: control-field, composition, checkbox • Category: composition • Status: stable • Since: 1.0.0

Compose the row explicitly with `ControlField.Indicator` to drop in a custom control — here a warning-colored checkbox.

```tsx
const [subscribed, setSubscribed] = useState(false);
  return (
    <ControlField isSelected={subscribed} onSelectedChange={setSubscribed}>
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
ID: `ControlField.grouped-surface` • Tags: control-field, group, surface, settings, dividers • Category: composition • Status: stable • Since: 1.0.0

Wrap rows in `ControlField.Group` to get an iOS-style settings surface — a rounded, filled background with hairline dividers between rows. The group can carry an optional title and footer, and sets a shared size for its children.

```tsx
const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(false);
  const [airplane, setAirplane] = useState(false);
  return (
    <ControlField.Group
      variant="bordered"
      title="Connectivity"
      footer="Airplane mode disables all wireless radios."
    >
      <ControlField label="Wi-Fi" isSelected={wifi} onSelectedChange={setWifi} />
      <ControlField
        label="Bluetooth"
        isSelected={bluetooth}
        onSelectedChange={setBluetooth}
      />
      <ControlField
        label="Airplane mode"
        description="Turn off all connections"
        isSelected={airplane}
        onSelectedChange={setAirplane}
      />
    </ControlField.Group>
  );
}
```
