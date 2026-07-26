import { Row, TableOfContents } from '@platform-blocks/ui';

const ITEMS = [
  { id: 'overview', value: 'Overview', depth: 1 },
  { id: 'tokens', value: 'Color tokens', depth: 2 },
  { id: 'accessibility', value: 'Accessibility', depth: 1 },
];

export default function Demo() {
  return (
    <Row gap="md" align="flex-start" wrap="wrap">
      <TableOfContents initialData={ITEMS} variant="outline" size="xs" style={{ width: 200 }} />
      <TableOfContents initialData={ITEMS} variant="ghost" size="xs" style={{ width: 200 }} />
      <TableOfContents
        initialData={ITEMS}
        variant="filled"
        color="primary.6"
        autoContrast
        size="xs"
        style={{ width: 200 }}
      />
    </Row>
  );
}
