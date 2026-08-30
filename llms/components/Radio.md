# Radio

Radio buttons allow users to select a single option from a group of mutually exclusive choices.

## Metadata

- Canonical name: `Radio`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Radio } from '@platform-blocks/react-ui-library';`
- Status: stable
- Since: 1.0.0
- Category: input
- Tags: input, form, selection, choice
- Docs: https://react-ui-library.com/components/Radio
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Radio

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | string | Yes |  | Radio value |
| `checked` | boolean | No |  | Whether radio is selected |
| `onChange` | (value: string) => void | No |  | Change handler |
| `name` | string | No |  | Radio group name |
| `size` | SizeValue | No |  | Radio size |
| `color` | ColorValue | No |  | Radio color theme |
| `label` | React.ReactNode | No |  | Radio label |
| `disabled` | boolean | No |  | Whether radio is disabled |
| `required` | boolean | No |  | Whether radio is required |
| `error` | string | No |  | Error message |
| `description` | string | No |  | Helper text |
| `labelPosition` | 'left' \| 'right' | No |  | Label position relative to radio |
| `children` | React.ReactNode | No |  | Radio content/children (alternative to label) |
| `icon` | React.ReactNode \| string | No |  | Optional icon displayed alongside the label |
| `onKeyDown` | (event: any) => void | No |  | Key handler for accessibility/keyboard support |
| `labelProps` | Omit<TextProps, 'children'> | No |  | Override props applied to the label `<Text>` |
| `descriptionProps` | Omit<TextProps, 'children'> | No |  | Override props applied to the description `<Text>` |
| `transitionDuration` | number | No | 160 | Length of the select/deselect animation in ms; the center dot grows in and shrinks out against it. `0` applies the state instantly. Always 0 under reduced motion. |
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
ID: `Radio.basic` • Tags: Radio, RadioGroup • Category: basics • Status: stable • Since: 1.0.0

Use standalone `Radio` components for custom layouts or pass an `options` array to `RadioGroup` for quick single-selection forms.

```tsx
const TEAMS = ['Falcons', 'Tigers', 'Sharks'] as const;
  const [favoriteTeam, setFavoriteTeam] = useState<string>('Tigers');
  const [ticketType, setTicketType] = useState<string>('reserved');
  return (
    <Block>
      <Block>
        <Text variant="small" color="muted">
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
        <Text variant="small" color="muted">
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
ID: `Radio.variants` • Tags: variants, radio, radiogroup, segmented, chip, card • Category: usage • Status: stable • Since: 1.0.0

The `variant` prop on `RadioGroup` selects how the group is laid out and how the selected option is communicated. `default` keeps the classic dot indicators; `card` renders each option as a bordered surface (useful when options have descriptions); `segmented` joins the options into a single iOS-style control; `chip` lays them out as wrap-friendly pills (good for filter UIs).

```tsx
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
  const [defaultValue, setDefaultValue] = useState('weekly');
  const [planValue, setPlanValue] = useState('growth');
  const [frequencyValue, setFrequencyValue] = useState('weekly');
  const [filterValue, setFilterValue] = useState('active');
  return (
    <Block>
      <Block>
        <Text variant="small" color="muted">default</Text>
        <RadioGroup
          variant="default"
          value={defaultValue}
          onChange={setDefaultValue}
          options={FREQUENCY_OPTIONS}
        />
      </Block>
      <Block>
        <Text variant="small" color="muted">card</Text>
        <RadioGroup
          variant="card"
          value={planValue}
          onChange={setPlanValue}
          options={PLAN_OPTIONS}
        />
      </Block>
      <Block>
        <Text variant="small" color="muted">segmented</Text>
        <RadioGroup
          variant="segmented"
          value={frequencyValue}
          onChange={setFrequencyValue}
          options={FREQUENCY_OPTIONS}
        />
      </Block>
      <Block>
        <Text variant="small" color="muted">chip</Text>
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
ID: `Radio.theming` • Tags: size, color, state • Category: theming • Status: stable • Since: 1.0.0

Combine the `size`, `color`, and validation props to align radios with your UI tokens and state requirements.

```tsx
const COLOR_OPTIONS = ['primary', 'secondary', 'success', 'error'] as const;
  const [sizeValue, setSizeValue] = useState<string>('club');
  const [colorValue, setColorValue] = useState<typeof COLOR_OPTIONS[number]>('primary');
  return (
    <Block>
      <Block>
        <Text variant="small" color="muted">
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
        <Text variant="small" color="muted">
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
        <Text variant="small" color="muted">
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
ID: `Radio.orientations` • Tags: horizontal, vertical • Category: layout • Status: stable • Since: 1.0.0

Toggle `orientation` between `horizontal` and `vertical` to adapt radio groups to the available space.

```tsx
const [favoriteSport, setFavoriteSport] = useState<string>('soccer');
  const [skillLevel, setSkillLevel] = useState<string>('intermediate');
  return (
    <Block>
      <Block>
        <Text variant="small" color="muted">
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
        <Text variant="small" color="muted">
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
ID: `Radio.forms` • Tags: form, validation • Category: advanced • Status: stable • Since: 1.0.0

Pair `RadioGroup` with `required` and `error` messaging to validate selections before submitting a form workflow.

```tsx
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
        <Text variant="small" color="success">
          {confirmation}
        </Text>
      )}
    </Block>
  );
}
```
