import { useRef, useState } from 'react';
import { Block, Chip, Row, TableOfContents, Text, Title, TitleRegistryProvider } from '@platform-blocks/react-ui-library';

const SECTIONS = [
  { id: 'overview', title: 'Overview', summary: 'Explain when the progress indicator should appear.' },
  { id: 'loading', title: 'Loading States', summary: 'Describe feedback while content is fetching.' },
  { id: 'error', title: 'Error Recovery', summary: 'Clarify what happens if the data fails to load.' },
];

export function Demo() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  return (
    <TitleRegistryProvider>
      <Block>
        <Chip variant="light" color={activeId ? 'primary' : 'gray'} size="sm">
          Active section: {activeId ?? 'None'}
        </Chip>

        <Row gap="xl" align="flex-start">
          <TableOfContents
            container={contentRef.current ?? undefined}
            variant="outline"
            size="xs"
            p="sm"
            style={{ width: 240 }}
            onActiveChange={setActiveId}
          />
          <Block ref={contentRef} component="div" grow={1} style={{ maxWidth: 560 }}>
            {SECTIONS.map((section, index) => (
              <Block key={section.id}>
                <Title order={index === 0 ? 1 : 2}>{section.title}</Title>
                <Text color="secondary">{section.summary}</Text>
              </Block>
            ))}
          </Block>
        </Row>
      </Block>
    </TitleRegistryProvider>
  );
}
