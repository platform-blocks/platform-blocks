import { useState } from 'react'

import { AutoComplete, Block, Chip, Icon, Text } from '@platform-blocks/ui'
import type { AutoCompleteOption } from '../../types'
import { fruits } from '../data'

export default function Demo() {
  const [inputValue, setInputValue] = useState('')
  const [selected, setSelected] = useState<AutoCompleteOption[]>([])

  const handleToggle = (option: AutoCompleteOption) => {
    const isSelected = selected.some((item) => item.value === option.value)

    setSelected((current) =>
      isSelected
        ? current.filter((item) => item.value !== option.value)
        : [...current, option],
    )
  }

  return (
    <Block w={400}>
      <AutoComplete
        label="Favorite fruits"
        placeholder="Type a fruit and press Enter..."
        data={fruits}
        value={inputValue}
        onChangeText={setInputValue}
        onSelect={handleToggle}
        freeSolo
        multiSelect
        selectedValues={selected}
        minSearchLength={0}
        clearable
        onClear={() => {
          setSelected([])
          setInputValue('')
        }}
        selectedValuesContainerStyle={{ flexWrap: 'wrap', gap: 6 }}
        renderSelectedValue={(item, _index, helpers) => (
          <Chip
            key={item.value}
            size="sm"
            variant="light"
            color="primary"
            endIcon={<Icon name="x" size={8} color="currentColor" />}
            onRemove={helpers.onRemove}
          >
            {item.label}
          </Chip>
        )}
      />
    </Block>
  )
}
