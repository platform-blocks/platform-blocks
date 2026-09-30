import { Block, Flex, TreeSelect } from '@plocks/ui';

const data = [{ id: 'fruit', label: 'Fruit', children: [{ id: 'apple', label: 'Apple' }] }];

export function Demo() {
  return (
    <Block fullWidth>
      <Flex direction="column" gap="md">
        <TreeSelect label="Read only" data={data} defaultValue="apple" readOnly />
        <TreeSelect label="Disabled" data={data} disabled />
        <TreeSelect label="Required" data={data} required error="Choose an item" />
      </Flex>
    </Block>
  );
}
