import { AutoComplete, Block } from '@plocks/ui';

const fruits = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Orange', value: 'orange' },
  { label: 'Grape', value: 'grape' },
  { label: 'Mango', value: 'mango' },
  { label: 'Pineapple', value: 'pineapple' },
];

export function Demo() {
  return (
    <Block fullWidth>
      <AutoComplete
        label="Favorite fruit"
        placeholder="Type anything..."
        data={fruits}
        freeSolo
        minSearchLength={0}
        fullWidth
      />
    </Block>
  );
}
