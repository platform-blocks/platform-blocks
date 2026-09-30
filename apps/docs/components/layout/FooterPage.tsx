import { Linking, View } from 'react-native';
import { Text, Flex, Block, useI18n, Grid, GridItem, Link, IconButton } from '@plocks/ui';
import { BrandIcon } from '@plocks/brands';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';
import { DISCORD_INVITE, GITHUB_REPO, NPM_PACKAGE, TWITTER_PROFILE } from 'config/urls';
import { LLMS_SKILLS_REPO_URL } from '../../config/llmsDocs';
import { useResponsive } from '../../hooks/useResponsive';
import { PlocksLogo } from './PlocksLogo';

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
          <GridItem span={responsive.isMobile ? 12 : 4}>
            <View role="heading" aria-level={2} aria-label={t('footer.app.title')} style={{ marginBottom: 12 }}>
              <PlocksLogo size={48} />
            </View>
            <Flex direction="column" gap="xs">

              <Text size="sm" c="secondary">{t('footer.app.tagline')}</Text>
              <Flex direction="row" align="center" gap="sm" wrap="wrap">
                <IconButton icon={<BrandIcon brand="github" size="sm" />} variant="ghost" size="sm" accessibilityLabel={t('actions.starOnGithub')} tooltip={t('actions.starOnGithub')} onPress={() => handleLinkPress(GITHUB_REPO)} />
                <IconButton icon={<BrandIcon brand="x" size="sm" />} variant="ghost" size="sm" accessibilityLabel={t('actions.followOnX')} tooltip={t('actions.followOnX')} onPress={() => handleLinkPress(TWITTER_PROFILE)} />
                <IconButton icon={<BrandIcon brand="discord" size="sm" />} variant="ghost" size="sm" accessibilityLabel={t('actions.joinDiscord')} tooltip={t('actions.joinDiscord')} onPress={() => handleLinkPress(DISCORD_INVITE)} />
                <IconButton icon={<BrandIcon brand="npm" size="sm" />} variant="ghost" size="sm" accessibilityLabel={t('actions.npm')} tooltip={t('actions.npm')} onPress={() => handleLinkPress(NPM_PACKAGE)} />
              </Flex>
            </Flex>
          </GridItem>

          {/* Quick Links */}
          <GridItem span={responsive.isMobile ? 6 : 2}>
            <Flex direction="column" gap="sm">
              <Text size="xs" fw="semibold" c="info" lts={1} tt="uppercase">Quick Links</Text>
              <Flex direction="column" gap="xs">
                <Link {...routeLink('/components')} variant="hover-underline" size="sm" c="gray">Components</Link>
                {/* Points at the dedicated /charts page, not a filtered /components view —
                    the charts index is its own indexable route with 25 detail pages under it. */}
                <Link {...routeLink('/charts')} variant="hover-underline" size="sm" c="gray">Charts</Link>
                <Link {...routeLink('/hooks')} variant="hover-underline" size="sm" c="gray">Hooks</Link>
                <Link {...routeLink('/extensions')} variant="hover-underline" size="sm" c="gray">Add-ons & extensions</Link>
              </Flex>
            </Flex>
          </GridItem>

          {/* Docs */}
          <GridItem span={responsive.isMobile ? 6 : 2}>
            <Flex direction="column" gap="sm">
              <Text size="xs" fw="semibold" c="info" lts={1} tt="uppercase">Docs</Text>
              <Flex direction="column" gap="xs">
                <Link {...routeLink('/getting-started')} variant="hover-underline" size="sm" c="gray">Getting Started</Link>
                <Link {...routeLink('/examples')} variant="hover-underline" size="sm" c="gray">Examples</Link>
                <Link {...routeLink('/localization')} variant="hover-underline" size="sm" c="gray">Localization</Link>
                <Link {...routeLink('/accessibility')} variant="hover-underline" size="sm" c="gray">Accessibility</Link>
              </Flex>
            </Flex>
          </GridItem>

          {/* Agents */}
          <GridItem span={responsive.isMobile ? 6 : 2}>
            <Flex direction="column" gap="sm">
              <Text size="xs" fw="semibold" c="info" lts={1} tt="uppercase">Agents</Text>
              <Flex direction="column" gap="xs">
                <Link href="/llms.txt" target="_blank" variant="hover-underline" size="sm" c="gray">llms.txt</Link>
                <Link href={LLMS_SKILLS_REPO_URL} target="_blank" variant="hover-underline" size="sm" c="gray">Skills</Link>
                <Link href="/sitemap.xml" target="_blank" variant="hover-underline" size="sm" c="gray">Sitemap</Link>
              </Flex>
            </Flex>
          </GridItem>

          {/* Resources */}
          <GridItem span={responsive.isMobile ? 6 : 2}>
            <Flex direction="column" gap="sm">
              <Text size="xs" fw="semibold" c="info" lts={1} tt="uppercase">Resources</Text>
              <Flex direction="column" gap="xs">
                <Link {...routeLink('/faq')} variant="hover-underline" size="sm" c="gray">FAQ</Link>
                <Link href={`${GITHUB_REPO}/releases`} target="_blank" variant="hover-underline" size="sm" c="gray">Changelog</Link>
                <Link {...routeLink('/contribute')} variant="hover-underline" size="sm" c="gray">Contributing</Link>
              </Flex>
            </Flex>
          </GridItem>
        </Grid>
      </Flex>
    </Block>
  );
}
