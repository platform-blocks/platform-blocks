# OverflowList

Items are measured offscreen before the list is shown. The overflow item receives the hidden entries.

## Metadata

- Import: `import { OverflowList } from '@plocks/ui';`
- Status: beta
- Docs: https://plocks.dev/components/OverflowList
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/OverflowList

## Props

- `data` (required): readonly T[] — Items to fit.
- `renderItem` (required): (item: T, index: number) => React.ReactNode — Renders an item at its original index.
- `renderOverflow` (required): (hiddenItems: T[]) => React.ReactNode — Renders the item that replaces hidden entries.
- `gap`: SpacingValue = 'sm' — Space between items. @default 'sm'
- `maxRows`: number = 1 — Maximum lines before collapsing. @default 1
- `maxVisibleItems`: number — Hard cap on shown entries.
- `collapseFrom`: 'start' | 'end' = 'end' — Side from which entries disappear. @default 'end'
- `getItemKey`: (item: T, index: number) => React.Key — Stable key for each item.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Examples

### Basics

Entries beyond the available width collapse into a single item.

```tsx
import { Badge, Block, OverflowList } from '@plocks/ui';

const data = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape'];
export function Demo() {
  return (
    <Block fullWidth>
      <OverflowList
        maw={320}
        data={data}
        renderItem={(item) => <Badge>{item}</Badge>}
        renderOverflow={(hidden) => <Badge>+{hidden.length} more</Badge>}
      />
    </Block>
  );
}
```

### Multiple Rows

`maxRows` lets entries wrap before collapsing.

```tsx
import { Badge, Block, OverflowList } from '@plocks/ui';

const data = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape'];
export function Demo() {
  return (
    <Block fullWidth>
      <OverflowList
        maw={320}
        data={data}
        maxRows={2}
        renderItem={(item) => <Badge>{item}</Badge>}
        renderOverflow={(hidden) => <Badge>+{hidden.length} more</Badge>}
      />
    </Block>
  );
}
```

### Collapse From Start

`collapseFrom="start"` keeps the last entries visible, as in breadcrumbs.

```tsx
import { Badge, Block, OverflowList } from '@plocks/ui';

const data = ['Home', 'Library', 'Projects', 'Design', 'Components', 'Current'];
export function Demo() {
  return (
    <Block fullWidth>
      <OverflowList
        maw={320}
        data={data}
        collapseFrom="start"
        renderItem={(item) => <Badge>{item}</Badge>}
        renderOverflow={(hidden) => <Badge>+{hidden.length} more</Badge>}
      />
    </Block>
  );
}
```

### Max Visible Items

`maxVisibleItems` limits the count even when space remains.

```tsx
import { Badge, Block, OverflowList } from '@plocks/ui';

const data = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];
export function Demo() {
  return (
    <Block fullWidth>
      <OverflowList
        data={data}
        maxVisibleItems={3}
        renderItem={(item) => <Badge>{item}</Badge>}
        renderOverflow={(hidden) => <Badge>+{hidden.length} more</Badge>}
      />
    </Block>
  );
}
```

### Overflow Details

The overflow item can reveal hidden entries in a HoverCard.

```tsx
import { Badge, Block, HoverCard, OverflowList, Text } from '@plocks/ui';

const data = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];
export function Demo() {
  return (
    <Block fullWidth>
      <OverflowList
        maw={280}
        data={data}
        renderItem={(item) => <Badge>{item}</Badge>}
        renderOverflow={(hidden) => (
          <HoverCard target={<Badge>+{hidden.length} more</Badge>}>
            {hidden.map((item) => (
              <Text key={item}>{item}</Text>
            ))}
          </HoverCard>
        )}
      />
    </Block>
  );
}
```
