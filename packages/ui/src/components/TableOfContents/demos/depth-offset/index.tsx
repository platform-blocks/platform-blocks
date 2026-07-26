import { Block, TableOfContents } from '@platform-blocks/ui';

const INITIAL_ITEMS = [
  { id: 'intro', value: 'Introduction', depth: 1 },
  { id: 'schedule', value: 'Release schedule', depth: 2 },
  { id: 'api', value: 'API reference', depth: 2 },
  { id: 'hooks', value: 'Hooks', depth: 3 },
  { id: 'migration', value: 'Migration', depth: 1 },
];

export default function Demo() {
  return (
    <Block align="flex-start">
      <TableOfContents
        initialData={INITIAL_ITEMS}
        variant="outline"
        minDepthToOffset={2}
        depthOffset={28}
        size="xs"
        p="sm"
        style={{ width: 240 }}
      />
    </Block>
  );
}
