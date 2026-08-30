import React from 'react';
import { Platform, ScrollView, StyleSheet } from 'react-native';
import {
  Dialog,
  Flex,
  IconButton,
  useAppShell,
  useAppShellApi,
  useTheme,
} from '@platform-blocks/react-ui-library';
import { BrandLink } from './BrandLink';
import { MobileThemeToggle } from './ToggleTheme';
import { MobileNavigation } from './MobileNavigation';

/**
 * The phone-sized stand-in for the desktop rail: a full-screen drawer holding
 * the same navigation tree.
 *
 * Its bar is a copy of the header it opens over, down to the height and the
 * theme toggle, with the menu button swapped for a close button in the same
 * spot — so nothing moves when the drawer opens and the way out is under the
 * thumb that opened it.
 */
export const MobileNavbar: React.FC = () => {
  const theme = useTheme();
  const { isMobile, navbarOpen, headerHeightStyle } = useAppShell();
  const { closeNavbar } = useAppShellApi();

  if (!isMobile) {
    return null;
  }

  return (
    <Dialog
      visible={navbarOpen}
      onClose={closeNavbar}
      variant="fullscreen"
      closable
      backdrop
      backdropClosable
      // Deliberately untitled. Dialog's own header can only hold a string, and
      // it paints itself from the surface the dialog was built with — so the
      // title bar arrived without the brand mark and, in dark mode, a step
      // lighter than the list below it. The bar below is that header, drawn
      // where it can carry the logo and share one fill with the drawer.
    >
      <Flex direction="column" style={{ flex: 1, width: '100%' }}>
        <Flex
          direction="row"
          align="center"
          justify="space-between"
          px="md"
          style={{
            width: '100%',
            // The same height the header behind it has, taken from the shell so
            // the drawer's bar lands exactly where the one it covers was.
            height: headerHeightStyle as any,
            // A hairline, not a filled band: the bar and the list are one
            // surface, and the rule is only there to catch rows scrolling
            // under it.
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: theme.backgrounds.border,
          }}
        >
          <IconButton
            icon="x"
            variant="ghost"
            size="lg"
            accessibilityLabel="Close navigation menu"
            onPress={closeNavbar}
          />

          <BrandLink onNavigate={closeNavbar} />

          {/* The header's toggle is underneath the drawer. Repeating it keeps
              the theme reachable while the menu is open, and balances the bar
              so the brand sits centred against the close button. */}
          <MobileThemeToggle />
        </Flex>

        <ScrollView
          style={{ flex: 1, width: '100%' }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16 }}
          showsVerticalScrollIndicator={Platform.OS !== 'web'}
        >
          <MobileNavigation onItemPress={closeNavbar} />
        </ScrollView>
      </Flex>
    </Dialog>
  );
};
