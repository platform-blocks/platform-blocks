import { Block, ScrollArea, Text } from '@plocks/ui';

export function Demo() {
  return (
    <ScrollArea fullWidth h={180} contentProps={{ p: 'md', gap: 'sm' }}>
      {Array.from({ length: 8 }, (_, index) => (
        <Block key={index} bg="subtle" p="sm">
          <Text>Item {index + 1}</Text>
        </Block>
      ))}
    </ScrollArea>
  );
}
