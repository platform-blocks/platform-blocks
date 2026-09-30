import { AutoComplete, Block } from '@plocks/ui';

const countries = [
  { label: 'United States', value: 'us' },
  { label: 'Canada', value: 'ca' },
  { label: 'United Kingdom', value: 'uk' },
  { label: 'Germany', value: 'de' },
  { label: 'France', value: 'fr' },
  { label: 'Italy', value: 'it' },
  { label: 'Spain', value: 'es' },
  { label: 'Netherlands', value: 'nl' },
  { label: 'Australia', value: 'au' },
  { label: 'Japan', value: 'jp' },
  { label: 'South Korea', value: 'kr' },
  { label: 'Brazil', value: 'br' },
  { label: 'Mexico', value: 'mx' },
  { label: 'India', value: 'in' },
  { label: 'China', value: 'cn' },
];

export function Demo() {
  return (
    <Block fullWidth>
      <AutoComplete
        label="Country"
        placeholder="Select a country..."
        data={countries}
        maxSuggestions={countries.length}
        editable={false}
        caretHidden
        filter={() => true}
        highlightMatches={false}
        fullWidth
      />
    </Block>
  );
}
