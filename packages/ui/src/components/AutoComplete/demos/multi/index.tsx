import { useState } from 'react';
import { AutoComplete, Block } from '@plocks/ui';
import type { AutoCompleteOption } from '@plocks/ui';

const genres = [
  { label: 'Pop', value: 'pop' },
  { label: 'Rock', value: 'rock' },
  { label: 'Hip Hop', value: 'hiphop' },
  { label: 'Jazz', value: 'jazz' },
  { label: 'Classical', value: 'classical' },
  { label: 'Electronic', value: 'electronic' },
  { label: 'Country', value: 'country' },
  { label: 'R&B', value: 'rnb' },
];

export function Demo() {
  const [selectedGenres, setSelectedGenres] = useState<AutoCompleteOption[]>([]);

  const handleToggle = (option: AutoCompleteOption) => {
    const isSelected = selectedGenres.some((genre) => genre.value === option.value);

    setSelectedGenres((current) =>
      isSelected
        ? current.filter((genre) => genre.value !== option.value)
        : [...current, option],
    );
  };

  return (
    <Block fullWidth>
      <AutoComplete
        label="Music genres"
        placeholder="Search genres..."
        data={genres}
        onSelect={handleToggle}
        multiSelect
        selectedValues={selectedGenres}
        minSearchLength={0}
        fullWidth
      />
    </Block>
  );
}
