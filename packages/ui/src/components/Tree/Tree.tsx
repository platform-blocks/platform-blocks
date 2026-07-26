import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Platform, ScrollView, View } from 'react-native';

// NOTE: Direct component/theme imports to break circular dependency with barrel index.ts
import { Text } from '../Text';
import { resolveOptionalModule } from '../../utils/optionalModule';
import { useTheme } from '../../core/theme';
import { withAlpha } from '../../core/theme/colorUtils';
import { surfaceInteractionTint } from '../../core/theme/surfaces';
import { useDirection } from '../../core/providers/DirectionProvider';
import { extractSpacingProps, getSpacingStyles } from '../../core/utils';
import { Collapse } from '../Collapse';
import { useControllableState } from '../../hooks/useControllableState';

import { TreeRow, type TreeRowColors } from './TreeRow';
import { resolveTreeMetrics } from './treeSizes';
import { useTreeState } from './useTreeState';
import { findNode, getCheckState, idRange, toggleCheckedIds } from './treeUtils';
import type { TreeNode, TreeProps, TreeRenderNode, TreeRow as TreeRowMeta } from './types';

export type { TreeNode, TreeProps } from './types';

const web = Platform.OS === 'web';
const TYPE_AHEAD_TIMEOUT = 800;

/**
 * Only `virtualized` trees need FlashList, so it is resolved on demand rather
 * than imported at module scope — a tree that never virtualizes should not drag
 * the dependency into the bundle, or require it to be installed at all.
 */
const resolveFlashList = () =>
  resolveOptionalModule<any>('@shopify/flash-list', {
    accessor: (mod) => mod?.FlashList,
    devWarning:
      '@shopify/flash-list is not installed; <Tree virtualized> renders every row inside a ScrollView instead.',
  });

/**
 * Wraps a branch's children so the collapse animation can play out. The
 * `onCollapsed` callback is read through a ref because `Collapse` lists
 * `onAnimationEnd` in its effect dependencies — a fresh closure per render
 * would restart the animation on every state change.
 */
const AnimatedBranch = React.memo(function AnimatedBranch({
  id,
  expanded,
  onCollapsed,
  children,
}: {
  id: string;
  expanded: boolean;
  onCollapsed: (id: string) => void;
  children: React.ReactNode;
}) {
  const expandedRef = useRef(expanded);
  expandedRef.current = expanded;
  const onCollapsedRef = useRef(onCollapsed);
  onCollapsedRef.current = onCollapsed;

  const handleAnimationEnd = useCallback(() => {
    if (!expandedRef.current) onCollapsedRef.current(id);
  }, [id]);

  return (
    <Collapse isCollapsed={!expanded} collapsedHeight={0} animateOnMount onAnimationEnd={handleAnimationEnd}>
      <View>{children}</View>
    </Collapse>
  );
});

export const Tree = React.forwardRef<View, TreeProps>((props, ref) => {
  const { spacingProps, otherProps } = extractSpacingProps(props as any);
  const {
    data,
    onNavigate,
    onNodePress,
    collapsible = true,
    size = 'md',
    indent,
    showGuides = false,
    accordion = false,
    expandAll = false,
    renderLabel,
    renderEndSection,
    style,
    rowStyle,
    selectionMode = 'none',
    selectedIds,
    defaultSelectedIds,
    onSelectionChange,
    onActiveNodeChange,
    checkboxes = false,
    checkedIds,
    defaultCheckedIds,
    onCheckedChange,
    cascadeCheck = true,
    expandOnClick = true,
    expandedIds,
    defaultExpandedIds,
    onExpandedIdsChange,
    onToggle,
    loadChildren,
    filterQuery = '',
    hideFiltered = true,
    autoExpandOnFilter = true,
    noResultsFallback,
    highlight,
    striped = false,
    useAnimations = true,
    virtualized = false,
    height,
    keyboardNavigation = true,
    selectionColor,
    accessibilityLabel,
  } = otherProps as TreeProps;

  const theme = useTheme?.() as any;
  const { isRTL } = useDirection();
  const isDark = theme?.colorScheme === 'dark';
  const metrics = useMemo(() => resolveTreeMetrics(size), [size]);
  const indentWidth = indent ?? metrics.indent;

  const reactId = useId();
  const domId = `tree-${reactId.replace(/:/g, '')}`;
  const rowDomId = useCallback((id: string) => `${domId}-row-${id}`, [domId]);

  const colors = useMemo<TreeRowColors>(() => {
    const accent = selectionColor || theme?.colors?.primary?.[5] || '#2684FF';
    const labelColor = theme?.text?.primary || theme?.colors?.gray?.[9] || '#1C1C1E';
    return {
      selectedBg: withAlpha(accent, isDark ? 0.28 : 0.14),
      hoverBg: surfaceInteractionTint(theme, 'hover'),
      pressedBg: surfaceInteractionTint(theme, 'pressed'),
      stripeBg: surfaceInteractionTint(theme, 'band'),
      selectedBorder: withAlpha(accent, isDark ? 0.55 : 0.35),
      focusRing: theme?.states?.focusRing || accent,
      label: labelColor,
      selectedLabel: (isDark ? theme?.colors?.primary?.[3] : theme?.colors?.primary?.[7]) || labelColor,
      chevron: theme?.text?.secondary || theme?.text?.muted || theme?.colors?.gray?.[7] || '#666',
      disabled: theme?.text?.disabled || theme?.colors?.gray?.[3] || '#C7C7CC',
      guide: surfaceInteractionTint(theme, 'selected'),
    };
  }, [isDark, selectionColor, theme]);

  // Branches whose collapse animation is still running. Their children stay in
  // the render tree until it ends, then unmount — the old implementation kept
  // every branch ever opened mounted at height 0, where the rows stayed in the
  // tab order and in find-in-page results.
  const [collapsingIds, setCollapsingIds] = useState<Set<string>>(() => new Set());
  const dropCollapsed = useCallback((id: string) => {
    setCollapsingIds(prev => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const handleToggle = useCallback((node: TreeNode, expanded: boolean) => {
    if (!expanded && useAnimations && !virtualized) {
      setCollapsingIds(prev => new Set(prev).add(node.id));
    } else if (expanded) {
      // Re-opening ends the exit animation early; without this the branch would
      // stay flagged as collapsing if `Collapse` never reported an end (content
      // that measured zero height, an unmount mid-animation).
      dropCollapsed(node.id);
    }
    onToggle?.(node, expanded);
  }, [dropCollapsed, onToggle, useAnimations, virtualized]);

  const tree = useTreeState({
    data,
    expandAll,
    collapsible,
    accordion,
    expandedIds,
    defaultExpandedIds,
    onExpandedIdsChange,
    onToggle: handleToggle,
    filterQuery,
    hideFiltered,
    autoExpandOnFilter,
    loadChildren,
    keepMountedIds: collapsingIds,
  });

  const { rows, rowIds, rowIndexById, renderNodes, descendantMap, parentMap, loadingIds } = tree;

  const [effectiveSelected, commitSelected] = useControllableState<string[]>({
    value: selectedIds,
    defaultValue: defaultSelectedIds,
    finalValue: [],
    onChange: onSelectionChange,
  });
  const [effectiveChecked, commitChecked] = useControllableState<string[]>({
    value: checkedIds,
    defaultValue: defaultCheckedIds,
    finalValue: [],
    onChange: onCheckedChange,
  });

  const selectedSet = useMemo(() => new Set(effectiveSelected), [effectiveSelected]);
  const checkedSet = useMemo(() => new Set(effectiveChecked), [effectiveChecked]);

  const anchorId = useRef<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [containerFocused, setContainerFocused] = useState(false);

  // A consumer that only asked for `onActiveNodeChange` still means "single".
  const effectiveSelectionMode =
    selectionMode === 'none' && onActiveNodeChange ? 'single' : selectionMode;

  const setSelected = useCallback((ids: string[], node: TreeNode) => {
    commitSelected(ids, node);
    const primaryId = ids[0];
    const primaryNode = primaryId ? findNode(data, primaryId, tree.loadedChildren) || null : null;
    onActiveNodeChange?.(primaryNode, ids);
  }, [commitSelected, data, onActiveNodeChange, tree.loadedChildren]);

  const selectableIds = useCallback((ids: string[]) => ids.filter(id => {
    const found = findNode(data, id, tree.loadedChildren);
    return !!found && (found.selectable ?? true) && !found.disabled;
  }), [data, tree.loadedChildren]);

  const applySelection = useCallback((node: TreeNode, event?: any) => {
    if (effectiveSelectionMode === 'none' || (node.selectable ?? true) === false) return;

    if (effectiveSelectionMode === 'single') {
      setSelected([node.id], node);
      anchorId.current = node.id;
      return;
    }

    // Read each flag off both the event and its nativeEvent: RN Web puts them on
    // the DOM event, RN on the native one, and a keyboard event carries them at
    // the top level. `||` rather than `??` — a `false` metaKey must not stop the
    // lookup before ctrlKey is considered.
    const flag = (name: 'shiftKey' | 'metaKey' | 'ctrlKey') =>
      !!(event?.[name] || event?.nativeEvent?.[name]);
    const shiftKey = flag('shiftKey');
    const modifierKey = flag('metaKey') || flag('ctrlKey');

    if (shiftKey && anchorId.current && anchorId.current !== node.id) {
      // Ranges walk the visible row order, so a range taken while a filter is
      // active can no longer sweep up rows that are not on screen.
      setSelected(selectableIds(idRange(rowIds, anchorId.current, node.id)), node);
      return;
    }

    if (modifierKey) {
      const next = selectedSet.has(node.id)
        ? effectiveSelected.filter(id => id !== node.id)
        : [...effectiveSelected, node.id];
      setSelected(next, node);
      anchorId.current = node.id;
      return;
    }

    setSelected([node.id], node);
    anchorId.current = node.id;
  }, [effectiveSelected, effectiveSelectionMode, rowIds, selectableIds, selectedSet, setSelected]);

  const handleRowPress = useCallback((node: TreeNode, isBranch: boolean, event?: any) => {
    if (node.disabled) return;

    const intercept = onNodePress?.(node, { isBranch, event });
    if (intercept === false) return;

    setFocusedId(node.id);

    if (isBranch && expandOnClick && collapsible) {
      tree.toggleNode(node);
    }

    applySelection(node, event);

    // Documented behaviour, finally implemented: leaves activate, and any node
    // carrying an href activates. The old guard required `href`, so the leaf
    // case — the one every file-browser demo relies on — never fired.
    if (node.href || !isBranch) onNavigate?.(node);
  }, [applySelection, collapsible, expandOnClick, onNavigate, onNodePress, tree]);

  const handleCheck = useCallback((node: TreeNode) => {
    if (node.disabled) return;
    const next = toggleCheckedIds(node, effectiveChecked, descendantMap[node.id], cascadeCheck);
    commitChecked(next, node);
  }, [cascadeCheck, commitChecked, descendantMap, effectiveChecked]);

  const handleDisclosureToggle = useCallback((node: TreeNode) => {
    setFocusedId(node.id);
    tree.toggleNode(node);
  }, [tree]);

  /* ---------------------------------------------------------------- keyboard */

  const keyboardEnabled = web && keyboardNavigation !== false;
  const containerRef = useRef<any>(null);
  const typeAhead = useRef<{ buffer: string; at: number }>({ buffer: '', at: 0 });

  // Everything the key handler needs, refreshed each render so the listener can
  // stay attached across re-renders without going stale.
  const nav = useRef<any>(null);
  nav.current = {
    rows,
    rowIds,
    rowIndexById,
    focusedId,
    setFocusedId,
    isRTL,
    checkboxes,
    selectionMode: effectiveSelectionMode,
    parentMap,
    setNodeExpanded: tree.setNodeExpanded,
    handleRowPress,
    handleCheck,
    applySelection,
    selectableIds,
    setSelected,
    anchorId,
    collapsible,
  };

  useEffect(() => {
    if (!keyboardEnabled) return;
    const node = containerRef.current as any;
    if (!node || typeof node.addEventListener !== 'function') return;

    node.tabIndex = 0;
    if (node.style) node.style.outline = 'none';

    const onFocus = () => setContainerFocused(true);
    const onBlur = () => setContainerFocused(false);

    const onKeyDown = (event: KeyboardEvent) => {
      const s = nav.current;
      if (!s || !s.rows.length) return;

      const current = s.focusedId ? s.rowIndexById.get(s.focusedId) ?? -1 : -1;
      const focusIndex = (index: number) => {
        const clamped = Math.max(0, Math.min(s.rows.length - 1, index));
        const target = s.rows[clamped] as TreeRowMeta;
        s.setFocusedId(target.node.id);
        return target;
      };
      const row = current >= 0 ? (s.rows[current] as TreeRowMeta) : null;
      const forwardKey = s.isRTL ? 'ArrowLeft' : 'ArrowRight';
      const backKey = s.isRTL ? 'ArrowRight' : 'ArrowLeft';

      const extendTo = (target: TreeRowMeta) => {
        if (s.selectionMode !== 'multiple') return;
        const anchor = s.anchorId.current ?? row?.node.id ?? target.node.id;
        s.anchorId.current = anchor;
        s.setSelected(s.selectableIds(idRange(s.rowIds, anchor, target.node.id)), target.node);
      };

      switch (event.key) {
        case 'ArrowDown': {
          event.preventDefault();
          const target = focusIndex(current < 0 ? 0 : current + 1);
          if (event.shiftKey) extendTo(target);
          return;
        }
        case 'ArrowUp': {
          event.preventDefault();
          const target = focusIndex(current < 0 ? 0 : current - 1);
          if (event.shiftKey) extendTo(target);
          return;
        }
        case 'Home':
          event.preventDefault();
          focusIndex(0);
          return;
        case 'End':
          event.preventDefault();
          focusIndex(s.rows.length - 1);
          return;
        case forwardKey:
          event.preventDefault();
          if (!row) return;
          if (row.isBranch && !row.expanded && s.collapsible) s.setNodeExpanded(row.node, true);
          else if (row.isBranch && row.expanded) focusIndex(current + 1);
          return;
        case backKey: {
          event.preventDefault();
          if (!row) return;
          if (row.isBranch && row.expanded && s.collapsible) {
            s.setNodeExpanded(row.node, false);
            return;
          }
          const parentId = row.parentId ?? s.parentMap[row.node.id];
          const parentIndex = parentId ? s.rowIndexById.get(parentId) : undefined;
          if (parentIndex !== undefined) focusIndex(parentIndex);
          return;
        }
        case 'Enter':
          event.preventDefault();
          if (row) s.handleRowPress(row.node, row.isBranch, event);
          return;
        case ' ':
        case 'Spacebar':
          event.preventDefault();
          if (!row) return;
          if (s.checkboxes) s.handleCheck(row.node);
          else s.handleRowPress(row.node, row.isBranch, event);
          return;
        default:
          break;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'a') {
        if (s.selectionMode !== 'multiple') return;
        event.preventDefault();
        const all = s.selectableIds(s.rowIds);
        if (all.length) s.setSelected(all, s.rows[0].node);
        return;
      }

      // Type-ahead: printable characters jump to the next row whose label starts
      // with what has been typed, wrapping around the current position.
      if (event.key.length !== 1 || event.metaKey || event.ctrlKey || event.altKey) return;
      const now = Date.now();
      const buffer =
        now - typeAhead.current.at > TYPE_AHEAD_TIMEOUT
          ? event.key.toLowerCase()
          : typeAhead.current.buffer + event.key.toLowerCase();
      typeAhead.current = { buffer, at: now };

      const start = current < 0 ? 0 : current + 1;
      const total = s.rows.length;
      for (let step = 0; step < total; step += 1) {
        const candidate = s.rows[(start + step) % total] as TreeRowMeta;
        if (candidate.node.label.toLowerCase().startsWith(buffer)) {
          event.preventDefault();
          s.setFocusedId(candidate.node.id);
          return;
        }
      }
    };

    node.addEventListener('keydown', onKeyDown);
    node.addEventListener('focus', onFocus);
    node.addEventListener('blur', onBlur);
    return () => {
      node.removeEventListener('keydown', onKeyDown);
      node.removeEventListener('focus', onFocus);
      node.removeEventListener('blur', onBlur);
    };
  }, [keyboardEnabled]);

  // Mirror the roving focus to assistive tech and keep the focused row on screen.
  useEffect(() => {
    if (!keyboardEnabled) return;
    const node = containerRef.current as any;
    if (!node?.setAttribute) return;
    if (focusedId && rowIndexById.has(focusedId)) {
      node.setAttribute('aria-activedescendant', rowDomId(focusedId));
      if (typeof document !== 'undefined') {
        document.getElementById(rowDomId(focusedId))?.scrollIntoView({ block: 'nearest' });
      }
    } else {
      node.removeAttribute('aria-activedescendant');
    }
  }, [focusedId, keyboardEnabled, rowDomId, rowIndexById]);

  // A focused row that filtering or a collapse removed would otherwise keep the
  // ring pointing at something invisible.
  useEffect(() => {
    if (focusedId && !rowIndexById.has(focusedId)) setFocusedId(null);
  }, [focusedId, rowIndexById]);

  /* ------------------------------------------------------------------ render */

  const renderRow = useCallback((row: TreeRowMeta) => {
    const { node } = row;
    const showCheckbox = checkboxes && (node.selectable ?? true);
    const checkState = getCheckState(node, checkedSet, descendantMap[node.id], cascadeCheck);

    return (
      <TreeRow
        key={node.id}
        row={row}
        metrics={metrics}
        indent={indentWidth}
        colors={colors}
        isRTL={isRTL}
        selected={selectedSet.has(node.id)}
        focused={containerFocused && focusedId === node.id}
        loading={loadingIds.has(node.id)}
        checkState={checkState}
        showCheckbox={showCheckbox}
        showDisclosure={collapsible}
        showGuides={showGuides}
        striped={striped && row.index % 2 === 1}
        domId={web ? rowDomId(node.id) : undefined}
        filterQuery={filterQuery}
        multiSelectable={effectiveSelectionMode === 'multiple'}
        selectable={effectiveSelectionMode !== 'none'}
        rowStyle={rowStyle}
        renderLabel={renderLabel}
        renderEndSection={renderEndSection}
        highlight={highlight}
        onPress={handleRowPress}
        onToggle={handleDisclosureToggle}
        onCheck={handleCheck}
      />
    );
  }, [
    cascadeCheck,
    checkboxes,
    checkedSet,
    collapsible,
    colors,
    containerFocused,
    descendantMap,
    effectiveSelectionMode,
    filterQuery,
    focusedId,
    handleCheck,
    handleDisclosureToggle,
    handleRowPress,
    highlight,
    indentWidth,
    isRTL,
    loadingIds,
    metrics,
    renderEndSection,
    renderLabel,
    rowDomId,
    rowStyle,
    selectedSet,
    showGuides,
    striped,
  ]);

  // Animated rendering nests each branch inside a `Collapse`, so the DOM gains
  // the two generic wrappers `Collapse` needs to measure and clip. Rows keep
  // their `treeitem` roles and the wrapper this component owns is presentational;
  // the flat and virtualized paths emit the strictly-nested structure.
  const renderAnimated = useCallback((nodes: TreeRenderNode[]): React.ReactNode =>
    nodes.map(entry => (
      <View key={entry.row.node.id} {...(web ? { role: 'none' } : {})}>
        {renderRow(entry.row)}
        {entry.mounted && (
          <AnimatedBranch
            id={entry.row.node.id}
            expanded={entry.row.expanded}
            onCollapsed={dropCollapsed}
          >
            <View {...(web ? { role: 'group' } : {})}>{renderAnimated(entry.children)}</View>
          </AnimatedBranch>
        )}
      </View>
    )), [dropCollapsed, renderRow]);

  const spacingStyle = useMemo(
    () => getSpacingStyles(spacingProps, isRTL),
    [spacingProps, isRTL]
  );

  // RN Web forwards `role` / `aria-*` to the DOM; native RN ignores them, so the
  // web branch is cast rather than squeezed into RN's `Role` union.
  const containerProps = {
    ref: (instance: any) => {
      containerRef.current = instance;
      if (typeof ref === 'function') ref(instance);
      else if (ref) (ref as React.MutableRefObject<any>).current = instance;
    },
    style: [spacingStyle as any, style],
    ...((web
      ? {
          id: domId,
          role: 'tree',
          'aria-label': accessibilityLabel ?? 'Tree',
          ...(effectiveSelectionMode === 'multiple' ? { 'aria-multiselectable': true } : {}),
        }
      : { accessibilityLabel }) as any),
  } as any;

  if (!rows.length) {
    return (
      <View {...containerProps}>
        {noResultsFallback !== undefined ? (
          noResultsFallback
        ) : (
          <Text size="sm" colorVariant="secondary">
            No results
          </Text>
        )}
      </View>
    );
  }

  if (virtualized) {
    const FlashListComponent = resolveFlashList();
    return (
      <View {...containerProps}>
        <View style={{ height: height ?? 320 }}>
          {FlashListComponent ? (
            <FlashListComponent
              data={rows}
              keyExtractor={(row: TreeRowMeta) => row.node.id}
              renderItem={({ item }: { item: TreeRowMeta }) => renderRow(item)}
              // Required by FlashList v1, dropped in v2 — the peer range allows
              // both, so it goes through untyped.
              {...({ estimatedItemSize: metrics.rowHeight + 2 } as Record<string, unknown>)}
              extraData={{ selectedSet, checkedSet, focusedId, containerFocused }}
              showsVerticalScrollIndicator={web}
            />
          ) : (
            <ScrollView>{rows.map(renderRow)}</ScrollView>
          )}
        </View>
      </View>
    );
  }

  return (
    <View {...containerProps}>
      {useAnimations ? renderAnimated(renderNodes) : rows.map(renderRow)}
    </View>
  );
});

Tree.displayName = 'Tree';

export default Tree;
