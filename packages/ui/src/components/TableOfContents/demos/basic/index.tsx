import { Block, Row, TableOfContents, Text, Title, TitleRegistryProvider } from '@plocks/ui';

const SECTIONS = [
  { id: 'intro', title: 'Introduction', summary: 'Set the stage for the walkthrough.' },
  { id: 'setup', title: 'Setup', summary: 'Install dependencies and initialize the provider.' },
  { id: 'usage', title: 'Usage', summary: 'Render headings inside your content area to register them.' },
  { id: 'faq', title: 'FAQ', summary: 'Answer the questions you expect most often.' },
];

export function Demo() {

  return (
    <TitleRegistryProvider>
      <Row gap="xl" align="flex-start">
        <TableOfContents
          container="#toc-basic-content"
          variant="outline"
          size="sm"
          p="sm"
          style={{ width: 240 }}
        />
        <Block id="toc-basic-content" grow={1} style={{ maxWidth: 560 }}>
          {SECTIONS.map((section, index) => (
            <Block key={section.id}>
              <Title order={index === 0 ? 1 : 2}>{section.title}</Title>
              <Text c="secondary">{section.summary}</Text>
            </Block>
          ))}
        </Block>
      </Row>
    </TitleRegistryProvider>
  );
}
