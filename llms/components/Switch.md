# Switch

Switch components provide a way to toggle between two states, typically representing on/off or enabled/disabled states.

## Metadata

- Canonical name: `Switch`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Switch } from '@platform-blocks/react-ui-library';`
- Status: stable
- Since: 1.0.0
- Category: input
- Tags: input, form, toggle, switch, boolean
- Docs: https://react-ui-library.com/components/Switch
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Switch

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `checked` | boolean | No |  | Whether switch is on |
| `defaultChecked` | boolean | No | false | Initial checked state for uncontrolled usage |
| `onChange` | (checked: boolean) => void | No |  | Change handler |
| `size` | SizeValue | No | 'md' | Switch size |
| `variant` | 'filled' \| 'outline' \| 'ios' \| 'android' | No | 'filled' | Visual style of the switch. - `filled` (default): solid track that fills with `color` when on, white thumb. - `outline`: transparent track with a colored border and a colored thumb when on. - `ios`: iOS-style pill — a large white thumb that nearly fills a rounded track. - `android`: Material-3-style — an outlined track with a small dot thumb that grows and turns white as the switch turns on. |
| `color` | ThemeColor | No | 'primary' | Switch color when on. A palette token, `'primary.6'` shade syntax, or any CSS color. |
| `transitionDuration` | number | No |  | Length of the on/off transition in ms. `0` moves the thumb instantly. When omitted the switch keeps its spring animation; any explicit value (including 0) swaps it for a timing curve. Always 0 under reduced motion. |
| `label` | React.ReactNode | No |  | Switch label |
| `disabled` | boolean | No | false | Whether switch is disabled |
| `required` | boolean | No | false | Whether switch is required |
| `error` | string | No |  | Error message |
| `description` | string | No |  | Helper text |
| `labelPosition` | 'left' \| 'right' \| 'top' \| 'bottom' | No | 'right' | Label position relative to switch |
| `children` | React.ReactNode | No |  | Switch content/children (alternative to label) |
| `onIcon` | React.ReactNode | No |  | Icon to show when on |
| `offIcon` | React.ReactNode | No |  | Icon to show when off |
| `onLabel` | string | No | 'On' | Labels for on/off states |
| `offLabel` | string | No | 'Off' |  |
| `controls` | string | No |  | Controlled component to show/hide |
| `accessibilityLabel` | string | No |  | Custom accessibility label (overrides label-based default) |
| `accessibilityHint` | string | No |  | Accessibility hint to describe what happens |
| `labelProps` | Omit<TextProps, 'children'> | No |  | Override props applied to the label `<Text>` |
| `descriptionProps` | Omit<TextProps, 'children'> | No |  | Override props applied to the description `<Text>` |
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

### Basic Usage
ID: `Switch.basic` • Tags: controlled, label • Category: basics • Status: stable • Since: 1.0.0

Control a `Switch` with local state and surface its status with supporting text and the `description` prop.

```tsx
const [enabled, setEnabled] = useState<boolean>(true);
  return (
    <Block>
      <Switch
        checked={enabled}
        onChange={setEnabled}
        label="Enable live score alerts"
        description="Send push notifications when the match score changes."
      />
      <Text variant="small" color="muted">
        Notices are {enabled ? 'enabled' : 'disabled'}.
      </Text>
    </Block>
  );
}
```

### Sizes
ID: `Switch.sizes` • Tags: size • Category: layout • Status: stable • Since: 1.0.0

Choose a `size` token to scale the switch track and thumb; `defaultChecked` seeds uncontrolled switches.

```tsx
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;
  return (
    <Row align="center" gap="lg" wrap="wrap">
      {SIZES.map((size) => (
        <Block key={size} align="center">
          <Switch size={size} defaultChecked />
          <Text variant="small">{size}</Text>
        </Block>
      ))}
    </Row>
  );
}
```

### Variants
ID: `Switch.variants` • Tags: variant, filled, outline • Category: appearance • Status: stable • Since: 1.0.0

Choose between a solid `filled` track (default) and an `outline` track whose border and thumb take on the active color.

```tsx
const VARIANTS = [
  { variant: 'filled', hint: 'filled (default) — solid track fills with the active color' },
  { variant: 'outline', hint: 'outline — bordered track with a colored thumb' },
  { variant: 'ios', hint: 'ios — large white thumb in a rounded pill track' },
  { variant: 'android', hint: 'android — Material dot thumb that grows and whitens when on' },
] as const;
  const [on, setOn] = useState<Record<string, boolean>>({
    filled: true,
    outline: true,
    ios: true,
    android: true,
  });
  return (
    <Block>
      {VARIANTS.map(({ variant, hint }) => (
        <Block key={variant}>
          <Text variant="small" color="muted">
            {hint}
          </Text>
          <Row gap="lg" wrap="wrap" align="center">
            <Switch
              variant={variant}
              checked={on[variant]}
              onChange={(v) => setOn((prev) => ({ ...prev, [variant]: v }))}
              label="On"
            />
            <Switch variant={variant} checked={false} label="Off" />
            <Switch variant={variant} checked color="success" label="Success" />
          </Row>
        </Block>
      ))}
    </Block>
  );
}
```

### Label on the thumb
ID: `Switch.thumb-label` • Tags: thumb, onIcon, offIcon, label • Category: appearance • Status: stable • Since: 1.0.0

Render content inside the moving thumb with the `onIcon` / `offIcon` props — an icon or a short text label that swaps with the on/off state.

```tsx
const theme = useTheme();
  const [wifi, setWifi] = useState<boolean>(true);
  const [available, setAvailable] = useState<boolean>(true);
  return (
    <Block>
      <Block>
        <Text variant="small" color="muted">
          Icon on the thumb — swaps with the on/off state
        </Text>
        <Switch
          checked={wifi}
          onChange={setWifi}
          size="xl"
          label="Wi-Fi"
          onIcon={<Icon name="check" size={18} color={theme.colors.primary[3]} stroke={3} />}
          offIcon={<Icon name="close" size={18} color={theme.colors.gray[5]} stroke={3} />}
        />
      </Block>
      <Block>
        <Text variant="small" color="muted">
          Text label on the thumb
        </Text>
        <Switch
          checked={available}
          onChange={setAvailable}
          size="3xl"
          color="success"
          label="Availability"
          onIcon={
            <Text style={{ fontSize: 12, lineHeight: 11, fontWeight: '700', color: theme.colors.success[5] }}>
              ON
            </Text>
          }
          offIcon={
            <Text style={{ fontSize: 12, lineHeight: 11, fontWeight: '700', color: theme.colors.gray[5] }}>
              OFF
            </Text>
          }
        />
      </Block>
    </Block>
  );
}
```

### Colors
ID: `Switch.colors` • Tags: color, semantic • Category: theming • Status: stable • Since: 1.0.0

Provide a `color` token to align switches with semantic palettes such as `primary`, `success`, or `error` states.

```tsx
const COLOR_VARIANTS = [
  { label: 'Primary', color: 'primary' },
  { label: 'Secondary', color: 'secondary' },
  { label: 'Success', color: 'success' },
  { label: 'Warning', color: 'warning' },
  { label: 'Error', color: 'error' }
] as const;
  return (
    <Block>
      <Text variant="small" color="muted">
        Semantic color variants
      </Text>
      <Row gap="md" wrap="wrap">
        {COLOR_VARIANTS.map(({ label, color }) => (
          <Switch key={color} defaultChecked label={label} labelPosition="right" color={color} />
        ))}
      </Row>
    </Block>
  );
}
```

### States
ID: `Switch.states` • Tags: state, disabled, validation • Category: behavior • Status: stable • Since: 1.0.0

Present interactive, disabled, and validation states by combining `checked`, `disabled`, `required`, and `error` props.

```tsx
const [homeAlerts, setHomeAlerts] = useState(true);
  const [awayAlerts, setAwayAlerts] = useState(false);
  return (
    <Block>
      <Block>
        <Text variant="small" color="muted">
          Interactive states
        </Text>
        <Switch
          checked={homeAlerts}
          onChange={setHomeAlerts}
          label="Home team alerts"
        />
        <Switch
          checked={awayAlerts}
          onChange={setAwayAlerts}
          label="Away team alerts"
        />
      </Block>
      <Block>
        <Text variant="small" color="muted">
          Disabled states
        </Text>
        <Switch defaultChecked label="Lineup lock" disabled />
        <Switch label="Sound effects" disabled />
      </Block>
      <Block>
        <Text variant="small" color="muted">
          Validation helpers
        </Text>
        <Switch
          label="Require broadcast approval"
          required
          error="Approval is needed before publishing."
        />
        <Switch
          defaultChecked
          label="Send pre-game summary"
          description="Dispatch an email recap to coaches and analysts."
        />
      </Block>
    </Block>
  );
}
```

### Shared State
ID: `Switch.sync` • Tags: controlled, summary • Category: behavior • Status: stable • Since: 1.0.0

Coordinate multiple switches with a shared state object and reflect the current selections in supporting copy.

```tsx
const PREFERENCE_CONTROLS = [
  {
    key: 'scoreAlerts',
    label: 'Live score alerts',
    description: 'Push notifications for scoring plays.'
  },
  {
    key: 'newsEmails',
    label: 'Breaking news emails',
    description: 'Send a morning recap with roster updates.'
  },
  {
    key: 'audioHighlights',
    label: 'Audio highlights',
    description: 'Play broadcast clips after each match.'
  }
] as const;
type PreferenceKey = (typeof PREFERENCE_CONTROLS)[number]['key'];
const INITIAL_SETTINGS: Record<PreferenceKey, boolean> = {
  scoreAlerts: true,
  newsEmails: false,
  audioHighlights: false
};
  const [settings, setSettings] = useState<Record<PreferenceKey, boolean>>(
    () => ({ ...INITIAL_SETTINGS })
  );
  return (
    <Block>
      <Block>
        <Text variant="small" color="muted">
          Shared state
        </Text>
        {PREFERENCE_CONTROLS.map(({ key, label, description }) => (
          <Switch
            key={key}
            checked={settings[key]}
            onChange={(checked) =>
              setSettings((prev) => ({ ...prev, [key]: checked }))
            }
            label={label}
            description={description}
          />
        ))}
      </Block>
  <Block>
        <Text variant="small" color="muted">
          Summary
        </Text>
        <Text variant="p">
          Score alerts are {settings.scoreAlerts ? 'on' : 'off'}.
        </Text>
        <Text variant="p">
          Breaking news emails are {settings.newsEmails ? 'on' : 'off'}.
        </Text>
        <Text variant="p">
          Audio highlights are {settings.audioHighlights ? 'on' : 'off'}.
        </Text>
      </Block>
    </Block>
  );
}
```
