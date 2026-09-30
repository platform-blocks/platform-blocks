import React, { useCallback, useMemo } from 'react';
import { Pressable, View, type GestureResponderEvent, type ViewStyle } from 'react-native';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { factory } from '../../core/factory/factory';
import { useLatestCallback } from '../../core/hooks/useLatestCallback';
import { isWeb } from '../../core/platform/flags';
import { webProps } from '../../core/platform/webProps';
import { useTheme } from '../../core/theme/ThemeProvider';
import { surfaceInteractionTint } from '../../core/theme/surfaces';
import { resolveVariantRoles } from '../../core/theme/variantRoles';
import type { VisibilityProps } from '../../core/types/base';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import { useControllableState } from '../../hooks/useControllableState/useControllableState';
import { useHover } from '../../hooks/useHover/useHover';
import { Highlight } from '../Highlight/Highlight';
import { Search } from '../Search/Search';
import { Tree } from '../Tree/Tree';
import { resolveTreeMetrics } from '../Tree/treeSizes';
import { hasModifier } from '../Tree/treeUtils';
import type { TreeNode } from '../Tree/types';

import { buildNavTree } from './buildNavTree';
import type { NavTreeItem, NavTreeProps } from './types';

/** Rows in the unknown-payload shape the implementation works with; the public type is generic. */
type NavNode = TreeNode<NavTreeItem>;

/** First href at or below this node, in display order. */
const firstHref = (node: NavNode): string | undefined => {
  if (node.href) return node.href;
  for (const child of node.children ?? []) {
    const found = firstHref(child);
    if (found) return found;
  }
  return undefined;
};

const containsHref = (node: NavNode, href: string): boolean => {
  if (node.href === href) return true;
  return (node.children ?? []).some(child => containsHref(child, href));
};

interface RailRowProps {
  node: NavNode;
  active: boolean;
  href?: string;
  size: number;
  intercept: boolean;
  activeBg: string;
  hoverBg: string;
  onPress: (node: NavNode) => void;
}

/**
 * One icon in the collapsed rail. Kept a link for the same reasons the tree
 * rows are — the rail is still navigation, and a reader who cmd-clicks it means
 * the same thing there as anywhere else.
 */
const RailRow = React.memo(function RailRow({
  node,
  active,
  href,
  size,
  intercept,
  activeBg,
  hoverBg,
  onPress,
}: RailRowProps) {
  const [hovered, { onHoverIn, onHoverOut }] = useHover();
  const linked = isWeb && !!href;

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      if (linked && intercept) {
        if (
          hasModifier(event, 'metaKey') ||
          hasModifier(event, 'ctrlKey') ||
          hasModifier(event, 'shiftKey') ||
          hasModifier(event, 'altKey')
        ) {
          return;
        }
        event?.preventDefault?.();
      }
      onPress(node);
    },
    [intercept, linked, node, onPress]
  );

  return (
    <Pressable
      onPress={handlePress}
      onHoverIn={onHoverIn}
      onHoverOut={onHoverOut}
      {...a11yProps({
        role: href ? 'link' : 'button',
        label: node.label,
        // Web: "you are here" is `aria-current`; native has no such state, so
        // the rail row reads as selected there.
        current: active ? 'page' : undefined,
        selected: isWeb ? undefined : active,
      })}
      {...webProps({ href: linked ? href : undefined })}
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: Math.round(size / 4),
        backgroundColor: active ? activeBg : hovered ? hoverBg : 'transparent',
      }}
    >
      {node.icon ?? null}
    </Pressable>
  );
});

const NavTreeBase = factory<{ props: NavTreeProps; ref: View }>((props, ref) => {
  const { styleProps, otherProps } = extractStyleProps(props);
  const {
    items,
    activeHref,
    onNavigate,
    size = 'sm',
    collapsed = false,
    searchable = false,
    searchPlaceholder = 'Filter…',
    highlightMatches = true,
    filterQuery,
    highlight,
    groupOrder,
    groupIcons,
    sortLeaves,
    openDepth,
    openGroups,
    getGroupNode,
    style,
    testID,
    accessibilityLabel = 'Navigation',
    ...treeProps
  } = otherProps;

  const theme = useTheme();
  const spacingStyle = useStyleProps(styleProps);

  const data = useMemo(
    () => buildNavTree(items, { groupOrder, groupIcons, sortLeaves, openDepth, openGroups, getGroupNode }),
    [items, groupOrder, groupIcons, sortLeaves, openDepth, openGroups, getGroupNode]
  );

  // Stable identity (reads the latest `onNavigate`), so an inline handler
  // doesn't re-render every memoized rail row / tree row.
  const handleNavigate = useLatestCallback((node: NavNode) => {
    if (!onNavigate) return;
    // A group has no page of its own, so pressing one in the rail lands on
    // the first thing inside it rather than going nowhere. `getGroupNode` can
    // give a group a real `href` when it does have an index page.
    const item = node.data;
    if (item) {
      onNavigate(item, node);
      return;
    }
    const href = firstHref(node);
    if (href) onNavigate({ label: node.label, href }, node);
  });

  const metrics = useMemo(() => resolveTreeMetrics(theme, size), [theme, size]);

  // Uncontrolled unless `filterQuery` is supplied, matching the rest of the
  // library's controlled/uncontrolled split.
  const [query, setQuery] = useControllableState<string>({ value: filterQuery, finalValue: '' });

  const highlightLabel = useCallback(
    (label: string, match: string) => <Highlight highlight={match}>{label}</Highlight>,
    []
  );

  const railColors = useMemo(
    () => ({
      // Same `light` variant role the tree paints its active row with.
      activeBg: resolveVariantRoles(theme, { variant: 'light', color: treeProps.selectionColor ?? 'primary' }).fill,
      hoverBg: surfaceInteractionTint(theme, 'hover'),
    }),
    [theme, treeProps.selectionColor]
  );

  if (collapsed) {
    const railSize = metrics.rowHeight + metrics.paddingHorizontal * 2;
    const railStyle: ViewStyle = { alignItems: 'center', gap: metrics.gap };
    return (
      <View
        ref={ref}
        testID={testID}
        style={[spacingStyle, railStyle, style]}
        {...a11yProps({ role: 'navigation', label: accessibilityLabel })}
      >
        {data.map(node => (
          <RailRow
            key={node.id}
            node={node}
            active={!!activeHref && containsHref(node, activeHref)}
            href={firstHref(node)}
            size={railSize}
            intercept={!!onNavigate}
            activeBg={railColors.activeBg}
            hoverBg={railColors.hoverBg}
            onPress={handleNavigate}
          />
        ))}
      </View>
    );
  }

  const tree = (
    <Tree
      {...treeProps}
      ref={searchable ? undefined : ref}
      testID={searchable ? undefined : testID}
      data={data}
      size={size}
      style={searchable ? undefined : [spacingStyle, style]}
      filterQuery={query}
      highlight={highlight ?? (highlightMatches ? highlightLabel : undefined)}
      activeHref={activeHref}
      onNavigate={onNavigate ? handleNavigate : undefined}
      accessibilityLabel={accessibilityLabel}
      // A nav tree marks where you are through `activeHref`; a second, separate
      // "picked" state on the same rows would only compete with it.
      selectionMode="none"
      expandOnClick
    />
  );

  if (!searchable) return tree;

  return (
    <View ref={ref} testID={testID} style={[spacingStyle, { gap: metrics.gap * 2 }, style]}>
      <Search
        value={query}
        onChangeText={setQuery}
        placeholder={searchPlaceholder}
        size={size === 'xs' || size === 'sm' ? 'sm' : 'md'}
        clearButton
        accessibilityLabel={`Filter ${accessibilityLabel.toLowerCase()}`}
      />
      {tree}
    </View>
  );
}, { displayName: 'NavTree' });

/**
 * A sidebar that nests itself.
 *
 * Hand it the flat list of routes an app already has — with a category on each
 * — and it groups, orders, and renders them as a tree: the branches above the
 * current page open on their own, the row for that page is marked
 * (`aria-current="page"`) and scrolled to, and which branches are open survives
 * a reload. Rows are real links on web, so cmd-click, middle-click and
 * crawlers work.
 *
 * Everything past `items` has a default that suits a docs sidebar, so the
 * one-prop version is the intended way to use it:
 *
 * ```tsx
 * <NavTree items={ROUTES} activeHref={pathname} onNavigate={i => router.push(i.href)} />
 * ```
 *
 * Generic over each item's `data` payload, inferred from `items`. The ref
 * reaches the root view (the rail, the search wrapper, or the tree itself).
 */
export const NavTree = NavTreeBase as unknown as (<T = unknown>(
  props: NavTreeProps<T> & VisibilityProps & React.RefAttributes<View>
) => React.ReactElement | null) &
  Pick<typeof NavTreeBase, 'displayName' | 'withProps' | 'extend'>;

export default NavTree;
