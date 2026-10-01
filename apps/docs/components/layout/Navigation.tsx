import React, { useCallback, useMemo } from 'react';
import { ScrollView } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import {
  useDeviceInfo,
  Block,
  Icon,
  NavTree,
  useAppShellLayout,
  useNavbarHover,
  type NavTreeItem,
} from '@plocks/ui';
import {
  NAV_GROUP_ICONS,
  NAV_GROUP_ORDER,
  NAV_TREE_ITEMS,
  SECTION_ROUTES,
  type NavItem,
} from '../../config/navigationConfig';

/** Open on a first visit: short, and where the reading order starts. */
const DEFAULT_OPEN_GROUPS = ['Overview'];

export const AppNavigation: React.FC = () => {
  const { platform: { isNative } } = useDeviceInfo();
  const { navbarWidth } = useAppShellLayout();
  const hovering = useNavbarHover?.() || false;
  const pathname = usePathname();
  const router = useRouter();

  const coerceNumber = (v: any, fallback: number): number =>
    typeof v === 'number' ? v : typeof v === 'string' && v.endsWith('px') ? parseFloat(v) : fallback;
  const rail = coerceNumber(navbarWidth as any, 72) <= 72;
  const railCollapsed = rail && !hovering;

  // Icons are the collapsed rail's only content, so the branch icons exist for
  // it alone — expanded, a section is a word and the glyph beside it is
  // decoration that pushes every row right.
  const railIcons = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(NAV_GROUP_ICONS).map(([label, icon]) => [
          label,
          <Icon key={label} name={icon} size={16} />,
        ])
      ),
    []
  );

  // Section branches double as links to their own index page, so pressing
  // `Components` opens the branch and lands on the listing in one go.
  const getGroupNode = useCallback(
    ({ label, depth }: { label: string; depth: number }) =>
      depth === 0 && SECTION_ROUTES[label] ? { href: SECTION_ROUTES[label] } : {},
    []
  );

  const handleNavigate = useCallback(
    (item: NavTreeItem<NavItem>) => {
      router.push(item.href as never);
    },
    [router]
  );

  const paddingHorizontal = railCollapsed ? 0 : (rail ? 8 : 12);
  const paddingVertical = rail ? 8 : 12;

  return (
    <Block fluid h="full" w="full" px={paddingHorizontal} py={paddingVertical}>
      <ScrollView
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 16 }}
        showsVerticalScrollIndicator={isNative}
      >
        <Block w="full" align={railCollapsed ? 'center' : undefined}>
          <NavTree
            items={NAV_TREE_ITEMS}
            activeHref={pathname}
            onNavigate={handleNavigate}
            collapsed={railCollapsed}
            groupIcons={railCollapsed ? railIcons : undefined}
            groupOrder={NAV_GROUP_ORDER}
            getGroupNode={getGroupNode}
            disclosure="nested"
            openDepth={0}
            openGroups={DEFAULT_OPEN_GROUPS}
            persistKey="docs-sidebar"
            searchable
            searchPlaceholder="Filter docs…"
            accessibilityLabel="Documentation"
            style={{ width: '100%' }}
          />
        </Block>
      </ScrollView>
    </Block>
  );
};
