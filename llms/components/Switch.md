# Switch

Switch components provide a way to toggle between two states, typically representing on/off or enabled/disabled states.

## Metadata

- Import: `import { Switch } from '@plocks/ui';`
- Tags: input, form, toggle, switch, boolean
- Docs: https://plocks.dev/components/Switch
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Switch

## Props

- `checked`: boolean — Controlled on state.
- `defaultChecked`: boolean = false — Initial on state for uncontrolled usage.
- `onChange`: (checked: boolean) => void — Called with the next on state.
- `variant`: 'filled' | 'outline' | 'ios' | 'android' = 'filled' — Visual style. Default `'filled'`.
- `color`: ThemeColor = 'primary' — Track color when on: a palette token, `'primary.6'` shade syntax, or any CSS color.
- `transitionDuration`: number — Length of the on/off transition in ms. `0` moves the thumb instantly. When omitted the switch keeps its spring animation; any explicit value (including 0) swaps it for a timing curve. Always 0 under reduced motion.
- `labelPosition`: SwitchLabelPosition = 'right' — Label position relative to the switch. `left` / `right` follow the reading direction (`right` = after the switch). Default `'right'`.
- `children`: React.ReactNode — Label content (alternative to `label`; wins when both are set).
- `onIcon`: React.ReactNode — Icon inside the thumb while on.
- `offIcon`: React.ReactNode — Icon inside the thumb while off.
- `onLabel`: string = 'On' — Spoken state while on (native). Default `'On'`.
- `offLabel`: string = 'Off' — Spoken state while off (native). Default `'Off'`.
- `controls`: string — Id of the element the switch shows/hides (web `aria-controls`).
- `id`: string — Base id: the control gets it, the label/description/error get `${id}-label` etc.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — field (`label` `description` `error` `helperText` `required` `withAsterisk` `disabled` `readOnly` `size` `name` `accessibilityLabel` `accessibilityHint` `labelProps` `descriptionProps` `onFocus` `onBlur`), base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), sizing (`fullWidth`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`), disclaimer (`disclaimer` `disclaimerProps`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export type SwitchLabelPosition = ChoiceLabelPosition;
```

## Examples

### Basics

Control a `Switch` with local state and surface its status with supporting text and the `description` prop.

```tsx
import { useState } from 'react';
import { Block, Switch, Text } from '@plocks/ui';

export function Demo() {
  const [enabled, setEnabled] = useState<boolean>(true);

  return (
    <Block>
      <Switch
        checked={enabled}
        onChange={setEnabled}
        label="Enable live score alerts"
        description="Send push notifications when the match score changes."
      />
      <Text variant="small" c="muted">
        Notices are {enabled ? 'enabled' : 'disabled'}.
      </Text>
    </Block>
  );
}
```

### Sizes

Choose a `size` token to scale the switch track and thumb; `defaultChecked` seeds uncontrolled switches.

```tsx
import { Block, Row, Switch, Text } from '@plocks/ui';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

export function Demo() {
  return (
    <Row align="center" gap="lg" wrap="wrap">
      {SIZES.map((size) => (
        <Block key={size} align="center">
          <Switch accessibilityLabel={`Switch ${size}`} size={size} defaultChecked />
          <Text variant="small">{size}</Text>
        </Block>
      ))}
    </Row>
  );
}
```

### Variants

Choose between a solid `filled` track (default) and an `outline` track whose border and thumb take on the active color.

```tsx
import { useState } from 'react';
import { Block, Row, Switch, Text } from '@plocks/ui';

const VARIANTS = [
  { variant: 'filled', hint: 'filled (default) — solid track fills with the active color' },
  { variant: 'outline', hint: 'outline — bordered track with a colored thumb' },
  { variant: 'ios', hint: 'ios — large white thumb in a rounded pill track' },
  { variant: 'android', hint: 'android — Material dot thumb that grows and whitens when on' },
] as const;

export function Demo() {
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
          <Text variant="small" c="muted">
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

Render content inside the moving thumb with the `onIcon` / `offIcon` props — an icon or a short text label that swaps with the on/off state.

```tsx
import { useState } from 'react';
import { Block, Icon, Switch, Text, useTheme } from '@plocks/ui';

export function Demo() {
  const theme = useTheme();
  const [wifi, setWifi] = useState<boolean>(true);
  const [available, setAvailable] = useState<boolean>(true);

  return (
    <Block>
      <Block>
        <Text variant="small" c="muted">
          Icon on the thumb — swaps with the on/off state
        </Text>
        <Switch
          checked={wifi}
          onChange={setWifi}
          size="xl"
          label="Wi-Fi"
          onIcon={<Icon name="check" size={18} color={theme.colors.primary[3]} stroke={3} />}
          offIcon={<Icon name="close" size={18} color={theme.text.muted} stroke={3} />}
        />
      </Block>

      <Block>
        <Text variant="small" c="muted">
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
            <Text style={{ fontSize: 12, lineHeight: 11, fontWeight: '700', color: theme.text.muted }}>
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

Provide a `color` token to align switches with semantic palettes such as `primary`, `success`, or `error` states.

```tsx
import { Block, Row, Switch, Text } from '@plocks/ui';

const COLOR_VARIANTS = [
  { label: 'Primary', color: 'primary' },
  { label: 'Secondary', color: 'secondary' },
  { label: 'Success', color: 'success' },
  { label: 'Warning', color: 'warning' },
  { label: 'Error', color: 'error' }
] as const;

export function Demo() {
  return (
    <Block>
      <Text variant="small" c="muted">
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

Present interactive, disabled, and validation states by combining `checked`, `disabled`, `required`, and `error` props.

```tsx
import { useState } from 'react';
import { Block, Switch, Text } from '@plocks/ui';

export function Demo() {
  const [homeAlerts, setHomeAlerts] = useState(true);
  const [awayAlerts, setAwayAlerts] = useState(false);

  return (
    <Block>
      <Block>
        <Text variant="small" c="muted">
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
        <Text variant="small" c="muted">
          Disabled states
        </Text>
        <Switch defaultChecked label="Lineup lock" disabled />
        <Switch label="Sound effects" disabled />
      </Block>
      <Block>
        <Text variant="small" c="muted">
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

Coordinate multiple switches with a shared state object and reflect the current selections in supporting copy.

```tsx
import { useState } from 'react';
import { Block, Switch, Text } from '@plocks/ui';

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

export function Demo() {
  const [settings, setSettings] = useState<Record<PreferenceKey, boolean>>(
    () => ({ ...INITIAL_SETTINGS })
  );

  return (
    <Block>
      <Block>
        <Text variant="small" c="muted">
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
        <Text variant="small" c="muted">
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
