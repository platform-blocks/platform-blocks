import { useState } from 'react'
import { Block, Icon, Select, Text, useTheme } from '@platform-blocks/ui'
import { detailedSports, type DetailedSport } from '../data'

export default function Demo() {
  const theme = useTheme()
  const [value, setValue] = useState<string | null>(detailedSports[0].value)
  const accent = theme.colorScheme === 'dark' ? theme.colors.primary[5] : theme.colors.primary[6]

  return (
    <Block w={400}>
      <Select
        label="Choose a sport"
        placeholder="Pick a sport"
        options={detailedSports}
        value={value}
        onChange={(selected) => setValue(selected as string)}
        renderOption={(option, active, selected) => {
          const { emoji, name, description } = option as DetailedSport

          return (
            <Block
              direction="row"
              align="center"
              gap={12}
              style={{
                padding: 12,
                borderLeftWidth: 3,
                borderLeftColor: active || selected ? accent : 'transparent',
                backgroundColor: selected ? theme.colors.primary[0] : undefined,
              }}
            >
              <Text size="3xl">{emoji}</Text>
              <Block direction="column" style={{ flex: 1 }} gap={0}>
                <Text weight={selected ? '900' : '600'}>{name}</Text>
                <Text size="sm" colorVariant="secondary">
                  {description}
                </Text>
              </Block>
              {selected ? <Icon name="check" size={16} color={accent} /> : null}
            </Block>
          )
        }}
      />
    </Block>
  )
}
