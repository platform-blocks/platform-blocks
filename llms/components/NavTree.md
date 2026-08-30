# NavTree

A sidebar that nests itself.

Hand it the flat list of routes an app already has — with a category on each — and it groups, orders and renders them as a tree. The branches above the current page open on their own, the row for that page is marked and scrolled to, and which branches are open survives a reload.

Rows carrying an `href` render as real `<a>` elements on web, so cmd-click, middle-click, "copy link address" and crawlers all work; a plain left-click goes to `onNavigate` for client-side routing. Omit `onNavigate` and the rows stay ordinary links the browser follows.

Built on [Tree](/components/Tree), so keyboard navigation, guide lines, filtering and the ARIA `tree`/`treeitem` roles come along with it.

## Metadata

- Canonical name: `NavTree`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { NavTree } from '@platform-blocks/react-ui-library';`
- Since: 1.1.0
- Category: navigation
- Tags: navigation, sidebar, tree, menu, routes
- Docs: https://react-ui-library.com/components/NavTree
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/NavTree

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `items` | NavTreeItem[] | Yes |  | The destinations, flat. Grouped and nested by `buildNavTree`. |
| `activeHref` | string | No |  | Current route. Marks its row and opens the groups above it. |
| `onNavigate` | (item: NavTreeItem, node: TreeNode) => void | No |  | Where a row press goes. Supply it to route client-side; without it the rows stay plain links and the browser navigates. |
| `size` | ComponentSizeValue | No | 'sm' | Row density. @default 'sm' |
| `collapsed` | boolean | No |  | Rail mode: only the top level renders, as icons. For a sidebar that collapses to a strip — the full tree is one hover away, and a column of every leaf's icon is not navigation, it is noise. |
| `searchable` | boolean | No |  | Show a filter field above the tree, wired to `filterQuery`. Past a certain length no amount of nesting beats typing three letters, and every sidebar that needs one would otherwise wire the same input and the same state. Pass `filterQuery` as well to drive it from outside; on its own the field keeps its own query. Hidden in `collapsed` mode, where there is no room. |
| `searchPlaceholder` | string | No | 'Filter…' | Placeholder for the filter field. @default 'Filter…' |
| `highlightMatches` | boolean | No | true | Matched substrings are marked in the row labels. @default true |
| `style` | StyleProp<ViewStyle> | No |  |  |
| `groupOrder` | string[] | No |  | Curated order for group labels, checked at every level. Groups not listed follow, alphabetically — so a partial order is enough, and a new group appears in a sensible place without touching this. Entries are bare labels (`'Input'`) or full paths (`'Hooks/Navigation'`). A path wins over a bare label, which is how the same name can rank differently in two branches. |
| `groupIcons` | Record<string, React.ReactNode> | No |  | Leading icon per group label. |
| `sortLeaves` | 'alpha' \| 'none' | No | 'alpha' | How leaves inside a group are ordered. - `'alpha'` — by `order` then label. The default: a long list is easier to scan alphabetically than in whatever order the array happened to be in. - `'none'` — keep the order given. |
| `openDepth` | number | No | 1 | Groups shallower than this start open. `1` opens the top level and leaves everything below it closed, which is the shape a docs sidebar wants: the sections are visible, the long category lists are not. |
| `openGroups` | string[] | No |  | Group labels (or full `A/B` paths) to open regardless of `openDepth`. |
| `getGroupNode` | (context: { label: string; path: string[]; depth: number; items: NavTreeItem[]; }) => Partial<TreeNode> | No |  | Decorates each group row — a count, a badge, an icon. Receives the group's path from the root and the items beneath it, at every level. |

## Examples

### Grouped routes
ID: `NavTree.basic` • Tags: navtree, sidebar • Category: navigation • Status: stable • Since: 1.1.0

A flat list of routes becomes a nested sidebar. The group above the active route is already open, because `activeHref` opened it.

```tsx
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
ID: `NavTree.counts` • Tags: navtree, sidebar • Category: navigation • Status: stable • Since: 1.1.0

`groupOrder` curates the sections that matter and leaves the rest alphabetical. `renderEndSection` hangs a count off each branch, and `openDepth={0}` starts everything closed.

```tsx
const ROUTES: NavTreeItem[] = [
  { label: 'Button', href: '/components/Button', group: 'Input' },
  { label: 'Select', href: '/components/Select', group: 'Input' },
  { label: 'Checkbox', href: '/components/Checkbox', group: 'Input' },
  { label: 'Card', href: '/components/Card', group: 'Display' },
  { label: 'Badge', href: '/components/Badge', group: 'Display' },
  { label: 'Tabs', href: '/components/Tabs', group: 'Navigation' },
];
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
ID: `NavTree.search` • Tags: navtree, sidebar, search, filter • Category: navigation • Status: stable • Since: 1.1.0

`searchable` adds a filter field wired to the tree. Typing hides the rows that do not match, opens the branches above the ones that do, and marks the matched substring — past a certain length, three letters beat any amount of nesting.

```tsx
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
ID: `NavTree.collapsed` • Tags: navtree, sidebar, rail • Category: navigation • Status: stable • Since: 1.1.0

`collapsed` drops the sidebar to a strip of top-level icons — the group holding the current route stays marked, and pressing one lands on the first page inside it. A sidebar with a hundred routes shows a handful of icons here, not a hundred.

```tsx
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
