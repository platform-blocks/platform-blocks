import { useState } from 'react'

import { AutoComplete, Block } from '@platform-blocks/ui'
import type { AutoCompleteOption } from '../../types'
import { programmingLanguages } from '../data'

const searchLanguages = async (query: string): Promise<AutoCompleteOption[]> => {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const normalized = query.toLowerCase()
  return programmingLanguages.filter((language) =>
    language.label.toLowerCase().includes(normalized),
  )
}

export default function Demo() {
  const [inputValue, setInputValue] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState<AutoCompleteOption | null>(null)

  return (
    <Block w={400}>
      <AutoComplete
        label="Search programming languages"
        placeholder="Start typing..."
        onSearch={searchLanguages}
        value={inputValue}
        onChangeText={(value) => {
          setInputValue(value)
          if (!value) setSelectedLanguage(null)
        }}
        onSelect={(item) => {
          setSelectedLanguage(item)
          setInputValue(item.label)
        }}
        minSearchLength={2}
        searchDelay={300}
        highlightMatches
        fullWidth
      />
    </Block>
  )
}
