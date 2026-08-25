import React from 'react';
import { Alert, Card, CodeBlock, Column, Link, Text, Title } from '@platform-blocks/ui';
import { DocsPage } from '../../components/DocsPage';
import { DocsPageHeader } from '../../components/DocsPageHeader';
import {
  LLMS_ENTRY_FILES,
  LLMS_FRESHNESS_NOTE,
  LLMS_FULL_URL,
  LLMS_INDEX_URL,
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

  return (
    <Card variant="outline" p="md">
      <Column gap="xs">
        {isPattern ? (
          <Text variant="code">{entry.path}</Text>
        ) : (
          <Link href={entry.path} target="_blank" variant="hover-underline">
            <Text variant="code">{entry.path}</Text>
          </Link>
        )}
        <Text variant="p" colorVariant="secondary">{entry.description}</Text>
      </Column>
    </Card>
  );
};

export default function LlmsScreen() {
  useBrowserTitle(formatPageTitle('LLM documentation'));

  return (
    <DocsPage>
      <Column gap="xl">
        <DocsPageHeader subtitle={LLMS_INTRO}>
          LLM documentation
        </DocsPageHeader>

        <Column gap="md">
          <Title order={2} size={28} weight="bold">Start here</Title>
          {LLMS_ENTRY_FILES.map(entry => (
            <FileRow key={entry.path} entry={entry} />
          ))}
        </Column>

        <Column gap="md">
          <Title
            order={2}
            size={28}
            weight="bold"
            subtitle="Every page in the index is a standalone Markdown file at a predictable path."
            subtitleProps={{ variant: 'p' }}
          >
            Individual pages
          </Title>
          {LLMS_PAGE_FILES.map(entry => (
            <FileRow key={entry.path} entry={entry} />
          ))}
        </Column>

        <Column gap="md">
          <Title order={2} size={28} weight="bold">Usage</Title>
          <CodeBlock variant="terminal" language="bash" fullWidth>
            {LLMS_USAGE_SNIPPET}
          </CodeBlock>
          <Text variant="p" colorVariant="secondary">{LLMS_ON_PAGE_NOTE}</Text>
        </Column>

        <Column gap="md">
          <Title
            order={2}
            size={28}
            weight="bold"
            subtitle={LLMS_SKILLS_INTRO}
            subtitleProps={{ variant: 'p' }}
          >
            {LLMS_SKILLS_TITLE}
          </Title>
          <CodeBlock variant="terminal" language="bash" fullWidth>
            {LLMS_SKILLS_SNIPPET}
          </CodeBlock>
          <Text variant="p" colorVariant="secondary">
            All five skills live at{' '}
            <Link href={LLMS_SKILLS_REPO_URL} target="_blank" variant="hover-underline">
              {LLMS_SKILLS_REPO_URL}
            </Link>
          </Text>
        </Column>

        <Alert sev="info" variant="light" title="Always current" fullWidth>
          {LLMS_FRESHNESS_NOTE}
        </Alert>

        <Text variant="small" colorVariant="secondary">
          The format follows the{' '}
          <Link href="https://llmstxt.org" target="_blank" variant="hover-underline">llmstxt.org</Link>
          {' '}proposal. Index:{' '}
          <Link href={LLMS_INDEX_URL} target="_blank" variant="hover-underline">{LLMS_INDEX_URL}</Link>
          {' '}• Full text:{' '}
          <Link href={LLMS_FULL_URL} target="_blank" variant="hover-underline">{LLMS_FULL_URL}</Link>
        </Text>
      </Column>
    </DocsPage>
  );
}
