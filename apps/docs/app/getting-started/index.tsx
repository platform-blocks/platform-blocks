import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { DocsPage } from '../../components/DocsPage';
import {
  useDeviceInfo,
  useBreakpoint,
  Button,
  Column,
  Flex,
  TableOfContents,
  Text,
  Title,
} from '@plocks/ui';
import { CodeBlock } from '@plocks/code';
import { DocsPageHeader } from '../../components/DocsPageHeader';
import { PrerequisitesList } from '../../components/PrerequisitesList';
import { Prose } from '../../components/Prose';
import { TemplatesList } from '../../components/TemplatesList';
import {
  GETTING_STARTED_STEPS,
  GETTING_STARTED_SUBTITLE,
} from '../../config/gettingStarted';
import {
  TEMPLATES_COMMUNITY_INVITE,
  TEMPLATES_GUIDANCE,
  TEMPLATES_CREATE_COMMAND,
  TEMPLATES_SUBTITLE,
  TEMPLATES_TITLE,
} from '../../config/templates';
import { GITHUB_REPO } from '../../config/urls';
import { useBrowserTitle, formatPageTitle } from 'hooks/useBrowserTitle';

/** The DOM node the TOC scans, and the scroll container its links jump within. */
const TOC_CONTAINER_ID = 'main-content-getting-started';

/**
 * Section headings on this page are the only `<h2>`s in the column — the
 * template cards title themselves with `Text variant="h3"/"h4"`, which
 * render as real headings too. Narrowing the scroll-spy selector keeps the
 * rail to actual sections instead of listing every card on the page.
 *
 * Module-level so the object identity is stable: useScrollSpy re-collects
 * whenever its options change, and a literal would rebuild it every render.
 */
const TOC_SCROLL_SPY = { selector: 'h2' };

export default function GettingStartedScreen() {
  useBrowserTitle(formatPageTitle('Getting Started'));

  const { platform: { isWeb } } = useDeviceInfo();
  const breakpoint = useBreakpoint();
  // Web-only: the rail is a DOM scan under `position: sticky`, and neither has
  // a native equivalent. Below the desktop breakpoint the 280px column would
  // eat the prose, so the page falls back to a single column.
  const showToc = isWeb && (breakpoint === 'lg' || breakpoint === 'xl');

  return (
    <DocsPage id={TOC_CONTAINER_ID}>
      {/* Prose on the left, sticky TOC on the right. The page column and its
          inset still come from DocsPage, the same geometry component detail
          pages use — this row only splits what is inside it. */}
      <View style={styles.pageRow}>
        <Column gap="xl" style={styles.contentColumn}>
          <DocsPageHeader
            subtitle={GETTING_STARTED_SUBTITLE}
          >
            Getting Started
          </DocsPageHeader>

          <Column gap="md">
            {/* An h2 like every other section on the page — the outline ran
                h1 -> h4 -> h2 before, which skipped a level and left this
                section out of the TOC. `size`/`lh` reproduce the h4
                metrics exactly, so only the tag changed. */}
            <Title order={2} size={20} lh={28} fw="bold">Prerequisites</Title>
            <PrerequisitesList />
          </Column>

          {GETTING_STARTED_STEPS.map(({ title, lead, code, fileName, language, variant, note }) => (
            <Column key={title} gap="md">
              <Title order={2} size={28} fw="bold">{title}</Title>
              {/* Prose, not Text: steps carry inline markdown so the config can
                  hold a link without pulling JSX into a module Node imports. */}
              <Prose>{lead}</Prose>
              <CodeBlock
                // variant={variant}
                // files={fileName ? [{ name: fileName }] : undefined}
                language={'bash'}
                fullWidth
              >
                {code}
              </CodeBlock>
              {note ? <Prose variant="small">{note}</Prose> : null}
            </Column>
          ))}

          <Column gap="md">
            <Title
              order={2}
              size={28}
              fw="bold"
              subtitle={TEMPLATES_SUBTITLE}
              subtitleProps={{ variant: 'p' }}
            >
              {TEMPLATES_TITLE}
            </Title>

            <Prose>{TEMPLATES_GUIDANCE}</Prose>
            <CodeBlock language="bash" fullWidth>
              {TEMPLATES_CREATE_COMMAND}
            </CodeBlock>

            <TemplatesList />

            <Flex direction="row" align="center" gap="sm" wrap="wrap">
              <Text variant="small" c="secondary">{TEMPLATES_COMMUNITY_INVITE}</Text>
              <Button
                title="Share your starter"
                variant="subtle"
                size="sm"
                onPress={() => router.push(`${GITHUB_REPO}/issues/new?template=community_template.yml`)}
              />
            </Flex>
          </Column>
        </Column>

        {showToc && (
          <View style={styles.sidebar}>
            <View style={styles.stickyToc}>
              <TableOfContents
                container={`#${TOC_CONTAINER_ID}`}
                variant="ghost"
                size="sm"
                scrollSpyOptions={TOC_SCROLL_SPY}
              />
            </View>
          </View>
        )}
      </View>
    </DocsPage>
  );
}

const styles = StyleSheet.create({
  pageRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 24,
  },
  contentColumn: {
    flex: 1,
    minWidth: 0, // Prevents flex item from overflowing
  },
  sidebar: {
    width: 280,
    flexShrink: 0,
  },
  // Sticks to the PageLayout ScrollView, the nearest scrolling ancestor — the
  // same rail geometry as the component detail pages.
  stickyToc: {
    position: 'sticky' as any,
    top: 20,
    overflow: 'auto' as any,
    gap: 16,
  },
});
