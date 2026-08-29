import React, { useCallback, useMemo } from 'react';
import { Platform, ScrollView } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import {
  Block,
  Icon,
  NavTree,
  useAppShellLayout,
  useNavbarHover,
  type NavTreeItem,
} from '@platform-blocks/ui';
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
        showsVerticalScrollIndicator={Platform.OS !== 'web'}
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
            // Sections read as headings rather than folders: no caret on the
            // top level, and no row holding its column open, so the whole tree
            // sits flush left. Pressing a section still opens it.
            disclosure="nested"
            // Everything closed but `Overview`, which is short and is where a first
            // visit starts. Ten rows at rest against the hundred and forty a
            // flat list showed, and `activeHref` opens the branch you are in.
            openDepth={0}
            openGroups={DEFAULT_OPEN_GROUPS}
            // Which branches the reader left open is theirs to keep; the rail
            // is rebuilt on every reload otherwise.
            persistKey="docs-sidebar"
            // Spotlight still owns cross-site search; this only narrows the
            // rail, which is the thing you want while reading one section.
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
