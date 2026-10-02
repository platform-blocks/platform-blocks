# Popover

Popover sits on the same overlay primitives as Menu and Tooltip, making it suitable for interactive content like forms, lists, and quick action menus while keeping focus management predictable.

## Metadata

- Import: `import { Popover } from '@plocks/ui';`
- Status: beta
- Docs: https://plocks.dev/components/Popover
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Popover

## Props

- `children` (required): ReactNode
- `opened`: boolean — Controlled open state
- `defaultOpened`: boolean = false — Initial open state in uncontrolled mode
- `onChange`: (opened: boolean) => void — Called when open state changes
- `onOpen`: () => void — Called when popover opens
- `onClose`: () => void — Called when popover closes
- `onDismiss`: () => void — Called when popover is dismissed via outside click or escape
- `trigger`: 'click' | 'hover' = 'click' — How the popover is triggered: 'click' (default) or 'hover' (mostly useful for devices with a mouse)
- `disabled`: boolean = false — Disable popover entirely
- `closeOnClickOutside`: boolean = true — Close when clicking outside
- `closeOnEscape`: boolean = true — Close when pressing Escape (web) or the Android back button. Only the topmost open overlay closes, so Escape in a nested popover closes just that one.
- `trapFocus`: boolean = false — Trap focus within the dropdown (web): focus moves to its first focusable element on open and Tab / Shift+Tab cycle inside it until it closes. Without it, a click-opened dropdown still receives focus (on the dropdown itself) so keyboard users can Tab into it.
- `keepMounted`: boolean = false — Keep dropdown mounted when hidden
- `returnFocus`: boolean = true — Return focus to the target after close (when focus was inside the dropdown — closing by clicking elsewhere never steals focus back).
- `w`: number | 'target' — Dropdown width, number or 'target' to match target width
- `maw`: number — Dropdown max-width
- `mah`: number — Dropdown max-height
- `miw`: number — Dropdown min-width
- `mih`: number — Dropdown min-height
- `radius`: RadiusValue | number — Border radius
- `shadow`: ShadowValue — Box shadow
- `zIndex`: number = the theme's `popover` layer (`getZIndex(theme, 'popover')`) — Dropdown z-index. @default the theme's `popover` layer (`getZIndex(theme, 'popover')`)
- `position`: 'top' | 'bottom' | 'left' | 'right' | 'auto' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end' = 'bottom' — Popover position relative to target, written for left-to-right layouts: in RTL `left`/`right` and the `-start`/`-end` of `top`/`bottom` are mirrored.
- `offset`: number | { mainAxis?: number; crossAxis?: number } = 8 — Offset from target
- `floatingStrategy`: 'absolute' | 'fixed' = 'fixed' — Floating strategy for positioning
- `middlewares`: PopoverMiddlewares — Custom positioning options
- `preventPositionChangeWhenVisible`: boolean = false — Prevent flipping/shifting when visible
- `viewport`: PositioningOptions['viewport'] — Override viewport padding
- `keyboardAvoidance`: boolean = true — Whether positioning should avoid the on-screen keyboard
- `fallbackPlacements`: PlacementType[] — Override fallback placements
- `boundary`: number — Override boundary padding
- `withRoles`: boolean = true — Render ARIA roles
- `id`: string — Unique id base for accessibility
- `withArrow`: boolean = false — Render arrow
- `arrowSize`: number = DEFAULT_ARROW_SIZE — Arrow size
- `arrowRadius`: number = 0 — Arrow border radius
- `arrowOffset`: number = 5 — Arrow offset
- `arrowPosition`: 'center' | 'side' = 'center' — Arrow position for start/end placements
- `onPositionChange`: (placement: PlacementType) => void — Called when the dropdown's physical placement changes (after flipping / RTL mirroring)
- `h`: DimensionProp — Height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Sub-components

### Popover.Dropdown

- `children` (required): ReactNode
- `role`: ViewProps['role'] = 'dialog' — ARIA role of the dropdown; the target's `aria-controls` points at it. @default 'dialog'
- `trapFocus`: boolean — Whether dropdown content should trap focus (web only); same as Popover's `trapFocus`
- `keepMounted`: boolean — Keep dropdown mounted

### Popover.Target

- `children` (required): ReactElement
- `popupType`: 'dialog' | 'menu' | 'listbox' | 'tree' | 'grid'
- `refProp`: string
- `targetProps`: Record<string, unknown> — Additional props merged onto target

## Types

```ts
export interface PopoverMiddlewares {
  flip?: boolean | { padding?: number };
  shift?: boolean | { padding?: number };
  inline?: boolean;
}
```

## Examples

### Basics

Popover targets wrap an interactive element and render dropdown content within `Popover.Dropdown`.

```tsx
import { Block, Button, Popover, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Popover>
      <Popover.Target>
        <Button>
          Toggle popover
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <Block p="sm">
          <Text fw="semibold">Quick actions</Text>
          <Button size="xs" variant="ghost">
            Create new entry
          </Button>
          <Button size="xs" variant="ghost">
            View documentation
          </Button>
        </Block>
      </Popover.Dropdown>
    </Popover>
  );
}
```

### Hover Trigger

Set `trigger="hover"` to open the popover when the user hovers over the target element. This is useful for mouse users who want quick access to additional content without clicking.

```tsx
import { Block, Button, Popover, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Popover trigger="hover">
      <Popover.Target>
        <Button>
          Hover over me
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <Block p="sm">
          <Text fw="semibold">Hover popover</Text>
        </Block>
      </Popover.Dropdown>
    </Popover>
  );
}
```

### Controlled State

Control the `opened` prop and respond to `onChange` when the popover needs to sync with surrounding form state.

```tsx
import { useState } from 'react';
import { Block, Button, Checkbox, Input, Popover, Text } from '@plocks/ui';

export function Demo() {
  const [opened, setOpened] = useState(false);

  return (
    <Block>
      <Checkbox
        label="Show popover"
        checked={opened}
        onChange={setOpened}
      />
      <Popover opened={opened} onChange={setOpened}>
        <Popover.Target>
          <Button>
            Invite teammate
          </Button>
        </Popover.Target>
        <Popover.Dropdown>
          <Block p="sm">
            <Text fw="semibold">Invite team member</Text>
            <Input
              label="Email"
              placeholder="name@example.com"
              size="sm"
              fullWidth
            />
            <Button size="xs" onPress={() => setOpened(false)}>
              Send invite
            </Button>
          </Block>
        </Popover.Dropdown>
      </Popover>
    </Block>
  );
}
```

### Placement Options

Set the `position` prop to control where the dropdown renders relative to its trigger.

```tsx
import { Button, Block, Popover, Text } from '@plocks/ui';

const OPTIONS = [
  { label: 'Top', position: 'top' },
  { label: 'Right', position: 'right' },
  { label: 'Bottom', position: 'bottom' },
  { label: 'Left', position: 'left' },
] as const;

export function Demo() {
  return (
    <Block direction="row">
      {OPTIONS.map(({ label, position }) => (
        <Popover key={position} position={position} withArrow>
          <Popover.Target>
            <Button>
              {label}
            </Button>
          </Popover.Target>
          <Popover.Dropdown>
            <Block p="sm">
              <Text fw="semibold">{label} placement</Text>
            </Block>
          </Popover.Dropdown>
        </Popover>
      ))}
    </Block>
  );
}
```
