import { Linking } from 'react-native';
import { Text, BrandButton, Flex, Divider, Block, useI18n, Grid, GridItem, Link, Title, BrandIcon, Image, Space } from '@platform-blocks/ui';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';
import { DISCORD_INVITE, GITHUB_REPO, NPM_PACKAGE, TWITTER_PROFILE } from 'config/urls';
import { useResponsive } from '../../hooks/useResponsive';

export function FooterContent() {
  const { t } = useI18n();
  const router = useRouter();
  const responsive = useResponsive();

  const handleLinkPress = (href: string, isRoute: boolean = false) => {
    if (isRoute) router.push(href); else {
      if (Platform.OS === 'web') window.open(href, '_blank');
      else Linking.openURL(href).catch(err => console.error('Failed to open URL:', href, err));
    }
  };

  /**
   * Props for an internal footer link.
   *
   * The footer is the one navigation surface that survives static prerendering —
   * the sidebar and header nav are client-only — so these anchors are how a
   * crawler gets from any page to the rest of the site. `href` has to be a real
   * URL for that; `Link` calls `onPress` after `preventDefault()`, so left-clicks
   * still route client-side.
   */
  const routeLink = (href: string) => ({
    href,
    onPress: () => handleLinkPress(href, true),
  });

  return (
    <Block mt={64}>
      <Flex direction="column" gap="2xl" px={responsive.isMobile ? 12 : 28}>
        <Grid columns={12} gap={responsive.isMobile ? 'xs' : 'xl'} style={{ width: '100%', rowGap: responsive.isMobile ? 32 : 48 }}>
          <GridItem span={responsive.isMobile ? 12 : 6}>
            <Title
              startIcon={(
                <Image
                  source={require('../../assets/favicon.png')}
                  src="footer-logo"
                  w={26}
                  h={26}
                  resizeMode="contain"
                />
              )}
              size={36} weight="bold">{t('footer.app.title')}</Title>
            <Flex direction="column" gap="xs">

              <Text size="sm" colorVariant="secondary">{t('footer.app.tagline')}</Text>
              <Flex direction="row" align="center" gap="sm">
                <BrandButton title={t('actions.starOnGithub')} brand="github" variant="ghost" iconPosition="left" size="sm" onPress={() => handleLinkPress(GITHUB_REPO)} />
                {/* <BrandButton title={t('actions.followOnX')} brand="x" variant="ghost" iconPosition="left" size="xs" onPress={() => handleLinkPress(TWITTER_PROFILE)} /> */}
                <BrandButton title={t('actions.joinDiscord')} brand="discord" variant="ghost" iconPosition="left" size="xs" onPress={() => handleLinkPress(DISCORD_INVITE)} />
                <BrandButton title={t('actions.npm')} brand="npm" variant="ghost" iconPosition="left" size="xs" onPress={() => handleLinkPress(NPM_PACKAGE)} />
              </Flex>
            </Flex>
          </GridItem>

          {/* Quick Links */}
          <GridItem span={responsive.isMobile ? 4 : 2}>
            <Flex direction="column" gap="sm">
              <Text size="xs" weight="semibold" colorVariant="info" tracking={1} uppercase>Quick Links</Text>
              <Flex direction="column" gap="xs">
                <Link {...routeLink('/components')} variant="hover-underline" size="sm" color="gray">Components</Link>
                {/* Points at the dedicated /charts page, not a filtered /components view —
                    the charts index is its own indexable route with 25 detail pages under it. */}
                <Link {...routeLink('/charts')} variant="hover-underline" size="sm" color="gray">Charts</Link>
                <Link {...routeLink('/hooks')} variant="hover-underline" size="sm" color="gray">Hooks</Link>
              </Flex>
            </Flex>
          </GridItem>

          {/* Documentation */}
          <GridItem span={responsive.isMobile ? 4 : 2}>
            <Flex direction="column" gap="sm">
              <Text size="xs" weight="semibold" colorVariant="info" tracking={1} uppercase>Documentation</Text>
              <Flex direction="column" gap="xs">
                <Link {...routeLink('/getting-started')} variant="hover-underline" size="sm" color="gray">Getting Started</Link>
                <Link {...routeLink('/localization')} variant="hover-underline" size="sm" color="gray">Localization</Link>
                <Link href="/llms.txt" target="_blank" variant="hover-underline" size="sm" color="gray">llms.txt</Link>
              </Flex>
            </Flex>
          </GridItem>

          {/* Resources */}
          <GridItem span={responsive.isMobile ? 4 : 2}>
            <Flex direction="column" gap="sm">
              <Text size="xs" weight="semibold" colorVariant="info" tracking={1} uppercase>Resources</Text>
              <Flex direction="column" gap="xs">
                <Link {...routeLink('/faq')} variant="hover-underline" size="sm" color="gray">FAQ</Link>
                {/* Changelog and Sitemap leave the router: one is off-site, the other is a
                    static XML file. Both were previously handed to `router.push`, which
                    treated them as in-app routes and landed on the not-found screen. */}
                <Link href={`${GITHUB_REPO}/releases`} target="_blank" variant="hover-underline" size="sm" color="gray">Changelog</Link>
                <Link {...routeLink('/accessibility')} variant="hover-underline" size="sm" color="gray">Accessibility</Link>
                <Link href="/sitemap.xml" target="_blank" variant="hover-underline" size="sm" color="gray">Sitemap</Link>
              </Flex>
            </Flex>
          </GridItem>
        </Grid>
      </Flex>
    </Block>
  );
}
