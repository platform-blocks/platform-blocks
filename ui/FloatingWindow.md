# FloatingWindow

Use DragHandle when controls inside the window need their own pointer interactions. Without it, the whole surface can be dragged.

## Metadata

- Import: `import { FloatingWindow } from '@plocks/ui';`
- Status: beta
- Docs: https://plocks.dev/components/FloatingWindow
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/FloatingWindow

## Props

- `children`: React.ReactNode
- `dimensions`: FloatingWindowDimensions — Dimensions and resize limits.
- `onSizeChange`: (size: { width: number; height: number }) => void — Called when resized.
- `onResizeStart`: () => void
- `onResizeEnd`: () => void
- `withBorder`: boolean — Surface border.
- `radius`: RadiusValue — Surface radius.
- `shadow`: ShadowToken — Surface shadow.
- `zIndex`: number — Overlay stack order.
- `withinPortal`: boolean = true — Render at app root. @default true
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`
- `initialPosition`: FloatingWindowInitialPosition
- `enabled`: boolean
- `constrainToViewport`: boolean
- `constrainOffset`: number
- `axis`: 'x' | 'y'
- `onPositionChange`: (position: FloatingWindowPosition) => void
- `onDragStart`: () => void
- `onDragEnd`: () => void
- `setPositionRef`: React.RefObject<FloatingWindowHandle | null>

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Sub-components

`import { FloatingWindowDragHandle, FloatingWindowResizeHandle } from '@plocks/ui';`

### FloatingWindowDragHandle

- `children`: React.ReactNode
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### FloatingWindowResizeHandle

- `children`: React.ReactNode
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### FloatingWindow.DragHandle

- `children`: React.ReactNode
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### FloatingWindow.ResizeHandle

- `children`: React.ReactNode
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Related hooks

- `useFloatingWindow({ initialPosition = { top: 20, left: 20 }, enabled = true, constrainToViewport = true, constrainOffset = 0, axis, onPositionChange, onDragStart, onDragEnd, setPositionRef }: UseFloatingWindowOptions = {}): UseFloatingWindowReturn`

## Types

```ts
export interface FloatingWindowDimensions { initialWidth?: number; initialHeight?: number; minWidth?: number; maxWidth?: number; minHeight?: number; maxHeight?: number }
```

## Examples

### Basics

Drag the header to move the window. The corner grip resizes it.

```tsx
import { useState } from 'react';
import { Button, FloatingWindow, Text } from '@plocks/ui';

export function Demo() {
  const [opened, setOpened] = useState(false);
  return (
    <>
      <Button onPress={() => setOpened((value) => !value)}>
        {opened ? 'Hide window' : 'Show window'}
      </Button>
      {opened && (
        <FloatingWindow
          dimensions={{ initialWidth: 260, initialHeight: 160 }}
          initialPosition={{ top: 90, left: 40 }}
          p="md"
        >
          <FloatingWindow.DragHandle>
            <Text fw="600">Drag this header</Text>
          </FloatingWindow.DragHandle>
          <Text>Move or resize this window.</Text>
          <FloatingWindow.ResizeHandle />
        </FloatingWindow>
      )}
    </>
  );
}
```

### Without Viewport Constraint

`constrainToViewport={false}` lets the window move beyond the viewport edge.

```tsx
import { useState } from 'react';
import { Button, FloatingWindow, Text } from '@plocks/ui';

export function Demo() {
  const [opened, setOpened] = useState(false);
  return (
    <>
      <Button onPress={() => setOpened(!opened)}>Toggle window</Button>
      {opened && (
        <FloatingWindow w={240} p="md" constrainToViewport={false}>
          <Text>Drag beyond the viewport.</Text>
        </FloatingWindow>
      )}
    </>
  );
}
```

### Drag Handle

The DragHandle confines movement to one region, leaving child buttons interactive.

```tsx
import { useState } from 'react';
import { Button, FloatingWindow, Text } from '@plocks/ui';

export function Demo() {
  const [opened, setOpened] = useState(false);
  return (
    <>
      <Button onPress={() => setOpened(true)}>Open window</Button>
      {opened && (
        <FloatingWindow w={260} p="md">
          <FloatingWindow.DragHandle>
            <Text fw="600">Drag here</Text>
          </FloatingWindow.DragHandle>
          <Button size="sm" onPress={() => setOpened(false)}>
            Close
          </Button>
        </FloatingWindow>
      )}
    </>
  );
}
```

### Disabled Dragging

`enabled={false}` keeps the window fixed in place.

```tsx
import { useState } from 'react';
import { Button, FloatingWindow, Text } from '@plocks/ui';

export function Demo() {
  const [opened, setOpened] = useState(false);
  return (
    <>
      <Button onPress={() => setOpened(!opened)}>Toggle static window</Button>
      {opened && (
        <FloatingWindow enabled={false} w={220} p="md">
          <Text>This window stays put.</Text>
        </FloatingWindow>
      )}
    </>
  );
}
```

### Constrain Offset

`constrainOffset` keeps space between the window and viewport edges.

```tsx
import { useState } from 'react';
import { Button, FloatingWindow, Text } from '@plocks/ui';

export function Demo() {
  const [opened, setOpened] = useState(false);
  return (
    <>
      <Button onPress={() => setOpened(!opened)}>Toggle inset window</Button>
      {opened && (
        <FloatingWindow constrainOffset={30} w={220} p="md">
          <Text>30 px from the edge.</Text>
        </FloatingWindow>
      )}
    </>
  );
}
```

### Lock Axis

`axis="x"` limits dragging to the horizontal axis.

```tsx
import { useState } from 'react';
import { Button, FloatingWindow, Text } from '@plocks/ui';

export function Demo() {
  const [opened, setOpened] = useState(false);
  return (
    <>
      <Button onPress={() => setOpened(!opened)}>Toggle horizontal window</Button>
      {opened && (
        <FloatingWindow axis="x" w={220} p="md">
          <Text>Drag horizontally.</Text>
        </FloatingWindow>
      )}
    </>
  );
}
```

### Set Position

`setPositionRef` can move the window to a new viewport inset.

```tsx
import { useRef, useState } from 'react';
import { Button, FloatingWindow, Text } from '@plocks/ui';
import type { FloatingWindowHandle } from '@plocks/ui';

export function Demo() {
  const [opened, setOpened] = useState(false);
  const windowRef = useRef<FloatingWindowHandle>(null);
  return (
    <>
      <Button onPress={() => setOpened(true)}>Open window</Button>
      {opened && (
        <FloatingWindow
          setPositionRef={windowRef}
          initialPosition={{ top: 100, left: 40 }}
          dimensions={{ initialWidth: 240, initialHeight: 140 }}
          p="md"
        >
          <FloatingWindow.DragHandle>
            <Text fw="600">Move me</Text>
          </FloatingWindow.DragHandle>
          <Button onPress={() => windowRef.current?.setPosition({ top: 60, right: 60 })}>
            Move to top right
          </Button>
        </FloatingWindow>
      )}
    </>
  );
}
```

### Resize Handle

`FloatingWindow.ResizeHandle` resizes within the limits in `dimensions`.

```tsx
import { useState } from 'react';
import { Button, FloatingWindow, Text } from '@plocks/ui';

export function Demo() {
  const [opened, setOpened] = useState(false);
  return (
    <>
      <Button onPress={() => setOpened(true)}>Open resizable window</Button>
      {opened && (
        <FloatingWindow
          initialPosition={{ top: 110, left: 60 }}
          dimensions={{
            initialWidth: 230,
            initialHeight: 130,
            minWidth: 160,
            minHeight: 90,
            maxWidth: 360,
            maxHeight: 280,
          }}
          p="md"
        >
          <FloatingWindow.DragHandle>
            <Text fw="600">Resizable window</Text>
          </FloatingWindow.DragHandle>
          <FloatingWindow.ResizeHandle />
        </FloatingWindow>
      )}
    </>
  );
}
```

### Resize Callbacks

`onSizeChange` reports the final window dimensions after a resize.

```tsx
import { useState } from 'react';
import { Button, FloatingWindow, Text } from '@plocks/ui';

export function Demo() {
  const [opened, setOpened] = useState(false);
  const [size, setSize] = useState({ width: 240, height: 140 });
  return (
    <>
      <Button onPress={() => setOpened(true)}>Open window</Button>
      {opened && (
        <FloatingWindow
          initialPosition={{ top: 110, left: 60 }}
          dimensions={{ initialWidth: 240, initialHeight: 140 }}
          onSizeChange={setSize}
          p="md"
        >
          <FloatingWindow.DragHandle>
            <Text fw="600">Resize me</Text>
          </FloatingWindow.DragHandle>
          <Text>
            {Math.round(size.width)} × {Math.round(size.height)}
          </Text>
          <FloatingWindow.ResizeHandle />
        </FloatingWindow>
      )}
    </>
  );
}
```
