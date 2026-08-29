import React from 'react';
import { View } from 'react-native';
import { Card, CodeBlock, Column, Divider, Link, Row, Text, Title } from '@platform-blocks/ui';
import { DocsPage } from '../../components/DocsPage';
import { DocsPageHeader } from '../../components/DocsPageHeader';
import {
  LLMS_ENTRY_FILES,
  LLMS_FRESHNESS_NOTE,
  LLMS_INTRO,
  LLMS_ON_PAGE_NOTE,
  LLMS_PAGE_FILES,
  LLMS_SKILLS_INTRO,
  LLMS_SKILLS_REPO_URL,
  LLMS_SKILLS_SNIPPET,
  LLMS_SKILLS_TITLE,
  LLMS_USAGE_SNIPPET,
  type LlmsFileEntry,
} from '../../config/llmsDocs';
import { useBrowserTitle, formatPageTitle } from 'hooks/useBrowserTitle';

/**
 * Concrete paths are rendered as links only when they resolve to a real file —
 * the per-page rows are patterns (`<Name>.md`), so linking them would 404.
 */
const FileRow: React.FC<{ entry: LlmsFileEntry }> = ({ entry }) => {
  const isPattern = entry.path.includes('<');
  const path = <Text variant="code">{entry.path}</Text>;

  return (
    <Row gap="md" wrap="wrap" align="center">
      <View style={{ minWidth: 240 }}>
        {isPattern ? path : (
          <Link href={entry.path} target="_blank" variant="hover-underline">{path}</Link>
        )}
      </View>
      <Text variant="small" color="secondary" style={{ flex: 1, minWidth: 220 }}>
        {entry.description}
      </Text>
    </Row>
  );
};

export default function LlmsScreen() {
  useBrowserTitle(formatPageTitle('LLM documentation'));

  const files = [...LLMS_ENTRY_FILES, ...LLMS_PAGE_FILES];

  return (
    <DocsPage>
      <Column gap="lg">
        <DocsPageHeader subtitle={LLMS_INTRO}>
          LLM documentation
        </DocsPageHeader>

        <Card variant="outline" p="md">
          <Column gap="sm">
            {files.map((entry, index) => (
              <React.Fragment key={entry.path}>
                {index > 0 ? <Divider /> : null}
                <FileRow entry={entry} />
              </React.Fragment>
            ))}
          </Column>
        </Card>

        <Column gap="sm">
          <Title order={2} size={22} weight="bold">Usage</Title>
          <CodeBlock variant="terminal" language="bash" fullWidth>
            {LLMS_USAGE_SNIPPET}
          </CodeBlock>
          <Text variant="small" color="secondary">{LLMS_ON_PAGE_NOTE}</Text>
        </Column>

        <Column gap="sm">
          <Title
            order={2}
            size={22}
            weight="bold"
            subtitle={LLMS_SKILLS_INTRO}
            subtitleProps={{ variant: 'small' }}
          >
            {LLMS_SKILLS_TITLE}
          </Title>
          <CodeBlock variant="terminal" language="bash" fullWidth>
            {LLMS_SKILLS_SNIPPET}
          </CodeBlock>
        </Column>

        <Text variant="small" color="secondary">
          {LLMS_FRESHNESS_NOTE} Format follows{' '}
          <Link href="https://llmstxt.org" target="_blank" variant="hover-underline">llmstxt.org</Link>
          {' '}• Skills:{' '}
          <Link href={LLMS_SKILLS_REPO_URL} target="_blank" variant="hover-underline">platform-blocks/skills</Link>
        </Text>
      </Column>
    </DocsPage>
  );
}
