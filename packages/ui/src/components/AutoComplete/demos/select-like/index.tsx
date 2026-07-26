import { useState } from 'react'
import { AutoComplete, Block } from '@platform-blocks/ui'
import type { AutoCompleteOption } from '../../types'
import { countries } from '../data'

export default function Demo() {
  const [inputValue, setInputValue] = useState('')
  const [selectedCountry, setSelectedCountry] = useState<AutoCompleteOption | null>(null)

  return (
    <Block w={400}>
      <AutoComplete
        label="Country"
        placeholder="Select a country..."
        data={countries}
        value={inputValue}
        onChangeText={(value) => {
          setInputValue(value)
          if (!value) setSelectedCountry(null)
        }}
        onSelect={(item) => {
          setSelectedCountry(item)
          setInputValue(item.label)
        }}
        minSearchLength={0}
        maxSuggestions={countries.length}
        editable={false}
        caretHidden
        filter={() => true}
        highlightMatches={false}
        fullWidth
      />
    </Block>
  )
}