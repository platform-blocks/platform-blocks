# Tooltip

Tooltip provides contextual information without disrupting the user's workflow. It supports multiple trigger events, smart positioning, and accessibility features for an inclusive experience.

## Metadata

- Import: `import { Tooltip } from '@plocks/ui';`
- Docs: https://plocks.dev/components/Tooltip
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Tooltip

## Props

- `label` (required): ReactNode — Tooltip label. Also becomes the trigger's accessible description.
- `position`: 'top' | 'bottom' | 'left' | 'right' = 'top' — Position of the tooltip (written for LTR; mirrored in RTL). @default 'top'
- `withArrow`: boolean = false — Whether to show an arrow
- `color`: ThemeColor = an inverted surface — Bubble color: a palette token (`'primary'`, `'red.6'`) or any CSS color. The label color is picked for contrast. @default an inverted surface
- `radius`: RadiusValue = 'md' — Border radius. @default 'md'
- `offset`: number = 8 — Offset from target
- `w`: number — Fixed bubble width in px (not the root's). Omit to size to content, capped by `maw`.
- `maw`: number = 280 — Largest width the bubble may grow to before the label wraps. Also clamped by the available viewport space.
- `lineClamp`: number — Clamp the label to N lines with an ellipsis. Unset = wrap freely.
- `opened`: boolean — Controlled open state.
- `defaultOpened`: boolean = false — Initial open state when uncontrolled. @default false
- `onOpen`: () => void — Called when the tooltip opens (uncontrolled or requested).
- `onClose`: () => void — Called when the tooltip closes or asks to close (Escape, pointer / focus leaving).
- `openDelay`: number = 0 — Open delay in ms
- `closeDelay`: number = 0 — Close delay in ms
- `events`: TooltipEvents — Events that show the tooltip. Focus is on by default so keyboard users see it.
- `disabled`: boolean = false — Never show the tooltip.
- `children` (required): ReactElement — Children element to attach tooltip to
- `labelProps`: Omit<TextProps, 'children'> — Override props applied to the label `<Text>` (style, weight, ff, size, color).
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface TooltipEvents {
  /** Show while the pointer rests on the trigger (web). @default true */
  hover?: boolean;
  /** Show while the trigger has keyboard focus. @default true */
  focus?: boolean;
  /** Toggle on press (touch); on web a press shows it. @default true */
  touch?: boolean;
}
```

## Examples

### Basics

Wrap a control in `Tooltip` to display concise helper text on hover, focus, or touch.

```tsx
import { Button, Tooltip } from '@plocks/ui';

export function Demo() {
  return (
    <Tooltip label="Invite teammates" withArrow>
      <Button size="sm" variant="outline">
        Invite teammates
      </Button>
    </Tooltip>
  );
}
```

### Trigger Modes

Configure the `events` prop to decide whether tooltips appear on hover, focus, or touch interactions.

```tsx
import { Button, Row, Tooltip } from '@plocks/ui';

export function Demo() {
  return (
    <Row gap="md" wrap="wrap">
      <Tooltip label="Default hover and focus behavior">
        <Button size="sm">Hover or focus</Button>
      </Tooltip>
      <Tooltip
        label="Only appears when the button receives focus"
        events={{ hover: false, focus: true, touch: false }}
      >
        <Button size="sm" variant="outline">
          Focus only
        </Button>
      </Tooltip>
      <Tooltip
        label="Shows on touch interactions"
        events={{ hover: false, focus: false, touch: true }}
      >
        <Button size="sm" variant="ghost">
          Touch only
        </Button>
      </Tooltip>
    </Row>
  );
}
```

### Positions

Set `position` to top, bottom, left, or right to anchor the tooltip relative to its trigger.

```tsx
import { Button, Row, Tooltip } from '@plocks/ui';

export function Demo() {
  return (
    <Row gap="md" justify="center" wrap="wrap">
      <Tooltip label="Appears above the target" position="top" withArrow>
        <Button size="sm" variant="outline">
          Top
        </Button>
      </Tooltip>
      <Tooltip label="Appears below the target" position="bottom" withArrow>
        <Button size="sm" variant="outline">
          Bottom
        </Button>
      </Tooltip>
      <Tooltip label="Anchors to the left" position="left" withArrow>
        <Button size="sm" variant="outline">
          Left
        </Button>
      </Tooltip>
      <Tooltip label="Anchors to the right" position="right" withArrow>
        <Button size="sm" variant="outline">
          Right
        </Button>
      </Tooltip>
    </Row>
  );
}
```

### Delays and Content

Tune `openDelay`/`closeDelay` to reduce flicker. Long labels wrap on their own — use `maw` to move the wrap point, `w` for a fixed bubble, or `lineClamp` to truncate on purpose.

```tsx
import { Button, Row, Tooltip } from '@plocks/ui';

export function Demo() {
  return (
    <Row gap="md" wrap="wrap">
      <Tooltip label="Opens after 400ms" openDelay={400} closeDelay={200}>
        <Button size="sm" variant="outline">
          Delayed tooltip
        </Button>
      </Tooltip>
      <Tooltip
        label="This tooltip wraps across multiple lines so you can surface longer instructions without truncation."
        maw={220}
        withArrow
      >
        <Button size="sm">
          Wrapped tooltip
        </Button>
      </Tooltip>
    </Row>
  );
}
```
