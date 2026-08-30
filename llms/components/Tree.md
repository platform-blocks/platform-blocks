# Tree

Tree component for displaying hierarchical data structures like file systems, navigation menus, or any nested content.

## Metadata

- Canonical name: `Tree`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Tree } from '@platform-blocks/react-ui-library';`
- Since: 1.0.0
- Category: navigation
- Docs: https://react-ui-library.com/components/Tree
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Tree

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `data` | TreeNode<T>[] | Yes |  |  |
| `onNavigate` | (node: TreeNode<T>) => void | No |  | Called when a leaf is activated, or when any node carrying `href` is pressed |
| `onNodePress` | (node: TreeNode<T>, context: { isBranch: boolean; event?: any }) => boolean \| void | No |  | Called when a node row is pressed. Return false to prevent default handling (selection, expand). |
| `collapsible` | boolean | No |  | Allow collapsing/expanding |
| `disclosure` | TreeDisclosure | No | 'always' | Where the expand/collapse caret is drawn, and whether every row reserves its column. - `'always'` — a caret on each branch, and the column held open on rows without one so labels line up whatever the row is. - `'nested'` — top-level branches go bare and no row reserves the column, so the outermost rows read as headings and the whole tree sits flush against its edge. Branches still open when the row itself is pressed. - `'none'` — no caret at any depth, and no column. |
| `size` | ComponentSizeValue | No |  | Row density. Drives height, padding, indent and icon size. |
| `indent` | number | No |  | Indent size in px for each depth level. Defaults to the `size` scale. |
| `showGuides` | boolean | No |  | Draw vertical guide lines connecting a branch to its descendants |
| `accordion` | boolean | No |  | Keep only one branch open per parent level |
| `expandAll` | boolean | No |  | Expand every branch. Reactive: flipping it back restores the initial expansion. |
| `renderLabel` | ( node: TreeNode<T>, depth: number, isOpen: boolean, state: TreeNodeState ) => React.ReactNode | No |  | Custom render for label |
| `renderEndSection` | (node: TreeNode<T>, state: TreeNodeState) => React.ReactNode | No |  | Trailing slot rendered at the end of a row (actions, counts, badges) |
| `style` | StyleProp<ViewStyle> | No |  |  |
| `rowStyle` | StyleProp<ViewStyle> | No |  | Style applied to every row container |
| `selectionMode` | 'none' \| 'single' \| 'multiple' | No |  | Selection mode |
| `selectedIds` | string[] | No |  | Controlled selected ids |
| `defaultSelectedIds` | string[] | No |  | Uncontrolled default selected ids |
| `onSelectionChange` | (ids: string[], node: TreeNode<T>) => void | No |  | Selection change callback |
| `onActiveNodeChange` | (node: TreeNode<T> \| null, ids: string[]) => void | No |  | Fired after selection changes with the node considered primary (first in selection) |
| `checkboxes` | boolean | No |  | Enable checkboxes |
| `checkedIds` | string[] | No |  | Controlled checked ids |
| `defaultCheckedIds` | string[] | No |  | Uncontrolled default checked ids |
| `onCheckedChange` | (ids: string[], node: TreeNode<T>) => void | No |  | Checked change callback |
| `cascadeCheck` | boolean | No |  | Cascade checking to descendants |
| `expandOnClick` | boolean | No |  | Expand branches also when pressing label area (not just chevron) |
| `expandedIds` | string[] | No |  | Controlled external expansion state |
| `defaultExpandedIds` | string[] | No |  | Uncontrolled initial expansion, overriding each node's `startOpen` |
| `onExpandedIdsChange` | (ids: string[]) => void | No |  | Fired with the full expanded set whenever expansion changes |
| `onToggle` | (node: TreeNode<T>, expanded: boolean) => void | No |  | Expansion change callback for a single node |
| `loadChildren` | (node: TreeNode<T>) => Promise<TreeNode<T>[]> | No |  | Fetch a branch's children on first expand. Node needs `hasChildren` to show a caret. |
| `filterQuery` | string | No |  | Filter query to highlight / hide unmatched nodes |
| `hideFiltered` | boolean | No |  | If true, nodes that don't match filter are hidden; otherwise all shown with highlight |
| `autoExpandOnFilter` | boolean | No |  | Open the branches leading to filter matches while a query is active |
| `noResultsFallback` | React.ReactNode | No |  | Content when no results after filtering |
| `highlight` | (label: string, query: string) => React.ReactNode | No |  | Custom highlight function for labels (return ReactNode) |
| `striped` | boolean | No |  | Apply alternating background stripes to rows |
| `useAnimations` | boolean | No |  | Animate branch expansion/collapse using the Collapse component |
| `virtualized` | boolean | No |  | Render rows through a virtualized list. Disables expand/collapse animation. |
| `height` | number | No |  | Viewport height for the virtualized list |
| `keyboardNavigation` | boolean | No |  | Arrow-key navigation, type-ahead and roving focus (web). Defaults to on. |
| `activeId` | string | No |  | Id of the node representing the current location — the navigation counterpart to selection. It paints the row as active, opens the branches above it, and scrolls it into view, without consuming `selectedIds`. |
| `activeHref` | string | No |  | `activeId`, resolved by matching a node's `href` instead. Hand it a pathname and the tree finds the row. Ignored when `activeId` is set. |
| `expandToActive` | boolean | No | true | Open the branches leading to the active node whenever it changes. Re-opening is keyed on the ancestor set, so a branch the reader collapsed stays collapsed while they move between its children. |
| `scrollActiveIntoView` | boolean | No | true | Scroll the active row into view once it becomes visible (web only). |
| `persistKey` | string | No |  | Remember which branches are open across reloads, under this key (`localStorage`, web only). Ignored while expansion is controlled through `expandedIds` — the parent owns the state in that mode. |
| `selectionColor` | string | No |  | Base color for selection / focus affordances. Defaults to the primary palette. |
| `accessibilityLabel` | string | No |  | Accessible name for the tree container |

## Examples

### Basic Tree
ID: `Tree.basic` • Tags: tree, navigation • Category: basics • Status: stable • Since: 1.0.0

Render a hierarchical dataset with collapsing branches. Use `indent` to control how far each level is inset.

```tsx
return <Tree data={TREE_DATA} collapsible indent={20} />;
}
```

### Tree with Checkboxes
ID: `Tree.checkboxes` • Tags: tree, checkboxes • Category: behavior • Status: stable • Since: 1.0.0

Enable `checkboxes` with `cascadeCheck` to keep parent and child nodes synchronized while tracking checked ids.

```tsx
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

### Tree Selection
ID: `Tree.selection` • Tags: tree, selection • Category: behavior • Status: stable • Since: 1.0.0

Set `selectionMode` to `single` or `multiple` and drive `selectedIds` from state. In `multiple` mode, shift-click captures a range and Cmd/Ctrl-click toggles one row.

```tsx
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
      <Text size="xs" color="secondary">
        {selectedIds.length === 0
          ? 'Click a row, shift-click for a range, or Cmd/Ctrl-click to toggle.'
          : `${selectedIds.length} selected`}
      </Text>
    </Block>
  );
}
```

### Tree Filtering
ID: `Tree.filtering` • Tags: tree, filtering • Category: behavior • Status: stable • Since: 1.0.0

Provide `filterQuery` with `hideFiltered` to search the tree. A `highlight` renderer and `noResultsFallback` are also available for custom match styling and empty states.

```tsx
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

### Lazy Loading
ID: `Tree.lazy` • Tags: tree, async, loading • Category: behavior • Status: stable • Since: 1.0.0

Mark a node with `hasChildren` and supply `loadChildren` to fetch a branch the first time it opens. The disclosure control shows a loader while the promise is in flight.

```tsx
const loadChildren = (node: TreeNode) =>
    node.id.includes('-web') ? fetchVolumes(node.id) : fetchInstances(node.id);
  return <Tree data={TREE_DATA} loadChildren={loadChildren} selectionMode="single" showGuides />;
}
```

### Custom Tree Rendering
ID: `Tree.custom` • Tags: tree, custom-render • Category: customization • Status: stable • Since: 1.0.0

Pass `renderLabel` to build custom rows with icons and badges while keeping the tree interactions intact.

```tsx
const renderCustomLabel = (node: TreeNode) => {
    const data = node.data as CustomNodeData;
    const status = STATUS_BADGES[data.status];
    return (
      <Row gap="sm" align="center" style={{ flex: 1 }}>
        <Icon name={TYPE_ICONS[data.type]} size="sm" />
        <Text size="sm" style={{ flex: 1 }}>
          {node.label}
        </Text>
        <Badge variant="outline" color={status.color}>
          {status.label}
        </Badge>
      </Row>
    );
  };
  return <Tree data={TREE_DATA} renderLabel={renderCustomLabel} selectionMode="single" expandAll />;
}
```

### Virtualized Tree
ID: `Tree.virtualized` • Tags: tree, performance, virtualization • Category: performance • Status: stable • Since: 1.0.0

Pass `virtualized` with a `height` to render only the rows in view. Expansion animation is skipped in this mode; filtering, selection and keyboard navigation all still operate on the full row list.

```tsx
return <Tree data={TREE_DATA} virtualized height={320} size="sm" striped showGuides />;
}
```
