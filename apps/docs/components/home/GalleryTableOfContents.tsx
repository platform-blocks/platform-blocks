import React from 'react';
import { Block, TableOfContents, Text, Title, TitleRegistryProvider } from '@plocks/ui';

/** A stacked outline keeps the live navigation example usable in narrow cards. */
export default function GalleryTableOfContents() {
  return (
    <TitleRegistryProvider>
      <Block gap="md" fullWidth>
        <TableOfContents container="#gallery-outline-content" variant="outline" size="sm" p="sm" />
        <Block id="gallery-outline-content" gap="md" fullWidth>
          <Block gap="xs">
            <Title order={3} id="gallery-outline-overview">Overview</Title>
            <Text c="secondary">An outline helps readers jump to the section they need.</Text>
          </Block>
          <Block gap="xs">
            <Title order={3} id="gallery-outline-usage">Usage</Title>
            <Text c="secondary">Select a heading above to navigate within this example.</Text>
          </Block>
        </Block>
      </Block>
    </TitleRegistryProvider>
  );
}
