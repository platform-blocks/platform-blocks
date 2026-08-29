import React from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import {
  CodeBlock,
  Column,
  DataList,
  TableOfContents,
  Text,
  Title,
} from '@platform-blocks/ui';
import { BREAKPOINTS } from '@platform-blocks/ui/core/responsive';
import { DocsPage } from '../../components/DocsPage';
import { DocsPageHeader } from '../../components/DocsPageHeader';
import { Prose } from '../../components/Prose';
import {
  CONTRIBUTE_INTRO,
  CONTRIBUTE_OUTRO,
  CONTRIBUTE_REPO_LAYOUT,
  CONTRIBUTE_SECTIONS,
  CONTRIBUTE_SUBTITLE,
  CONTRIBUTE_TITLE,
} from '../../config/contribute';
import { useBrowserTitle, formatPageTitle } from 'hooks/useBrowserTitle';

/** The DOM node the TOC scans, and the scroll container its links jump within. */
const TOC_CONTAINER_ID = 'main-content-contribute';

/**
 * Only the section headings are `<h2>`, so the rail lists sections rather than
 * every heading on the page. Module-level so the object identity is stable —
 * useScrollSpy re-collects whenever its options change.
 */
const TOC_SCROLL_SPY = { selector: 'h2' };

/**
 * Bulleted or numbered list of inline-markdown strings. The marker sits outside
 * the <Prose> so a wrapped line indents under the text, not under the bullet.
 */
const ProseList: React.FC<{ items: string[]; ordered?: boolean }> = ({ items, ordered }) => (
  <Column gap="xs">
    {items.map((item, index) => (
      <View key={item} style={styles.listRow}>
        <Text variant="p" color="secondary" style={styles.marker}>
          {ordered ? `${index + 1}.` : '•'}
        </Text>
        <View style={styles.listBody}>
          <Prose>{item}</Prose>
        </View>
      </View>
    ))}
  </Column>
);

export default function ContributeScreen() {
  useBrowserTitle(formatPageTitle('Contributing'));

  const { width } = useWindowDimensions();
  // The rail is a DOM scan under `position: sticky`, and neither has a native
  // equivalent. Below the desktop breakpoint the 280px column would eat the
  // prose, so the page falls back to a single column — same rule as
  // /getting-started.
  const showToc = Platform.OS === 'web' && width >= BREAKPOINTS.lg;

  return (
    <DocsPage id={TOC_CONTAINER_ID}>
      <View style={styles.pageRow}>
        <Column gap="xl" style={styles.contentColumn}>
          <DocsPageHeader subtitle={CONTRIBUTE_SUBTITLE}>
            {CONTRIBUTE_TITLE}
          </DocsPageHeader>

          <Prose>{CONTRIBUTE_INTRO}</Prose>

          <Column gap="md">
            <Title order={2} size={28} weight="bold">Repo layout</Title>
            <DataList orientation="horizontal" size="sm" labelWidth={220} withDivider>
              {CONTRIBUTE_REPO_LAYOUT.map(({ path, description }) => (
                <DataList.Item key={path}>
                  <DataList.ItemLabel>
                    <Text variant="code">{path}</Text>
                  </DataList.ItemLabel>
                  {/* Outside DataList.ItemValue: the description carries inline
                      markdown, and <Prose> renders its own paragraph <Text>. */}
                  <View style={styles.layoutValue}>
                    <Prose variant="small">{description}</Prose>
                  </View>
                </DataList.Item>
              ))}
            </DataList>
          </Column>

          {CONTRIBUTE_SECTIONS.map(({ key, title, lead, items, ordered, snippets, note }) => (
            <Column key={key} gap="md">
              <Title order={2} size={28} weight="bold">{title}</Title>
              <Prose>{lead}</Prose>
              {items ? <ProseList items={items} ordered={ordered} /> : null}
              {snippets?.map(snippet => (
                <Column key={snippet.code} gap="sm">
                  {snippet.lead ? <Prose>{snippet.lead}</Prose> : null}
                  <CodeBlock
                    language={snippet.language ?? 'bash'}
                    files={snippet.fileName ? [{ name: snippet.fileName }] : undefined}
                    fullWidth
                  >
                    {snippet.code}
                  </CodeBlock>
                </Column>
              ))}
              {note ? <Prose variant="small">{note}</Prose> : null}
            </Column>
          ))}

          <Prose>{CONTRIBUTE_OUTRO}</Prose>
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
  listRow: {
    flexDirection: 'row',
    gap: 8,
  },
  // Fixed box so the text of every row starts at the same x, one digit or two.
  marker: {
    width: 20,
  },
  listBody: {
    flex: 1,
    minWidth: 0,
  },
  layoutValue: {
    flex: 1,
    minWidth: 0,
  },
  sidebar: {
    width: 280,
    flexShrink: 0,
  },
  // Sticks to the PageLayout ScrollView, the nearest scrolling ancestor.
  stickyToc: {
    position: 'sticky' as any,
    top: 20,
    overflow: 'auto' as any,
    gap: 16,
  },
});
