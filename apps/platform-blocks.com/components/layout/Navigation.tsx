import React, { useCallback } from 'react';
import { Platform, ScrollView } from 'react-native';
import { usePathname } from 'expo-router';
import {
  Block,
  Text,
  useTheme,
  useHover,
  useAppShellLayout,
  useNavbarHover,
  Divider,
  resolveVariantRoles,
  withAlpha,
} from '@platform-blocks/ui';
import { NAV_SECTIONS, type NavItem, isRouteActive } from '../../config/navigationConfig';
import { NavigationSection } from './NavigationSection';
import { RouteLink } from '../RouteLink';

interface NavRowProps {
  item: NavItem;
  active: boolean;
}

/**
 * A single expanded-sidebar row.
 *
 * Colors resolve through `resolveVariantRoles` rather than raw palette indexes:
 * palettes invert between light and dark, so a hardcoded `primary[0]` fill reads
 * as a pale wash in one scheme and a heavy slab in the other. The `light` role
 * tints with alpha over the live surface, so active state stays consistent.
 */
const NavRow: React.FC<NavRowProps> = ({ item, active }) => {
  const theme = useTheme();
  const [hovered, hoverHandlers] = useHover();

  const activeRoles = resolveVariantRoles(theme, { variant: 'light', color: 'primary' });
  // Hover on an inactive row is a neutral wash, not a primary tint — reserving the
  // accent color for the active route keeps "where I am" readable at a glance.
  // `withAlpha` returns non-hex input untouched, which would paint an opaque bar,
  // so fall back to the theme's subtle surface if the tint didn't take.
  const neutralTint = withAlpha(theme.text.primary, theme.colorScheme === 'dark' ? 0.08 : 0.05);
  const hoverFill = neutralTint === theme.text.primary ? theme.backgrounds.subtle : neutralTint;

  const background = active ? activeRoles.fill : hovered ? hoverFill : 'transparent';
  // Inactive rows keep full-contrast text — these are primary navigation targets,
  // not supporting copy. Hover reads off the background wash instead of a color shift.
  const textColor = active ? activeRoles.text : theme.text.primary;

  return (
    // A sidebar entry is a navigation target, so it renders as an anchor rather
    // than a Pressable — that restores middle-click and cmd-click, and leaves a
    // followable href behind if this rail is ever prerendered.
    <RouteLink
      href={item.route}
      accessibilityLabel={item.label}
      onHoverIn={hoverHandlers.onHoverIn}
      onHoverOut={hoverHandlers.onHoverOut}
    >
      <Block
        direction="row"
        align="center"
        radius="lg"
        py={7}
        px={8}
        bg={background}
        style={
          Platform.OS === 'web'
            ? ({ transition: 'background-color 120ms ease, color 120ms ease' } as any)
            : undefined
        }
      >
        <Text
          size="sm"
          weight={active ? '600' : '400'}
          style={{ color: textColor }}
          numberOfLines={1}
        >
          {item.label}
        </Text>
      </Block>
    </RouteLink>
  );
};

export const AppNavigation: React.FC = () => {
  const { navbarWidth } = useAppShellLayout();
  const hovering = useNavbarHover?.() || false;
  const pathname = usePathname();
  const coerceNumber = (v: any, fallback: number): number =>
    typeof v === 'number' ? v : typeof v === 'string' && v.endsWith('px') ? parseFloat(v) : fallback;
  const rail = coerceNumber(navbarWidth as any, 72) <= 72;
  const railCollapsed = rail && !hovering;
  const showLabels = !railCollapsed;
  const paddingHorizontal = railCollapsed ? 0 : (rail ? 8 : 12);
  const paddingVertical = rail ? 8 : 12;

  const renderItem = useCallback((item: NavItem) => (
    <NavRow
      key={item.route}
      item={item}
      active={isRouteActive(pathname, item.route)}
    />
  ), [pathname]);

  return (
    <Block fluid h="full" w="full" px={paddingHorizontal} py={paddingVertical}>
      <ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={{ flexGrow: 1, paddingBottom: 16 }} showsVerticalScrollIndicator={Platform.OS !== 'web'}>
        <Block w="full" align={railCollapsed ? 'center' : undefined}>
          {showLabels ? (
            // Expanded: a flat, always-visible list grouped into separator sections
            // (no collapse/expand — every route is one scroll away).
            NAV_SECTIONS.map((section, sectionIndex) => (
              <Block key={section.section} w="full" mb={8}>
                {sectionIndex > 0 && <Divider style={{ marginTop: 4, marginBottom: 12 }} />}
                <Text
                  size="xs"
                  weight="semibold"
                  colorVariant="info"
                  tracking={1}
                  uppercase
                  style={{ marginBottom: 6, paddingHorizontal: 8 }}
                >
                  {section.section}
                </Text>
                <Block w="full" gap={2}>
                  {section.items.map(renderItem)}
                </Block>
              </Block>
            ))
          ) : (
            NAV_SECTIONS.map(section => (
              <NavigationSection
                key={section.section}
                section={section}
                variant="rail"
                railCollapsed
                showSectionTitle={false}
              />
            ))
          )}
        </Block>
      </ScrollView>
    </Block>
  );
};
