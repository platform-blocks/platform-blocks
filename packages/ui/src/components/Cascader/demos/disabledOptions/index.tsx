import { Block, Cascader } from '@plocks/ui';

const data = [
  {
    value: 'europe',
    label: 'Europe',
    children: [
      { value: 'france', label: 'France', disabled: true },
      { value: 'germany', label: 'Germany' },
    ],
  },
];
export function Demo() {
  return (
    <Block fullWidth>
      <Cascader label="Location" data={data} />
    </Block>
  );
}
