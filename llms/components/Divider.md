# Divider

The Divider component provides a visual separator between content sections. Supports horizontal and vertical orientations, four visual variants (`solid`, `dashed`, `dotted`, `gradient`), an aligned `color` vocabulary with a soft default tuned for separators, an `opacity` shorthand, and optional labels.

## Metadata

- Canonical name: `Divider`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Divider } from '@platform-blocks/react-ui-library';`
- Category: layout
- Tags: divider, separator, line, section
- Docs: https://react-ui-library.com/components/Divider
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Divider

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `orientation` | DividerOrientation | No |  | Layout direction of the line. `'horizontal'` spans width; `'vertical'` spans height. Defaults to `'horizontal'`. |
| `variant` | DividerVariant | No |  | Visual style of the line. `'gradient'` fades transparent → color → transparent. Defaults to `'solid'`. |
| `color` | ThemeColor | No |  | Line color. Accepts the named tokens `'border'` / `'subtle'` / `'muted'`, a palette name (`'success'` → a shade well below the accent, so a tinted rule still reads as chrome), `'primary.6'` shade syntax, or any CSS color. Defaults to `'border'`. |
| `size` | SizeValue \| number | No |  | Thickness of the divider (default 1). Accepts a size token or pixel value. |
| `opacity` | number | No |  | Multiplied with the divider's overall opacity. Convenience prop equivalent to `style={{ opacity }}`. |
| `label` | React.ReactNode | No |  | Optional content rendered in the middle of the line. |
| `labelPosition` | 'left' \| 'center' \| 'right' | No |  | Where the `label` sits along the line. Defaults to `'center'`. |
| `labelProps` | Omit<TextProps, 'children'> | No |  | Override props applied to the label `<Text>` (only when `label` is a string). |
| `style` | StyleProp<ViewStyle> | No |  | Style override applied to the outer wrapping `View`. |
| `testID` | string | No |  | Test identifier forwarded to the wrapping `View`. |
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
ID: `Divider.basic` • Tags: solid, dashed • Category: basics • Status: stable • Since: 1.0.0

Insert horizontal dividers between sections to separate content; switch the `variant` prop to toggle between solid and dashed lines.

```tsx
return (
    <Block>
      <Text variant="p" weight="medium">
        Q1 Highlights
      </Text>
      <Text variant="p">Revenue grew 12% year over year.</Text>
      <Divider />
      <Text variant="p">Customer retention improved across every region.</Text>
      <Divider variant="dashed" />
      <Text variant="p">Product roadmap updates will ship next quarter.</Text>
    </Block>
  );
}
```

### Color Variants
ID: `Divider.colors` • Tags: color, label, variant • Category: theming • Status: stable • Since: 1.0.0

Select a `color` to match semantic palettes and combine it with `label` plus `variant` to fit your divider into content sections.

```tsx
const COLORS: Array<{ label: string; tone?: DividerProps['color'] }> = [
  { label: 'Border (default)' },
  { label: 'Subtle', tone: 'subtle' },
  { label: 'Muted', tone: 'muted' },
  { label: 'Gray', tone: 'gray' },
  { label: 'Primary', tone: 'primary' },
  { label: 'Secondary', tone: 'secondary' },
  { label: 'Success', tone: 'success' },
  { label: 'Warning', tone: 'warning' },
  { label: 'Error', tone: 'error' },
];
  return (
    <Block>
      <Block>
        <Text variant="small" weight="medium">
          Semantic color variants
        </Text>
        {COLORS.map(({ label, tone }) => (
          <Block key={label}>
            <Text variant="p" color="muted">
              {label}
            </Text>
            <Divider color={tone} />
          </Block>
        ))}
      </Block>
      <Block>
        <Text variant="small" weight="medium">
          Labeled dividers
        </Text>
        <Divider color="primary" label="Quarterly results" />
        <Divider color="success" label="Customer satisfaction" />
        <Divider color="error" label="Risks" />
      </Block>
      <Block>
        <Text variant="small" weight="medium">
          Variant styles
        </Text>
        <Divider color="primary" variant="solid" label="Solid" />
        <Divider color="primary" variant="dashed" label="Dashed" />
        <Divider color="primary" variant="dotted" label="Dotted" />
        <Divider color="primary" variant="gradient" label="Gradient" />
      </Block>
    </Block>
  );
}
```

### Gradient & opacity
ID: `Divider.gradient-opacity` • Tags: gradient, opacity, customization, variants • Category: general • Status: stable • Since: 1.0.0

The `gradient` variant fades transparent → color → transparent, perfect for breaking up sections without a hard edge. The `opacity` prop is a shorthand for `style={{ opacity }}` — combine it with `color` to dial in subtle separators.

```tsx
return (
    <Block>
      <Block>
        <Text variant="small" weight="medium">
          Gradient variant
        </Text>
        <Divider variant="gradient" color="primary" />
        <Divider variant="gradient" color="error" size={2} />
        <Divider variant="gradient" label="Section break" />
      </Block>
      <Block>
        <Text variant="small" weight="medium">
          Opacity prop — same color, different emphasis
        </Text>
        <Divider color="primary" />
        <Divider color="primary" opacity={0.5} />
        <Divider color="primary" opacity={0.25} />
      </Block>
      <Block>
        <Text variant="small" weight="medium">
          Subtle separator (border default + low opacity)
        </Text>
        <Divider opacity={0.4} />
      </Block>
      <Block>
        <Text variant="small" weight="medium">
          Custom color + opacity
        </Text>
        <Divider color="#a855f7" opacity={0.6} size={2} />
      </Block>
    </Block>
  );
}
```

### Labeled Dividers
ID: `Divider.labeled` • Tags: label, labelPosition • Category: layout • Status: stable • Since: 1.0.0

Provide a `label` node and adjust `labelPosition` plus `color` to separate form sections with contextual dividers.

```tsx
return (
    <Block>
      <Text variant="p">Sign in with email</Text>
      <Divider label="or" />
      <Text variant="p">Continue with social accounts</Text>
      <Divider
        label={<Chip size="sm" variant="outline">Settings</Chip>}
        labelPosition="left"
        color="secondary"
      />
      <Text variant="p">Manage notification preferences</Text>
      <Divider label="Advanced options" labelPosition="right" color="primary" />
      <Text variant="p">Invite admins or export account data</Text>
    </Block>
  );
}
```

### Vertical Dividers
ID: `Divider.vertical` • Tags: vertical, navigation, label • Category: layout • Status: stable • Since: 1.0.0

Switch `orientation="vertical"` to separate horizontal layouts like navigation and add `label` or `color` when you need emphasis.

```tsx
return (
    <Block>
      <Block align="center" direction="row" h={100}>
        <Block align="center">
          <Text variant="p" weight="medium">
            Profile
          </Text>
          <Text variant="small" color="muted">
            View details
          </Text>
        </Block>
        <Divider orientation="vertical" />
        <Block align="center">
          <Text variant="p" weight="medium">
            Settings
          </Text>
          <Text variant="small" color="muted">
            Preferences
          </Text>
        </Block>
        <Divider orientation="vertical" label="Pro" color="success" />
        <Block align="center">
          <Text variant="p" weight="medium">
            Support
          </Text>
          <Text variant="small" color="muted">
            Help center
          </Text>
        </Block>
      </Block>
      <Block align="center" wrap="wrap" direction="row" h={100}>
        <Text variant="p">Home</Text>
        <Divider orientation="vertical" />
        <Text variant="p">Fixtures</Text>
        <Divider orientation="vertical" color="primary" />
        <Text variant="p">Standings</Text>
        <Divider orientation="vertical" label="Live" color="warning" />
        <Text variant="p">Highlights</Text>
      </Block>
    </Block>
  );
}
```

### Sizes
ID: `Divider.sizes` • Category: general

Demonstrates how the `size` prop accepts both numeric values and spacing tokens so you can dial in subtle, comfortable, or bold divider weights in horizontal and vertical layouts.

```tsx
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;
  return (
    <Block fullWidth>
      {SIZES.map((size) => (
        <Block key={size} fullWidth>
          <Text variant="small" color="secondary">{size}</Text>
          <Divider size={size} />
        </Block>
      ))}
      <Block fullWidth>
        <Text variant="small" color="secondary">1 (numeric)</Text>
        <Divider size={1} />
      </Block>
    </Block>
  );
}
```

### Variants
ID: `Divider.variants` • Category: general

Showcase solid, dashed, and dotted dividers in both horizontal and vertical layouts to highlight how each variant can communicate different section breaks.

```tsx
return (
    <Block>
      <Block>
        <Text variant="p" weight="medium">
          Release Notes
        </Text>
        <Text variant="p" color="muted">
          Default solid divider keeps sections crisp.
        </Text>
        <Divider variant="solid" />
        <Text variant="p">
          The winter update introduces a revamped queue and faster syncing.
        </Text>
      </Block>
      <Block>
        <Text variant="p" weight="medium">
          Sprint Checklist
        </Text>
        <Text variant="p" color="muted">
          Dashed lines work nicely for in-progress flows.
        </Text>
        <Divider variant="dashed" />
        <Text variant="p">
          QA sign-off, regression pass, and rollout comms are scheduled for Friday.
        </Text>
      </Block>
      <Block>
        <Text variant="p" weight="medium">
          Creator Status
        </Text>
        <Text variant="p" color="muted">
          Dotted borders add a softer visual break.
        </Text>
        <Divider variant="dotted" />
        <Text variant="p">
          Enable payouts once verification documents finish processing.
        </Text>
      </Block>
      <Block>
        <Text variant="p" weight="medium">
          Section break
        </Text>
        <Text variant="p" color="muted">
          Gradient variant fades the line in and out — softer than a hard rule.
        </Text>
        <Divider variant="gradient" color="primary" />
        <Text variant="p">
          The fade keeps long-form content breathable without dropping a horizontal stripe.
        </Text>
      </Block>
      <Block direction="row" align="center" wrap="wrap">
        <Text variant="small" weight="medium">
          Published
        </Text>
        <Divider orientation="vertical" variant="solid" style={{ height: 48 }} />
        <Text variant="small" weight="medium">
          Drafts
        </Text>
        <Divider orientation="vertical" variant="dashed" style={{ height: 48 }} />
        <Text variant="small" weight="medium">
          Scheduled
        </Text>
        <Divider orientation="vertical" variant="dotted" label="Beta" color="warning" style={{ height: 48 }} />
        <Text variant="small" weight="medium">
          Archived
        </Text>
      </Block>
    </Block>
  );
}
```
