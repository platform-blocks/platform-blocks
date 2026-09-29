import { AutoComplete, Block } from '@platform-blocks/ui';

const sports = [
  { label: 'Football', value: 'football' },
  { label: 'Basketball', value: 'basketball' },
  { label: 'Soccer', value: 'soccer' },
  { label: 'Baseball', value: 'baseball' },
  { label: 'Tennis', value: 'tennis' },
  { label: 'Golf', value: 'golf' },
  { label: 'Swimming', value: 'swimming' },
  { label: 'Volleyball', value: 'volleyball' },
  { label: 'Cricket', value: 'cricket' },
  { label: 'Rugby', value: 'rugby' },
  { label: 'Softball', value: 'softball' },
  { label: 'Hockey', value: 'hockey' },
];

export function Demo() {
  return (
    <Block fullWidth>
      <AutoComplete
        label="Choose a sport"
        placeholder="Search for a sport..."
        data={sports}
        minSearchLength={1}
        fullWidth
      />
    </Block>
  );
}
