import type { TreeNode } from '../Tree/types';
import type { BuildNavTreeOptions, NavTreeItem } from './types';

/** Group ids are namespaced so a group can never collide with a route id. */
export const GROUP_ID_PREFIX = 'navgroup:';

const PATH_SEPARATOR = '/';

export const groupNodeId = (path: string[]): string =>
  `${GROUP_ID_PREFIX}${path.join(PATH_SEPARATOR)}`;

/** True for an id `buildNavTree` minted for a group rather than an item. */
export const isGroupNodeId = (id: string): boolean => id.startsWith(GROUP_ID_PREFIX);

const toPath = (group: NavTreeItem['group']): string[] => {
  if (!group) return [];
  const parts = Array.isArray(group) ? group : [group];
  // A blank level would otherwise nest everything under an unnamed branch —
  // an item with no category belongs beside the groups, not below a gap.
  return parts.map(part => part?.trim()).filter((part): part is string => !!part);
};

/**
 * Curated first, in the order given; everything else after, alphabetically.
 * A partial `groupOrder` is the common case — name the groups you care about
 * and let the rest fall in line without editing the list again.
 *
 * An entry may be a bare label or a full `Parent/Child` path. The path wins,
 * which is what lets the same label mean different things in two branches: a
 * `Navigation` category of components and a `Navigation` category of hooks
 * would otherwise share one rank and one of them would sort wrong.
 */
const compareGroups = (a: string, b: string, path: string[], groupOrder?: string[]): number => {
  const rank = (label: string) => {
    if (!groupOrder) return Number.MAX_SAFE_INTEGER;
    const qualified = groupOrder.indexOf([...path, label].join(PATH_SEPARATOR));
    if (qualified !== -1) return qualified;
    const bare = groupOrder.indexOf(label);
    return bare === -1 ? Number.MAX_SAFE_INTEGER : bare;
  };
  const delta = rank(a) - rank(b);
  return delta !== 0 ? delta : a.localeCompare(b);
};

const compareItems = (a: NavTreeItem, b: NavTreeItem): number => {
  const rank = (item: NavTreeItem) => item.order ?? Number.MAX_SAFE_INTEGER;
  const delta = rank(a) - rank(b);
  return delta !== 0 ? delta : a.label.localeCompare(b.label);
};

const leafNode = (item: NavTreeItem): TreeNode<NavTreeItem> => ({
  id: item.id ?? item.href,
  label: item.label,
  href: item.href,
  icon: item.icon,
  disabled: item.disabled,
  data: item,
});

/**
 * Nests a flat list of routes into the tree `Tree` renders.
 *
 * Grouping is by each item's `group` path, so the same list can be regrouped —
 * by category, by package, by anything already on the record — without
 * restructuring it. Ordering is curated-then-alphabetical at every level, which
 * keeps a hand-picked section order while new entries still land somewhere
 * predictable on their own.
 */
export function buildNavTree(
  items: NavTreeItem[],
  options: BuildNavTreeOptions = {}
): TreeNode<NavTreeItem>[] {
  const { groupOrder, groupIcons, sortLeaves = 'alpha', openDepth = 1, openGroups, getGroupNode } = options;

  /** One level of the tree while it is being assembled. */
  interface Level {
    /** Items that stop here — rendered as leaves, in sibling order with groups. */
    leaves: NavTreeItem[];
    /** Child groups, keyed by label, in first-seen order until they are sorted. */
    groups: Map<string, Level>;
    /** Everything at or below this level, for `getGroupNode`. */
    items: NavTreeItem[];
  }

  const newLevel = (): Level => ({ leaves: [], groups: new Map(), items: [] });
  const root = newLevel();

  items.forEach(item => {
    const path = toPath(item.group);
    let level = root;
    root.items.push(item);
    path.forEach(label => {
      let next = level.groups.get(label);
      if (!next) {
        next = newLevel();
        level.groups.set(label, next);
      }
      next.items.push(item);
      level = next;
    });
    level.leaves.push(item);
  });

  const openSet = new Set(openGroups ?? []);

  const emit = (level: Level, path: string[], depth: number): TreeNode<NavTreeItem>[] => {
    const groupNodes = Array.from(level.groups.entries())
      .sort(([a], [b]) => compareGroups(a, b, path, groupOrder))
      .map(([label, child]): TreeNode<NavTreeItem> => {
        const childPath = [...path, label];
        const base: TreeNode<NavTreeItem> = {
          id: groupNodeId(childPath),
          label,
          icon: groupIcons?.[label],
          // A group is a signpost, not a destination: pressing it opens the
          // branch rather than selecting a row that has no page behind it.
          selectable: false,
          startOpen:
            depth < openDepth || openSet.has(label) || openSet.has(childPath.join(PATH_SEPARATOR)),
          children: emit(child, childPath, depth + 1),
        };
        const overrides = getGroupNode?.({ label, path: childPath, depth, items: child.items });
        return overrides ? { ...base, ...overrides } : base;
      });

    const leaves = (sortLeaves === 'alpha' ? [...level.leaves].sort(compareItems) : level.leaves)
      .map(leafNode);

    // Groups first, then the loose items at this level. A branch buried between
    // two leaves is easy to miss; a block of branches above a block of links
    // reads as structure.
    return [...groupNodes, ...leaves];
  };

  return emit(root, [], 0);
}
