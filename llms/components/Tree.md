# Tree

Tree displays hierarchical data with expandable branches.

## Metadata

- Import: `import { Tree } from '@plocks/ui';`
- Docs: https://plocks.dev/components/Tree
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Tree

## Props

- `data` (required): TreeNode<T>[]
- `onNavigate`: (node: TreeNode<T>) => void — Called when a leaf is activated, or when any node carrying `href` is pressed
- `onNodePress`: ( node: TreeNode<T>, context: { isBranch: boolean; event?: TreePressEvent } ) => boolean | void — Called when a node row is pressed. Return false to prevent default handling (selection, expand).
- `collapsible`: boolean — Allow collapsing/expanding
- `disclosure`: 'always' | 'nested' | 'none' = 'always' — Where the expand/collapse caret is drawn, and whether every row reserves its column. - `'always'` — a caret on each branch, and the column held open on rows without one so labels line up whatever the row is. - `'nested'` — top-level branches go bare and no row reserves the column, so the outermost rows read as headings (the theme's `sectionLabel` text role) and the whole tree sits flush against its edge. Branches still open when the row itself is pressed. - `'none'` — no caret at any depth, and no column.
- `size`: ComponentSizeValue — Row density. Drives height, padding, indent and icon size (resolved from the theme's control sizes, one step down — rows are compact controls). A number is read as the label font size and the rest of the row scales with it.
- `indent`: number — Indent size in px for each depth level. Defaults to the `size` scale.
- `showGuides`: boolean — Draw vertical guide lines connecting a branch to its descendants
- `accordion`: boolean — Keep only one branch open per parent level
- `expandAll`: boolean — Expand every branch. Reactive: flipping it back restores the initial expansion.
- `renderLabel`: ( node: TreeNode<T>, depth: number, isOpen: boolean, state: TreeNodeState ) => React.ReactNode — Custom render for label
- `renderEndSection`: (node: TreeNode<T>, state: TreeNodeState) => React.ReactNode — Trailing slot rendered at the end of a row (actions, counts, badges)
- `rowStyle`: StyleProp<ViewStyle> — Style applied to every row container
- `selectionMode`: 'none' | 'single' | 'multiple' — Selection mode
- `selectedIds`: string[] — Controlled selected ids
- `defaultSelectedIds`: string[] — Uncontrolled default selected ids
- `onSelectionChange`: (ids: string[], node: TreeNode<T>) => void — Selection change callback
- `onActiveNodeChange`: (node: TreeNode<T> | null, ids: string[]) => void — Fired after selection changes with the node considered primary (first in selection)
- `checkboxes`: boolean — Enable checkboxes
- `checkedIds`: string[] — Controlled checked ids
- `defaultCheckedIds`: string[] — Uncontrolled default checked ids
- `onCheckedChange`: (ids: string[], node: TreeNode<T>) => void — Checked change callback
- `cascadeCheck`: boolean — Cascade checking to descendants
- `expandOnClick`: boolean — Expand branches also when pressing label area (not just chevron)
- `expandedIds`: string[] — Controlled external expansion state
- `defaultExpandedIds`: string[] — Uncontrolled initial expansion, overriding each node's `startOpen`
- `onExpandedIdsChange`: (ids: string[]) => void — Fired with the full expanded set whenever expansion changes
- `onToggle`: (node: TreeNode<T>, expanded: boolean) => void — Expansion change callback for a single node
- `loadChildren`: (node: TreeNode<T>) => Promise<TreeNode<T>[]> — Fetch a branch's children on first expand. Node needs `hasChildren` to show a caret.
- `filterQuery`: string — Filter query to highlight / hide unmatched nodes
- `hideFiltered`: boolean — If true, nodes that don't match filter are hidden; otherwise all shown with highlight
- `autoExpandOnFilter`: boolean — Open the branches leading to filter matches while a query is active
- `noResultsFallback`: React.ReactNode — Content when no results after filtering
- `highlight`: (label: string, query: string) => React.ReactNode — Custom highlight function for labels (return ReactNode)
- `striped`: boolean — Apply alternating background stripes to rows
- `useAnimations`: boolean — Animate branch expansion/collapse using the Collapse component (instant under reduced motion)
- `virtualized`: boolean — Render rows through a virtualized list, which fills the tree's height (`h`, 320 by default). Disables expand/collapse animation.
- `keyboardNavigation`: boolean — Arrow-key navigation, type-ahead and roving focus (web). Defaults to on. The tree is then a single tab stop that tracks the focused row with `aria-activedescendant`, per the WAI-ARIA tree pattern.
- `activeId`: string — Id of the node representing the current location — the navigation counterpart to selection. It paints the row as active, opens the branches above it, and scrolls it into view, without consuming `selectedIds`. On web the row gets `aria-current="page"`.
- `activeHref`: string — `activeId`, resolved by matching a node's `href` instead. Hand it a pathname and the tree finds the row. Ignored when `activeId` is set.
- `expandToActive`: boolean = true — Open the branches leading to the active node whenever it changes. Re-opening is keyed on the ancestor set, so a branch the reader collapsed stays collapsed while they move between its children.
- `scrollActiveIntoView`: boolean = true — Scroll the active row into view once it becomes visible (web only).
- `persistKey`: string — Remember which branches are open across reloads, under this key (`localStorage`, web only). Ignored while expansion is controlled through `expandedIds` — the parent owns the state in that mode.
- `selectionColor`: string — Base color for selection / focus affordances. Defaults to the primary palette.
- `accessibilityLabel`: string — Accessible name for the tree container
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

- `useTreeState(options: UseTreeStateOptions): TreeStateResult` — Returns the headless state behind `Tree` — expansion (controlled or not), lazy-loaded children, filter matches and the flattened visible `rows` — for building a custom tree or outline view over the same `TreeNode` data.

## Types

```ts
export interface TreeNode<T = unknown> {
  id: string;
  label: string;
  children?: TreeNode<T>[];
  /**
   * Marks a node as a branch before its children exist — the disclosure control
   * renders, and pressing it calls `loadChildren`. Ignored once `children` is set.
   */
  hasChildren?: boolean;
  /**
   * Navigation target. On web the row renders as a real `<a href>`, so
   * cmd/middle-click, "copy link address" and crawlers all work; plain clicks
   * still go through `onNavigate`. Native has no anchor and falls back to a
   * pressable with the `link` role.
   */
  href?: string;
  startOpen?: boolean;
  icon?: React.ReactNode; // optional leading icon, branches included
  disabled?: boolean;
  selectable?: boolean; // override global selection mode
  data?: T; // arbitrary extra data
}

export type TreePressEvent = GestureResponderEvent | WebKeyboardEvent;

export interface TreeNodeState {
  selected: boolean;
  /** Row is the tree's `activeId` / `activeHref` target — "you are here". */
  active: boolean;
  checked: boolean;
  indeterminate: boolean;
  expanded: boolean;
  disabled: boolean;
  /** Row holds the keyboard focus ring. */
  focused: boolean;
  /** `loadChildren` is in flight for this node. */
  loading: boolean;
  /** Node's own label matched the active `filterQuery`. */
  matched: boolean;
  depth: number;
}
```

## Examples

### Basics

Render a hierarchical dataset with collapsing branches. Use `indent` to control how far each level is inset.

```tsx
import { Tree } from '@plocks/ui';

import { TREE_DATA } from './data';

export function Demo() {
  return <Tree data={TREE_DATA} collapsible indent={20} />;
}
```

`data.ts`

```ts
import type { TreeNode } from '@plocks/ui';

/** A small file-manager hierarchy: folders deep enough to show nested expansion. */
export const TREE_DATA: TreeNode[] = [
  {
    id: 'documents',
    label: 'Documents',
    children: [
      {
        id: 'work',
        label: 'Work',
        children: [
          { id: 'presentation.pptx', label: 'Presentation.pptx' },
          { id: 'budget.xlsx', label: 'Budget.xlsx' },
          { id: 'report.docx', label: 'Report.docx' },
        ],
      },
      {
        id: 'personal',
        label: 'Personal',
        children: [
          { id: 'vacation-photos', label: 'Vacation Photos' },
          { id: 'recipes.txt', label: 'Recipes.txt' },
        ],
      },
    ],
  },
  {
    id: 'downloads',
    label: 'Downloads',
    children: [
      { id: 'installer.dmg', label: 'Installer.dmg' },
      { id: 'archive.zip', label: 'Archive.zip' },
    ],
  },
  {
    id: 'desktop',
    label: 'Desktop',
    children: [
      { id: 'screenshot.png', label: 'Screenshot.png' },
      { id: 'notes.txt', label: 'Notes.txt' },
    ],
  },
];
```

### Tree with Checkboxes

Enable `checkboxes` with `cascadeCheck` to keep parent and child nodes synchronized while tracking checked ids.

```tsx
import { useState } from 'react';

import { Tree } from '@plocks/ui';

import { TREE_DATA } from './data';

export function Demo() {
  const [checkedIds, setCheckedIds] = useState<string[]>(['react', 'css']);

  return (
    <Tree
      data={TREE_DATA}
      checkboxes
      cascadeCheck
      checkedIds={checkedIds}
      onCheckedChange={setCheckedIds}
      expandAll
    />
  );
}
```

`data.ts`

```ts
import type { TreeNode } from '@plocks/ui';

/** Two-level technology groups, so cascading checks have parents to roll up into. */
export const TREE_DATA: TreeNode[] = [
  {
    id: 'frontend',
    label: 'Frontend Technologies',
    children: [
      {
        id: 'frameworks',
        label: 'Frameworks',
        children: [
          { id: 'react', label: 'React' },
          { id: 'vue', label: 'Vue.js' },
          { id: 'angular', label: 'Angular' },
        ],
      },
      {
        id: 'styling',
        label: 'Styling',
        children: [
          { id: 'css', label: 'CSS' },
          { id: 'sass', label: 'Sass' },
          { id: 'tailwind', label: 'Tailwind CSS' },
        ],
      },
    ],
  },
  {
    id: 'backend',
    label: 'Backend Technologies',
    children: [
      {
        id: 'languages',
        label: 'Languages',
        children: [
          { id: 'nodejs', label: 'Node.js' },
          { id: 'python', label: 'Python' },
          { id: 'go', label: 'Go' },
        ],
      },
      {
        id: 'databases',
        label: 'Databases',
        children: [
          { id: 'postgresql', label: 'PostgreSQL' },
          { id: 'mongodb', label: 'MongoDB' },
          { id: 'redis', label: 'Redis' },
        ],
      },
    ],
  },
];
```

### Tree Selection

Set `selectionMode` to `single` or `multiple` and drive `selectedIds` from state. In `multiple` mode, shift-click captures a range and Cmd/Ctrl-click toggles one row.

```tsx
import { useState } from 'react';

import { Block, Text, Tree } from '@plocks/ui';

import { TREE_DATA } from './data';

export function Demo() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  return (
    <Block fullWidth>
      <Tree
        data={TREE_DATA}
        selectionMode="multiple"
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        expandAll
      />

      <Text size="xs" c="secondary">
        {selectedIds.length === 0
          ? 'Click a row, shift-click for a range, or Cmd/Ctrl-click to toggle.'
          : `${selectedIds.length} selected`}
      </Text>
    </Block>
  );
}
```

`data.ts`

```ts
import type { TreeNode } from '@plocks/ui';

/** A catalogue tree with both nested and flat branches to select across. */
export const TREE_DATA: TreeNode[] = [
  {
    id: 'products',
    label: 'Products',
    children: [
      {
        id: 'electronics',
        label: 'Electronics',
        children: [
          { id: 'laptop', label: 'Laptops' },
          { id: 'phone', label: 'Smartphones' },
          { id: 'tablet', label: 'Tablets' },
        ],
      },
      {
        id: 'clothing',
        label: 'Clothing',
        children: [
          { id: 'shirts', label: 'Shirts' },
          { id: 'pants', label: 'Pants' },
          { id: 'shoes', label: 'Shoes' },
        ],
      },
    ],
  },
  {
    id: 'services',
    label: 'Services',
    children: [
      { id: 'support', label: 'Customer Support' },
      { id: 'consulting', label: 'Consulting' },
      { id: 'training', label: 'Training' },
    ],
  },
];
```

### Tree Filtering

Provide `filterQuery` with `hideFiltered` to search the tree. A `highlight` renderer and `noResultsFallback` are also available for custom match styling and empty states.

```tsx
import { useState } from 'react';

import { Block, Input, Tree } from '@plocks/ui';

import { TREE_DATA } from './data';

export function Demo() {
  const [filterQuery, setFilterQuery] = useState('');

  return (
    <Block fullWidth>
      <Input
        label="Search technologies"
        value={filterQuery}
        onChangeText={setFilterQuery}
        placeholder="Type to filter the tree"
      />

      <Tree
        data={TREE_DATA}
        filterQuery={filterQuery}
        hideFiltered
        expandAll={!!filterQuery}
      />
    </Block>
  );
}
```

`data.ts`

```ts
import type { TreeNode } from '@plocks/ui';

/** Enough labels sharing substrings ("Java"/"JavaScript") to make filtering visible. */
export const TREE_DATA: TreeNode[] = [
  {
    id: 'programming',
    label: 'Programming Languages',
    children: [
      {
        id: 'frontend',
        label: 'Frontend',
        children: [
          { id: 'javascript', label: 'JavaScript' },
          { id: 'typescript', label: 'TypeScript' },
          { id: 'html', label: 'HTML' },
          { id: 'css', label: 'CSS' },
        ],
      },
      {
        id: 'backend',
        label: 'Backend',
        children: [
          { id: 'python', label: 'Python' },
          { id: 'java', label: 'Java' },
          { id: 'csharp', label: 'C#' },
          { id: 'go', label: 'Go' },
        ],
      },
      {
        id: 'mobile',
        label: 'Mobile',
        children: [
          { id: 'swift', label: 'Swift' },
          { id: 'kotlin', label: 'Kotlin' },
          { id: 'dart', label: 'Dart' },
        ],
      },
    ],
  },
  {
    id: 'databases',
    label: 'Databases',
    children: [
      { id: 'mysql', label: 'MySQL' },
      { id: 'postgresql', label: 'PostgreSQL' },
      { id: 'mongodb', label: 'MongoDB' },
      { id: 'redis', label: 'Redis' },
    ],
  },
];
```

### Lazy Loading

Mark a node with `hasChildren` and supply `loadChildren` to fetch a branch the first time it opens. The disclosure control shows a loader while the promise is in flight.

```tsx
import { Tree, type TreeNode } from '@plocks/ui';

import { TREE_DATA, fetchInstances, fetchVolumes } from './data';

export function Demo() {
  const loadChildren = (node: TreeNode) =>
    node.id.includes('-web') ? fetchVolumes(node.id) : fetchInstances(node.id);

  return <Tree data={TREE_DATA} loadChildren={loadChildren} selectionMode="single" showGuides />;
}
```

`data.ts`

```ts
import type { TreeNode } from '@plocks/ui';

/** Roots that advertise children with `hasChildren` but ship none — `loadChildren` fills them in. */
export const TREE_DATA: TreeNode[] = [
  { id: 'us-east-1', label: 'us-east-1', hasChildren: true },
  { id: 'eu-west-1', label: 'eu-west-1', hasChildren: true },
  { id: 'ap-south-1', label: 'ap-south-1', hasChildren: true },
];

/** Stands in for the API call a real app would make. */
export const fetchInstances = (regionId: string): Promise<TreeNode[]> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: `${regionId}-web`, label: 'web-server', hasChildren: true },
        { id: `${regionId}-db`, label: 'database' },
        { id: `${regionId}-cache`, label: 'cache' },
      ]);
    }, 700);
  });

export const fetchVolumes = (instanceId: string): Promise<TreeNode[]> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: `${instanceId}-vol-1`, label: 'volume-1 (100 GiB)' },
        { id: `${instanceId}-vol-2`, label: 'volume-2 (500 GiB)' },
      ]);
    }, 700);
  });
```

### Custom Tree Rendering

Pass `renderLabel` to build custom rows with icons and badges while keeping the tree interactions intact.

```tsx
import { Badge, Icon, Row, Text, Tree, type TreeNode } from '@plocks/ui';

import { STATUS_BADGES, TREE_DATA, TYPE_ICONS, type CustomNodeData } from './data';

export function Demo() {
  const renderCustomLabel = (node: TreeNode) => {
    const data = node.data as CustomNodeData;
    const status = STATUS_BADGES[data.status];

    return (
      <Row gap="sm" align="center" style={{ flex: 1 }}>
        <Icon name={TYPE_ICONS[data.type]} size="sm" />
        <Text size="sm" style={{ flex: 1 }}>
          {node.label}
        </Text>
        <Badge variant="outline" c={status.color}>
          {status.label}
        </Badge>
      </Row>
    );
  };

  return <Tree data={TREE_DATA} renderLabel={renderCustomLabel} selectionMode="single" expandAll />;
}
```

`data.ts`

```ts
import type { TreeNode } from '@plocks/ui';

/** Payload each node carries on `node.data` for the custom label renderer. */
export interface CustomNodeData {
  status: 'active' | 'inactive' | 'pending';
  count?: number;
  type: 'folder' | 'file' | 'project';
}

/** A workspace whose nodes cover every status and an empty branch. */
export const TREE_DATA: TreeNode[] = [
  {
    id: 'workspace',
    label: 'Workspace',
    data: { status: 'active', type: 'folder', count: 3 },
    children: [
      {
        id: 'project-a',
        label: 'Project Alpha',
        data: { status: 'active', type: 'project', count: 12 },
        children: [
          {
            id: 'file-1',
            label: 'main.ts',
            data: { status: 'active', type: 'file' }
          },
          {
            id: 'file-2',
            label: 'config.json',
            data: { status: 'pending', type: 'file' }
          },
          {
            id: 'file-3',
            label: 'README.md',
            data: { status: 'active', type: 'file' }
          },
        ],
      },
      {
        id: 'project-b',
        label: 'Project Beta',
        data: { status: 'pending', type: 'project', count: 5 },
        children: [
          {
            id: 'file-4',
            label: 'app.tsx',
            data: { status: 'inactive', type: 'file' }
          },
          {
            id: 'file-5',
            label: 'styles.css',
            data: { status: 'active', type: 'file' }
          },
        ],
      },
      {
        id: 'project-c',
        label: 'Project Gamma',
        data: { status: 'inactive', type: 'project', count: 0 },
        children: [],
      },
    ],
  },
];

/** Icon shown ahead of a node's label, keyed by node type. */
export const TYPE_ICONS: Record<CustomNodeData['type'], string> = {
  folder: 'folder',
  project: 'sheild',
  file: 'file',
};

/** Badge copy and colour for each status, also driving the legend above the tree. */
export const STATUS_BADGES: Record<CustomNodeData['status'], { label: string; color: string }> = {
  active: { label: 'Active', color: 'success' },
  pending: { label: 'Pending', color: 'warning' },
  inactive: { label: 'Inactive', color: 'gray' },
};
```

### Virtualized Tree

Pass `virtualized` with an `h` to render only the rows in view. Expansion animation is skipped in this mode; filtering, selection and keyboard navigation all still operate on the full row list.

```tsx
import { Tree } from '@plocks/ui';

import { TREE_DATA } from './data';

export function Demo() {
  return <Tree data={TREE_DATA} virtualized h={320} size="sm" striped showGuides />;
}
```

`data.ts`

```ts
import type { TreeNode } from '@plocks/ui';

const DEPARTMENTS = ['Engineering', 'Design', 'Sales', 'Support', 'Finance', 'Legal'];

/** ~1,500 rows: large enough that rendering every one of them would be felt. */
export const TREE_DATA: TreeNode[] = DEPARTMENTS.map((department, d) => ({
  id: `dept-${d}`,
  label: department,
  startOpen: d === 0,
  children: Array.from({ length: 15 }, (_, t) => ({
    id: `dept-${d}-team-${t}`,
    label: `${department} team ${t + 1}`,
    children: Array.from({ length: 16 }, (_, m) => ({
      id: `dept-${d}-team-${t}-member-${m}`,
      label: `Member ${t + 1}.${m + 1}`,
    })),
  })),
}));
```
