# Checkbox

The Checkbox component allows users to select one or more options from a set. Supports different states, colors, and group functionality.

## Metadata

- Canonical name: `Checkbox`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Checkbox } from '@platform-blocks/react-ui-library';`
- Category: input
- Tags: checkbox, input, form, selection, toggle
- Docs: https://react-ui-library.com/components/Checkbox
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Checkbox

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `checked` | boolean | No |  | Whether checkbox is checked |
| `defaultChecked` | boolean | No | false | Initial checked value for uncontrolled usage |
| `onChange` | (checked: boolean) => void | No |  | Change handler |
| `indeterminate` | boolean | No | false | Indeterminate state for partial selections |
| `color` | string | No |  | Indicator color. A palette token (`'success'`), `'primary.6'` shade syntax, or any CSS color. |
| `size` | SizeValue | No | 'md' | Checkbox size |
| `label` | React.ReactNode | No |  | Checkbox label |
| `disabled` | boolean | No | false | Whether checkbox is disabled |
| `required` | boolean | No | false | Whether checkbox is required |
| `error` | string | No |  | Error message |
| `description` | string | No |  | Helper text |
| `icon` | React.ReactNode | No |  | Icon to show when checked |
| `indeterminateIcon` | React.ReactNode | No |  | Icon to show when indeterminate |
| `labelPosition` | 'left' \| 'right' \| 'top' \| 'bottom' | No | 'right' | Label position relative to checkbox |
| `labelProps` | Omit<TextProps, 'children'> | No |  | Override styles/props applied to the label `<Text>` |
| `descriptionProps` | Omit<TextProps, 'children'> | No |  | Override styles/props applied to the description `<Text>` |
| `transitionDuration` | number | No | 160 | Length of the check/uncheck animation in ms; the fill and mark phases scale against it. `0` applies the state instantly. Always 0 under reduced motion. |
| `children` | React.ReactNode | No |  | Checkbox content/children (alternative to label) |
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
ID: `Checkbox.basic` • Tags: checkboxes • Category: basics • Status: stable • Since: 1.0.0

Controlled checkbox example with a helper message that reacts to user selection.

```tsx
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
ID: `Checkbox.sizes` • Tags: checkboxes, sizes • Category: styling • Status: stable • Since: 1.0.0

Explore available checkbox sizes with guidance on where each fits best.

```tsx
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;
  return (
    <Row align="center" gap="lg" wrap="wrap">
      {SIZES.map((size) => (
        <Block key={size} align="center">
          <Checkbox size={size} defaultChecked />
          <Text variant="small">{size}</Text>
        </Block>
      ))}
    </Row>
  );
}
```

### Colors
ID: `Checkbox.colors` • Tags: checkboxes, colors • Category: styling • Status: stable • Since: 1.0.0

Toggle checkboxes styled with semantic `color` options and a default-checked example.

```tsx
const COLORS = ['primary', 'secondary', 'success', 'warning', 'error'] as const;
  const [values, setValues] = useState<Record<string, boolean>>({});
  const toggle = (color: string) => {
    setValues((current) => ({
      ...current,
      [color]: !current[color]
    }));
  };
  return (
    <Block>
      <Text weight="medium">Semantic colors</Text>
      <Block>
        {COLORS.map((color) => (
          <Checkbox
            key={color}
            color={color}
            label={`Color: ${color}`}
            checked={Boolean(values[color])}
            onChange={() => toggle(color)}
          />
        ))}
      </Block>
      <Checkbox
        color="success"
        label="Default checked"
        defaultChecked
      />
      <Text variant="small" color="muted">
        Use `color` to match checkbox accents with message intent while keeping labels readable.
      </Text>
    </Block>
  );
}
```

### States
ID: `Checkbox.states` • Tags: checkboxes, states • Category: behavior • Status: stable • Since: 1.0.0

Highlight enabled, disabled, required, and error states to cover validation scenarios.

```tsx
const [enabled, setEnabled] = useState(true);
  const [required, setRequired] = useState(true);
  const [withError, setWithError] = useState(false);
  return (
    <Block>
      <Checkbox label="Enabled" checked={enabled} onChange={setEnabled} />
      <Checkbox label="Disabled" checked={false} disabled />
      <Checkbox label="Required" required checked={required} onChange={setRequired} />
      <Checkbox
        label="With error"
        error={withError ? 'Selection required' : undefined}
        checked={withError}
        onChange={setWithError}
      />
    </Block>
  );
}
```

### Indeterminate
ID: `Checkbox.indeterminate` • Tags: checkboxes, indeterminate • Category: interaction • Status: stable • Since: 1.0.0

Demonstrates a parent checkbox that toggles a group and reflects partial selection with `indeterminate`.

```tsx
const [selected, setSelected] = useState<number[]>([]);
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
        label={`Select all (${selected.length}/${ITEMS.length})`}
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
ID: `Checkbox.withDescription` • Tags: checkboxes, helper-text • Category: usage • Status: stable • Since: 1.0.0

Descriptions and helper text

```tsx
const [newsletter, setNewsletter] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  return (
    <Block style={{ maxWidth: 400 }}>
      <Checkbox
        label="Receive product updates"
        description="Get occasional emails about new features and improvements."
        checked={newsletter}
        onChange={setNewsletter}
      />
      <Checkbox
        label="Accept terms of service"
        description="Required before creating an account."
        error={termsAccepted ? undefined : 'Please accept to continue.'}
        checked={termsAccepted}
        onChange={setTermsAccepted}
        required
      />
      <Text variant="small" color="muted">
        Use `description` for supporting copy and pair with `error` to surface validation details.
      </Text>
    </Block>
  );
}
```
