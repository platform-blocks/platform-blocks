import React from 'react';
import { Flex, Text, Breadcrumbs, Image, Search, Row, KeyCap } from '@platform-blocks/ui';
import { HeaderThemeToggle } from './ToggleTheme';
import { ToggleDirection } from './ToggleDirection';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';
import { RouteLink } from '../RouteLink';

export const AppHeader: React.FC = () => {
  const breadcrumbs = useBreadcrumbs();

  // CMD+K shortcut component
  const shortcutComponent = (
    <Row gap={4} align="center">
      <KeyCap>⌘</KeyCap>
      <KeyCap>K</KeyCap>
    </Row>
  );

  return (
    <>
      {/* Fills the bar the shell sized. The height varies by viewport, which a
          prerender cannot resolve — the shell publishes it as a CSS variable. */}
      <Flex direction="row" justify="space-between" align="center" px="md" style={{ height: '100%' }}>
        <Flex direction="row" align="center" gap="md">
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
