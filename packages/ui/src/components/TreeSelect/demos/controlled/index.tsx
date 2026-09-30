import { useState } from 'react';
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
  const [value, setValue] = useState<string | null>('apple');
  return (
    <Block fullWidth>
      <TreeSelect label="Food" data={data} value={value} onChange={setValue} clearable />
    </Block>
  );
}
