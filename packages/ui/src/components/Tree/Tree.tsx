import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { ScrollView, View, type BlurEvent, type FocusEvent, type ViewStyle } from 'react-native';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { factory } from '../../core/factory/factory';
import { useLatestCallback } from '../../core/hooks/useLatestCallback';
import { hasDOM, isWeb } from '../../core/platform/flags';
import { webProps, type WebKeyboardEvent } from '../../core/platform/webProps';
import { webStyle } from '../../core/platform/webStyle';
import { useDirection } from '../../core/providers/DirectionProvider';
import { useTheme } from '../../core/theme/ThemeProvider';
import { surfaceInteractionTint } from '../../core/theme/surfaces';
import { resolveVariantRoles } from '../../core/theme/variantRoles';
import type { VisibilityProps } from '../../core/types/base';
import { useMergedRef } from '../../core/utils/mergeRefs';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import { useControllableState } from '../../hooks/useControllableState/useControllableState';
import { resolveOptionalModule } from '../../utils/optionalModule';
import { Collapse } from '../Collapse/Collapse';
import { Text } from '../Text/Text';

import { TreeRow, type TreeRowColors } from './TreeRow';
import {
  flushPersistedExpansion,
  readPersistedExpansion,
  schedulePersistedExpansion,
} from './treePersistence';
import { resolveTreeMetrics } from './treeSizes';
import {
  findNode,
  findNodeByHref,
  getCheckState,
  hasModifier,
  idRange,
  toggleCheckedIds,
} from './treeUtils';
import type {
  TreeNode,
  TreePressEvent,
  TreeProps,
  TreeRenderNode,
  TreeRow as TreeRowMeta,
} from './types';
import { useTreeState } from './useTreeState';

export type { TreeNode, TreeProps } from './types';

const TYPE_AHEAD_TIMEOUT = 800;

/** The slice of FlashList's API this component uses (v1 and v2). */
interface FlashListLikeProps {
  data: readonly TreeRowMeta[];
  keyExtractor: (row: TreeRowMeta) => string;
  renderItem: (info: { item: TreeRowMeta }) => React.ReactElement | null;
  /** Required by FlashList v1, ignored by v2 — the peer range allows both. */
  estimatedItemSize?: number;
  extraData?: unknown;
  showsVerticalScrollIndicator?: boolean;
}
type FlashListLike = React.ComponentType<FlashListLikeProps>;

/**
 * Only `virtualized` trees need FlashList, so it is resolved on demand rather
 * than imported at module scope — a tree that never virtualizes should not drag
 * the dependency into the bundle, or require it to be installed at all.
 */
const resolveFlashList = () =>
  resolveOptionalModule<FlashListLike>('@shopify/flash-list', {
    accessor: (mod: { FlashList?: FlashListLike } | null) => mod?.FlashList,
    devWarning:
      '@shopify/flash-list is not installed; <Tree virtualized> renders every row inside a ScrollView instead.',
  });

const keyExtractor = (row: TreeRowMeta) => row.node.id;

/** Animated rendering nests each branch in wrappers of its own; these keep them out of the tree semantics. */
const PRESENTATION_PROPS = isWeb ? a11yProps({ role: 'none' }) : null;
const GROUP_PROPS = isWeb ? a11yProps({ role: 'group' }) : null;

const STRETCH: ViewStyle = { alignSelf: 'stretch' };
/** A virtualized list must be bounded: the tree's height unless `h` / `style` set one. */
const VIRTUAL_HEIGHT: ViewStyle = { height: 320 };
const FILL: ViewStyle = { flex: 1 };
// The tree draws its own focus ring on the focused row (aria-activedescendant),
// so the container's outline would only frame the whole list twice.
const NO_OUTLINE = webStyle({ outlineStyle: 'none' });

const selectorSafe = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, '');

const TreeBase = factory<{ props: TreeProps; ref: View }>((props, ref) => {
  const { styleProps, otherProps } = extractStyleProps(props);
  const {
    data,
    onNavigate,
    onNodePress,
    collapsible = true,
    disclosure = 'always',
    size = 'md',
    indent,
    showGuides = false,
    accordion = false,
    expandAll = false,
    renderLabel,
    renderEndSection,
    style,
    testID,
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
    keyboardNavigation = true,
    activeId: activeIdProp,
    activeHref,
    expandToActive = true,
    scrollActiveIntoView = true,
    persistKey,
    selectionColor,
    accessibilityLabel,
  } = otherProps;

  const theme = useTheme();
  const { isRTL } = useDirection();
  const spacingStyle = useStyleProps(styleProps);
  const metrics = useMemo(() => resolveTreeMetrics(theme, size), [theme, size]);
  const indentWidth = indent ?? metrics.indent;

  const reactId = useId();
  const domId = `tree-${selectorSafe(reactId)}`;
  const rowDomId = useCallback((id: string) => `${domId}-row-${encodeURIComponent(id)}`, [domId]);

  const colors = useMemo<TreeRowColors>(() => {
    // The selected / active row is the shared `light` variant role — the same
    // fill, border and text a light Chip or Badge resolves — so the accent reads
    // identically wherever it appears, and the label is chosen by *measured*
    // contrast against the color the tint actually composites to.
    //
    // Reading a fixed palette index is what broke this in dark mode. The two
    // palettes mirror each other (light runs pale → deep, dark runs deep →
    // pale), so `primary[3]` is a pale blue in the light theme and a near-navy
    // in the dark one: the dark rail was painting #1E40AF text on a blue fill
    // over a near-black page, at roughly 1.5:1.
    const selection = resolveVariantRoles(theme, {
      variant: 'light',
      color: selectionColor ?? 'primary',
    });
    const label = theme.text.primary;
    return {
      selectedBg: selection.fill,
      hoverBg: surfaceInteractionTint(theme, 'hover'),
      pressedBg: surfaceInteractionTint(theme, 'pressed'),
      stripeBg: surfaceInteractionTint(theme, 'band'),
      selectedBorder: selection.border,
      focusRing: theme.states?.focusRing ?? selectionColor ?? theme.colors.primary[5],
      label,
      selectedLabel: selection.text || label,
      chevron: theme.text.secondary,
      disabled: theme.text.disabled,
      guide: surfaceInteractionTint(theme, 'selected'),
    };
  }, [selectionColor, theme]);

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

  // Branches the reader opened themselves — the only mounts that should
  // unroll. Everything else that mounts open is the tree arriving in that
  // shape: its initial `startOpen` state, the ancestors of the active row, the
  // branches a filter opened. Animating those replays the whole expansion on
  // every mount, and a tree inside an overlay mounts on every open.
  const openedByPress = useRef<Set<string>>(new Set());

  // Called from `setNodeExpanded` (an event-time callback), so it needs no
  // stable identity of its own.
  const handleToggle = (node: TreeNode, expanded: boolean) => {
    if (expanded) openedByPress.current.add(node.id);
    else openedByPress.current.delete(node.id);

    if (!expanded && useAnimations && !virtualized) {
      setCollapsingIds(prev => new Set(prev).add(node.id));
    } else if (expanded) {
      // Re-opening ends the exit animation early; without this the branch would
      // stay flagged as collapsing if `Collapse` never reported an end (content
      // that measured zero height, an unmount mid-animation).
      dropCollapsed(node.id);
    }
    onToggle?.(node, expanded);
  };

  // `activeHref` resolves against `data` alone: a lazily loaded node does not
  // exist to match until its branch has been opened, at which point the reader
  // is already there. Static nav trees — the case this exists for — are fully
  // present from the first render.
  const activeId = useMemo(() => {
    if (activeIdProp) return activeIdProp;
    if (!activeHref) return undefined;
    return findNodeByHref(data, activeHref)?.id;
  }, [activeHref, activeIdProp, data]);

  const expandToIds = useMemo(
    () => (activeId && expandToActive ? [activeId] : undefined),
    [activeId, expandToActive]
  );

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
    expandToIds,
  });

  const {
    rows,
    rowIds,
    rowIndexById,
    renderNodes,
    descendantMap,
    parentMap,
    loadingIds,
    loadedChildren,
    toggleNode,
    setNodeExpanded,
    setExpanded,
    expandedIds: expandedIdList,
  } = tree;

  /* ------------------------------------------------------------- persistence */

  // Restoring runs in an effect rather than in the state initializer, which is
  // what keeps it out of the hydration pass: the server has no localStorage, so
  // reading it during the first render would hand React two different trees.
  // Effects do not run while rendering to a string and run after hydration on
  // the client, so the markup matches and the stored expansion lands right
  // after.
  const persistenceEnabled = !!persistKey && expandedIds === undefined;
  const [persistRestored, setPersistRestored] = useState(false);

  useEffect(() => {
    if (!persistenceEnabled || !persistKey) return;
    const stored = readPersistedExpansion(persistKey);
    if (stored) setExpanded(stored);
    // Batched with the restore above, so the writer below never sees the
    // pre-restore list and clobbers what it was about to read back.
    setPersistRestored(true);
  }, [persistKey, persistenceEnabled, setExpanded]);

  useEffect(() => {
    if (!persistenceEnabled || !persistKey || !persistRestored) return;
    schedulePersistedExpansion(persistKey, expandedIdList);
  }, [expandedIdList, persistKey, persistRestored, persistenceEnabled]);

  // Land a debounced write on unmount (or a key change) instead of dropping it.
  useEffect(() => {
    if (!persistKey) return undefined;
    return () => flushPersistedExpansion(persistKey);
  }, [persistKey]);

  /* --------------------------------------------------------------- selection */

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
  const [focusedIdState, setFocusedId] = useState<string | null>(null);
  const [containerFocused, setContainerFocused] = useState(false);
  // A focused row that filtering or a collapse removed would otherwise keep the
  // ring pointing at something invisible. Derived, not synced in an effect.
  const focusedId = focusedIdState && rowIndexById.has(focusedIdState) ? focusedIdState : null;

  // A consumer that only asked for `onActiveNodeChange` still means "single".
  const effectiveSelectionMode =
    selectionMode === 'none' && onActiveNodeChange ? 'single' : selectionMode;

  // The selection helpers below close over this render's state and are only
  // called from event handlers, so they are plain functions.
  const setSelected = (ids: string[], node: TreeNode) => {
    commitSelected(ids, node);
    const primaryId = ids[0];
    const primaryNode = primaryId ? findNode(data, primaryId, loadedChildren) || null : null;
    onActiveNodeChange?.(primaryNode, ids);
  };

  const selectableIds = (ids: string[]) =>
    ids.filter(id => {
      const found = findNode(data, id, loadedChildren);
      return !!found && (found.selectable ?? true) && !found.disabled;
    });

  const applySelection = (node: TreeNode, event?: TreePressEvent) => {
    if (effectiveSelectionMode === 'none' || (node.selectable ?? true) === false) return;

    if (effectiveSelectionMode === 'single') {
      setSelected([node.id], node);
      anchorId.current = node.id;
      return;
    }

    const shiftKey = hasModifier(event, 'shiftKey');
    const modifierKey = hasModifier(event, 'metaKey') || hasModifier(event, 'ctrlKey');

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
  };

  // Row callbacks keep one identity for the life of the tree, so the memoized
  // rows only re-render when their own flags change.
  const handleRowPress = useLatestCallback((node: TreeNode, isBranch: boolean, event?: TreePressEvent) => {
    if (node.disabled) return;

    const intercept = onNodePress?.(node, { isBranch, event });
    if (intercept === false) return;

    setFocusedId(node.id);

    if (isBranch && expandOnClick && collapsible) {
      toggleNode(node);
    }

    applySelection(node, event);

    // Leaves activate, and any node carrying an href activates.
    if (node.href || !isBranch) onNavigate?.(node);
  });

  const handleCheck = useLatestCallback((node: TreeNode) => {
    if (node.disabled) return;
    setFocusedId(node.id);
    const next = toggleCheckedIds(node, effectiveChecked, descendantMap[node.id], cascadeCheck);
    commitChecked(next, node);
  });

  const handleDisclosureToggle = useLatestCallback((node: TreeNode) => {
    setFocusedId(node.id);
    toggleNode(node);
  });

  /* ---------------------------------------------------------------- keyboard */

  const keyboardEnabled = isWeb && keyboardNavigation !== false;
  const containerRef = useRef<View>(null);
  const mergedRef = useMergedRef(containerRef, ref);
  const typeAhead = useRef<{ buffer: string; at: number }>({ buffer: '', at: 0 });

  const handleKeyDown = (event: WebKeyboardEvent) => {
    if (!rows.length) return;

    // A row, caret or checkbox that a pointer focused. Hand focus back to the
    // tree, so the ring and `aria-activedescendant` follow the keys from here.
    // (Enter on such a control never gets here: its own press handles it.)
    if (event.target !== event.currentTarget) containerRef.current?.focus();

    const current = focusedId ? rowIndexById.get(focusedId) ?? -1 : -1;
    const focusIndex = (index: number) => {
      const clamped = Math.max(0, Math.min(rows.length - 1, index));
      const target = rows[clamped];
      setFocusedId(target.node.id);
      return target;
    };
    const row = current >= 0 ? rows[current] : null;
    // Arrow keys follow the reading direction, not the screen.
    const forwardKey = isRTL ? 'ArrowLeft' : 'ArrowRight';
    const backKey = isRTL ? 'ArrowRight' : 'ArrowLeft';

    const extendTo = (target: TreeRowMeta) => {
      if (effectiveSelectionMode !== 'multiple') return;
      const anchor = anchorId.current ?? row?.node.id ?? target.node.id;
      anchorId.current = anchor;
      setSelected(selectableIds(idRange(rowIds, anchor, target.node.id)), target.node);
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
        focusIndex(rows.length - 1);
        return;
      case forwardKey:
        event.preventDefault();
        if (!row) return;
        if (row.isBranch && !row.expanded && collapsible) setNodeExpanded(row.node, true);
        else if (row.isBranch && row.expanded) focusIndex(current + 1);
        return;
      case backKey: {
        event.preventDefault();
        if (!row) return;
        if (row.isBranch && row.expanded && collapsible) {
          setNodeExpanded(row.node, false);
          return;
        }
        const parentId = row.parentId ?? parentMap[row.node.id];
        const parentIndex = parentId ? rowIndexById.get(parentId) : undefined;
        if (parentIndex !== undefined) focusIndex(parentIndex);
        return;
      }
      case 'Enter':
        event.preventDefault();
        if (row) handleRowPress(row.node, row.isBranch, event);
        return;
      case ' ':
      case 'Spacebar':
        event.preventDefault();
        if (!row) return;
        if (checkboxes) handleCheck(row.node);
        else handleRowPress(row.node, row.isBranch, event);
        return;
      default:
        break;
    }

    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'a') {
      if (effectiveSelectionMode !== 'multiple') return;
      event.preventDefault();
      const all = selectableIds(rowIds);
      if (all.length) setSelected(all, rows[0].node);
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
    const total = rows.length;
    for (let step = 0; step < total; step += 1) {
      const candidate = rows[(start + step) % total];
      if (candidate.node.label.toLowerCase().startsWith(buffer)) {
        event.preventDefault();
        setFocusedId(candidate.node.id);
        return;
      }
    }
  };

  const handleFocus = (event: FocusEvent) => {
    // Focus landing on a row a pointer pressed is not the tree taking focus.
    if (event.target !== event.currentTarget) return;
    setContainerFocused(true);
    // WAI-ARIA tree pattern: on entry, focus the current / selected node, or
    // the first one — so the ring is visible from the first Tab.
    if (!focusedId) {
      const initial = [activeId, ...effectiveSelected].find(
        (id): id is string => !!id && rowIndexById.has(id)
      );
      setFocusedId(initial ?? rows[0]?.node.id ?? null);
    }
  };

  const handleBlur = (event: BlurEvent) => {
    if (event.target !== event.currentTarget) return;
    setContainerFocused(false);
  };

  // Keep the focused row on screen.
  useEffect(() => {
    if (!keyboardEnabled || !hasDOM || !focusedId) return;
    document.getElementById(rowDomId(focusedId))?.scrollIntoView?.({ block: 'nearest' });
  }, [focusedId, keyboardEnabled, rowDomId]);

  // Bring the active row on screen once it is actually rendered. The guard on
  // `rowIndexById` is what makes this wait for `expandToActive` to open the
  // branches above it — scrolling to a row still inside a collapsed branch
  // finds nothing, and the effect would not fire again.
  const scrolledToActive = useRef<string | null>(null);
  useEffect(() => {
    if (!hasDOM || !scrollActiveIntoView || !activeId) return;
    if (scrolledToActive.current === activeId) return;
    if (!rowIndexById.has(activeId)) return;
    scrolledToActive.current = activeId;
    document.getElementById(rowDomId(activeId))?.scrollIntoView?.({ block: 'nearest' });
  }, [activeId, rowDomId, rowIndexById, scrollActiveIntoView]);

  /* ------------------------------------------------------------------ render */

  // With nowhere to route a press, an `href` row stays a plain anchor and the
  // browser navigates — a tree handed links but no handler should still work as
  // links, rather than swallowing every click.
  const interceptLinks = !!onNavigate || !!onNodePress;
  const selectable = effectiveSelectionMode !== 'none';

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
        selected={selectedSet.has(node.id)}
        active={activeId === node.id}
        focused={containerFocused && focusedId === node.id}
        loading={loadingIds.has(node.id)}
        checkState={checkState}
        showCheckbox={showCheckbox}
        // `nested` leaves the outermost branches bare — a section heading with a
        // caret reads as a folder, and the column it costs is the indent every
        // row below it inherits.
        showDisclosure={
          collapsible && disclosure !== 'none' && !(disclosure === 'nested' && row.depth === 0)
        }
        reserveDisclosure={disclosure === 'always'}
        heading={disclosure === 'nested' && row.depth === 0 && row.isBranch}
        showGuides={showGuides}
        striped={striped && row.index % 2 === 1}
        domId={isWeb ? rowDomId(node.id) : undefined}
        filterQuery={filterQuery}
        selectable={selectable}
        keyboardNavigation={keyboardEnabled}
        interceptLinks={interceptLinks}
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
    activeId,
    cascadeCheck,
    checkboxes,
    checkedSet,
    collapsible,
    colors,
    containerFocused,
    descendantMap,
    disclosure,
    filterQuery,
    focusedId,
    handleCheck,
    handleDisclosureToggle,
    handleRowPress,
    highlight,
    indentWidth,
    interceptLinks,
    keyboardEnabled,
    loadingIds,
    metrics,
    renderEndSection,
    renderLabel,
    rowDomId,
    rowStyle,
    selectable,
    selectedSet,
    showGuides,
    striped,
  ]);

  // Animated rendering nests each branch inside a `Collapse`, so the DOM gains
  // the generic wrappers `Collapse` needs to measure and clip. Rows keep their
  // `treeitem` roles and the wrapper this component owns is presentational; the
  // flat and virtualized paths emit the strictly-nested structure.
  const renderAnimated = useCallback((nodes: TreeRenderNode[]): React.ReactNode =>
    nodes.map(entry => {
      const { row } = entry;
      const id = row.node.id;
      return (
        <View key={id} {...PRESENTATION_PROPS}>
          {renderRow(row)}
          {entry.mounted && (
            // Branches mount only while open (or while animating shut), so
            // `animateOnMount` is what plays the unroll — only for branches the
            // reader opened. Collapse reads its callbacks through a latest-ref
            // and only animates on a new target, so neither prop restarts it.
            <Collapse
              isCollapsed={!row.expanded}
              collapsedHeight={0}
              animateOnMount={openedByPress.current.has(id)}
              onAnimationEnd={row.expanded ? undefined : () => dropCollapsed(id)}
            >
              <View {...GROUP_PROPS}>{renderAnimated(entry.children)}</View>
            </Collapse>
          )}
        </View>
      );
    }), [dropCollapsed, renderRow]);

  const renderItem = useCallback(({ item }: { item: TreeRowMeta }) => renderRow(item), [renderRow]);
  const extraData = useMemo(
    () => ({ selectedSet, checkedSet, focusedId, containerFocused }),
    [checkedSet, containerFocused, focusedId, selectedSet]
  );

  const empty = rows.length === 0;
  const interactive = keyboardEnabled && !empty;

  const containerProps = {
    ref: mergedRef,
    testID,
    ...a11yProps({
      role: isWeb ? 'tree' : undefined,
      label: accessibilityLabel,
      id: isWeb ? domId : undefined,
      activeDescendant: interactive && focusedId ? rowDomId(focusedId) : undefined,
    }),
    // Web-only and tree-specific; react-native-web forwards any `aria-*`.
    ...(isWeb && effectiveSelectionMode === 'multiple' ? { 'aria-multiselectable': true } : null),
    ...webProps({
      tabIndex: interactive ? 0 : undefined,
      onKeyDown: interactive ? handleKeyDown : undefined,
    }),
    ...(interactive ? { onFocus: handleFocus, onBlur: handleBlur } : null),
  };

  if (empty) {
    return (
      <View {...containerProps} style={[spacingStyle, style]}>
        {noResultsFallback !== undefined ? (
          noResultsFallback
        ) : (
          <Text size="sm" c="secondary">
            No results
          </Text>
        )}
      </View>
    );
  }

  if (virtualized) {
    const FlashListComponent = resolveFlashList();
    return (
      // A virtualized list positions every row absolutely, so it contributes no
      // content width of its own. Under a parent that sizes its children to
      // their content — `alignItems: 'center'` is the usual one — the tree
      // collapsed to zero width and rendered as an empty box. Stretching the
      // container gives the list the definite width it measures rows against;
      // an explicit `style` from the caller still wins.
      <View {...containerProps} style={[VIRTUAL_HEIGHT, spacingStyle, STRETCH, NO_OUTLINE, style]}>
        <View style={FILL}>
          {FlashListComponent ? (
            <FlashListComponent
              data={rows}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              estimatedItemSize={metrics.rowHeight + 2}
              extraData={extraData}
              showsVerticalScrollIndicator={isWeb}
            />
          ) : (
            <ScrollView>{rows.map(renderRow)}</ScrollView>
          )}
        </View>
      </View>
    );
  }

  return (
    <View {...containerProps} style={[spacingStyle, NO_OUTLINE, style]}>
      {useAnimations ? renderAnimated(renderNodes) : rows.map(renderRow)}
    </View>
  );
}, { displayName: 'Tree' });

/**
 * A hierarchical list with expand/collapse, selection, checkboxes, filtering,
 * lazy loading and virtualization. Generic over the node payload: `T` is
 * inferred from `data` and flows into every callback.
 */
export const Tree = TreeBase as unknown as (<T = unknown>(
  props: TreeProps<T> & VisibilityProps & React.RefAttributes<View>
) => React.ReactElement | null) &
  Pick<typeof TreeBase, 'displayName' | 'withProps' | 'extend'>;

export default Tree;
