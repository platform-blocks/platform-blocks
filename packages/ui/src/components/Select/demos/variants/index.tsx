import { useState } from 'react'
import { Block, Select } from '@platform-blocks/ui'
import { sports } from '../data'

const variants = [
  { variant: 'default', label: 'Default' },
  { variant: 'filled', label: 'Filled' },
  { variant: 'outline', label: 'Outline' },
  { variant: 'unstyled', label: 'Unstyled' },
] as const

export default function Demo() {
  const [value, setValue] = useState<string | null>(null)

  return (
    <Block flex>
      {variants.map(({ variant, label }) => (
        <Select
          key={variant}
          variant={variant}
          label={label}
          placeholder="Pick one…"
          options={sports}
          value={value}
          onChange={(v) => setValue(v as string | null)}
        />
      ))}
    </Block>
  )
}
