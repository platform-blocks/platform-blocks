import { Block, Cascader } from '@plocks/ui';

const data = [
  {
    value: 'europe',
    label: 'Europe',
    children: [
      {
        value: 'france',
        label: 'France',
        children: [
          { value: 'paris', label: 'Paris' },
          { value: 'lyon', label: 'Lyon' },
        ],
      },
    ],
  },
  {
    value: 'asia',
    label: 'Asia',
    children: [{ value: 'japan', label: 'Japan', children: [{ value: 'tokyo', label: 'Tokyo' }] }],
  },
];
export function Demo() {
  return (
    <Block fullWidth>
      <Cascader
        label="Location"
        data={data}
        defaultValue={['europe', 'france', 'paris']}
        formatValue={(path) => path.map((item) => item.label).join(' → ')}
      />
    </Block>
  );
}
