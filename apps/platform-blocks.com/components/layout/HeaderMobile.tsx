import React from 'react';
import {
  Flex,
  IconButton,
  Image,
  Text,
  useAppShellApi,
  useTheme,
  useThemeMode,
} from '@platform-blocks/ui';
import { RouteLink } from '../RouteLink';

export interface DocsHeaderMobileProps {
  orientation: 'portrait' | 'landscape';
}

/**
 * Compact header variant tailored for mobile layouts. Shows a menu toggle,
 * brand identity, and theme switcher while keeping the footprint small.
 */
export const DocsHeaderMobile: React.FC<DocsHeaderMobileProps> = ({ orientation }) => {
  const { openNavbar } = useAppShellApi();
  const { mode, cycleMode } = useThemeMode();
  const theme = useTheme();

  const themeIcon = mode === 'light' ? 'sun' : mode === 'dark' ? 'moon' : 'contrast';

  return (
    <Flex
      direction="row"
      align="center"
      justify="space-between"
      px="md"
      style={{
        height: orientation === 'landscape' ? 60 : 56,
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.gray[0] : theme.colors.gray[0],
      }}
    >
      <IconButton
        icon="menu"
        variant="ghost"
        size="lg"
        accessibilityLabel="Open navigation menu"
        onPress={openNavbar}
      />

      {/* This is the header that static rendering emits — prerendering has no
          viewport width, so every prerendered page falls to the mobile shell.
          That makes this wordmark the only link home a crawler sees on a deep
          page, so it has to be a real anchor rather than a Pressable. */}
      <RouteLink
        href="/"
        accessibilityLabel="Go to docs home"
        style={{ flexDirection: 'row', alignItems: 'center' }}
      >
        <Image
          source={require('../../assets/favicon.png')}
          src="docs-mobile-header-logo"
          w={24}
          h={24}
          resizeMode="contain"
          style={{ marginRight: 8 }}
        />
        <Text size="lg" weight="semibold">
          Platform Blocks
        </Text>
      </RouteLink>

      <IconButton
        icon={themeIcon as any}
        iconVariant="filled"
        variant="ghost"
        size="lg"
        accessibilityLabel="Toggle theme mode"
        onPress={cycleMode}
      />
    </Flex>
  );
};
