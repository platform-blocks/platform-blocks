import { useState } from 'react'

import { AutoComplete, Block } from '@platform-blocks/react-ui-library';
import type { AutoCompleteOption } from '@platform-blocks/react-ui-library';
import { groupedCountries } from '../data'

export function Demo() {
  const [value, setValue] = useState('')
  const [selectedCountry, setSelectedCountry] = useState<AutoCompleteOption | null>(null)

  return (
    <Block w={400} >
      <AutoComplete
        label="Search countries"
        placeholder="Search for a country..."
        data={groupedCountries}
        value={value}
        onChangeText={(next) => {
          setValue(next)
          if (!next) setSelectedCountry(null)
        }}
        onSelect={(item) => {
          setSelectedCountry(item)
          setValue(item.label)
        }}
        minSearchLength={1}
        highlightMatches
        fullWidth
      />
    </Block>
  )
}
