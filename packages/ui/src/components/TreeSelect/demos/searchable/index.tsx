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
  {
    id: 'vegetable',
    label: 'Vegetable',
    children: [
      { id: 'carrot', label: 'Carrot' },
      { id: 'lettuce', label: 'Lettuce' },
    ],
  },
];

export function Demo() {
  return (
    <Block fullWidth>
      <TreeSelect label="Food" data={data} searchable />
    </Block>
  );
}
