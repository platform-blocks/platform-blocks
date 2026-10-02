# Stepper

Step-by-step navigation interface, perfect for multi-step forms, wizards, and progress tracking.

## Metadata

- Import: `import { Stepper } from '@plocks/ui';`
- Docs: https://plocks.dev/components/Stepper
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Stepper

## Props

- `active` (required): number — Active step index
- `onStepClick`: (stepIndex: number) => void — Called when step is clicked
- `orientation`: 'horizontal' | 'vertical' — Step orientation
- `iconPosition`: 'left' | 'right' — Icon position relative to step body
- `iconSize`: number — Icon size
- `size`: SizeValue = 'md' — Component size: a size token, or a numeric control height. @default 'md'
- `color`: ColorProp — Accent color: a palette name (`'primary'`), a shade (`'primary.6'`) or any CSS color.
- `completedIcon`: ReactNode — Icon to display when step is completed
- `allowNextStepsSelect`: boolean — Whether next steps (steps with higher index) can be selected
- `children` (required): ReactNode — Step content
- `aria-label`: string — Accessible name of the stepper (renders it as a labelled group).
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

### Stepper.Completed

- `children` (required): ReactNode — Content to display when all steps are completed

### Stepper.Step

- `children`: ReactNode — Step content
- `label`: string — Step label
- `description`: string — Step description
- `icon`: ReactNode — Custom icon to display instead of the step number
- `completedIcon`: ReactNode — Icon to display when step is completed (overrides global completedIcon)
- `allowStepSelect`: boolean — Whether this step can be selected by clicking
- `color`: ColorProp — Step accent color: a palette name (`'teal'`), a shade (`'teal.6'`) or any CSS color.
- `loading`: boolean — Whether the step is loading
- `aria-label`: string — Accessibility label for screen readers
- `title`: string — Title attribute for tooltips
- `stepIndex`: number — Internal step index (added automatically)
- `isFirst`: boolean — Internal: true for the first step in the stepper (added automatically)
- `isLast`: boolean — Internal: true for the last step in the stepper (added automatically)
- `labelProps`: Omit<TextProps, 'children'> — Override props applied to the step's label `<Text>` (style, fw, ff, size, c).
- `descriptionProps`: Omit<TextProps, 'children'> — Override props applied to the step's description `<Text>`.

Also accepts the shared props — base (`style` `testID`): https://plocks.dev/llms/guides/shared-props.md

## Examples

### Basics

Control the active step with local state and show completion messaging once the flow finishes.

```tsx
import { useState } from 'react';
import { Block, Button, Row, Stepper } from '@plocks/ui';

export function Demo() {
  const [active, setActive] = useState(1);

  return (
    <Block fullWidth>
      <Stepper active={active} onStepClick={setActive}>
        <Stepper.Step label="Account" description="Create your credentials">
          Set up your sign-in information.
        </Stepper.Step>
        <Stepper.Step label="Verification" description="Confirm your email">
          Check your inbox for a verification link.
        </Stepper.Step>
        <Stepper.Step label="Preferences" description="Adjust defaults">
          Choose your notification defaults.
        </Stepper.Step>
        <Stepper.Completed>All steps complete.</Stepper.Completed>
      </Stepper>
      <Row gap="sm" justify="space-between">
        <Button variant="outline" onPress={() => setActive(active - 1)} disabled={active === 0}>
          Back
        </Button>
        <Button onPress={() => setActive(active + 1)} disabled={active === 3}>
          Next
        </Button>
      </Row>
    </Block>
  );
}
```

### Disable Step Selection

Set `allowStepSelect={false}` to stop a step from being selected by click. Here, Preferences can't be clicked.

```tsx
import { useState } from 'react';
import { Block, Stepper } from '@plocks/ui';

export function Demo() {
  const [active, setActive] = useState(0);

  return (
    <Block fullWidth>
      <Stepper active={active} onStepClick={setActive}>
        <Stepper.Step label="Account" />
        <Stepper.Step label="Verification" />
        <Stepper.Step label="Preferences" allowStepSelect={false} />
      </Stepper>
    </Block>
  );
}
```

### Icon Overrides

Swap icons for both active steps and the completed state to reinforce the status of each milestone.

```tsx
import { Block, Icon, Stepper } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Stepper active={1} completedIcon={<Icon name="check" />}>
        <Stepper.Step label="Account" icon={<Icon name="user" />} />
        <Stepper.Step label="Verification" icon={<Icon name="mail" />} />
        <Stepper.Step label="Preferences" icon={<Icon name="settings" />} />
      </Stepper>
    </Block>
  );
}
```

### Step Colors

Give each step its own `color` to override the stepper's accent color.

```tsx
import { Block, Stepper } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Stepper active={3}>
        <Stepper.Step label="Plan" color="teal" />
        <Stepper.Step label="Design" color="cyan" />
        <Stepper.Step label="Build" color="violet" />
        <Stepper.Step label="Launch" color="pink" />
      </Stepper>
    </Block>
  );
}
```

### Vertical Orientation

Switch the orientation to vertical when you need more room for descriptive copy under each step.

```tsx
import { Block, Stepper } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Stepper active={1} orientation="vertical">
        <Stepper.Step label="Account" description="Create your credentials" />
        <Stepper.Step label="Verification" description="Confirm your email" />
        <Stepper.Step label="Preferences" description="Adjust defaults" />
      </Stepper>
    </Block>
  );
}
```

### Loading Indicator

Replace the step icon with a spinner during long-running work by toggling the `loading` prop.

```tsx
import { Block, Stepper } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Stepper active={1}>
        <Stepper.Step label="Details" />
        <Stepper.Step label="Processing" loading />
        <Stepper.Step label="Ready" />
      </Stepper>
    </Block>
  );
}
```

### Size Variants

Compare the `size` prop across the full `xs`–`3xl` scale while reusing the same steps.

```tsx
import { Block, Stepper, Text } from '@plocks/ui';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

export function Demo() {
  return (
    <Block fullWidth>
      {SIZES.map((size) => (
        <Block key={size} fullWidth>
          <Text variant="small" c="secondary">{size}</Text>
          <Stepper active={1} size={size}>
            <Stepper.Step label="Plan" />
            <Stepper.Step label="Build" />
            <Stepper.Step label="Launch" />
          </Stepper>
        </Block>
      ))}
    </Block>
  );
}
```
