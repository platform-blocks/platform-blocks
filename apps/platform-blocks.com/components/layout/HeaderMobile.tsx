import React from 'react';
import { Flex, IconButton, useAppShellApi, useTheme } from '@platform-blocks/ui';
import { BrandLink } from './BrandLink';
import { MobileThemeToggle } from './ToggleTheme';

/**
 * Compact header variant tailored for mobile layouts. Shows a menu toggle,
 * brand identity, and theme switcher while keeping the footprint small.
 *
 * It fills the bar the shell sized rather than sizing itself: the height is one
 * of the values a prerender cannot resolve, so the shell publishes it as a CSS
 * variable and everything inside just fills it. Measuring the viewport here
 * instead is what made the static page disagree with the hydrated one.
 */
export const DocsHeaderMobile: React.FC = () => {
  const { openNavbar } = useAppShellApi();
  const theme = useTheme();

  return (
    <Flex
      direction="row"
      align="center"
      justify="space-between"
      px="md"
      style={{
        height: '100%',
        // The page backdrop, not a palette step: `backgrounds.base` resolves
        // through a CSS variable, so the prerendered header follows the reader's
        // scheme instead of freezing on whichever theme rendered the static HTML.
        backgroundColor: theme.backgrounds.base,
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
          page. */}
      <BrandLink />

      <MobileThemeToggle />
    </Flex>
  );
};
