# Progress

The Progress component displays the completion progress of a task or process. Supports different variants, colors, and animations.

## Metadata

- Import: `import { Progress } from '@plocks/ui';`
- Tags: progress, loading, status, indicator, completion, segments, vertical
- Docs: https://plocks.dev/components/Progress
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Progress

## Props

- `value` (required): number — Completion, 0–100 (clamped).
- `size`: SizeValue = 'md' — Bar thickness: a control-size token (`getControlSize(theme, size).height`) or pixels. @default 'md'
- `color`: ThemeColor = 'primary' — Fill color: palette token, `'primary.6'` shade syntax, or any CSS color. @default 'primary'
- `radius`: RadiusValue = 'md' — Corner radius: theme radius token, px, `'none'` or `'full'`. @default 'md'
- `striped`: boolean = false
- `animate`: boolean = false — Animates the stripes. Requires `striped`. Off while reduced motion is on.
- `transitionDuration`: number = 0 — Animate fill changes over this many ms. `0` (and reduced motion) jumps straight to the value. @default 0
- `orientation`: 'horizontal' | 'vertical' = 'horizontal' — Axis the bar fills along. Vertical bars fill bottom-up. @default 'horizontal'
- `length`: number | `${number}%` — Length along the main axis. Vertical bars default to 160.
- `trackColor`: string — Track (unfilled) color. Defaults to the theme's `backgrounds.border`.
- `aria-label`: string — Accessible name. Defaults to the `label` (web: by reference).
- `aria-valuetext`: string — Spoken value text, e.g. `"3 of 8 files"`. Defaults to the percentage.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`
- `label`: React.ReactNode — Label rendered outside the track. Strings are styled; nodes render as-is.
- `description`: React.ReactNode — Helper text ("sublabel") rendered directly beneath the label. Hidden while `error` is set.
- `error`: React.ReactNode — Error message rendered below the bar (announced politely). Replaces `description` when present.
- `required`: boolean = false — Marks the field as required, rendering an asterisk beside the label. @default false
- `withAsterisk`: boolean = true — Whether the required marker is drawn. @default true
- `labelPosition`: 'top' | 'bottom' | 'left' | 'right' = 'top' — Placement of the label block relative to the bar. @default 'top'
- `labelGap`: SizeValue = 'xs' — Gap between the label block and the bar — a theme spacing token or pixel value. @default 'xs'
- `labelProps`: Omit<TextProps, 'children'> — Override props applied to the label `<Text>`
- `descriptionProps`: Omit<TextProps, 'children'> — Override props applied to the description `<Text>`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), sizing (`fullWidth`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Sub-components

`import { ProgressRoot, ProgressSection, ProgressLabel } from '@plocks/ui';`

### ProgressRoot

- `size`: SizeValue = 'md' — Bar thickness: a control-size token or pixels. @default 'md'
- `radius`: RadiusValue = 'md' — Corner radius of the track. @default 'md'
- `orientation`: 'horizontal' | 'vertical' = 'horizontal' — Axis sections fill along. Vertical roots stack sections bottom-up. @default 'horizontal'
- `length`: number | `${number}%` — Length along the main axis. Vertical roots default to 160.
- `trackColor`: string — Track (unfilled) color. Defaults to the theme's `backgrounds.border`.
- `transitionDuration`: number — Default `transitionDuration` for child sections.
- `children` (required): React.ReactNode
- `aria-label`: string — Accessible name of the group of sections. Defaults to the `label`.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`
- `label`: React.ReactNode — Label rendered outside the track. Strings are styled; nodes render as-is.
- `description`: React.ReactNode — Helper text ("sublabel") rendered directly beneath the label. Hidden while `error` is set.
- `error`: React.ReactNode — Error message rendered below the bar (announced politely). Replaces `description` when present.
- `required`: boolean = false — Marks the field as required, rendering an asterisk beside the label. @default false
- `withAsterisk`: boolean = true — Whether the required marker is drawn. @default true
- `labelPosition`: 'top' | 'bottom' | 'left' | 'right' = 'top' — Placement of the label block relative to the bar. @default 'top'
- `labelGap`: SizeValue = 'xs' — Gap between the label block and the bar — a theme spacing token or pixel value. @default 'xs'
- `labelProps`: Omit<TextProps, 'children'> — Override props applied to the label `<Text>`
- `descriptionProps`: Omit<TextProps, 'children'> — Override props applied to the description `<Text>`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), sizing (`fullWidth`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### ProgressSection

- `value` (required): number — This section's share of the track, 0–100 (clamped).
- `color`: ThemeColor
- `striped`: boolean — Diagonal stripe overlay, matching `Progress`'s `striped`.
- `animate`: boolean — Animates the stripes. Requires `striped`. Off while reduced motion is on.
- `transitionDuration`: number — Animate size changes over this many ms. Inherited from `Progress.Root`.
- `radius`: RadiusValue — Rounds this section's own corners. Sections are square by default.
- `tooltip`: TooltipPropValue — Tooltip shown on hover/focus/tap, rendered inside the section. Prefer this over wrapping the section in `Tooltip` yourself: the wrapper would become the flex item and collapse the section's percentage width. Pass a string for the common case, or a config object to tune the tooltip: `tooltip={{ label: 'Documents — 35%', position: 'bottom' }}`.
- `aria-label`: string — Accessible name. Defaults to the tooltip text.
- `aria-valuetext`: string — Spoken value text. Defaults to the percentage.
- `children`: React.ReactNode
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`
- `onPress`: () => void
- `onHoverIn`: () => void
- `onHoverOut`: () => void
- `onMouseEnter`: (event: WebMouseEvent) => void — Web only. Forwarded for wrappers (e.g. `Tooltip`) that attach mouse handlers; prefer `onHoverIn`.
- `onMouseLeave`: (event: WebMouseEvent) => void — Web only. Forwarded for wrappers (e.g. `Tooltip`) that attach mouse handlers; prefer `onHoverOut`.
- `onFocus`: () => void
- `onBlur`: () => void

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### ProgressLabel

- `children` (required): React.ReactNode
- `color`: string — Label color. Defaults to a color readable on the enclosing section's fill.
- `size`: SizeValue = 'sm' — Font size token or px. @default 'sm'
- `numberOfLines`: number
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### Progress.Label

- `children` (required): React.ReactNode
- `color`: string — Label color. Defaults to a color readable on the enclosing section's fill.
- `size`: SizeValue = 'sm' — Font size token or px. @default 'sm'
- `numberOfLines`: number
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### Progress.Root

- `size`: SizeValue = 'md' — Bar thickness: a control-size token or pixels. @default 'md'
- `radius`: RadiusValue = 'md' — Corner radius of the track. @default 'md'
- `orientation`: 'horizontal' | 'vertical' = 'horizontal' — Axis sections fill along. Vertical roots stack sections bottom-up. @default 'horizontal'
- `length`: number | `${number}%` — Length along the main axis. Vertical roots default to 160.
- `trackColor`: string — Track (unfilled) color. Defaults to the theme's `backgrounds.border`.
- `transitionDuration`: number — Default `transitionDuration` for child sections.
- `children` (required): React.ReactNode
- `aria-label`: string — Accessible name of the group of sections. Defaults to the `label`.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`
- `label`: React.ReactNode — Label rendered outside the track. Strings are styled; nodes render as-is.
- `description`: React.ReactNode — Helper text ("sublabel") rendered directly beneath the label. Hidden while `error` is set.
- `error`: React.ReactNode — Error message rendered below the bar (announced politely). Replaces `description` when present.
- `required`: boolean = false — Marks the field as required, rendering an asterisk beside the label. @default false
- `withAsterisk`: boolean = true — Whether the required marker is drawn. @default true
- `labelPosition`: 'top' | 'bottom' | 'left' | 'right' = 'top' — Placement of the label block relative to the bar. @default 'top'
- `labelGap`: SizeValue = 'xs' — Gap between the label block and the bar — a theme spacing token or pixel value. @default 'xs'
- `labelProps`: Omit<TextProps, 'children'> — Override props applied to the label `<Text>`
- `descriptionProps`: Omit<TextProps, 'children'> — Override props applied to the description `<Text>`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), sizing (`fullWidth`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### Progress.Section

- `value` (required): number — This section's share of the track, 0–100 (clamped).
- `color`: ThemeColor
- `striped`: boolean — Diagonal stripe overlay, matching `Progress`'s `striped`.
- `animate`: boolean — Animates the stripes. Requires `striped`. Off while reduced motion is on.
- `transitionDuration`: number — Animate size changes over this many ms. Inherited from `Progress.Root`.
- `radius`: RadiusValue — Rounds this section's own corners. Sections are square by default.
- `tooltip`: TooltipPropValue — Tooltip shown on hover/focus/tap, rendered inside the section. Prefer this over wrapping the section in `Tooltip` yourself: the wrapper would become the flex item and collapse the section's percentage width. Pass a string for the common case, or a config object to tune the tooltip: `tooltip={{ label: 'Documents — 35%', position: 'bottom' }}`.
- `aria-label`: string — Accessible name. Defaults to the tooltip text.
- `aria-valuetext`: string — Spoken value text. Defaults to the percentage.
- `children`: React.ReactNode
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`
- `onPress`: () => void
- `onHoverIn`: () => void
- `onHoverOut`: () => void
- `onMouseEnter`: (event: WebMouseEvent) => void — Web only. Forwarded for wrappers (e.g. `Tooltip`) that attach mouse handlers; prefer `onHoverIn`.
- `onMouseLeave`: (event: WebMouseEvent) => void — Web only. Forwarded for wrappers (e.g. `Tooltip`) that attach mouse handlers; prefer `onHoverOut`.
- `onFocus`: () => void
- `onBlur`: () => void

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Examples

### Basics

Track a single completion percentage. Set `transitionDuration` so the bar animates its width whenever `value` changes instead of snapping to it.

```tsx
import { useState } from 'react';
import { Block, Button, Progress } from '@plocks/ui';

export function Demo() {
  const [value, setValue] = useState(50);

  return (
    <Block fullWidth>
      <Progress value={value} transitionDuration={400} />
      <Button onPress={() => setValue(Math.round(Math.random() * 100))}>Randomize value</Button>
    </Block>
  );
}
```

### Label and description

Progress takes the same field props as the input components: `label`, `description` (the sublabel beneath it), `error`, `required`, and `labelPosition`. The block renders outside the track — use `Progress.Label` for text drawn *inside* a filled section.

```tsx
import { Block, Progress } from '@plocks/ui';

export function Demo() {
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

Combine `striped` and `animate` to represent indeterminate work.

```tsx
import { Block, Progress } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Progress value={100} striped animate />
    </Block>
  );
}
```

### Compound sections

Compose a multi-part bar from `Progress.Root`, `Progress.Section`, and `Progress.Label`. Each section is sized as a percentage of the track, so sections may sum to less than 100% and leave the remainder unfilled.

```tsx
import { Block, Progress } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Progress.Root>
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
    </Block>
  );
}
```

### With tooltips

```tsx
import { Block, Progress } from '@plocks/ui';

const SECTIONS = [
  { label: 'Documents', value: 34, color: 'primary' as const },
  { label: 'Photos', value: 26, color: 'success' as const },
  { label: 'Backups', value: 18, color: 'warning' as const }
];

export function Demo() {
  return (
    <Block fullWidth>
      <Progress.Root>
        {SECTIONS.map((section) => (
          <Progress.Section
            key={section.label}
            value={section.value}
            color={section.color}
            tooltip={`${section.label} — ${section.value}%`}
          />
        ))}
      </Progress.Root>
    </Block>
  );
}
```

### Example — segments with legend

Custom-colored segments with tooltips and legend.

```tsx
import { Block, ColorSwatch, Progress, Row, Text } from '@plocks/ui';

const USAGE = [
  { label: 'Documents', value: 32, color: '#4c6ef5' },
  { label: 'Music', value: 24, color: '#12b886' },
  { label: 'Code', value: 14, color: '#fab005' },
  { label: 'Video Games', value: 9, color: '#fa5252' }
];

const TOTAL_GB = 500;

const formatSize = (percent: number) => {
  const gb = (percent / 100) * TOTAL_GB;
  return gb < 1 ? `${Math.round(gb * 1024)} MB` : `${Math.round(gb)} GB`;
};

export function Demo() {
  return (
    <Block gap="md" fullWidth>
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
            <Text variant="small" c="muted">
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

Set `orientation="vertical"` to fill from the bottom up. Vertical bars have no intrinsic length, so they default to 160 — use `length` (or `h`) to size them.

```tsx
import { Block, Progress, Row, Text } from '@plocks/ui';

const CHANNELS = [
  { label: 'Kick', value: 82 },
  { label: 'Snare', value: 64 },
  { label: 'Bass', value: 91 },
  { label: 'Vox', value: 47 }
];

export function Demo() {
  return (
    <Row gap="md">
      {CHANNELS.map((channel) => (
        <Block key={channel.label} gap="xs" align="center">
          <Progress value={channel.value} orientation="vertical" length={120} />
          <Text variant="small" c="muted">
            {channel.label}
          </Text>
        </Block>
      ))}
    </Row>
  );
}
```
