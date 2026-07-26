---
title: Progress
category: feedback
tags: [progress, loading, status, indicator, completion, segments, vertical]
playground: true
---

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
