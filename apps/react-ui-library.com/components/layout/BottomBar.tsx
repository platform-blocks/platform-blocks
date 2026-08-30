import React from 'react';
import { Platform } from 'react-native';
import { usePathname, router } from 'expo-router';
import { AppShell, useTheme, useAppShellApi } from '@platform-blocks/react-ui-library';
import { BOTTOM_NAV_ITEMS } from '../../config/navigationConfig';
import { Icon } from '@platform-blocks/react-ui-library';

export const MobileBottomBar: React.FC = () => {
  const theme = useTheme();
  const pathname = usePathname();
  const { openNavbar } = useAppShellApi();
  
  // Stable press handlers and color tokens
  const pushTo = React.useCallback((route: string) => router.push(route), []);
  const gray6 = `${theme.colors.gray[6]}`;
  const primary6 = `${theme.colors.primary[6]}`;

  // Precompute base items once; only colors/handlers are stable refs
  const baseItems = React.useMemo(() => BOTTOM_NAV_ITEMS.map(item => ({
    key: item.route,
    label: item.label,
    iconName: item.icon as any,
    route: item.route
  })), []);

  const items = React.useMemo(() => {
    const mapped = baseItems.map(it => ({
      key: it.key,
      label: it.label,
      icon: <Icon name={it.iconName} size={22} color={gray6} />,
      activeIcon: <Icon name={it.iconName} size={22} color={primary6} />,
      onPress: () => pushTo(it.route)
    }));
    mapped.push({
      key: '__menu',
      label: 'Menu',
      icon: <Icon name="menu" size={22} color={gray6} />,
      activeIcon: <Icon name="menu" size={22} color={primary6} />,
      onPress: openNavbar
    } as any);
    return mapped as any[];
  }, [baseItems, gray6, primary6, pushTo, openNavbar]);

  const activeKey = React.useMemo(() => {
    const match = baseItems.find(i => pathname === i.key || (i.key !== '/' && pathname.startsWith(i.key as string)));
    return match?.key;
  }, [baseItems, pathname]);
  
  if (Platform.OS === 'web') return null;
  
  return <AppShell.BottomAppBar items={items} activeKey={activeKey} variant="solid" showLabels />;
};
