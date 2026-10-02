# NavTree

NavTree turns a flat route list into a collapsible sidebar navigation tree.

## Metadata

- Import: `import { NavTree } from '@plocks/ui';`
- Tags: navigation, sidebar, tree, menu, routes
- Docs: https://plocks.dev/components/NavTree
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/NavTree

## Props

- `items` (required): NavTreeItem<T>[] — The destinations, flat. Grouped and nested by `buildNavTree`.
- `activeHref`: string — Current route. Marks its row (`aria-current="page"` on web) and opens the groups above it.
- `onNavigate`: (item: NavTreeItem<T>, node: TreeNode<NavTreeItem<T>>) => void — Where a row press goes. Supply it to route client-side; without it the rows stay plain links and the browser navigates.
- `size`: ComponentSizeValue = 'sm' — Row density. @default 'sm'
- `collapsed`: boolean — Rail mode: only the top level renders, as icons. For a sidebar that collapses to a strip — the full tree is one hover away, and a column of every leaf's icon is not navigation, it is noise.
- `searchable`: boolean — Show a filter field above the tree, wired to `filterQuery`. Past a certain length no amount of nesting beats typing three letters, and every sidebar that needs one would otherwise wire the same input and the same state. Pass `filterQuery` as well to drive it from outside; on its own the field keeps its own query. Hidden in `collapsed` mode, where there is no room.
- `searchPlaceholder`: string = 'Filter…' — Placeholder for the filter field. @default 'Filter…'
- `highlightMatches`: boolean = true — Matched substrings are marked in the row labels. @default true
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`
- `groupOrder`: string[] — Curated order for group labels, checked at every level. Groups not listed follow, alphabetically — so a partial order is enough, and a new group appears in a sensible place without touching this. Entries are bare labels (`'Input'`) or full paths (`'Hooks/Navigation'`). A path wins over a bare label, which is how the same name can rank differently in two branches.
- `groupIcons`: Record<string, React.ReactNode> — Leading icon per group label.
- `sortLeaves`: 'alpha' | 'none' = 'alpha' — How leaves inside a group are ordered. - `'alpha'` — by `order` then label. The default: a long list is easier to scan alphabetically than in whatever order the array happened to be in. - `'none'` — keep the order given.
- `openDepth`: number = 1 — Groups shallower than this start open. `1` opens the top level and leaves everything below it closed, which is the shape a docs sidebar wants: the sections are visible, the long category lists are not.
- `openGroups`: string[] — Group labels (or full `A/B` paths) to open regardless of `openDepth`.
- `getGroupNode`: (context: { label: string; path: string[]; depth: number; items: NavTreeItem<T>[]; }) => Partial<TreeNode<NavTreeItem<T>>> — Decorates each group row — a count, a badge, an icon. Receives the group's path from the root and the items beneath it, at every level.

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface NavTreeItem<T = unknown> {
  /** Row text. */
  label: string;
  /** Route this row points at. Doubles as the item's id unless `id` is given. */
  href: string;
  /**
   * Where the item sits, outermost group first. A string is a single level;
   * omit it for a top-level row. Empty strings are dropped, so an item whose
   * category is unset lands beside the groups rather than under a blank one.
   */
  group?: string | string[];
  /** Stable id. Defaults to `href`, which is already unique in a router. */
  id?: string;
  /** Leading icon for the row. */
  icon?: React.ReactNode;
  /** Sorts before `label` when leaves are ordered. Unset sorts last. */
  order?: number;
  disabled?: boolean;
  /** Anything the consumer wants back in `onNavigate`. */
  data?: T;
}
```

## Examples

### Basics

A flat list of routes becomes a nested sidebar. The group above the active route is already open, because `activeHref` opened it.

```tsx
import React, { useState } from 'react';
import { NavTree, type NavTreeItem } from '@plocks/ui';

// The whole input: a flat list, with a category on each row. Nothing here
// describes the tree — `NavTree` derives it.
const ROUTES: NavTreeItem[] = [
  { label: 'Getting Started', href: '/getting-started' },
  { label: 'Button', href: '/components/Button', group: ['Components', 'Input'] },
  { label: 'Select', href: '/components/Select', group: ['Components', 'Input'] },
  { label: 'Checkbox', href: '/components/Checkbox', group: ['Components', 'Input'] },
  { label: 'Card', href: '/components/Card', group: ['Components', 'Display'] },
  { label: 'Badge', href: '/components/Badge', group: ['Components', 'Display'] },
  { label: 'Tabs', href: '/components/Tabs', group: ['Components', 'Navigation'] },
];

export function Demo() {
  const [route, setRoute] = useState('/components/Select');

  return (
    <NavTree
      items={ROUTES}
      activeHref={route}
      onNavigate={item => setRoute(item.href)}
      showGuides
    />
  );
}
```

### Counts and order

`groupOrder` curates the sections that matter and leaves the rest alphabetical. `renderEndSection` hangs a count off each branch, and `openDepth={0}` starts everything closed.

```tsx
import React, { useState } from 'react';
import { Badge, NavTree, type NavTreeItem } from '@plocks/ui';

const ROUTES: NavTreeItem[] = [
  { label: 'Button', href: '/components/Button', group: 'Input' },
  { label: 'Select', href: '/components/Select', group: 'Input' },
  { label: 'Checkbox', href: '/components/Checkbox', group: 'Input' },
  { label: 'Card', href: '/components/Card', group: 'Display' },
  { label: 'Badge', href: '/components/Badge', group: 'Display' },
  { label: 'Tabs', href: '/components/Tabs', group: 'Navigation' },
];

export function Demo() {
  const [route, setRoute] = useState('/components/Card');

  return (
    <NavTree
      items={ROUTES}
      activeHref={route}
      onNavigate={item => setRoute(item.href)}
      // Curate the order that matters and let the rest sort themselves.
      groupOrder={['Input', 'Display']}
      openDepth={0}
      renderEndSection={node =>
        node.children ? <Badge size="xs" variant="light">{node.children.length}</Badge> : null
      }
    />
  );
}
```

### Filtering

`searchable` adds a filter field wired to the tree. Typing hides the rows that do not match, opens the branches above the ones that do, and marks the matched substring — past a certain length, three letters beat any amount of nesting.

```tsx
import React, { useState } from 'react';
import { NavTree, type NavTreeItem } from '@plocks/ui';

const ROUTES: NavTreeItem[] = [
  { label: 'Button', href: '/components/Button', group: 'Input' },
  { label: 'Checkbox', href: '/components/Checkbox', group: 'Input' },
  { label: 'Select', href: '/components/Select', group: 'Input' },
  { label: 'TextArea', href: '/components/TextArea', group: 'Input' },
  { label: 'Badge', href: '/components/Badge', group: 'Display' },
  { label: 'Card', href: '/components/Card', group: 'Display' },
  { label: 'Breadcrumbs', href: '/components/Breadcrumbs', group: 'Navigation' },
  { label: 'Tabs', href: '/components/Tabs', group: 'Navigation' },
];

export function Demo() {
  const [route, setRoute] = useState('/components/Card');

  return (
    <NavTree
      items={ROUTES}
      activeHref={route}
      onNavigate={item => setRoute(item.href)}
      searchable
      searchPlaceholder="Filter components…"
    />
  );
}
```

### Collapsed rail

`collapsed` drops the sidebar to a strip of top-level icons — the group holding the current route stays marked, and pressing one lands on the first page inside it. A sidebar with a hundred routes shows a handful of icons here, not a hundred.

```tsx
import React, { useState } from 'react';
import { Column, Icon, NavTree, Switch, type NavTreeItem } from '@plocks/ui';

const ROUTES: NavTreeItem[] = [
  { label: 'Button', href: '/components/Button', group: 'Components' },
  { label: 'Card', href: '/components/Card', group: 'Components' },
  { label: 'LineChart', href: '/components/LineChart', group: 'Charts' },
  { label: 'BarChart', href: '/components/BarChart', group: 'Charts' },
  { label: 'useHover', href: '/hooks/useHover', group: 'Hooks' },
];

const GROUP_ICONS = {
  Components: <Icon name="grid" size={18} />,
  Charts: <Icon name="chart-bar" size={18} />,
  Hooks: <Icon name="hook" size={18} />,
};

export function Demo() {
  const [collapsed, setCollapsed] = useState(true);
  const [route, setRoute] = useState('/components/Card');

  return (
    <Column gap="md">
      <Switch checked={collapsed} onChange={setCollapsed} label="Collapsed" />
      <NavTree
        items={ROUTES}
        activeHref={route}
        onNavigate={item => setRoute(item.href)}
        groupIcons={GROUP_ICONS}
        collapsed={collapsed}
      />
    </Column>
  );
}
```
