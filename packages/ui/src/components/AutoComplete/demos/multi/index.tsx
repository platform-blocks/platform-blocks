import { useState } from 'react'

import { AutoComplete, Block, Chip, Icon } from '@platform-blocks/ui';
import type { AutoCompleteOption } from '@platform-blocks/ui';
import { musicGenres } from '../data'

export function Demo() {
  const [inputValue, setInputValue] = useState('')
  const [selectedGenres, setSelectedGenres] = useState<AutoCompleteOption[]>([])

  const handleToggle = (option: AutoCompleteOption) => {
    const isSelected = selectedGenres.some((genre) => genre.value === option.value)

    setSelectedGenres((current) =>
      isSelected
        ? current.filter((genre) => genre.value !== option.value)
        : [...current, option],
    )
  }

  return (
    <Block w={400}>
      <AutoComplete
        label="Music genres"
        placeholder="Search genres..."
        data={musicGenres}
        value={inputValue}
        onChangeText={setInputValue}
        onSelect={handleToggle}
        multiSelect
        selectedValues={selectedGenres}
        minSearchLength={0}
        clearable
        onClear={() => {
          setSelectedGenres([])
          setInputValue('')
        }}
        selectedValuesContainerStyle={{ flexWrap: 'wrap', gap: 6 }}
        renderSelectedValue={(item, _index, helpers) => (
          <Chip
            key={item.value}
            size="sm"
            variant="surface"
            endIcon={<Icon name="x" size={12} color="currentColor" />}
            onRemove={helpers.onRemove}
          >
            {item.label}
          </Chip>
        )}
        inputWidth={400}
      />
    </Block>
  )
}
