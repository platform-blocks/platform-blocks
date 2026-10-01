import React from 'react';
import { usePathname } from 'expo-router';
import { Flex, Text, Breadcrumbs, Search, Row, KeyCap, IconButton } from '@plocks/ui';
import { Linking } from 'react-native';
import { spotlight } from '@plocks/spotlight';
import { HeaderThemeToggle } from './ToggleTheme';
import { ToggleDirection } from './ToggleDirection';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';
import { RouteLink } from '../RouteLink';
import { PlocksLogo } from './PlocksLogo';
import { GITHUB_REPO } from '../../config/urls';
import { GithubIcon } from '../GithubIcon';

export const AppHeader: React.FC = () => {
  const breadcrumbs = useBreadcrumbs();
  const pathname = usePathname();
  const isHome = pathname === '/';

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
        <Flex direction="row" align="center" gap="md" style={{ flex: 1, minWidth: 0 }}>
          {/* The wordmark is the site-wide link home, so it has to be a real anchor:
              the header is prerendered on every route, making this the one link to
              the homepage a crawler sees from a deep page. */}
          <RouteLink href="/" accessibilityLabel="plocks home">
            <PlocksLogo size={34} />
          </RouteLink>
          {isHome ? (
            <Flex direction="row" gap="lg" align="center">
              {[
                ['Docs', '/getting-started'],
                ['Components', '/components'],
                ['Charts', '/charts'],
                ['Hooks', '/hooks'],
                ['Examples', '/examples'],
              ].map(([label, href]) => (
                <RouteLink key={href} href={href}>
                  <Text size="sm" c="secondary" fw="medium">{label}</Text>
                </RouteLink>
              ))}
            </Flex>
          ) : (
            <Breadcrumbs
              items={breadcrumbs}
              size="xs"
              maxItems={4}
            />
          )}
        </Flex>

        <IconButton
          icon={<GithubIcon />}
          variant="ghost"
          size="md"
          accessibilityLabel="View plocks on GitHub"
          tooltip="View plocks on GitHub"
          onPress={() => Linking.openURL(GITHUB_REPO)}
        />

        <Flex direction="row" gap="sm" align="center" justify="flex-end" style={{ flex: 1, minWidth: 0 }}>

          <Search
            buttonMode={true}
            onPress={() => spotlight.open()}
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
