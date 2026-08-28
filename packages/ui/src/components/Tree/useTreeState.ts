import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useControllableState } from '../../hooks/useControllableState';

import type { TreeNode, TreeRenderNode, TreeRow } from './types';
import {
  buildDescendantMap,
  buildInitialExpanded,
  buildParentMap,
  childrenOf,
  collectBranchIds,
  filterTree,
  isBranchNode,
  walkTree,
  ancestorIds,
  type LoadedChildren,
} from './treeUtils';

export interface UseTreeStateOptions {
  data: TreeNode[];
  expandAll: boolean;
  collapsible: boolean;
  accordion: boolean;
  expandedIds?: string[];
  defaultExpandedIds?: string[];
  onExpandedIdsChange?: (ids: string[]) => void;
  onToggle?: (node: TreeNode, expanded: boolean) => void;
  filterQuery: string;
  hideFiltered: boolean;
  autoExpandOnFilter: boolean;
  loadChildren?: (node: TreeNode) => Promise<TreeNode[]>;
  /** Branches mid collapse-animation, kept in the render tree until it ends. */
  keepMountedIds?: Set<string>;
  /**
   * Ids whose ancestors should be opened — the active route, typically. Applied
   * whenever the resolved ancestor set changes, not on every render, so a branch
   * the reader collapsed stays collapsed while they move within it.
   */
  expandToIds?: string[];
}

export interface TreeStateResult {
  /** Open branch ids, in insertion order. */
  expandedIds: string[];
  /** Replace the whole expanded set. Honours controlled mode like any setter. */
  setExpanded: (ids: string[]) => void;
  /** Visible rows, in display order. The single source of truth for rendering,
   *  keyboard navigation, range selection, striping and aria indices. */
  rows: TreeRow[];
  rowIds: string[];
  rowIndexById: Map<string, number>;
  /** The same rows nested, for the animated render path. */
  renderNodes: TreeRenderNode[];
  descendantMap: Record<string, string[]>;
  parentMap: Record<string, string>;
  loadedChildren: LoadedChildren;
  loadingIds: Set<string>;
  matchedIds: Set<string>;
  expandedSet: Set<string>;
  isExpanded: (id: string) => boolean;
  toggleNode: (node: TreeNode) => void;
  setNodeExpanded: (node: TreeNode, expanded: boolean) => void;
  childrenFor: (node: TreeNode) => TreeNode[] | undefined;
  isBranch: (node: TreeNode) => boolean;
}

export function useTreeState(options: UseTreeStateOptions): TreeStateResult {
  const {
    data,
    expandAll,
    collapsible,
    accordion,
    expandedIds,
    defaultExpandedIds,
    onExpandedIdsChange,
    onToggle,
    filterQuery,
    hideFiltered,
    autoExpandOnFilter,
    loadChildren,
    keepMountedIds,
    expandToIds,
  } = options;

  const [loadedChildren, setLoadedChildren] = useState<LoadedChildren>({});
  const [loadingIds, setLoadingIds] = useState<Set<string>>(() => new Set());
  const inFlight = useRef<Set<string>>(new Set());
  const mounted = useRef(true);
  useEffect(() => () => { mounted.current = false; }, []);

  const [expandedList, setExpandedList] = useControllableState<string[]>({
    value: expandedIds,
    defaultValue: () => defaultExpandedIds ?? buildInitialExpanded(data, expandAll),
    finalValue: [],
    onChange: onExpandedIdsChange,
  });

  const expandedSet = useMemo(() => new Set(expandedList), [expandedList]);
  const isControlledExpansion = expandedIds !== undefined;

  const childrenFor = useCallback(
    (node: TreeNode) => childrenOf(node, loadedChildren),
    [loadedChildren]
  );
  const isBranch = useCallback(
    (node: TreeNode) => isBranchNode(node, loadedChildren),
    [loadedChildren]
  );

  const descendantMap = useMemo(
    () => buildDescendantMap(data, loadedChildren),
    [data, loadedChildren]
  );
  const parentMap = useMemo(() => buildParentMap(data, loadedChildren), [data, loadedChildren]);

  /** Sibling ids per parent, so `accordion` closes peers without touching ancestors. */
  const siblingMap = useMemo(() => {
    const map: Record<string, string[]> = { '': data.map(node => node.id) };
    walkTree(data, node => {
      const kids = childrenOf(node, loadedChildren);
      if (kids?.length) map[node.id] = kids.map(child => child.id);
    }, loadedChildren);
    return map;
  }, [data, loadedChildren]);

  // `expandAll` used to be read once, in a useState initializer, so flipping it
  // later did nothing — `expandAll={!!query}` never expanded anything. Track the
  // previous value and re-derive expansion when it actually changes.
  const prevExpandAll = useRef(expandAll);
  useEffect(() => {
    if (prevExpandAll.current === expandAll) return;
    prevExpandAll.current = expandAll;
    if (isControlledExpansion) return;
    setExpandedList(
      expandAll
        ? collectBranchIds(data, loadedChildren)
        : buildInitialExpanded(data, false, loadedChildren)
    );
  }, [expandAll, data, loadedChildren, isControlledExpansion, setExpandedList]);

  // Nodes appearing after mount (new `data`, or a lazily loaded subtree) get their
  // `startOpen` honoured once — the first time they are seen, never again, so a
  // branch the user closed stays closed when the array identity changes.
  const seenIds = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (isControlledExpansion) return;
    const additions: string[] = [];
    walkTree(data, node => {
      if (seenIds.current.has(node.id)) return;
      seenIds.current.add(node.id);
      if (isBranchNode(node, loadedChildren) && (expandAll || node.startOpen)) {
        additions.push(node.id);
      }
    }, loadedChildren);
    if (!additions.length) return;
    setExpandedList(prev => {
      const missing = additions.filter(id => !prev.includes(id));
      return missing.length ? [...prev, ...missing] : prev;
    });
  }, [data, loadedChildren, expandAll, isControlledExpansion, setExpandedList]);

  const requestChildren = useCallback((node: TreeNode) => {
    if (!loadChildren) return;
    if (node.children || loadedChildren[node.id] || inFlight.current.has(node.id)) return;

    inFlight.current.add(node.id);
    setLoadingIds(prev => new Set(prev).add(node.id));

    Promise.resolve(loadChildren(node))
      .then(children => {
        if (!mounted.current) return;
        setLoadedChildren(prev => ({ ...prev, [node.id]: children ?? [] }));
      })
      .catch(() => {
        // A failed load leaves the branch empty rather than wedging the caret;
        // the consumer's own promise rejection is where errors get surfaced.
        if (mounted.current) setLoadedChildren(prev => ({ ...prev, [node.id]: [] }));
      })
      .finally(() => {
        inFlight.current.delete(node.id);
        if (!mounted.current) return;
        setLoadingIds(prev => {
          if (!prev.has(node.id)) return prev;
          const next = new Set(prev);
          next.delete(node.id);
          return next;
        });
      });
  }, [loadChildren, loadedChildren]);

  const setNodeExpanded = useCallback((node: TreeNode, expanded: boolean) => {
    if (!collapsible) return;
    if (expanded) requestChildren(node);
    onToggle?.(node, expanded);

    setExpandedList(prev => {
      const next = new Set(prev);
      if (!expanded) {
        next.delete(node.id);
        return Array.from(next);
      }
      // Accordion closes only this node's siblings. Closing every open branch —
      // what the old implementation did — also closed the node's own ancestors,
      // hiding the branch that was just opened.
      if (accordion) {
        const parentId = parentMap[node.id] ?? '';
        (siblingMap[parentId] ?? []).forEach(id => {
          if (id !== node.id) next.delete(id);
        });
      }
      next.add(node.id);
      return Array.from(next);
    });
  }, [accordion, collapsible, onToggle, parentMap, requestChildren, setExpandedList, siblingMap]);

  const toggleNode = useCallback((node: TreeNode) => {
    setNodeExpanded(node, !expandedSet.has(node.id));
  }, [expandedSet, setNodeExpanded]);

  const setExpanded = useCallback((ids: string[]) => {
    setExpandedList(ids);
  }, [setExpandedList]);

  // Open the branches above the ids we were pointed at — the active route, in
  // practice. Keyed on the resolved ancestor set rather than on the ids: moving
  // between two leaves of the same branch resolves to the same ancestors and
  // does nothing, so a branch the reader collapsed under their feet stays that
  // way. Merging rather than replacing leaves their other open branches alone.
  const appliedAncestors = useRef<string | null>(null);
  useEffect(() => {
    if (!collapsible) return;
    const wanted = new Set<string>();
    expandToIds?.forEach(id => {
      ancestorIds(parentMap, id).forEach(ancestor => wanted.add(ancestor));
    });
    // Nothing resolved yet — a lazily loaded subtree, or data that has not
    // arrived. Leave the marker alone so the next parentMap gets its turn.
    if (!wanted.size) return;

    const key = Array.from(wanted).sort().join('\u0000');
    if (appliedAncestors.current === key) return;
    appliedAncestors.current = key;

    setExpandedList(prev => {
      const missing = Array.from(wanted).filter(id => !prev.includes(id));
      return missing.length ? [...prev, ...missing] : prev;
    });
  }, [collapsible, expandToIds, parentMap, setExpandedList]);

  const filter = useMemo(
    () => filterTree(data, filterQuery, loadedChildren),
    [data, filterQuery, loadedChildren]
  );

  const hasQuery = filterQuery.trim().length > 0;

  // One walk produces both views of the tree: the flat list of visible rows that
  // everything reasons about, and the nested structure the animated renderer
  // needs. Deriving them separately is how the two used to disagree — striping
  // counted rows the flat model never showed.
  const { rows, renderNodes } = useMemo(() => {
    const flat: TreeRow[] = [];
    const prune = hasQuery && hideFiltered;
    const forceOpen = hasQuery && autoExpandOnFilter ? filter.ancestors : null;

    const visit = (
      nodes: TreeNode[],
      depth: number,
      parentId: string | null,
      lines: boolean[],
      hidden: boolean
    ): TreeRenderNode[] => {
      const siblings = prune ? nodes.filter(node => filter.visible.has(node.id)) : nodes;
      return siblings.map((node, i) => {
        const branch = isBranchNode(node, loadedChildren);
        const expanded = expandedSet.has(node.id) || !!forceOpen?.has(node.id);
        const isLastChild = i === siblings.length - 1;

        const row: TreeRow = {
          node,
          depth,
          index: hidden ? -1 : flat.length,
          parentId,
          isBranch: branch,
          expanded,
          matched: filter.matched.has(node.id),
          ancestorLines: lines,
          isLastChild,
          posInSet: i + 1,
          setSize: siblings.length,
        };
        if (!hidden) flat.push(row);

        const kids = childrenOf(node, loadedChildren);
        const mounted = !!(branch && kids?.length && (expanded || keepMountedIds?.has(node.id)));
        const children = mounted
          ? visit(kids!, depth + 1, node.id, [...lines, !isLastChild], hidden || !expanded)
          : [];

        return { row, children, mounted };
      });
    };

    const tree = visit(data, 0, null, [], false);
    return { rows: flat, renderNodes: tree };
  }, [
    data,
    expandedSet,
    filter,
    hasQuery,
    hideFiltered,
    autoExpandOnFilter,
    loadedChildren,
    keepMountedIds,
  ]);

  const rowIds = useMemo(() => rows.map(row => row.node.id), [rows]);
  const rowIndexById = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach(row => map.set(row.node.id, row.index));
    return map;
  }, [rows]);
  const isExpanded = useCallback((id: string) => expandedSet.has(id), [expandedSet]);

  return {
    expandedIds: expandedList,
    setExpanded,
    rows,
    rowIds,
    rowIndexById,
    renderNodes,
    descendantMap,
    parentMap,
    loadedChildren,
    loadingIds,
    matchedIds: filter.matched,
    expandedSet,
    isExpanded,
    toggleNode,
    setNodeExpanded,
    childrenFor,
    isBranch,
  };
}
