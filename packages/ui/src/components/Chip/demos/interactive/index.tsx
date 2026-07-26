import { useState } from 'react'
import { Block, Chip } from '@platform-blocks/ui'

const initialSports = [
  { label: 'Soccer', emoji: '⚽' },
  { label: 'Basketball', emoji: '🏀' },
  { label: 'Tennis', emoji: '🎾' },
]

export default function Demo() {
  const [chips, setChips] = useState(initialSports)

  const handleRemove = (chipToRemove: string) => {
    setChips((current) => current.filter((chip) => chip.label !== chipToRemove))
  }

  return (
    <Block>
      {chips.map((chip) => (
        <Chip
          key={chip.label}
          onRemove={() => handleRemove(chip.label)}
        >
          {chip.label}
        </Chip>
      ))}
    </Block>
  )
}