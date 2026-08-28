import type { TreeCheckState, TreeNode } from './types';

/** Children fetched through `loadChildren`, keyed by the branch they belong to. */
export type LoadedChildren = Record<string, TreeNode[]>;

/**
 * A node's children, whether they came with the data or arrived from
 * `loadChildren`. Every traversal in this component goes through here so lazy
 * branches behave like static ones everywhere else.
 */
export const childrenOf = (node: TreeNode, loaded?: LoadedChildren): TreeNode[] | undefined =>
  node.children ?? loaded?.[node.id];

/**
 * Whether the node gets a disclosure control. `hasChildren` covers the lazy case
 * where the caret has to exist before there is anything to show.
 */
export const isBranchNode = (node: TreeNode, loaded?: LoadedChildren): boolean => {
  const kids = childrenOf(node, loaded);
  if (kids) return kids.length > 0 || !!node.hasChildren;
  return !!node.hasChildren;
};

export const walkTree = (
  nodes: TreeNode[],
  visit: (node: TreeNode, depth: number, parent: TreeNode | null) => void,
  loaded?: LoadedChildren,
  depth = 0,
  parent: TreeNode | null = null
): void => {
  nodes.forEach(node => {
    visit(node, depth, parent);
    const kids = childrenOf(node, loaded);
    if (kids?.length) walkTree(kids, visit, loaded, depth + 1, node);
  });
};

export const findNode = (
  nodes: TreeNode[],
  id: string,
  loaded?: LoadedChildren
): TreeNode | undefined => {
  for (const node of nodes) {
    if (node.id === id) return node;
    const kids = childrenOf(node, loaded);
    if (kids?.length) {
      const found = findNode(kids, id, loaded);
      if (found) return found;
    }
  }
  return undefined;
};

/** Every branch id, for expand-all. */
export const collectBranchIds = (nodes: TreeNode[], loaded?: LoadedChildren): string[] => {
  const ids: string[] = [];
  walkTree(nodes, node => {
    if (isBranchNode(node, loaded)) ids.push(node.id);
  }, loaded);
  return ids;
};

/** Branch id → every descendant id below it. Built once per data change. */
export const buildDescendantMap = (
  nodes: TreeNode[],
  loaded?: LoadedChildren
): Record<string, string[]> => {
  const map: Record<string, string[]> = {};
  const collect = (node: TreeNode): string[] => {
    const kids = childrenOf(node, loaded);
    if (!kids?.length) return [];
    const ids: string[] = [];
    kids.forEach(child => {
      ids.push(child.id);
      ids.push(...collect(child));
    });
    map[node.id] = ids;
    return ids;
  };
  nodes.forEach(collect);
  return map;
};

/** Child id → parent id, for ArrowLeft and for expanding a match's ancestors. */
export const buildParentMap = (
  nodes: TreeNode[],
  loaded?: LoadedChildren
): Record<string, string> => {
  const map: Record<string, string> = {};
  walkTree(nodes, (node, _depth, parent) => {
    if (parent) map[node.id] = parent.id;
  }, loaded);
  return map;
};

/** Ids expanded before the user touches anything: `startOpen`, or everything. */
export const buildInitialExpanded = (
  nodes: TreeNode[],
  expandAll: boolean,
  loaded?: LoadedChildren
): string[] => {
  const ids: string[] = [];
  walkTree(nodes, node => {
    if (!isBranchNode(node, loaded)) return;
    if (expandAll || node.startOpen) ids.push(node.id);
  }, loaded);
  return ids;
};

export interface FilterResult {
  /** Nodes whose own label matched — what `highlight` marks up. */
  matched: Set<string>;
  /** Matches plus their ancestors: the set still rendered when `hideFiltered`. */
  visible: Set<string>;
  /** Ancestors of matches, opened so the matches can actually be reached. */
  ancestors: Set<string>;
}

/**
 * Marks matches without rebuilding the tree. The old implementation cloned
 * every surviving node, which broke referential equality — memoized rows saw a
 * new node object on each keystroke, and callbacks handed consumers a copy
 * rather than the node they passed in.
 */
export const filterTree = (
  nodes: TreeNode[],
  query: string,
  loaded?: LoadedChildren
): FilterResult => {
  const matched = new Set<string>();
  const visible = new Set<string>();
  const ancestors = new Set<string>();
  const normalized = query.trim().toLowerCase();
  if (!normalized) return { matched, visible, ancestors };

  const visit = (node: TreeNode, trail: string[]): boolean => {
    const selfMatch = node.label.toLowerCase().includes(normalized);
    if (selfMatch) matched.add(node.id);

    const kids = childrenOf(node, loaded);
    let childMatch = false;
    if (kids?.length) {
      const nextTrail = [...trail, node.id];
      kids.forEach(child => {
        if (visit(child, nextTrail)) childMatch = true;
      });
    }

    if (selfMatch || childMatch) {
      visible.add(node.id);
      trail.forEach(id => ancestors.add(id));
      return true;
    }
    return false;
  };

  nodes.forEach(node => visit(node, []));
  return { matched, visible, ancestors };
};

/** Aggregate check state for a node, from the checked set alone. */
export const getCheckState = (
  node: TreeNode,
  checked: Set<string>,
  descendants: string[] | undefined,
  cascade: boolean
): TreeCheckState => {
  if (!cascade || !descendants?.length) {
    return checked.has(node.id) ? 'checked' : 'unchecked';
  }
  let checkedCount = 0;
  for (const id of descendants) {
    if (checked.has(id)) checkedCount += 1;
  }
  if (checkedCount === descendants.length) return 'checked';
  if (checkedCount === 0) return checked.has(node.id) ? 'indeterminate' : 'unchecked';
  return 'indeterminate';
};

/**
 * Two-state toggle: a branch goes fully checked or fully unchecked, taking its
 * descendants with it. The previous tri-state cycle had a "parent checked, no
 * children" step that was indistinguishable on screen from "some children
 * checked", so the control looked stuck.
 */
export const toggleCheckedIds = (
  node: TreeNode,
  current: string[],
  descendants: string[] | undefined,
  cascade: boolean
): string[] => {
  const next = new Set(current);
  const kids = cascade ? descendants ?? [] : [];

  if (!kids.length) {
    if (next.has(node.id)) next.delete(node.id);
    else next.add(node.id);
    return Array.from(next);
  }

  const allChecked = kids.every(id => next.has(id)) && next.has(node.id);
  if (allChecked) {
    next.delete(node.id);
    kids.forEach(id => next.delete(id));
  } else {
    next.add(node.id);
    kids.forEach(id => next.add(id));
  }
  return Array.from(next);
};

/** Ids between two rows, inclusive, in visible order. */
export const idRange = (orderedIds: string[], fromId: string, toId: string): string[] => {
  const from = orderedIds.indexOf(fromId);
  const to = orderedIds.indexOf(toId);
  if (from === -1 || to === -1) return [];
  return orderedIds.slice(Math.min(from, to), Math.max(from, to) + 1);
};

/**
 * Every ancestor id of `id`, nearest first. Guards against a cycle in
 * `parentMap` — a malformed tree should render wrong, not hang the thread.
 */
export const ancestorIds = (parentMap: Record<string, string>, id: string): string[] => {
  const trail: string[] = [];
  const seen = new Set<string>([id]);
  let cursor = parentMap[id];
  while (cursor && !seen.has(cursor)) {
    seen.add(cursor);
    trail.push(cursor);
    cursor = parentMap[cursor];
  }
  return trail;
};

/**
 * First node whose `href` matches, in document order. Backs `activeHref`, so a
 * consumer can hand the tree a pathname instead of resolving the node itself.
 */
export const findNodeByHref = (
  nodes: TreeNode[],
  href: string,
  loaded?: LoadedChildren
): TreeNode | undefined => {
  for (const node of nodes) {
    if (node.href === href) return node;
    const kids = childrenOf(node, loaded);
    if (kids?.length) {
      const found = findNodeByHref(kids, href, loaded);
      if (found) return found;
    }
  }
  return undefined;
};
