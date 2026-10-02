# Radio

Radio lets users select one option from a group of choices.

## Metadata

- Import: `import { Radio } from '@plocks/ui';`
- Tags: input, form, selection, choice
- Docs: https://plocks.dev/components/Radio
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Radio

## Props

- `value` (required): string — Value reported to `onChange` when this radio is picked.
- `checked`: boolean — Whether this radio is the selected one.
- `onChange`: (value: string) => void — Called with `value` when the radio is picked.
- `color`: ThemeColor — Radio color: a palette token, `'primary.6'` shade syntax, or any CSS color.
- `labelPosition`: 'left' | 'right' — Label side. Default `'right'`.
- `children`: React.ReactNode — Label content (alternative to `label`; wins when both are set).
- `icon`: React.ReactNode | string — Icon shown before the label: an icon registry name or any element.
- `onKeyDown`: (event: WebKeyboardEvent) => void — Web key handler on the radio (RadioGroup uses it for arrow-key navigation).
- `tabIndex`: 0 | -1 — Web tab order of the radio. Groups manage it (only the selected radio is a tab stop); a standalone radio is always a tab stop.
- `transitionDuration`: number = 160 — Length of the select/deselect animation in ms; the center dot grows in and shrinks out against it. `0` applies the state instantly. Always 0 under reduced motion.
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

## Sub-components

`import { RadioGroup } from '@plocks/ui';`

### RadioGroup

- `options` (required): RadioGroupOption[] — Available options.
- `value`: string — Selected value (controlled).
- `defaultValue`: string — Initially selected value (uncontrolled).
- `onChange`: (value: string) => void — Called with the newly selected value.
- `orientation`: 'vertical' | 'horizontal' — Group orientation. Ignored by `segmented` (always horizontal) and `chip` (wraps).
- `variant`: 'default' | 'card' | 'segmented' | 'chip' — Visual variant of the group. Defaults to `'default'`.
- `color`: ThemeColor — Radio color: a palette token, `'primary.6'` shade syntax, or any CSS color.
- `gap`: SizeValue | number — Gap between options: a spacing token or px. Default 8.
- `labelPosition`: 'left' | 'right' — Label position relative to each radio (default variant).
- `transitionDuration`: number = 160 — Length of each radio's select/deselect animation in ms. `0` applies the state instantly. Always 0 under reduced motion.
- `id`: string — Base id for the group; option radios get `${id}-option-${index}`.
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
export interface RadioGroupOption {
  label: React.ReactNode;
  value: string;
  disabled?: boolean;
  description?: React.ReactNode;
  icon?: React.ReactNode | string;
}
```

## Examples

### Basics

Use standalone `Radio` components for custom layouts or pass an `options` array to `RadioGroup` for quick single-selection forms.

```tsx
import { useState } from 'react';
import { Block, Radio, RadioGroup, Text } from '@plocks/ui';

const TEAMS = ['Falcons', 'Tigers', 'Sharks'] as const;

export function Demo() {
  const [favoriteTeam, setFavoriteTeam] = useState<string>('Tigers');
  const [ticketType, setTicketType] = useState<string>('reserved');

  return (
    <Block>
      <Block>
        <Text variant="small" c="muted">
          Standalone radios
        </Text>
        <Block>
          {TEAMS.map((team) => (
            <Radio
              key={team}
              value={team}
              checked={favoriteTeam === team}
              onChange={setFavoriteTeam}
              label={team}
            />
          ))}
        </Block>
      </Block>

      <Block>
        <Text variant="small" c="muted">
          Grouped selection
        </Text>
        <RadioGroup
          value={ticketType}
          onChange={setTicketType}
          options={[
            { label: 'General admission', value: 'general' },
            { label: 'Reserved seating', value: 'reserved' },
            { label: 'VIP hospitality', value: 'vip' }
          ]}
        />
      </Block>
    </Block>
  );
}
```

### Variants

The `variant` prop on `RadioGroup` selects how the group is laid out and how the selected option is communicated. `default` keeps the classic dot indicators; `card` renders each option as a bordered surface (useful when options have descriptions); `segmented` joins the options into a single iOS-style control; `chip` lays them out as wrap-friendly pills (good for filter UIs).

```tsx
import { useState } from 'react';
import { Block, RadioGroup, Text } from '@plocks/ui';

const PLAN_OPTIONS = [
  { label: 'Starter', value: 'starter', description: 'Up to 3 projects, community support' },
  { label: 'Growth', value: 'growth', description: 'Unlimited projects, priority email support' },
  { label: 'Scale', value: 'scale', description: 'Dedicated success manager + SSO' },
];

const FREQUENCY_OPTIONS = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

const FILTER_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Archived', value: 'archived' },
  { label: 'Trashed', value: 'trashed' },
];

export function Demo() {
  const [defaultValue, setDefaultValue] = useState('weekly');
  const [planValue, setPlanValue] = useState('growth');
  const [frequencyValue, setFrequencyValue] = useState('weekly');
  const [filterValue, setFilterValue] = useState('active');

  return (
    <Block>
      <Block>
        <Text variant="small" c="muted">default</Text>
        <RadioGroup
          variant="default"
          value={defaultValue}
          onChange={setDefaultValue}
          options={FREQUENCY_OPTIONS}
        />
      </Block>

      <Block>
        <Text variant="small" c="muted">card</Text>
        <RadioGroup
          variant="card"
          value={planValue}
          onChange={setPlanValue}
          options={PLAN_OPTIONS}
        />
      </Block>

      <Block>
        <Text variant="small" c="muted">segmented</Text>
        <RadioGroup
          variant="segmented"
          value={frequencyValue}
          onChange={setFrequencyValue}
          options={FREQUENCY_OPTIONS}
        />
      </Block>

      <Block>
        <Text variant="small" c="muted">chip</Text>
        <RadioGroup
          variant="chip"
          value={filterValue}
          onChange={setFilterValue}
          options={FILTER_OPTIONS}
        />
      </Block>
    </Block>
  );
}
```

### Theming

Combine the `size`, `color`, and validation props to align radios with your UI tokens and state requirements.

```tsx
import { useState } from 'react';
import { Block, Radio, RadioGroup, Text } from '@plocks/ui';

const COLOR_OPTIONS = ['primary', 'secondary', 'success', 'error'] as const;

export function Demo() {
  const [sizeValue, setSizeValue] = useState<string>('club');
  const [colorValue, setColorValue] = useState<typeof COLOR_OPTIONS[number]>('primary');

  return (
    <Block>
      <Block>
        <Text variant="small" c="muted">
          Size tokens
        </Text>
        <RadioGroup
          size="sm"
          value={sizeValue}
          onChange={setSizeValue}
          options={[
            { label: 'Club', value: 'club' },
            { label: 'Suite', value: 'suite' },
            { label: 'Field level', value: 'field' }
          ]}
        />
      </Block>

      <Block>
        <Text variant="small" c="muted">
          Semantic colors
        </Text>
        <Block>
          {COLOR_OPTIONS.map((tone) => (
            <Radio
              key={tone}
              value={tone}
              checked={colorValue === tone}
              onChange={(value) => setColorValue(value as typeof COLOR_OPTIONS[number])}
              label={`${tone.charAt(0).toUpperCase()}${tone.slice(1)} tickets`}
              color={tone}
            />
          ))}
        </Block>
      </Block>

      <Block>
        <Text variant="small" c="muted">
          Common states
        </Text>
        <Radio value="available" checked label="Available" />
        <Radio value="disabled" disabled label="Disabled" />
        <Radio value="error" error="Select a seat" label="Needs attention" />
      </Block>
    </Block>
  );
}
```

### Orientations

Toggle `orientation` between `horizontal` and `vertical` to adapt radio groups to the available space.

```tsx
import { useState } from 'react';
import { Block, RadioGroup, Text } from '@plocks/ui';

export function Demo() {
  const [favoriteSport, setFavoriteSport] = useState<string>('soccer');
  const [skillLevel, setSkillLevel] = useState<string>('intermediate');

  return (
    <Block>
      <Block>
        <Text variant="small" c="muted">
          Horizontal layout
        </Text>
        <RadioGroup
          orientation="horizontal"
          value={favoriteSport}
          onChange={setFavoriteSport}
          options={[
            { label: 'Soccer', value: 'soccer' },
            { label: 'Basketball', value: 'basketball' },
            { label: 'Tennis', value: 'tennis' },
            { label: 'Volleyball', value: 'volleyball' }
          ]}
        />
      </Block>

      <Block>
        <Text variant="small" c="muted">
          Vertical layout
        </Text>
        <RadioGroup
          orientation="vertical"
          value={skillLevel}
          onChange={setSkillLevel}
          options={[
            { label: 'Beginner', value: 'beginner' },
            { label: 'Intermediate', value: 'intermediate' },
            { label: 'Advanced', value: 'advanced' },
            { label: 'Expert', value: 'expert' }
          ]}
        />
      </Block>
    </Block>
  );
}
```

### Forms

Pair `RadioGroup` with `required` and `error` messaging to validate selections before submitting a form workflow.

```tsx
import { useState } from 'react';
import { Block, Button, RadioGroup, Text } from '@plocks/ui';

const PLANS = [
  {
    label: 'Starter — $9/mo',
    value: 'starter',
    description: 'Streamline a single project'
  },
  {
    label: 'Team — $19/mo',
    value: 'team',
    description: 'Collaborate with up to 10 teammates'
  },
  {
    label: 'Club — $39/mo',
    value: 'club',
    description: 'Unlock advanced analytics'
  }
];

const BILLING = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Annual (save 20%)', value: 'annual' }
];

export function Demo() {
  const [plan, setPlan] = useState<string>('');
  const [billingCycle, setBillingCycle] = useState<string>('monthly');
  const [planError, setPlanError] = useState<string | undefined>();
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!plan) {
      setPlanError('Select a plan to continue');
      setConfirmation(null);
      return;
    }

    setPlanError(undefined);
    setConfirmation(`Subscribed to the ${plan} plan with ${billingCycle} billing.`);
  };

  return (
    <Block>
      <RadioGroup
        label="Select a membership"
        options={PLANS}
        value={plan}
        onChange={(next) => {
          setPlan(next);
          setPlanError(undefined);
        }}
        error={planError}
        required
      />

      <RadioGroup
        label="Billing cadence"
        orientation="horizontal"
        options={BILLING}
        value={billingCycle}
        onChange={setBillingCycle}
      />

      <Button onPress={handleSubmit}>Confirm subscription</Button>

      {confirmation && (
        <Text variant="small" c="success">
          {confirmation}
        </Text>
      )}
    </Block>
  );
}
```
