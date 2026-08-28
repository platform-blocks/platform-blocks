import React, { useCallback } from 'react';
import { usePathname, useRouter } from 'expo-router';
import { Icon, NavTree, type NavTreeItem } from '@platform-blocks/ui';
import {
  NAV_GROUP_ICONS,
  NAV_GROUP_ORDER,
  NAV_TREE_ITEMS,
  SECTION_ROUTES,
  type NavItem,
} from '../../config/navigationConfig';

/** Matches the desktop rail: only the short section starts open. */
const DEFAULT_OPEN_GROUPS = ['Docs'];

/**
 * Branches get an icon, leaves do not — the same split the desktop rail makes.
 * A column of icons beside every component name is noise; a handful marking
 * where the sections start is what makes a long drawer scannable.
 */
const GROUP_ICONS = Object.fromEntries(
  Object.entries(NAV_GROUP_ICONS).map(([label, icon]) => [
    label,
    <Icon key={label} name={icon} size={18} />,
  ])
);

export interface MobileNavigationProps {
  onItemPress?: () => void;
}

/**
 * The drawer's navigation, rendered by the same component as the desktop
 * sidebar. It used to be a second, divergent implementation — buttons pushed
 * through the router where the sidebar used anchors, a different active tint,
 * and no nesting — which meant every change to the rail had to be made twice
 * and only ever got made once.
 */
export const MobileNavigation: React.FC<MobileNavigationProps> = React.memo(({ onItemPress }) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigate = useCallback(
    (item: NavTreeItem<NavItem>) => {
      router.push(item.href as never);
      onItemPress?.();
    },
    [onItemPress, router]
  );

  const getGroupNode = useCallback(
    ({ label, depth }: { label: string; depth: number }) =>
      depth === 0 && SECTION_ROUTES[label] ? { href: SECTION_ROUTES[label] } : {},
    []
  );

  return (
    <NavTree
      items={NAV_TREE_ITEMS}
      activeHref={pathname}
      onNavigate={handleNavigate}
      groupIcons={GROUP_ICONS}
      groupOrder={NAV_GROUP_ORDER}
      getGroupNode={getGroupNode}
      openDepth={0}
      openGroups={DEFAULT_OPEN_GROUPS}
      // A drawer is taller than it is wide and closes on every press, so rows
      // get the roomier density and start from scratch each time it opens.
      size="md"
      searchable
      searchPlaceholder="Filter docs…"
      accessibilityLabel="Documentation"
    />
  );
});

MobileNavigation.displayName = 'MobileNavigation';
