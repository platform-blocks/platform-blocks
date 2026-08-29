import { useMemo, useState } from 'react';
import { AutoComplete, Block } from '@platform-blocks/ui';
import type { AutoCompleteOption } from '@platform-blocks/ui';
import { sports } from '../data';

export function Demo() {
  const [inputValue, setInputValue] = useState('');
  const [selectedSport, setSelectedSport] = useState<AutoCompleteOption | null>(null);

  const displayValue = useMemo(() => selectedSport?.label ?? inputValue, [selectedSport, inputValue]);

  return (
    <Block w={400}>
      <AutoComplete
        label="Choose a sport"
        placeholder="Search for a sport..."
        data={sports}
        value={displayValue}
        onChangeText={(value) => {
          setInputValue(value);
          if (!value) setSelectedSport(null);
        }}
        onSelect={(item) => {
          setSelectedSport(item);
          setInputValue(item.label);
        }}
        displayProperty="label"
        minSearchLength={1}
      />
    </Block>
  );
}
