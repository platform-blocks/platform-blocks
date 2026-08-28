import type React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import type { ComponentSizeValue } from '../../core/theme/componentSize';
import type { TreeNode, TreeProps } from '../Tree/types';

/**
 * One navigable destination, as a flat record.
 *
 * The flat shape is the point: an app knows its routes, and often already has
 * them in a list with a category on each. `buildNavTree` turns that list into
 * the nested structure `Tree` renders, so nothing has to author a tree by hand
 * or keep one in sync as routes come and go.
 */
export interface NavTreeItem<T = any> {
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

export interface BuildNavTreeOptions {
  /**
   * Curated order for group labels, checked at every level. Groups not listed
   * follow, alphabetically — so a partial order is enough, and a new group
   * appears in a sensible place without touching this.
   *
   * Entries are bare labels (`'Input'`) or full paths (`'Hooks/Navigation'`).
   * A path wins over a bare label, which is how the same name can rank
   * differently in two branches.
   */
  groupOrder?: string[];
  /** Leading icon per group label. */
  groupIcons?: Record<string, React.ReactNode>;
  /**
   * How leaves inside a group are ordered.
   * - `'alpha'` — by `order` then label. The default: a long list is easier to
   *   scan alphabetically than in whatever order the array happened to be in.
   * - `'none'` — keep the order given.
   * @default 'alpha'
   */
  sortLeaves?: 'alpha' | 'none';
  /**
   * Groups shallower than this start open. `1` opens the top level and leaves
   * everything below it closed, which is the shape a docs sidebar wants: the
   * sections are visible, the long category lists are not.
   * @default 1
   */
  openDepth?: number;
  /** Group labels (or full `A/B` paths) to open regardless of `openDepth`. */
  openGroups?: string[];
  /**
   * Decorates each group row — a count, a badge, an icon. Receives the group's
   * path from the root and the items beneath it, at every level.
   */
  getGroupNode?: (context: {
    label: string;
    path: string[];
    depth: number;
    items: NavTreeItem[];
  }) => Partial<TreeNode>;
}

export interface NavTreeProps
  extends BuildNavTreeOptions,
    Pick<
      TreeProps,
      | 'showGuides'
      | 'accordion'
      | 'indent'
      | 'filterQuery'
      | 'hideFiltered'
      | 'autoExpandOnFilter'
      | 'highlight'
      | 'persistKey'
      | 'expandToActive'
      | 'scrollActiveIntoView'
      | 'noResultsFallback'
      | 'accessibilityLabel'
      | 'selectionColor'
      | 'rowStyle'
      | 'renderEndSection'
    > {
  /** The destinations, flat. Grouped and nested by `buildNavTree`. */
  items: NavTreeItem[];
  /** Current route. Marks its row and opens the groups above it. */
  activeHref?: string;
  /**
   * Where a row press goes. Supply it to route client-side; without it the
   * rows stay plain links and the browser navigates.
   */
  onNavigate?: (item: NavTreeItem, node: TreeNode) => void;
  /** Row density. @default 'sm' */
  size?: ComponentSizeValue;
  /**
   * Rail mode: only the top level renders, as icons. For a sidebar that
   * collapses to a strip — the full tree is one hover away, and a column of
   * every leaf's icon is not navigation, it is noise.
   */
  collapsed?: boolean;
  /**
   * Show a filter field above the tree, wired to `filterQuery`. Past a certain
   * length no amount of nesting beats typing three letters, and every sidebar
   * that needs one would otherwise wire the same input and the same state.
   *
   * Pass `filterQuery` as well to drive it from outside; on its own the field
   * keeps its own query. Hidden in `collapsed` mode, where there is no room.
   */
  searchable?: boolean;
  /** Placeholder for the filter field. @default 'Filter…' */
  searchPlaceholder?: string;
  /** Matched substrings are marked in the row labels. @default true */
  highlightMatches?: boolean;
  style?: StyleProp<ViewStyle>;
}
