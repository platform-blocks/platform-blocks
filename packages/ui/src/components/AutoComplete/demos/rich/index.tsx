import { useState } from 'react'

import { AutoComplete, Block, Column, Icon, MenuItemButton, Row, Text } from '@platform-blocks/ui'

interface RichSportOption {
  label: string;
  value: string;
  emoji: string;
  color: string;
  price: number;     // Avg ticket price
  duration: string;  // Typical game length / format
}

// The option colors are plain 6-digit hex, so an 8-digit suffix gives a tint
// that works on both web and native without a color library.
const tint = (hex: string, alpha: string) => `${hex}${alpha}`

export function Demo() {
  const [value, setValue] = useState('')
  const [selectedSport, setSelectedSport] = useState<RichSportOption | null>(null)

  const richSportData: RichSportOption[] = [
    { label: 'Soccer', value: 'soccer', emoji: '⚽', color: '#22c55e', price: 75.5, duration: '90 min' },
    { label: 'Basketball', value: 'basketball', emoji: '🏀', color: '#f97316', price: 120.0, duration: '48 min' },
    { label: 'Football', value: 'football', emoji: '🏈', color: '#92400e', price: 180.0, duration: '60 min' },
    { label: 'Volleyball', value: 'volleyball', emoji: '🏐', color: '#fbbf24', price: 60.0, duration: 'Best of 5' },
    { label: 'Baseball', value: 'baseball', emoji: '⚾', color: '#ef4444', price: 85.0, duration: '9 innings' },
    { label: 'Golf', value: 'golf', emoji: '⛳', color: '#15803d', price: 110.0, duration: '4 hrs' },
  ];

  // Colored emoji tile — carries the option color instead of a loose dot, and
  // doubles as the leading media for both the dropdown row and the input value.
  const renderTile = (sport: RichSportOption, size: number) => (
    <Block
      w={size}
      h={size}
      radius="lg"
      align="center"
      justify="center"
      bg={tint(sport.color, '26')}
      borderWidth={1}
      borderColor={tint(sport.color, '59')}
    >
      <Text size={size >= 40 ? 'xl' : 'md'}>{sport.emoji}</Text>
    </Block>
  )

  return (
    <Block w={400}>
      <AutoComplete
        label="Search sports"
        placeholder="Search sports with rich details..."
        data={richSportData}
        value={value}
        clearable
        // Drop focus after selecting so the rich value overlay shows immediately.
        refocusAfterSelect={false}
        onChangeText={(next) => {
          setValue(next)
          if (!next) setSelectedSport(null)
        }}
        onSelect={(item) => {
          const sport = item as RichSportOption
          setSelectedSport(sport)
          setValue(sport.label)
        }}
        // Media / title+meta / trailing price — the standard three-slot list row,
        // so the eye scans names down the left and prices down the right.
        renderItem={(item, index, helpers) => {
          const sport = item as RichSportOption
          const isChosen = selectedSport?.value === sport.value

          return (
            <MenuItemButton
              key={sport.value}
              rounded={false}
              compact
              fullWidth
              active={helpers?.isHighlighted || isChosen}
              onPress={() => helpers?.onSelect?.(sport)}
              style={{ alignItems: 'stretch', gap: 0 }}
            >
              <Row align="center" gap="md" px="md" py="sm" fullWidth>
                {renderTile(sport, 40)}

                <Column grow={1} gap="xs">
                  <Text size="sm" weight="semibold" numberOfLines={1}>
                    {sport.label}
                  </Text>
                  <Text size="xs" color="secondary" numberOfLines={1}>
                    {sport.duration}
                  </Text>
                </Column>

                <Column align="flex-end" gap="xs">
                  <Text size="sm" weight="semibold">
                    ${sport.price.toFixed(2)}
                  </Text>
                  <Text size="xs" color="secondary">
                    avg ticket
                  </Text>
                </Column>

                {isChosen ? (
                  <Icon name="check" size={16} stroke={3} color={sport.color} />
                ) : (
                  <Block w={16} />
                )}
              </Row>
            </MenuItemButton>
          )
        }}
        // Chosen sport inside the input box — same tile, single line so it fits
        // the field height.
        renderValue={(item) => {
          const sport = item as RichSportOption
          return (
            <Row align="center" gap="sm" grow={1}>
              {renderTile(sport, 24)}
              <Text size="sm" weight="semibold">{sport.label}</Text>
              <Text size="xs" color="secondary">
                {sport.duration}
              </Text>
              <Block grow={1} />
              <Text size="sm" weight="semibold">
                ${sport.price.toFixed(2)}
              </Text>
            </Row>
          )
        }}
        minSearchLength={1}
        fullWidth
      />
    </Block>
  )
}
