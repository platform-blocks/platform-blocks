# Title

Semantic heading component mapping `order={1..6}` to typography variants `h1..h6` while offering decorative enhancements like underline, afterline, and prefix adornments.

## Metadata

- Canonical name: `Title`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Title } from '@platform-blocks/react-ui-library';`
- Status: beta
- Since: 0.1.0
- Category: typography
- Docs: https://react-ui-library.com/components/Title
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Title

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `text` | string | No |  | The text content to display in the title |
| `order` | 1 \| 2 \| 3 \| 4 \| 5 \| 6 | No |  | The heading level (1-6), determines the semantic importance and default styling |
| `underline` | boolean | No |  | Whether to show an underline decoration below the title |
| `afterline` | boolean | No |  | Whether to show a line after the title text |
| `underlineColor` | string | No |  | Color of the underline decoration |
| `underlineStroke` | number | No |  | Thickness/stroke width of the underline in pixels |
| `afterlineGap` | number | No |  | Gap between the title text and afterline in pixels |
| `underlineOffset` | number | No |  | Vertical offset of the underline from the text baseline in pixels |
| `prefix` | boolean \| React.ReactNode | No |  | Prefix decoration - can be a boolean to show default prefix or a custom React element |
| `prefixVariant` | 'bar' \| 'dot' | No |  | Style variant for the default prefix decoration |
| `prefixColor` | string | No |  | Color of the prefix decoration |
| `prefixSize` | number | No |  | Size of the prefix decoration in pixels |
| `prefixLength` | number | No |  | Length of the prefix decoration (for bar variant) in pixels |
| `prefixGap` | number | No |  | Gap between the prefix and title text in pixels |
| `prefixRadius` | number | No |  | Border radius of the prefix decoration in pixels |
| `style` | any | No |  | Additional styles to apply to the title text element |
| `variant` | TextProps['variant'] | No |  | Text variant to use, inherits from TextProps variant system |
| `containerStyle` | any | No |  | Additional styles to apply to the container wrapping the entire title |
| `startIcon` | React.ReactNode | No |  | Icon element to display on the left side of the title |
| `endIcon` | React.ReactNode | No |  | Icon element to display on the right side of the title |
| `action` | React.ReactNode | No |  | Action button or element positioned at the far right of the title |
| `subtitle` | React.ReactNode | No |  | Optional subtitle displayed below the title |
| `subtitleProps` | Partial<TextProps> | No |  | Additional Text props applied to the subtitle when rendered as Text |
| `subtitleSpacing` | number | No |  | Spacing between the title and subtitle in pixels (default: 8) |
| `children` | React.ReactNode | No |  | Text node children. Optional if using translation via `tx`. |
| `tx` | string | No |  | Translation key (if provided, overrides children when found) |
| `txParams` | Record<string, any> | No |  | Params for translation interpolation |
| `size` | SizeValue | No |  | Size can be a size token or number (overrides variant fontSize) |
| `color` | string | No |  | Text color. Accepts a `theme.text` role (`'primary'`, `'secondary'`, `'muted'`, `'disabled'`, `'link'`), `'dimmed'` for the muted token, a palette name (`'success'` → its readable shade), `'primary.6'` shade syntax, or any CSS color string. |
| `c` | string | No |  | Shorthand alias for `color`, resolved identically. `color` wins when both are set. |
| `weight` | 'normal' \| 'medium' \| 'semibold' \| 'bold' \| 'light' \| 'black' \| '100' \| '200' \| '300' \| '400' \| '500' \| '600' \| '700' \| '800' \| '900' \| number | No |  | Font weight (supports all CSS font-weight values) |
| `align` | 'left' \| 'center' \| 'right' \| 'justify' | No |  | Text alignment |
| `lineHeight` | number | No |  | Line height as a multiplier (e.g., 1.5) or absolute value |
| `tracking` | number | No |  | Letter spacing (tracking) in pixels or em units |
| `uppercase` | boolean | No |  | Convert text to uppercase |
| `fontFamily` | string | No |  | Custom font family (overrides theme font) |
| `ff` | string | No |  | Shorthand alias for `fontFamily` |
| `as` | HTMLTextVariant | No |  | For platform-specific rendering on web |
| `selectable` | boolean | No |  | Whether text is selectable (default: true) |
| `onPress` | () => void | No |  | Called when text is pressed |
| `onLayout` | (event: any) => void | No |  | Called when the text layout is calculated |
| `value` | string \| number | No |  | Value to display (overrides children, useful for numbers) |
| `numberOfLines` | RNTextProps['numberOfLines'] | No |  | Maximum number of lines to display (native + web) |
| `ellipsizeMode` | RNTextProps['ellipsizeMode'] | No |  | Ellipsis strategy when text exceeds available space |
| `id` | string | No |  | Element id. On web this is the DOM `id` — headings need one to be a link target. |
| `nativeID` | string | No |  | React Native alias for `id`; used when the two platforms need different values. |
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
ID: `Title.basic` • Tags: title, headings • Category: usage • Status: stable • Since: 1.0.0

Default Title usage shows the h2-style heading produced by the component without additional props.

```tsx
return (
    <Card p="md">
      <Block>
        <Title>Default section heading</Title>
        <Text size="sm" color="secondary">
          Titles default to order 2, making them a natural choice for section headings.
        </Text>
      </Block>
    </Card>
  );
}
```

### Heading Levels
ID: `Title.levels` • Tags: headings, semantics • Category: usage • Status: stable • Since: 1.0.0

Set the `order` prop to align Title with semantic heading levels from h1 through h6.

```tsx
return (
    <Card p="md">
      <Block>
        <Title order={1}>Page heading (order=1)</Title>
        <Title order={2}>Section heading (order=2)</Title>
        <Title order={3}>Subsection heading (order=3)</Title>
        <Title order={4}>Fourth-level heading (order=4)</Title>
        <Title order={5}>Fifth-level heading (order=5)</Title>
        <Title order={6}>Sixth-level heading (order=6)</Title>
      </Block>
    </Card>
  );
}
```

### Prefix Styles
ID: `Title.prefix` • Tags: prefix, decoration • Category: theming • Status: stable • Since: 1.0.0

Enable the `prefix` prop to add visual markers, switching variants or supplying a custom icon for emphasis.

```tsx
return (
    <Card p="md">
      <Block>
        <Title prefix>Default bar prefix</Title>
        <Title prefix prefixVariant="dot">Dot prefix</Title>
        <Title prefix prefixVariant="bar" prefixSize={6} prefixLength={40} prefixColor="#6366f1">
          Custom bar size and color
        </Title>
        <Title prefix={<Icon name="star" />} prefixGap={8} prefixColor="#f59e0b">
          Icon prefix with custom color
        </Title>
      </Block>
    </Card>
  );
}
```

### Underlines
ID: `Title.underline` • Tags: underline, afterline • Category: theming • Status: stable • Since: 1.0.0

Toggle `underline` and `afterline` to add emphasis and separation, including custom color and stroke weights.

```tsx
return (
    <Card p="md">
      <Block>
        <Title underline>Underline only</Title>
        <Title afterline>Afterline only</Title>
        <Title underline afterline>Underline with afterline</Title>
        <Title underline underlineColor="#ff4d4f" underlineStroke={4}>
          Custom underline color and stroke
        </Title>
      </Block>
    </Card>
  );
}
```

### Actions
ID: `Title.action` • Tags: actions, layout • Category: usage • Status: stable • Since: 1.0.0

Pass an `action` element to align buttons or toggles alongside the heading.

```tsx
return (
    <Card p="md">
      <Block>
        <Title action={<Button title="Action" size="sm" />}>Basic with action</Title>
        <Title underline action={<Button title="Edit" size="sm" variant="outline" />}>
          Underline with action
        </Title>
        <Title afterline action={<Button title="Settings" size="sm" variant="ghost" />}>
          Afterline with action
        </Title>
        <Title underline afterline action={<Button title="More" size="sm" />}>
          Full layout with action
        </Title>
      </Block>
    </Card>
  );
}
```

### Combined Accents
ID: `Title.combined` • Tags: prefix, underline, afterline • Category: theming • Status: stable • Since: 1.0.0

Mix prefix, underline, and afterline props to create a primary heading and aligned subsection titles with consistent accents.

```tsx
return (
    <Card p="md">
      <Block>
        <Title
          prefix
          underline
          afterline
          prefixVariant="bar"
          prefixSize={6}
          prefixLength={48}
          prefixColor="#10b981"
          underlineStroke={3}
        >
          Analytics overview
        </Title>
        <Text size="sm" color="secondary">
          Combine prefixes, underline, and afterline to create a structured page heading with a strong visual anchor.
        </Text>
        <Block>
          <Title
            order={3}
            prefix
            prefixVariant="dot"
            prefixColor="#ef4444"
            underline
            underlineColor="#ef4444"
            underlineStroke={2}
          >
            Active users
          </Title>
          <Title
            order={3}
            prefix
            prefixVariant="dot"
            prefixColor="#6366f1"
            underline
            underlineColor="#6366f1"
            underlineStroke={2}
          >
            Conversion rate
          </Title>
        </Block>
      </Block>
    </Card>
  );
}
```
