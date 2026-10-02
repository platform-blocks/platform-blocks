# Rating

An interactive component for displaying star ratings and allowing users to provide ratings with customizable appearance.

## Metadata

- Import: `import { Rating } from '@plocks/ui';`
- Tags: rating, stars, review, score, feedback
- Docs: https://plocks.dev/components/Rating
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Rating

## Props

- `value`: number — Current rating value (controlled).
- `defaultValue`: number = 0 — Initial rating value for uncontrolled usage.
- `count`: number = 5 — Number of rating items (stars) to render.
- `readOnly`: boolean = false — Display only: the rating shows its value (as an image with a spoken "4 out of 5") and takes no input.
- `disabled`: boolean = false — Disables the rating: blocks input, dims the control and reports it disabled to assistive technology.
- `allowFraction`: boolean = false — Allows partial values so a star can be filled fractionally.
- `precision`: number = 0.1 when `allowFraction`, otherwise 1 — Smallest increment a value is rounded to when `allowFraction` is enabled. Clamped to the `0.01`–`1` range.
- `size`: SizeValue = 'md' — Size of each rating item — a theme size token or an explicit pixel size.
- `color`: string — Color of filled items. Defaults to the theme warning color.
- `emptyColor`: string — Color of empty items. Defaults to `theme.text.muted`.
- `hoverColor`: string — Color of items while hovering/dragging. Defaults to a deeper theme warning color.
- `onChange`: (value: number) => void — Called with the new value when the rating changes.
- `onHover`: (value: number) => void — Called with the previewed value while hovering (web only).
- `clearable`: boolean = false — Allows clearing the rating by selecting the value that is already set.
- `showTooltip`: boolean = false — Shows a tooltip with the current value out of `count` while hovering.
- `getTooltipLabel`: (value: number, count: number) => string — Formats the tooltip text. Receives the previewed value and `count`; defaults to `4.5 / 5`.
- `icon`: RatingIcon — Icon rendered for each item instead of the default star. Accepts an icon registry name (`'heart'`), an icon library component, or an element. Takes precedence over `character`.
- `emptyIcon`: RatingIcon — Icon rendered for empty items. Defaults to `icon`, so the same glyph is drawn in `emptyColor` unless a different empty icon is supplied.
- `character`: string | React.ReactNode = '★' — Character or node rendered for filled items. Custom strings render as text glyphs, a React element is cloned with `size` and `color`, and the default star character renders the built-in star icon. Ignored when `icon` is set.
- `emptyCharacter`: string | React.ReactNode = '☆' — Character or node rendered for empty items. Ignored when `icon` or `emptyIcon` is set.
- `gap`: SizeValue = 'xs' — Spacing between rating items — a theme size token or an explicit pixel value.
- `labelPosition`: 'left' | 'right' | 'above' | 'below' = 'above' — Placement of the label relative to the rating (`left` / `right` follow the reading direction).
- `labelGap`: SizeValue = 'xs' — Spacing between the label and the rating — a theme size token or pixel value.
- `id`: string — Base id: the control gets it, the label/description/error get `${id}-label` etc.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — field (`label` `description` `error` `helperText` `required` `withAsterisk` `name` `accessibilityLabel` `accessibilityHint` `labelProps` `descriptionProps` `onFocus` `onBlur`), base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), sizing (`fullWidth`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`), disclaimer (`disclaimer` `disclaimerProps`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export type RatingIcon = string | ExternalIconComponent | React.ReactElement;
```

## Examples

### Basics

Capture a single rating value with an interactive control and mirror the current score in helper text.

```tsx
import { useState } from 'react';
import { Block, Rating, Text } from '@plocks/ui';

export function Demo() {
  const [score, setScore] = useState<number>(3);

  return (
    <Block>
      <Rating
        value={score}
        onChange={setScore}
        size="lg"
        label="Rate the broadcast quality"
      />
      <Text variant="small" c="muted">
        Current score: {score} out of 5.
      </Text>
    </Block>
  );
}
```

### Sizes

Compare the available `size` tokens side by side to pick the right scale for your scene.

```tsx
import { Block, Rating, Row, Text } from '@plocks/ui';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

export function Demo() {
  return (
    <Block fullWidth direction="row" align="center" justify="space-evenly">
      {SIZES.map((size) => (
        <Rating
          key={size}
          size={size}
          value={1}
          readOnly
          count={1}
          label={size}
          labelPosition="left"
        />
      ))}
    </Block>
  );
}
```

### Colors

Derive filled, hover, and empty colors from the theme palette to align ratings with product semantics.

```tsx
import { useState } from 'react';
import { Block, Rating, Text, useTheme } from '@plocks/ui';

const COLOR_CONFIG = [
  {
    key: 'primary',
    label: 'Primary accent',
    getColors: (palette: string[]) => ({
      color: palette[5],
      emptyColor: palette[1],
      hoverColor: palette[6]
    })
  },
  {
    key: 'success',
    label: 'Success feedback',
    getColors: (palette: string[]) => ({
      color: palette[5],
      emptyColor: palette[1],
      hoverColor: palette[6]
    })
  },
  {
    key: 'warning',
    label: 'Warning feedback',
    getColors: (palette: string[]) => ({
      color: palette[5],
      emptyColor: palette[1],
      hoverColor: palette[6]
    })
  }
] as const;

type PaletteKey = (typeof COLOR_CONFIG)[number]['key'];

export function Demo() {
  const theme = useTheme();
  const [values, setValues] = useState<Record<PaletteKey, number>>({
    primary: 4,
    success: 3.5,
    warning: 2.5
  });

  return (
    <Block>
      {COLOR_CONFIG.map(({ key, label, getColors }) => {
        const palette = theme.colors[key as keyof typeof theme.colors] ?? theme.colors.gray;
        const { color, emptyColor, hoverColor } = getColors(palette);

        return (
          <Block key={key}>
            <Rating
              value={values[key]}
              onChange={(next) =>
                setValues((prev) => ({ ...prev, [key]: next }))
              }
              color={color}
              emptyColor={emptyColor}
              hoverColor={hoverColor}
              size="lg"
              labelPosition="right"
              label={
            <Text variant="small" c="muted">
              {label}
            </Text>
            }
            />
          </Block>
        );
      })}
    </Block>
  );
}
```

### Fractions

Enable fractional ratings with configurable `precision` values to capture nuanced feedback.

```tsx
import { useState } from 'react';
import { Block, Rating, Text, useTheme } from '@plocks/ui';

const FRACTION_SETTINGS = [
  {
    key: 'match',
    label: 'Match excitement',
    precision: 0.1,
    helper: 'Set scores in 0.1 increments to capture precise fan sentiment.'
  },
  {
    key: 'broadcast',
    label: 'Broadcast quality',
    precision: 0.5,
    helper: 'Use half-star increments when quick feedback is enough.'
  }
] as const;

type FractionKey = (typeof FRACTION_SETTINGS)[number]['key'];

export function Demo() {
  const theme = useTheme();
  const [values, setValues] = useState<Record<FractionKey, number>>({
    match: 4.2,
    broadcast: 3.5
  });

  return (
    <Block>
      {FRACTION_SETTINGS.map(({ key, label, precision, helper }) => (
        <Block key={key}>
          <Text variant="small" c="muted">
            {label}
          </Text>
          <Rating accessibilityLabel="Rating"
            value={values[key]}
            onChange={(next) => setValues((prev) => ({ ...prev, [key]: next }))}
            allowFraction
            precision={precision}
            size="lg"
            color={theme.colors.highlight[5]}
            emptyColor={theme.colors.highlight[1]}
            hoverColor={theme.colors.highlight[6]}
            showTooltip
          />
          <Text variant="small" c="muted">
            {helper}
          </Text>
        </Block>
      ))}
    </Block>
  );
}
```

### Custom Icons

Swap the default star for any registry icon with `icon`, pair it with a different `emptyIcon` for the unfilled state, or fall back to plain text glyphs through `character` and `emptyCharacter`.

```tsx
import { useState } from 'react';
import { Block, Rating, Text, useTheme } from '@plocks/ui';

export function Demo() {
  const theme = useTheme();
  const [hearts, setHearts] = useState<number>(4);
  const [bolts, setBolts] = useState<number>(3);

  return (
    <Block>
      <Rating
        value={hearts}
        onChange={setHearts}
        icon="heart"
        size="lg"
        color={theme.colors.error[5]}
        emptyColor={theme.colors.error[2]}
        hoverColor={theme.colors.error[6]}
        label="Registry icon via `icon`"
      />
      <Rating
        value={bolts}
        onChange={setBolts}
        icon="bolt"
        emptyIcon="circle"
        size="lg"
        label="Different empty icon via `emptyIcon`"
      />
      <Rating
        value={3.5}
        readOnly
        allowFraction
        icon="moon"
        size="lg"
        label="Custom icons support fractions"
      />
      <Rating
        value={4}
        readOnly
        character="♥"
        emptyCharacter="♡"
        size="lg"
        label="Text glyphs via `character`"
      />
    </Block>
  );
}
```

### Variants

Contrast interactive, read-only, and tooltip-enabled ratings to decide which fits your feedback flow.

```tsx
import { useState } from 'react';
import { Block, Rating } from '@plocks/ui';

export function Demo() {
  const [interactiveValue, setInteractiveValue] = useState<number>(4);

  return (
    <Block>
      <Rating
        value={interactiveValue}
        onChange={setInteractiveValue}
        size="lg"
        label="Interactive rating"
      />
      <Rating
        value={4.5}
        readOnly
        size="lg"
        label="Read-only rating"
        disclaimer="Use `readOnly` to show aggregated scores."
      />
      <Rating
        defaultValue={3}
        showTooltip
        size="lg"
        label="Tooltip rating"
        disclaimer="Tooltips show numeric value on hover."
      />
      <Rating
        defaultValue={4}
        showTooltip
        getTooltipLabel={(value, count) => `${value} out of ${count} stars`}
        size="lg"
        label="Custom tooltip text"
        disclaimer="Pass `getTooltipLabel` to format the tooltip."
      />
      <Rating
        value={3}
        disabled
        size="lg"
        label="Disabled rating"
        disclaimer="`disabled` blocks input and dims the control."
      />
    </Block>
  );
}
```

### Form Field

Use `required`, `description`, and `error` to drop a rating into a form like any other field, and `clearable` to let people undo a score by selecting it again.

```tsx
import { useState } from 'react';
import { Block, Button, Rating, Text } from '@plocks/ui';

export function Demo() {
  const [score, setScore] = useState<number>(0);
  const [submitted, setSubmitted] = useState(false);

  const error = submitted && score === 0 ? 'Please choose a rating' : undefined;

  return (
    <Block>
      <Rating
        value={score}
        onChange={setScore}
        clearable
        required
        size="lg"
        label="Overall experience"
        description="Select a star again to clear your rating."
        error={error}
      />
      <Button onPress={() => setSubmitted(true)}>Submit</Button>
      <Text variant="small" c="muted">
        {score === 0 ? 'No rating selected.' : `You rated ${score} out of 5.`}
      </Text>
    </Block>
  );
}
```
