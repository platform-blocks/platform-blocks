import { AutoComplete, Block } from '@plocks/ui';

const countries = [
  { label: 'United States', value: 'us', group: 'North America' },
  { label: 'Canada', value: 'ca', group: 'North America' },
  { label: 'Mexico', value: 'mx', group: 'North America' },
  { label: 'United Kingdom', value: 'uk', group: 'Europe' },
  { label: 'Germany', value: 'de', group: 'Europe' },
  { label: 'France', value: 'fr', group: 'Europe' },
  { label: 'Japan', value: 'jp', group: 'Asia' },
  { label: 'India', value: 'in', group: 'Asia' },
  { label: 'Australia', value: 'au', group: 'Oceania' },
  { label: 'Brazil', value: 'br', group: 'South America' },
];

export function Demo() {
  return (
    <Block fullWidth>
      <AutoComplete
        label="Search countries"
        placeholder="Search for a country..."
        data={countries}
        minSearchLength={1}
        fullWidth
      />
    </Block>
  );
}
