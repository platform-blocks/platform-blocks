import { useState } from 'react';
import { AutoComplete, Block } from '@plocks/ui';
import type { AutoCompleteOption } from '@plocks/ui';

const fruits = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Orange', value: 'orange' },
  { label: 'Grape', value: 'grape' },
  { label: 'Mango', value: 'mango' },
  { label: 'Pineapple', value: 'pineapple' },
];

export function Demo() {
  const [selected, setSelected] = useState<AutoCompleteOption[]>([]);

  const handleToggle = (option: AutoCompleteOption) => {
    const isSelected = selected.some((item) => item.value === option.value);

    setSelected((current) =>
      isSelected
        ? current.filter((item) => item.value !== option.value)
        : [...current, option],
    );
  };

  return (
    <Block fullWidth>
      <AutoComplete
        label="Favorite fruits"
        placeholder="Type a fruit and press Enter..."
        data={fruits}
        onSelect={handleToggle}
        freeSolo
        multiSelect
        selectedValues={selected}
        minSearchLength={0}
        fullWidth
      />
    </Block>
  );
}
