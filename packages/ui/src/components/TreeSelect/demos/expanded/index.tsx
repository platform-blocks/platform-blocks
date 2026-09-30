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
  { id: 'vegetable', label: 'Vegetable', children: [{ id: 'carrot', label: 'Carrot' }] },
];
export function Demo() {
  return (
    <Block fullWidth>
      <TreeSelect label="Food" data={data} defaultExpandAll />
    </Block>
  );
}
