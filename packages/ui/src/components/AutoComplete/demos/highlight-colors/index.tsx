import { useState } from 'react'
import { AutoComplete, Block, ColorSwatch, Row, Text, useTheme } from '@platform-blocks/ui'

const sampleData = [
  { label: 'Apple', value: 'apple', description: 'A red or green fruit' },
  { label: 'Banana', value: 'banana', description: 'A yellow curved fruit' },
  { label: 'Cherry', value: 'cherry', description: 'A small red fruit' },
  { label: 'Date', value: 'date', description: 'A sweet brown fruit' },
  { label: 'Elderberry', value: 'elderberry', description: 'A dark purple berry' },
  { label: 'Fig', value: 'fig', description: 'A purple or green fruit' },
  { label: 'Grape', value: 'grape', description: 'Clusters of small berries' },
  { label: 'Honeydew', value: 'honeydew', description: 'A sweet green melon' },
]

export default function Demo() {
  const theme = useTheme()
  const isDark = theme.colorScheme === 'dark'

  // The matched substring sits on the menu surface, so only the shades with
  // enough contrast against it are offered: dark end of the ramp on light
  // surfaces, light end on dark ones.
  const ramp = theme.colors.highlight ?? []
  const shadeIndices = isDark ? [3, 4, 5, 6] : [6, 7, 8, 9]
  const swatches = shadeIndices.map(index => ramp[index]).filter(Boolean)

  // `undefined` = no override, i.e. the primary-derived default AutoComplete
  // uses when `highlightColor` is omitted.
  const [highlightColor, setHighlightColor] = useState<string | undefined>(undefined)
  const tintIndex = isDark ? 8 : 1

  return (
    <Block w={400} gap="md">
      <AutoComplete
        label="Search fruits"
        placeholder="Type to search fruits..."
        data={sampleData}
        highlightMatches
        highlightColor={highlightColor}
        highlightBackgroundColor={highlightColor ? ramp[tintIndex] : undefined}
        minSearchLength={0}
        fullWidth
      />

      <Block gap="xs">
        <Text size="sm" weight="semibold">
          Match colour
        </Text>
        <Row gap="sm" align="center">
          <ColorSwatch
            color={theme.colors.primary[isDark ? 5 : 6]}
            selected={highlightColor === undefined}
            onPress={() => setHighlightColor(undefined)}
            accessibilityLabel="Theme default highlight colour"
          />
          {swatches.map(color => (
            <ColorSwatch
              key={color}
              color={color}
              selected={highlightColor === color}
              onPress={() => setHighlightColor(color)}
              accessibilityLabel={`Highlight colour ${color}`}
            />
          ))}
        </Row>
        <Text size="xs" colorVariant="secondary">
          Type a letter or two, then pick a swatch. The first is the default
          (primary ramp); the rest come from `theme.colors.highlight`, paired
          with a soft tint from the same ramp as the match background.
        </Text>
      </Block>
    </Block>
  )
}
