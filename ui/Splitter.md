# Splitter

A number or percent size is flexible; a px or rem size stays fixed as the container changes.

## Metadata

- Import: `import { Splitter } from '@plocks/ui';`
- Status: beta
- Docs: https://plocks.dev/components/Splitter
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Splitter

## Props

- `children` (required): React.ReactNode
- `onResizeStart`: (index: number) => void
- `onResizeEnd`: (index: number) => void
- `step`: number
- `shiftStep`: number
- `lineSize`: number
- `handleColor`: string
- `withHandle`: boolean
- `handleIcon`: React.ReactNode
- `resetOnDoubleClick`: boolean
- `splitterRef`: React.RefObject<SplitterHandle | null>
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`
- `orientation`: 'horizontal' | 'vertical'
- `sizes`: SplitterPaneSize[]
- `onSizeChange`: (sizes: SplitterPaneSize[]) => void
- `onCollapseChange`: (index: number, collapsed: boolean) => void
- `redistribute`: 'nearest' | 'equal' | ((sizes: SplitterPaneSize[], index: number, delta: number) => SplitterPaneSize[])

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Sub-components

`import { SplitterPane } from '@plocks/ui';`

### SplitterPane

- `children`: React.ReactNode
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`
- `defaultSize`: SplitterPaneSize
- `min`: SplitterPaneSize
- `max`: SplitterPaneSize
- `collapsible`: boolean
- `collapseThreshold`: SplitterPaneSize

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### Splitter.Pane

- `children`: React.ReactNode
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`
- `defaultSize`: SplitterPaneSize
- `min`: SplitterPaneSize
- `max`: SplitterPaneSize
- `collapsible`: boolean
- `collapseThreshold`: SplitterPaneSize

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Related hooks

- `useSplitter({ panels, orientation = 'horizontal', sizes: controlled, onSizeChange, onCollapseChange, redistribute = 'nearest', }: UseSplitterOptions): UseSplitterReturn`

## Types

```ts
export interface SplitterHandle {
  sizes: SplitterPaneSize[];
  collapsed: boolean[];
  setSizes: (sizes: SplitterPaneSize[]) => void;
  collapse: (index: number) => void;
  expand: (index: number) => void;
  toggleCollapse: (index: number) => void;
}

export type SplitterPaneSize = number | `${number}%` | `${number}px` | `${number}rem`;
```

## Examples

### Basics

Drag or focus the separator to resize the panes.

```tsx
import { Block, Splitter, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Splitter h={200}>
        <Splitter.Pane defaultSize={35} min={20} bg="surface" p="md">
          <Text>Sidebar</Text>
        </Splitter.Pane>
        <Splitter.Pane defaultSize={65} min={20} bg="subtle" p="md">
          <Text>Content</Text>
        </Splitter.Pane>
      </Splitter>
    </Block>
  );
}
```

### Fixed and Flexible Sizes

A pixel-sized sidebar keeps its width as the container changes.

```tsx
import { Block, Splitter, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Splitter h={160}>
        <Splitter.Pane defaultSize="180px" min="120px" bg="subtle" p="md">
          <Text>Fixed sidebar</Text>
        </Splitter.Pane>
        <Splitter.Pane defaultSize={100} bg="surface" p="md">
          <Text>Flexible content</Text>
        </Splitter.Pane>
      </Splitter>
    </Block>
  );
}
```

### Vertical Orientation

Vertical panes resize from a horizontal separator.

```tsx
import { Block, Splitter, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Splitter orientation="vertical" h={220}>
        <Splitter.Pane defaultSize={50} bg="surface" p="md">
          <Text>Top</Text>
        </Splitter.Pane>
        <Splitter.Pane defaultSize={50} bg="subtle" p="md">
          <Text>Bottom</Text>
        </Splitter.Pane>
      </Splitter>
    </Block>
  );
}
```

### Collapsible Pane

A collapsible pane can be toggled through the imperative ref.

```tsx
import { useRef } from 'react';
import { Block, Button, Splitter, Text } from '@plocks/ui';
import type { SplitterHandle } from '@plocks/ui';

export function Demo() {
  const splitterRef = useRef<SplitterHandle>(null);
  return (
    <Block fullWidth>
      <Button size="sm" onPress={() => splitterRef.current?.toggleCollapse(0)}>
        Toggle sidebar
      </Button>
      <Splitter splitterRef={splitterRef} h={150} mt="sm">
        <Splitter.Pane defaultSize={30} collapsible bg="subtle" p="md">
          <Text>Sidebar</Text>
        </Splitter.Pane>
        <Splitter.Pane defaultSize={70} bg="surface" p="md">
          <Text>Content</Text>
        </Splitter.Pane>
      </Splitter>
    </Block>
  );
}
```

### Multiple Panes

Handles appear between every adjacent pair.

```tsx
import { Block, Splitter, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Splitter h={160}>
        <Splitter.Pane defaultSize={25} bg="subtle" p="md">
          <Text>One</Text>
        </Splitter.Pane>
        <Splitter.Pane defaultSize={50} bg="surface" p="md">
          <Text>Two</Text>
        </Splitter.Pane>
        <Splitter.Pane defaultSize={25} bg="subtle" p="md">
          <Text>Three</Text>
        </Splitter.Pane>
      </Splitter>
    </Block>
  );
}
```

### Without Grip

`withHandle={false}` keeps the separator line without the visual grip.

```tsx
import { Block, Splitter, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Splitter h={160} withHandle={false} lineSize={4}>
        <Splitter.Pane defaultSize={50} bg="surface" p="md">
          <Text>One</Text>
        </Splitter.Pane>
        <Splitter.Pane defaultSize={50} bg="subtle" p="md">
          <Text>Two</Text>
        </Splitter.Pane>
      </Splitter>
    </Block>
  );
}
```

### Controlled Sizes

The parent owns the pane sizes through `sizes` and `onSizeChange`.

```tsx
import { useState } from 'react';
import { Block, Splitter, Text } from '@plocks/ui';

export function Demo() {
  const [sizes, setSizes] = useState<[number, number]>([40, 60]);
  return (
    <Block fullWidth>
      <Splitter h={160} sizes={sizes} onSizeChange={(next) => setSizes(next as [number, number])}>
        <Splitter.Pane bg="subtle" p="md">
          <Text>First ({Math.round(sizes[0])}%)</Text>
        </Splitter.Pane>
        <Splitter.Pane bg="surface" p="md">
          <Text>Second</Text>
        </Splitter.Pane>
      </Splitter>
    </Block>
  );
}
```

### Nested Splitters

A pane can contain another splitter with its own direction.

```tsx
import { Block, Splitter, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Splitter h={220}>
        <Splitter.Pane defaultSize={40} bg="subtle" p="md">
          <Text>Left</Text>
        </Splitter.Pane>
        <Splitter.Pane defaultSize={60}>
          <Splitter orientation="vertical" h={220}>
            <Splitter.Pane defaultSize={50} bg="surface" p="md">
              <Text>Top</Text>
            </Splitter.Pane>
            <Splitter.Pane defaultSize={50} bg="subtle" p="md">
              <Text>Bottom</Text>
            </Splitter.Pane>
          </Splitter>
        </Splitter.Pane>
      </Splitter>
    </Block>
  );
}
```

### Redistribute Space

`redistribute="nearest"` borrows from farther panes when a neighbor reaches its minimum.

```tsx
import { Block, Splitter, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Splitter h={160} redistribute="nearest">
        {['A', 'B', 'C', 'D'].map((item) => (
          <Splitter.Pane
            key={item}
            defaultSize={25}
            min={item === 'B' ? 20 : 10}
            bg="subtle"
            p="sm"
          >
            <Text>{item}</Text>
          </Splitter.Pane>
        ))}
      </Splitter>
    </Block>
  );
}
```

### Line Size

`lineSize` and `handleColor` customize the visible separator.

```tsx
import { Block, Splitter, Text, useTheme } from '@plocks/ui';

export function Demo() {
  const theme = useTheme();
  return (
    <Block fullWidth>
      <Splitter h={160} lineSize={4} handleColor={theme.colors.primary[5]}>
        <Splitter.Pane defaultSize={40} bg="subtle" p="md">
          <Text>Navigation</Text>
        </Splitter.Pane>
        <Splitter.Pane defaultSize={60} bg="surface" p="md">
          <Text>Content</Text>
        </Splitter.Pane>
      </Splitter>
    </Block>
  );
}
```

### Imperative API

`splitterRef` exposes collapse and expand controls for each pane.

```tsx
import { useRef } from 'react';
import { Block, Button, Flex, Splitter, Text } from '@plocks/ui';
import type { SplitterHandle } from '@plocks/ui';

export function Demo() {
  const splitterRef = useRef<SplitterHandle>(null);
  return (
    <Block fullWidth>
      <Flex gap="sm">
        <Button onPress={() => splitterRef.current?.collapse(0)}>Collapse</Button>
        <Button onPress={() => splitterRef.current?.expand(0)}>Expand</Button>
      </Flex>
      <Splitter h={160} splitterRef={splitterRef} mt="sm">
        <Splitter.Pane defaultSize={35} collapsible bg="subtle" p="md">
          <Text>Sidebar</Text>
        </Splitter.Pane>
        <Splitter.Pane defaultSize={65} bg="surface" p="md">
          <Text>Content</Text>
        </Splitter.Pane>
      </Splitter>
    </Block>
  );
}
```
