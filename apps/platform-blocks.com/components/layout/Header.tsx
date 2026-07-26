import React, { useState } from 'react';
import { Flex, Text, Breadcrumbs, Image, useAppShell, Search, Row, KeyCap } from '@platform-blocks/ui';
import { HeaderThemeToggle } from './ToggleTheme';
import { ToggleDirection } from './ToggleDirection';
import { NavIconButton } from './NavIconButton';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';
import { RouteLink } from '../RouteLink';

export const AppHeader: React.FC = () => {
  const { headerHeight, isMobile } = useAppShell();
  const breadcrumbs = useBreadcrumbs();
  const [navSidebarOpen, setNavSidebarOpen] = useState(false);

  // CMD+K shortcut component
  const shortcutComponent = (
    <Row gap={4} align="center">
      <KeyCap>⌘</KeyCap>
      <KeyCap>K</KeyCap>
    </Row>
  );

  return (
    <>
      <Flex direction="row" justify="space-between" align="center" px="md" style={{ height: typeof headerHeight === 'number' ? headerHeight : 60 }}>
        <Flex direction="row" align="center" gap="md">
          {isMobile && (
            <NavIconButton
              icon="menu"
              onPress={() => setNavSidebarOpen(!navSidebarOpen)}
              accessibilityLabel="Toggle navigation menu"
            />
          )}
          {/* The wordmark is the site-wide link home, so it has to be a real anchor:
              the header is prerendered on every route, making this the one link to
              the homepage a crawler sees from a deep page. */}
          <RouteLink href="/" accessibilityLabel="Platform Blocks home">
            <Flex direction="row" align="center" gap="sm">
              <Image
                source={require('../../assets/favicon.png')}
                src="app-shell-logo"
                w={26}
                h={26}
                resizeMode="contain"
              />
              <Text size="xl" weight="bold">
                Platform Blocks
              </Text>
            </Flex>
          </RouteLink>
         <Breadcrumbs
            items={breadcrumbs}
            size="xs"
            maxItems={4}
          />
        </Flex>

        <Flex direction="row" gap="sm" align="center">

          <Search
            buttonMode={true}
            placeholder="Search"
            rightComponent={shortcutComponent}
          />
          <ToggleDirection />
          <HeaderThemeToggle />
        </Flex>
      </Flex>

    </>
  );
};
