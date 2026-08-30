# Progress

The Progress component displays the completion progress of a task or process. Supports different variants, colors, and animations.

## Label and description

Progress accepts the same field props as the input components, rendered outside the track:

```tsx
<Progress
  value={64}
  label="Uploading assets"
  description="12 of 18 files"
  required
  labelPosition="top"
/>
```

`description` is the sublabel beneath the label, `error` replaces it and renders below the bar, `required` adds an asterisk (suppress it with `withAsterisk={false}`), and `labelPosition` accepts `top` (default), `bottom`, `left`, or `right`. `labelGap` tunes the space between the block and the bar, and `labelProps` / `descriptionProps` pass through to the underlying `<Text>` elements. `Progress.Root` takes the same props, so a segmented bar can be labelled the same way.

Don't confuse this with `Progress.Label`, which renders text *inside* a filled section.

## Compound components

For multi-part bars, compose `Progress.Root` with one `Progress.Section` per segment, and optionally a `Progress.Label` inside each section:

```tsx
<Progress.Root size="xl">
  <Progress.Section value={35} color="primary">
    <Progress.Label>35%</Progress.Label>
  </Progress.Section>
  <Progress.Section value={28} color="success">
    <Progress.Label>28%</Progress.Label>
  </Progress.Section>
</Progress.Root>
```

Each section takes its `value` as a percentage of the whole track, so sections may sum to less than 100 and leave the remainder unfilled. Sections support `color`, `striped`, `animate`, `radius`, and `transitionDuration` (inherited from `Progress.Root` when omitted).

## Tooltips

Use the section's own `tooltip` prop — a string, or a config object for full `Tooltip` props:

```tsx
<Progress.Section value={35} color="primary" tooltip="Documents — 35%" />
<Progress.Section value={28} color="success" tooltip={{ label: 'Photos — 28%', withArrow: true }} />
```

Do not wrap a section in `Tooltip` yourself. `Tooltip` renders a wrapper view, which then becomes the flex item inside `Progress.Root` and sizes itself to its content — collapsing the section's percentage width. The `tooltip` prop renders the tooltip *inside* the already-sized section instead. If you do need a manual wrapper, give it the width explicitly: `<Tooltip style={{ width: '35%' }}>`.

Sections also forward `onPress` and hover/focus handlers, so they can be made interactive directly.

## Vertical orientation

Pass `orientation="vertical"` to `Progress` or `Progress.Root` to fill from the bottom up. Vertical bars have no intrinsic length, so they default to 160 — set `length` (or the `h` layout prop) to size them, and `size` controls the thickness.

```tsx
<Progress value={82} orientation="vertical" length={120} size="sm" />
```

## Metadata

- Canonical name: `Progress`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Progress } from '@platform-blocks/react-ui-library';`
- Category: feedback
- Tags: progress, loading, status, indicator, completion, segments, vertical
- Docs: https://react-ui-library.com/components/Progress
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Progress

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | number | Yes |  | 0-100 |
| `size` | SizeValue | No | 'md' |  |
| `color` | ThemeColor | No | 'primary' |  |
| `radius` | SizeValue | No | 'md' |  |
| `striped` | boolean | No | false |  |
| `animate` | boolean | No | false |  |
| `transitionDuration` | number | No | 0 | ms |
| `orientation` | ProgressOrientation | No | 'horizontal' | Axis the bar fills along. Vertical bars fill bottom-up. @default 'horizontal' |
| `length` | number \| `${number}%` | No |  | Length along the main axis. Vertical bars default to 160. |
| `trackColor` | string | No |  | Track (unfilled) color. Defaults to the theme's `gray[1]`. |
| `style` | StyleProp<ViewStyle> | No |  | Styles applied to the track. Spacing/layout props stay on the outermost element. |
| `testID` | string | No |  |  |
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
| `fullWidth` | boolean | No |  | Makes the component fill the full width of its parent |
| `w` | DimensionValue | No |  | Sets a specific width |
| `h` | DimensionValue | No |  | Sets a specific height |
| `maxW` | DimensionValue | No |  | Sets the maximum width |
| `minW` | DimensionValue | No |  | Sets the minimum width |
| `maxH` | DimensionValue | No |  | Sets the maximum height |
| `minH` | DimensionValue | No |  | Sets the minimum height |
| `label` | React.ReactNode | No |  | Label rendered outside the track. Strings are styled; nodes render as-is. |
| `description` | React.ReactNode | No |  | Helper text ("sublabel") rendered directly beneath the label. Hidden while `error` is set. |
| `error` | React.ReactNode | No |  | Error message rendered below the bar. Replaces `description` when present. |
| `required` | boolean | No | false | Marks the field as required, rendering an asterisk beside the label. @default false |
| `withAsterisk` | boolean | No | true | Whether the required marker is drawn. @default true |
| `labelPosition` | ProgressLabelPosition | No | 'top' | Placement of the label block relative to the bar. @default 'top' |
| `labelGap` | SizeValue \| number | No | 'xs' | Gap between the label block and the bar — a theme size token or pixel value. @default 'xs' |
| `labelProps` | Omit<TextProps, 'children'> | No |  | Override props applied to the label `<Text>` |
| `descriptionProps` | Omit<TextProps, 'children'> | No |  | Override props applied to the description `<Text>` |

## Examples

### Basics
ID: `Progress.basic` • Tags: progress • Category: basics • Status: stable • Since: 1.0.0

Track a single completion percentage. Set `transitionDuration` so the bar animates its width whenever `value` changes instead of snapping to it.

```tsx
const TRANSITION_MS = 400;
  const [completion, setCompletion] = useState<number>(50);
  return (
    <Block fullWidth >
      <Progress value={completion} transitionDuration={TRANSITION_MS} />
      <Button onPress={() => setCompletion(randomValue)}>
        randomize value
      </Button>
    </Block>
  );
}
```

### Label and description
ID: `Progress.label` • Tags: label, description, error, field • Category: basics • Status: stable • Since: 0.11.0

Progress takes the same field props as the input components: `label`, `description` (the sublabel beneath it), `error`, `required`, and `labelPosition`. The block renders outside the track — use `Progress.Label` for text drawn *inside* a filled section.

```tsx
return (
    <Block gap="lg" fullWidth>
      <Progress value={64} label="Uploading assets" description="12 of 18 files" />
      <Progress
        value={40}
        color="error"
        label="Sync"
        description="Retries every 30 seconds"
        error="Connection lost — retrying"
      />
      <Progress value={82} label="Storage" required labelPosition="left" color="success" />
      <Progress.Root label="Disk usage" description="Documents, photos, and system files">
        <Progress.Section value={35} color="primary" />
        <Progress.Section value={28} color="success" />
        <Progress.Section value={12} color="warning" />
      </Progress.Root>
    </Block>
  );
}
```

### Advanced
ID: `Progress.advanced` • Tags: animation, striped • Category: behavior • Status: stable • Since: 1.0.0

Combine `striped` and `animate` to represent indeterminate work.

```tsx
const [value, setValue] = useState<number>(0);
  useEffect(() => {
    // Hold on the completed state for a beat, then start the run over.
    if (value >= 100) {
      const restart = setTimeout(() => setValue(0), 1800);
      return () => clearTimeout(restart);
    }
    const tick = setTimeout(() => {
      setValue((current) => Math.min(100, current + stageFor(current).speed));
    }, TICK_MS);
    return () => clearTimeout(tick);
  }, [value]);
  const done = value >= 100;
  const stage = stageFor(value);
  return (
    <Block fullWidth>
      <Progress
        value={value}
        label={done ? 'Upload complete' : `${stage.label} — ${Math.round(value)}%`}
        description={done ? `18 files · ${TOTAL_MB} MB` : describe(value)}
        color={done ? 'success' : stage.color}
        striped={!done && stage.striped}
        animate={!done && stage.striped}
        transitionDuration={TICK_MS + 20}
        size="lg"
        radius="xl"
      />
    </Block>
  );
}
```

### Compound sections
ID: `Progress.compound` • Tags: compound, sections, label • Category: composition • Status: stable • Since: 0.10.2

Compose a multi-part bar from `Progress.Root`, `Progress.Section`, and `Progress.Label`. Each section is sized as a percentage of the track, so sections may sum to less than 100% and leave the remainder unfilled.

```tsx
return (
    <Block gap="lg">
      <Block gap="xs">
        <Text variant="small" color="muted">
          Sections with inline labels
        </Text>
        <Progress.Root size="xl">
          <Progress.Section value={35} color="primary">
            <Progress.Label>Docs</Progress.Label>
          </Progress.Section>
          <Progress.Section value={28} color="success">
            <Progress.Label>Media</Progress.Label>
          </Progress.Section>
          <Progress.Section value={15} color="warning">
            <Progress.Label>Other</Progress.Label>
          </Progress.Section>
        </Progress.Root>
        <Text variant="small" color="muted">
          Sections take a share of the track, so the remaining 22% stays unfilled.
        </Text>
      </Block>
      <Block gap="xs">
        <Text variant="small" color="muted">
          Striped and animated sections
        </Text>
        <Progress.Root size="lg" radius="xl">
          <Progress.Section value={45} color="primary" />
          <Progress.Section value={25} color="secondary" striped animate />
        </Progress.Root>
        <Text variant="small" color="muted">
          `striped` and `animate` work per section, marking in-flight work.
        </Text>
      </Block>
    </Block>
  );
}
```

### With tooltips
ID: `Progress.tooltips` • Tags: tooltip, sections, hover • Category: composition • Status: stable • Since: 0.10.2

```tsx
const SECTIONS = [
  { label: 'Documents', value: 34, color: 'primary' as const },
  { label: 'Photos', value: 26, color: 'success' as const },
  { label: 'Backups', value: 18, color: 'warning' as const }
];
  return (
      <Progress.Root size="xl">
        {SECTIONS.map((section) => (
          <Progress.Section
            key={section.label}
            value={section.value}
            color={section.color}
            tooltip={`${section.label} — ${section.value}%`}
          >
            <Progress.Label>{section.value}%</Progress.Label>
          </Progress.Section>
        ))}
      </Progress.Root>
  );
}
```

### Example — segments with legend
ID: `Progress.segments` • Tags: segments, legend, storage • Category: composition • Status: stable • Since: 0.10.2

Custom-colored segments with tooltips and legend.

```tsx
const USAGE = [
  { label: 'Documents', value: 32, color: '#4c6ef5' },
  { label: 'Music', value: 24, color: '#12b886' },
  { label: 'Code', value: 14, color: '#fab005' },
  { label: 'Video Games', value: 9, color: '#fa5252' }
];
const TOTAL_GB = 500;
const used = USAGE.reduce((sum, segment) => sum + segment.value, 0);
const formatSize = (percent: number) => {
  const gb = (percent / 100) * TOTAL_GB;
  return gb < 1 ? `${Math.round(gb * 1024)} MB` : `${Math.round(gb)} GB`;
};
  return (
    <Block gap="md" fullWidth>
      <Row justify="space-between" align="center">
        <Text weight="600">Project storage</Text>
        <Text variant="small" color="muted">
          {formatSize(used)} of {TOTAL_GB} GB used
        </Text>
      </Row>
      <Progress.Root size="lg" radius="xl">
        {USAGE.map((segment) => (
          <Progress.Section
            key={segment.label}
            value={segment.value}
            color={segment.color}
            tooltip={{
              label: `${segment.label} — ${formatSize(segment.value)} (${segment.value}%)`,
              withArrow: true
            }}
          >
            <Progress.Label>{formatSize(segment.value)}</Progress.Label>
          </Progress.Section>
        ))}
      </Progress.Root>
      <Block gap="lg" direction="row" justify="center">
        {USAGE.map((segment) => (
          <Row key={segment.label} gap="xs" align="center">
            <ColorSwatch color={segment.color} size={12} />
            <Text variant="small">{segment.label}</Text>
            <Text variant="small" color="muted">
              {segment.value}%
            </Text>
          </Row>
        ))}
      </Block>
    </Block>
  );
}
```

### Vertical orientation
ID: `Progress.vertical` • Tags: orientation, vertical • Category: composition • Status: stable • Since: 0.10.2

Set `orientation="vertical"` to fill from the bottom up. Vertical bars have no intrinsic length, so they default to 160 — use `length` (or `h`) to size them.

```tsx
const CHANNELS = [
  { label: 'Kick', value: 82, color: 'primary' as const },
  { label: 'Snare', value: 64, color: 'success' as const },
  { label: 'Bass', value: 91, color: 'warning' as const },
  { label: 'Vox', value: 47, color: 'error' as const }
];
  return (
    <Block gap="lg">
      <Block gap="sm">
        <Text variant="small" color="muted">
          Vertical bars fill from the bottom up
        </Text>
        <Row gap="md" align="flex-end">
          {CHANNELS.map((channel) => (
            <Block key={channel.label} gap="xs" align="center">
              <Progress
                value={channel.value}
                orientation="vertical"
                length={120}
                size="sm"
                radius="xl"
                color={channel.color}
                transitionDuration={600}
              />
              <Text variant="small" color="muted">
                {channel.label}
              </Text>
            </Block>
          ))}
          <Progress.Root orientation="vertical" length={140} size="md" radius="md">
            <Progress.Section value={40} color="primary" />
            <Progress.Section value={25} color="success" />
            <Progress.Section value={15} color="warning" striped animate />
          </Progress.Root>
        </Row>
      </Block>
    </Block>
  );
}
```
