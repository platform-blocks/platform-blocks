# Rating

An interactive component for displaying star ratings and allowing users to provide ratings with customizable appearance.

## Metadata

- Canonical name: `Rating`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Rating } from '@platform-blocks/react-ui-library';`
- Category: input
- Tags: rating, stars, review, score, feedback
- Docs: https://react-ui-library.com/components/Rating
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Rating

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | number | No |  | Current rating value |
| `defaultValue` | number | No | 0 | Initial rating value for uncontrolled component |
| `count` | number | No | 5 | Number of rating items (stars) to render |
| `readOnly` | boolean | No | false | Disables input — the rating only displays its value |
| `disabled` | boolean | No | false | Disables the rating. Like `readOnly` it blocks input, but it also dims the control and reports a disabled state to assistive technology. |
| `allowFraction` | boolean | No | false | Allows partial values so a star can be filled fractionally |
| `precision` | number | No | 0.1 when `allowFraction`, otherwise 1 | Smallest increment a value is rounded to when `allowFraction` is enabled. Clamped to the `0.01`–`1` range. |
| `size` | SizeValue \| number | No | 'md' | Size of each rating item — a theme size token or an explicit pixel size |
| `color` | string | No |  | Color of filled items. Defaults to the theme warning color. |
| `emptyColor` | string | No |  | Color of empty items. Defaults to the theme gray color. |
| `hoverColor` | string | No |  | Color of items while hovering/dragging. Defaults to a darker theme warning color. |
| `onChange` | (value: number) => void | No |  | Called with the new value when the rating changes |
| `onHover` | (value: number) => void | No |  | Called with the previewed value while hovering (web only) |
| `clearable` | boolean | No | false | Allows clearing the rating by selecting the value that is already set |
| `required` | boolean | No | false | Marks the field as required. Renders an asterisk beside the label and reports the requirement to assistive technology on web. |
| `error` | React.ReactNode | No |  | Error message rendered below the rating |
| `description` | React.ReactNode | No |  | Helper text rendered below the rating |
| `showTooltip` | boolean | No | false | Shows a tooltip with the current value out of `count` while hovering |
| `getTooltipLabel` | (value: number, count: number) => string | No |  | Formats the tooltip text. Receives the previewed value and `count`; defaults to `4.5 / 5`. |
| `icon` | RatingIcon | No |  | Icon rendered for each item instead of the default star. Accepts an icon registry name (`'heart'`), an icon library component, or an element. Takes precedence over `character`. |
| `emptyIcon` | RatingIcon | No |  | Icon rendered for empty items. Defaults to `icon`, so the same glyph is drawn in `emptyColor` unless a different empty icon is supplied. |
| `character` | string \| React.ReactNode | No | '★' | Character or node rendered for filled items. Custom strings render as text glyphs, a React element is cloned with `size` and `color`, and the default star character renders the built-in star icon. Ignored when `icon` is set. |
| `emptyCharacter` | string \| React.ReactNode | No | '☆' | Character or node rendered for empty items. Ignored when `icon` or `emptyIcon` is set. |
| `gap` | SizeValue \| number | No | 'xs' | Spacing between rating items — a theme size token or an explicit pixel value |
| `style` | StyleProp<ViewStyle> | No |  | Additional styles applied to the root element |
| `testID` | string | No |  | Test ID for testing |
| `accessibilityLabel` | string | No |  | Custom accessibility label. Defaults to `Rating: {value} out of {count} stars`. |
| `accessibilityHint` | string | No |  | Custom accessibility hint. Defaults to an adjust hint unless `readOnly`. |
| `label` | React.ReactNode | No |  | Label rendered next to the rating. Strings are wrapped in a secondary `Text`. |
| `labelPosition` | 'left' \| 'right' \| 'above' \| 'below' | No | 'above' | Placement of the label relative to the rating |
| `labelGap` | SizeValue \| number | No | 'xs' | Spacing between the label and the rating — a theme size token or pixel value |
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
ID: `Rating.basic` • Tags: interactive • Category: basics • Status: stable • Since: 1.0.0

Capture a single rating value with an interactive control and mirror the current score in helper text.

```tsx
const [score, setScore] = useState<number>(3);
  return (
    <Block>
      <Rating
        value={score}
        onChange={setScore}
        size="lg"
        label="Rate the broadcast quality"
      />
      <Text variant="small" color="muted">
        Current score: {score} out of 5.
      </Text>
    </Block>
  );
}
```

### Sizes
ID: `Rating.sizes` • Tags: size • Category: layout • Status: stable • Since: 1.0.0

Compare the available `size` tokens side by side to pick the right scale for your scene.

```tsx
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;
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
ID: `Rating.colors` • Tags: palette • Category: theming • Status: stable • Since: 1.0.0

Derive filled, hover, and empty colors from the theme palette to align ratings with product semantics.

```tsx
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
            <Text variant="small" color="muted">
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
ID: `Rating.fractions` • Tags: precision • Category: features • Status: stable • Since: 1.0.0

Enable fractional ratings with configurable `precision` values to capture nuanced feedback.

```tsx
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
  const theme = useTheme();
  const [values, setValues] = useState<Record<FractionKey, number>>({
    match: 4.2,
    broadcast: 3.5
  });
  return (
    <Block>
      {FRACTION_SETTINGS.map(({ key, label, precision, helper }) => (
        <Block key={key}>
          <Text variant="small" color="muted">
            {label}
          </Text>
          <Rating
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
          <Text variant="small" color="muted">
            {helper}
          </Text>
        </Block>
      ))}
    </Block>
  );
}
```

### Custom Icons
ID: `Rating.icons` • Tags: icon, character • Category: theming • Status: stable • Since: 0.11.0

Swap the default star for any registry icon with `icon`, pair it with a different `emptyIcon` for the unfilled state, or fall back to plain text glyphs through `character` and `emptyCharacter`.

```tsx
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
ID: `Rating.variants` • Tags: interactive, read-only • Category: behavior • Status: stable • Since: 1.0.0

Contrast interactive, read-only, and tooltip-enabled ratings to decide which fits your feedback flow.

```tsx
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
ID: `Rating.form-field` • Tags: validation, required, clearable • Category: features • Status: stable • Since: 0.11.0

Use `required`, `description`, and `error` to drop a rating into a form like any other field, and `clearable` to let people undo a score by selecting it again.

```tsx
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
      <Text variant="small" color="muted">
        {score === 0 ? 'No rating selected.' : `You rated ${score} out of 5.`}
      </Text>
    </Block>
  );
}
```
