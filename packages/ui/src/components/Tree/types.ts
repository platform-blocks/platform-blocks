import type React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import type { ComponentSizeValue } from '../../core/theme/componentSize';

export interface TreeNode<T = any> {
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

/** Everything a row knows about itself, handed to `renderLabel` / `renderEndSection`. */
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

/** A visible row: one entry per node the tree is currently showing, in display order. */
export interface TreeRow<T = any> {
  node: TreeNode<T>;
  depth: number;
  /** Position among visible rows — the axis keyboard nav, ranges and striping use. */
  index: number;
  parentId: string | null;
  isBranch: boolean;
  expanded: boolean;
  matched: boolean;
  /**
   * One entry per ancestor level: whether that ancestor has a following sibling,
   * i.e. whether its guide line continues past this row.
   */
  ancestorLines: boolean[];
  isLastChild: boolean;
  /** 1-based `aria-posinset` / `aria-setsize` among siblings. */
  posInSet: number;
  setSize: number;
}

/**
 * The same rows arranged as a tree, for the animated render path: a collapsing
 * branch keeps its children in this structure until the animation finishes,
 * while `TreeRow.index` stays -1 so they never count as visible.
 */
export interface TreeRenderNode<T = any> {
  row: TreeRow<T>;
  children: TreeRenderNode<T>[];
  /** Children are rendered — either the branch is open, or it is animating shut. */
  mounted: boolean;
}

export type TreeCheckState = 'checked' | 'indeterminate' | 'unchecked';

export interface TreeProps<T = any> {
  data: TreeNode<T>[];
  /** Called when a leaf is activated, or when any node carrying `href` is pressed */
  onNavigate?: (node: TreeNode<T>) => void;
  /** Called when a node row is pressed. Return false to prevent default handling (selection, expand). */
  onNodePress?: (node: TreeNode<T>, context: { isBranch: boolean; event?: any }) => boolean | void;
  /** Allow collapsing/expanding */
  collapsible?: boolean;
  /** Row density. Drives height, padding, indent and icon size. */
  size?: ComponentSizeValue;
  /** Indent size in px for each depth level. Defaults to the `size` scale. */
  indent?: number;
  /** Draw vertical guide lines connecting a branch to its descendants */
  showGuides?: boolean;
  /** Keep only one branch open per parent level */
  accordion?: boolean;
  /** Expand every branch. Reactive: flipping it back restores the initial expansion. */
  expandAll?: boolean;
  /** Custom render for label */
  renderLabel?: (
    node: TreeNode<T>,
    depth: number,
    isOpen: boolean,
    state: TreeNodeState
  ) => React.ReactNode;
  /** Trailing slot rendered at the end of a row (actions, counts, badges) */
  renderEndSection?: (node: TreeNode<T>, state: TreeNodeState) => React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Style applied to every row container */
  rowStyle?: StyleProp<ViewStyle>;
  /** Selection mode */
  selectionMode?: 'none' | 'single' | 'multiple';
  /** Controlled selected ids */
  selectedIds?: string[];
  /** Uncontrolled default selected ids */
  defaultSelectedIds?: string[];
  /** Selection change callback */
  onSelectionChange?: (ids: string[], node: TreeNode<T>) => void;
  /** Fired after selection changes with the node considered primary (first in selection) */
  onActiveNodeChange?: (node: TreeNode<T> | null, ids: string[]) => void;
  /** Enable checkboxes */
  checkboxes?: boolean;
  /** Controlled checked ids */
  checkedIds?: string[];
  /** Uncontrolled default checked ids */
  defaultCheckedIds?: string[];
  /** Checked change callback */
  onCheckedChange?: (ids: string[], node: TreeNode<T>) => void;
  /** Cascade checking to descendants */
  cascadeCheck?: boolean;
  /** Expand branches also when pressing label area (not just chevron) */
  expandOnClick?: boolean;
  /** Controlled external expansion state */
  expandedIds?: string[];
  /** Uncontrolled initial expansion, overriding each node's `startOpen` */
  defaultExpandedIds?: string[];
  /** Fired with the full expanded set whenever expansion changes */
  onExpandedIdsChange?: (ids: string[]) => void;
  /** Expansion change callback for a single node */
  onToggle?: (node: TreeNode<T>, expanded: boolean) => void;
  /** Fetch a branch's children on first expand. Node needs `hasChildren` to show a caret. */
  loadChildren?: (node: TreeNode<T>) => Promise<TreeNode<T>[]>;
  /** Filter query to highlight / hide unmatched nodes */
  filterQuery?: string;
  /** If true, nodes that don't match filter are hidden; otherwise all shown with highlight */
  hideFiltered?: boolean;
  /** Open the branches leading to filter matches while a query is active */
  autoExpandOnFilter?: boolean;
  /** Content when no results after filtering */
  noResultsFallback?: React.ReactNode;
  /** Custom highlight function for labels (return ReactNode) */
  highlight?: (label: string, query: string) => React.ReactNode;
  /** Apply alternating background stripes to rows */
  striped?: boolean;
  /** Animate branch expansion/collapse using the Collapse component */
  useAnimations?: boolean;
  /** Render rows through a virtualized list. Disables expand/collapse animation. */
  virtualized?: boolean;
  /** Viewport height for the virtualized list */
  height?: number;
  /** Arrow-key navigation, type-ahead and roving focus (web). Defaults to on. */
  keyboardNavigation?: boolean;
  /**
   * Id of the node representing the current location — the navigation
   * counterpart to selection. It paints the row as active, opens the branches
   * above it, and scrolls it into view, without consuming `selectedIds`.
   */
  activeId?: string;
  /**
   * `activeId`, resolved by matching a node's `href` instead. Hand it a
   * pathname and the tree finds the row. Ignored when `activeId` is set.
   */
  activeHref?: string;
  /**
   * Open the branches leading to the active node whenever it changes.
   * Re-opening is keyed on the ancestor set, so a branch the reader collapsed
   * stays collapsed while they move between its children.
   * @default true
   */
  expandToActive?: boolean;
  /**
   * Scroll the active row into view once it becomes visible (web only).
   * @default true
   */
  scrollActiveIntoView?: boolean;
  /**
   * Remember which branches are open across reloads, under this key
   * (`localStorage`, web only). Ignored while expansion is controlled through
   * `expandedIds` — the parent owns the state in that mode.
   */
  persistKey?: string;
  /** Base color for selection / focus affordances. Defaults to the primary palette. */
  selectionColor?: string;
  /** Accessible name for the tree container */
  accessibilityLabel?: string;
}
