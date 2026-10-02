# ReorderableList

ReorderableList accepts an ordered `data` array and calls `onReorder({ data, from, to })` after a move. Update your state with the returned array. On native, long press the handle to drag; on web, drag a row or focus its handle and press Up or Down. Native drag gestures need `GestureHandlerRootView` at the application root.

Use `scrollEnabled={false}` for short native lists embedded in a parent ScrollView. Set `w="100%"` when placing the list in a column that aligns children to the start.

## Metadata

- Import: `import { ReorderableList } from '@plocks/ui';`
- Status: beta
- Tags: list, reorder, drag, sort
- Docs: https://plocks.dev/components/ReorderableList
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/ReorderableList

## Props

- `data` (required): T[] — Ordered items. Update this array in onReorder to commit a move.
- `keyExtractor` (required): (item: T, index: number) => string
- `renderItem` (required): (info: { item: T; index: number; isActive: boolean }) => React.ReactNode
- `getItemLabel`: (item: T, index: number) => string — Used in the drag handle's accessible name.
- `onReorder` (required): (result: ReorderResult<T>) => void
- `disabled`: boolean = false
- `scrollEnabled`: boolean = true — Enable the native list's own scrolling. Disable inside a parent ScrollView. @default true
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface ReorderResult<T> {
  data: T[];
  from: number;
  to: number;
}
```

## Examples

### Reorder tasks

Drag a row to change its position. On web, focus the reorder handle and use the Up and Down arrows; on native, long press the handle or use screen reader move actions. The list is controlled, so `onReorder` updates the items state.

```tsx
import { useState } from 'react';
import { Block, Column, ReorderableList, Text } from '@plocks/ui';

const initialTasks = [
  { id: 'plan', title: 'Plan the release' },
  { id: 'build', title: 'Build the package' },
  { id: 'share', title: 'Share with developers' },
];

export function Demo() {
  const [tasks, setTasks] = useState(initialTasks);
  return (
    <Column gap="sm" fullWidth>
      <ReorderableList
        w="100%"
        scrollEnabled={false}
        data={tasks}
        keyExtractor={(task) => task.id}
        getItemLabel={(task) => task.title}
        onReorder={({ data }) => setTasks(data)}
        renderItem={({ item }) => <Block p="sm" fullWidth><Text>{item.title}</Text></Block>}
      />
    </Column>
  );
}
```
