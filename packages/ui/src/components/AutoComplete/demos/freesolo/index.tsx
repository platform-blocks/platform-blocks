import { useState } from 'react'

import { AutoComplete, Block, Text } from '@platform-blocks/ui'
import { fruits } from '../data'

export default function Demo() {
  const [value, setValue] = useState('')

  return (
    <Block w={400}>
      <AutoComplete
        label="Favorite fruit"
        placeholder="Type anything..."
        data={fruits}
        value={value}
        onChangeText={setValue}
        onSelect={(item) => setValue(item.label)}
        freeSolo
        minSearchLength={0}
        fullWidth
      />
      <Text size="xs" colorVariant="secondary">
        Current value: {value || '(empty)'}
      </Text>
    </Block>
  )
}
