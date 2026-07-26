import { useRef } from 'react';
import { Block, Row, TableOfContents, Text, Title, TitleRegistryProvider } from '@platform-blocks/ui';

const SECTIONS = [
  { id: 'intro', title: 'Introduction', summary: 'Set the stage for the walkthrough.' },
  { id: 'setup', title: 'Setup', summary: 'Install dependencies and initialize the provider.' },
  { id: 'usage', title: 'Usage', summary: 'Render headings inside your content area to register them.' },
  { id: 'faq', title: 'FAQ', summary: 'Answer the questions you expect most often.' },
];

export default function Demo() {
  const contentRef = useRef<HTMLDivElement | null>(null);

  return (
    <TitleRegistryProvider>
      <Row gap="xl" align="flex-start">
        <TableOfContents
          container={contentRef.current ?? undefined}
          variant="outline"
          size="sm"
          p="sm"
          style={{ width: 240 }}
        />
        <Block ref={contentRef} component="div" grow={1} style={{ maxWidth: 560 }}>
          {SECTIONS.map((section, index) => (
            <Block key={section.id}>
              <Title order={index === 0 ? 1 : 2}>{section.title}</Title>
              <Text colorVariant="secondary">{section.summary}</Text>
            </Block>
          ))}
        </Block>
      </Row>
    </TitleRegistryProvider>
  );
}
