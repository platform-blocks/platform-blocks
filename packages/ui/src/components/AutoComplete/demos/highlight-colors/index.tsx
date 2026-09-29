import { AutoComplete, Block } from '@platform-blocks/ui';

const fruits = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Date', value: 'date' },
  { label: 'Elderberry', value: 'elderberry' },
  { label: 'Fig', value: 'fig' },
  { label: 'Grape', value: 'grape' },
  { label: 'Honeydew', value: 'honeydew' },
];

export function Demo() {
  return (
    <Block fullWidth>
      <AutoComplete
        label="Search fruits"
        placeholder="Type to search fruits..."
        data={fruits}
        highlightColor="highlight.8"
        minSearchLength={0}
        fullWidth
      />
    </Block>
  );
}
