import { Block, TreeSelect } from '@plocks/ui';

const data = [
  {
    id: 'fruit',
    label: 'Fruit',
    children: [
      { id: 'apple', label: 'Apple' },
      { id: 'banana', label: 'Banana' },
    ],
  },
];

export function Demo() {
  return (
    <Block fullWidth>
      <TreeSelect label="Food" data={data} offset={16} />
    </Block>
  );
}
