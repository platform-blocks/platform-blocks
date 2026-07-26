import { Block, TableOfContents } from '@platform-blocks/ui';

const INITIAL_ITEMS = [
  { id: 'overview', value: 'Overview', depth: 1 },
  { id: 'setup', value: 'Setup', depth: 2 },
  { id: 'usage', value: 'Usage', depth: 2 },
  { id: 'advanced', value: 'Advanced', depth: 1 },
  { id: 'faq', value: 'FAQ', depth: 1 },
];

export default function Demo() {
  return (
    <Block align="flex-start">
      <TableOfContents
        initialData={INITIAL_ITEMS}
        variant="outline"
        depthOffset={16}
        radius="sm"
        size="sm"
        p="sm"
        style={{ width: 240 }}
      />
    </Block>
  );
}
