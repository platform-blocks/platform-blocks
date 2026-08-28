import React, { useCallback, useMemo, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';

// NOTE: Direct component/theme imports to break circular dependency with barrel index.ts
import { Tree } from '../Tree/Tree';
import { resolveTreeMetrics } from '../Tree/treeSizes';
import { Highlight } from '../Highlight';
import { Search } from '../Search';
import { useTheme } from '../../core/theme';
import { withAlpha } from '../../core/theme/colorUtils';
import { surfaceInteractionTint } from '../../core/theme/surfaces';
import { useHover } from '../../hooks/useHover';

import { buildNavTree } from './buildNavTree';
import type { NavTreeItem, NavTreeProps } from './types';
import type { TreeNode } from '../Tree/types';

const web = Platform.OS === 'web';

/** First href at or below this node, in display order. */
const firstHref = (node: TreeNode<NavTreeItem>): string | undefined => {
  if (node.href) return node.href;
  for (const child of node.children ?? []) {
    const found = firstHref(child);
    if (found) return found;
  }
  return undefined;
};

const containsHref = (node: TreeNode<NavTreeItem>, href: string): boolean => {
  if (node.href === href) return true;
  return (node.children ?? []).some(child => containsHref(child, href));
};

interface RailRowProps {
  node: TreeNode<NavTreeItem>;
  active: boolean;
  href?: string;
  size: number;
  intercept: boolean;
  onPress: (node: TreeNode<NavTreeItem>) => void;
}

/**
 * One icon in the collapsed rail. Kept a link for the same reasons the tree
 * rows are — the rail is still navigation, and a reader who cmd-clicks it means
 * the same thing there as anywhere else.
 */
const RailRow: React.FC<RailRowProps> = ({ node, active, href, size, intercept, onPress }) => {
  const theme = useTheme() as any;
  const [hovered, hoverHandlers] = useHover();
  const accent = theme?.colors?.primary?.[5] || '#2684FF';
  const linked = web && !!href;

  const handlePress = (event: any) => {
    if (linked && intercept) {
      if (event?.metaKey || event?.ctrlKey || event?.shiftKey || event?.altKey) return;
      event?.preventDefault?.();
    }
    onPress(node);
  };

  return (
    <Pressable
      onPress={handlePress}
      {...hoverHandlers}
      accessibilityRole={href ? 'link' : 'button'}
      accessibilityLabel={node.label}
      accessibilityState={{ selected: active }}
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: Math.round(size / 4),
        backgroundColor: active
          ? withAlpha(accent, theme?.colorScheme === 'dark' ? 0.28 : 0.14)
          : hovered
            ? surfaceInteractionTint(theme, 'hover')
            : 'transparent',
      }}
      {...(web
        ? {
            ...(linked ? { href } : {}),
            ...(active ? { 'aria-current': 'page' as const } : {}),
          }
        : {})}
    >
      {node.icon ?? null}
    </Pressable>
  );
};

/**
 * A sidebar that nests itself.
 *
 * Hand it the flat list of routes an app already has — with a category on each
 * — and it groups, orders, and renders them as a tree: the branches above the
 * current page open on their own, the row for that page is marked and scrolled
 * to, and which branches are open survives a reload. Rows are real links on
 * web, so cmd-click, middle-click and crawlers work.
 *
 * Everything past `items` has a default that suits a docs sidebar, so the
 * one-prop version is the intended way to use it:
 *
 * ```tsx
 * <NavTree items={ROUTES} activeHref={pathname} onNavigate={i => router.push(i.href)} />
 * ```
 */
export const NavTree: React.FC<NavTreeProps> = ({
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
  accessibilityLabel = 'Navigation',
  ...treeProps
}) => {
  const data = useMemo(
    () => buildNavTree(items, { groupOrder, groupIcons, sortLeaves, openDepth, openGroups, getGroupNode }),
    [items, groupOrder, groupIcons, sortLeaves, openDepth, openGroups, getGroupNode]
  );

  const handleNavigate = useCallback(
    (node: TreeNode<NavTreeItem>) => {
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
    },
    [onNavigate]
  );

  const metrics = useMemo(() => resolveTreeMetrics(size), [size]);

  // Uncontrolled unless `filterQuery` is supplied, matching the rest of the
  // library's controlled/uncontrolled split.
  const [ownQuery, setOwnQuery] = useState('');
  const query = filterQuery ?? ownQuery;

  const highlightLabel = useCallback(
    (label: string, match: string) => <Highlight highlight={match}>{label}</Highlight>,
    []
  );

  if (collapsed) {
    const railSize = metrics.rowHeight + metrics.paddingHorizontal * 2;
    return (
      <View
        style={[{ alignItems: 'center', gap: metrics.gap }, style]}
        {...(web
          ? ({ role: 'navigation', 'aria-label': accessibilityLabel } as any)
          : { accessibilityLabel })}
      >
        {data.map(node => (
          <RailRow
            key={node.id}
            node={node}
            active={!!activeHref && containsHref(node, activeHref)}
            href={firstHref(node)}
            size={railSize}
            intercept={!!onNavigate}
            onPress={handleNavigate}
          />
        ))}
      </View>
    );
  }

  const tree = (
    <Tree
      {...treeProps}
      data={data}
      size={size}
      style={searchable ? undefined : style}
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
    <View style={[{ gap: metrics.gap * 2 }, style]}>
      <Search
        value={query}
        onChange={filterQuery === undefined ? setOwnQuery : undefined}
        placeholder={searchPlaceholder}
        size={size === 'xs' || size === 'sm' ? 'sm' : 'md'}
        clearButton
        accessibilityLabel={`Filter ${accessibilityLabel.toLowerCase()}`}
      />
      {tree}
    </View>
  );
};

NavTree.displayName = 'NavTree';

export default NavTree;
