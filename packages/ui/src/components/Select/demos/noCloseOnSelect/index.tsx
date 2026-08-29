import { useState } from 'react'
import { Select } from '@platform-blocks/ui'
import { sports } from '../data'

export function Demo() {
  const [value, setValue] = useState<string | null>(null)

  return (
    <Select
      label="Persistent menu"
      description="Menu doesn't close on option press"
      options={sports}
      value={value}
      onChange={(val) => setValue(val as string)}
      closeOnSelect={false}
    />
  )
}
