import { useState } from 'react'
import { Block, Select } from '@platform-blocks/react-ui-library'
import { sports } from '../data'

// One option is taken out of play to show the per-option disabled state next to
// the whole-field one.
const options = sports.map((option) =>
  option.value === 'basketball' ? { ...option, label: 'Basketball (disabled)', disabled: true } : option,
)

export function Demo() {
  const [value, setValue] = useState<string | null>(sports[0].value)

  return (
    <Block flex direction="row">
      <Select
        label="Disabled option example"
        options={options}
        value={value}
        onChange={(val) => setValue(val as string)}
      />
      <Select label="Entire select disabled" options={options} value={value} disabled />
    </Block>
  )
}
