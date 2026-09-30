import React, { useCallback } from 'react';
import { Pressable, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { factory } from '../../core/factory/factory';
import { isWeb } from '../../core/platform/flags';
import { webStyle } from '../../core/platform/webStyle';
import { shellChrome } from '../../core/theme/cssVariableTheme';
import { resolveSurface } from '../../core/theme/surfaces';
import { useTheme } from '../../core/theme/ThemeProvider';
import { onColor, resolveShadow, type ShadowToken } from '../../core/theme/tokens';
import type { PlocksTheme } from '../../core/theme/types';
import { getZIndex } from '../../core/theme/zIndices';
import { useStyleProps } from '../../core/utils/spacing';
import { Text } from '../Text';
import { useAppShellInternal } from './AppShellContext';
import type { BottomAppBarProps, BottomAppBarItem } from './types';

const ROW: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'stretch',
  justifyContent: 'space-between',
  minHeight: 56,
  paddingHorizontal: 4,
};
const ITEM: ViewStyle = { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 6 };
const ICON_WRAP: ViewStyle = { position: 'relative', alignItems: 'center', justifyContent: 'center' };
const ICON: ViewStyle = { padding: 6, borderRadius: 20, overflow: 'hidden' };
const FAB: ViewStyle = { position: 'absolute', top: -32, alignSelf: 'center' };
// Web: stick to the bottom of the shell's scroll container; native: pin to the bottom edge.
const POSITION: ViewStyle[] = [
  { bottom: 0, start: 0, end: 0 },
  isWeb ? webStyle({ position: 'sticky' }) : { position: 'absolute' },
];

/** Android-style elevation (0–24) → the theme's shadow scale. */
const elevationToShadow = (elevation: number): ShadowToken => {
  if (elevation <= 0) return 'none';
  if (elevation <= 1) return 'xs';
  if (elevation <= 2) return 'sm';
  if (elevation <= 4) return 'md';
  if (elevation <= 8) return 'lg';
  return 'xl';
};

const getVariantStyles = (
  variant: BottomAppBarProps['variant'],
  theme: PlocksTheme,
  elevation: number | undefined
): ViewStyle | ViewStyle[] => {
  const chrome = shellChrome(theme);

  switch (variant) {
    case 'surface':
      // App chrome resting on the page — level 1.
      return { backgroundColor: resolveSurface(theme, 1).background };
    case 'elevated':
      // Lifted above content, so it takes the floating step.
      return [{ backgroundColor: resolveSurface(theme, 2).background }, resolveShadow(theme, elevationToShadow(elevation ?? 4))];
    case 'translucent':
      return isWeb
        ? [{ backgroundColor: chrome.veil }, webStyle({ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' })]
        : { backgroundColor: chrome.veilStrong };
    case 'solid':
    default:
      // Continuous with the page — level 0.
      return { backgroundColor: resolveSurface(theme, 0).background };
  }
};

const ItemBadge: React.FC<{ count?: number; theme: PlocksTheme }> = ({ count, theme }) => {
  if (!count || count < 0) return null;
  const limited = count > 99 ? '99+' : String(count);
  const background = theme.colors.error[5];
  return (
    <View
      // The count is part of the item's accessible name; the badge is visual only.
      aria-hidden
      style={{
        position: 'absolute',
        top: -4,
        end: -10,
        backgroundColor: background,
        paddingHorizontal: 6,
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text size="xs" style={{ color: onColor(theme, background), fontSize: 11, lineHeight: 14, fontWeight: '600' }}>
        {limited}
      </Text>
    </View>
  );
};

interface NavItemProps {
  item: BottomAppBarItem;
  active: boolean;
  showLabel: boolean;
  theme: PlocksTheme;
  onSelect: (item: BottomAppBarItem) => void;
}

const NavItem = React.memo(function NavItem({ item, active, showLabel, theme, onSelect }: NavItemProps) {
  const color = active ? theme.colors.primary[5] : theme.text.secondary;
  const handlePress = useCallback(() => onSelect(item), [onSelect, item]);
  const name = item.badgeCount && item.badgeCount > 0 ? `${item.label}, ${item.badgeCount}` : item.label;
  return (
    <Pressable
      {...a11yProps({ role: 'button', label: name, current: active ? 'page' : undefined })}
      onPress={handlePress}
      style={({ pressed }) => [ITEM, { opacity: pressed ? 0.65 : 1 }]}
    >
      <View style={ICON_WRAP}>
        <View
          aria-hidden
          style={[ICON, { backgroundColor: active ? shellChrome(theme).navActive : 'transparent' }]}
        >
          {active && item.activeIcon ? item.activeIcon : item.icon}
        </View>
        <ItemBadge count={item.badgeCount} theme={theme} />
      </View>
      {showLabel && (
        <Text size="xs" style={{ marginTop: 2, fontSize: 10, color, textAlign: 'center' }}>
          {item.label}
        </Text>
      )}
    </Pressable>
  );
});

/**
 * A ready-made bottom navigation bar — a `navigation` landmark of items with
 * icons, labels and badges; the active item is marked `aria-current="page"`.
 */
export const BottomAppBar = factory<{ props: BottomAppBarProps; ref: View }>(
  function BottomAppBar(props, ref) {
    const {
      children,
      items,
      activeKey,
      onItemPress,
      showLabels = true,
      variant = 'solid',
      elevation,
      fab,
      withBorder = true,
      zIndex,
      style,
      accessibilityLabel,
      testID,
    } = props;
    const theme = useTheme();
    const spacingStyles = useStyleProps(props);
    const internal = useAppShellInternal();

    const handleSelect = useCallback(
      (item: BottomAppBarItem) => {
        item.onPress?.();
        onItemPress?.(item.key);
      },
      [onItemPress]
    );

    return (
      <SafeAreaView
        ref={ref}
        testID={testID}
        edges={['bottom']}
        role="navigation"
        aria-label={accessibilityLabel}
        style={[
          getVariantStyles(variant, theme, elevation),
          {
            borderTopWidth: withBorder ? 1 : 0,
            borderTopColor: shellChrome(theme).border,
            zIndex: zIndex ?? internal?.zIndices.bottomNav ?? getZIndex(theme, 'sticky'),
          },
          POSITION,
          spacingStyles,
          style,
        ]}
      >
        <View style={ROW}>
          {items && items.length > 0
            ? items.map((it) => (
                <NavItem
                  key={it.key}
                  item={it}
                  theme={theme}
                  active={it.key === activeKey}
                  showLabel={showLabels}
                  onSelect={handleSelect}
                />
              ))
            : children}
        </View>
        {fab && <View style={FAB}>{fab}</View>}
      </SafeAreaView>
    );
  },
  { displayName: 'BottomAppBar' }
);
