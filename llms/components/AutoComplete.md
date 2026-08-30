# AutoComplete

The AutoComplete component provides search functionality with suggestions, supporting single/multi-select, async data loading, and rich content display

## Metadata

- Canonical name: `AutoComplete`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { AutoComplete } from '@platform-blocks/react-ui-library';`
- Category: input
- Tags: input, search, typeahead, autocomplete, suggestions
- Docs: https://react-ui-library.com/components/AutoComplete
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/AutoComplete

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `label` | string | No |  | Input label |
| `description` | string | No |  | Description text below the input |
| `helperText` | string | No |  | Helper text displayed below the field when no error is present |
| `required` | boolean | No |  | Whether the field is required |
| `error` | string | No |  | Error message |
| `value` | string | No |  | Input value |
| `onChangeText` | (text: string) => void | No |  | Change handler |
| `placeholder` | string | No |  | Placeholder text |
| `disabled` | boolean | No |  | Whether the input is disabled |
| `size` | SizeValue | No |  | Controls input size (affects padding and height) |
| `radius` | RadiusValue | No |  | Controls border radius; accepts size tokens or numeric value |
| `clearable` | boolean | No |  | Show built-in clear button when there is text |
| `clearButtonLabel` | string | No |  | Accessible label for the clear button |
| `onClear` | () => void | No |  | Callback when the clear button is pressed |
| `style` | StyleProp<ViewStyle> | No |  | Custom style |
| `data` | AutoCompleteOption[] | No |  | Data source for suggestions |
| `onSearch` | (query: string) => Promise<AutoCompleteOption[]> | No |  | Async data fetcher |
| `minSearchLength` | number | No |  | Minimum characters to trigger search |
| `searchDelay` | number | No |  | Search debounce delay |
| `renderItem` | ( item: AutoCompleteOption, index: number, options: { query: string; onSelect: (item: AutoCompleteOption) => void; isHighlighted?: boolean; isSelected?: boolean; } ) => React.ReactNode | No |  | Custom item renderer |
| `onSelect` | (item: AutoCompleteOption) => void | No |  | Selection handler |
| `renderValue` | ( item: AutoCompleteOption, context: { focused: boolean; clear: () => void; } ) => React.ReactNode | No |  | Custom renderer for the selected option shown inside the single-select input. When provided and an option is selected, the returned node is overlaid on the text field while it is not focused (focusing the field reveals the editable text so the query can be changed). Ignored in multiSelect mode — use `renderSelectedValue` for chips there. |
| `allowCustomValue` | boolean | No |  | Whether to allow custom values |
| `maxSuggestions` | number | No |  | Maximum number of suggestions to display |
| `showSuggestionsOnFocus` | boolean | No |  | Whether to show suggestions on focus (default: true) |
| `renderEmptyState` | () => React.ReactNode | No |  | Custom empty state component |
| `renderLoadingState` | () => React.ReactNode | No |  | Custom loading state component |
| `filter` | (item: AutoCompleteOption, query: string) => boolean | No |  | Filter function for local data |
| `highlightMatches` | boolean | No |  | Whether to highlight matching text |
| `highlightColor` | string | No |  | Text color for the matched substring when `highlightMatches` is on. Defaults to a primary-ramp shade chosen for the active color scheme. |
| `highlightBackgroundColor` | string | No |  | Background color painted behind the matched substring (default: transparent — the match is distinguished by color and weight). |
| `suggestionsStyle` | any | No |  | Custom styles for suggestions container |
| `suggestionItemStyle` | any | No |  | Custom styles for suggestion items |
| `multiSelect` | boolean | No |  | Enable multi-select mode |
| `selectedValues` | AutoCompleteOption[] | No |  | Selected values for multi-select mode |
| `renderSelectedValue` | ( item: AutoCompleteOption, index: number, context: { onRemove: () => void; disabled: boolean; isFocused: boolean; inputValue: string; source: 'input' \| 'modal'; } ) => React.ReactNode | No |  | Custom renderer for each selected value chip in multi-select mode |
| `selectedValuesContainerStyle` | StyleProp<ViewStyle> | No |  | Optional style override for the selected values container |
| `selectedValueChipProps` | Partial<ChipProps> | No |  | Additional props applied to the default Chip renderer for selected values |
| `refocusAfterSelect` | boolean | No |  | Controls whether the input regains focus after selecting an option |
| `freeSolo` | boolean | No |  | Whether to allow free-form input (can add custom values) |
| `displayProperty` | 'label' \| 'value' | No |  | What to display in input after selection - 'label' or 'value' |
| `useModal` | boolean | No |  | Whether to render suggestions in a modal for guaranteed top layering |
| `usePortal` | boolean | No |  | Whether to render suggestions in a portal for proper z-index handling (default: true) |
| `inputWidth` | number \| string | No |  | Explicit width for the input container (overrides layout width) |
| `minWidth` | number | No |  | Minimum width (particularly helpful on Android where intrinsic shrink can occur) |
| `textInputProps` | Omit<TextInputProps, 'value' \| 'onChangeText' \| 'placeholder'> | No |  | Additional TextInput props |
| `autoCapitalize` | RNTextInputProps['autoCapitalize'] | No |  | Text auto-capitalization behavior |
| `autoCorrect` | boolean | No |  | Whether to enable auto-correct |
| `autoFocus` | boolean | No |  | Whether to auto-focus on mount |
| `returnKeyType` | RNTextInputProps['returnKeyType'] | No |  | Return key type for soft keyboard |
| `blurOnSubmit` | boolean | No |  | Whether to blur on submit |
| `selectTextOnFocus` | boolean | No |  | Select all text on focus |
| `textContentType` | RNTextInputProps['textContentType'] | No |  | iOS text content type for autofill |
| `textAlign` | RNTextInputProps['textAlign'] | No |  | Text alignment |
| `spellCheck` | boolean | No |  | Whether spell check is enabled |
| `inputMode` | RNTextInputProps['inputMode'] | No |  | Input mode (modern alternative to keyboardType) |
| `enterKeyHint` | RNTextInputProps['enterKeyHint'] | No |  | Enter key hint |
| `selectionColor` | string | No |  | Color of the text selection handles and highlight |
| `showSoftInputOnFocus` | boolean | No |  | Whether to show the soft keyboard on focus |
| `editable` | boolean | No |  | Whether the field is editable |
| `caretHidden` | boolean | No |  | Hide the blinking text caret (useful for select-like, non-editable fields) |
| `placement` | 'auto' \| 'top' \| 'bottom' \| 'left' \| 'right' \| 'top-start' \| 'top-end' \| 'bottom-start' \| 'bottom-end' \| 'left-start' \| 'left-end' \| 'right-start' \| 'right-end' | No |  | Placement preference for the suggestions dropdown (default: 'bottom-start') |
| `flip` | boolean | No |  | Enable flipping to opposite side when dropdown would go off-screen (default: true) |
| `shift` | boolean | No |  | Enable shifting within bounds when dropdown would go off-screen (default: true) |
| `boundary` | number | No |  | Distance from viewport edges in pixels (default: 12) |
| `autoReposition` | boolean | No |  | Enable automatic repositioning on scroll/resize (default: true) |
| `labelProps` | Omit<TextProps, 'children'> | No |  | Override props applied to the field label `<Text>`. |
| `descriptionProps` | Omit<TextProps, 'children'> | No |  | Override props applied to the field description `<Text>`. |
| `placeholderTextColor` | string | No |  | Color of the placeholder text (defaults to `theme.text.muted`). |
| `startSectionProps` | Omit<ViewProps, 'children'> | No |  | View props applied to the wrapper around startSection (chip area, etc.). |
| `endSectionProps` | Omit<ViewProps, 'children'> | No |  | View props applied to the wrapper around endSection (clear button area). |
| `m` | number | No |  | Margin applied to all sides |
| `mt` | number | No |  | Margin applied to the top side |
| `mr` | number | No |  | Margin applied to the right side |
| `mb` | number | No |  | Margin applied to the bottom side |
| `ml` | number | No |  | Margin applied to the left side |
| `mx` | number | No |  | Horizontal margin applied to left and right sides |
| `my` | number | No |  | Vertical margin applied to top and bottom sides |
| `p` | number | No |  | Padding applied to all sides |
| `pt` | number | No |  | Padding applied to the top side |
| `pr` | number | No |  | Padding applied to the right side |
| `pb` | number | No |  | Padding applied to the bottom side |
| `pl` | number | No |  | Padding applied to the left side |
| `px` | number | No |  | Horizontal padding applied to left and right sides |
| `py` | number | No |  | Vertical padding applied to top and bottom sides |
| `fullWidth` | boolean | No |  | Makes the component fill the full width of its parent |
| `w` | DimensionValue | No |  | Sets a specific width |
| `h` | DimensionValue | No |  | Sets a specific height |
| `maxW` | DimensionValue | No |  | Sets the maximum width |
| `minW` | DimensionValue | No |  | Sets the minimum width |
| `maxH` | DimensionValue | No |  | Sets the maximum height |
| `minH` | DimensionValue | No |  | Sets the minimum height |

## Examples

### Basic
ID: `AutoComplete.basic` • Tags: basic, getting-started, search • Category: usage • Status: stable • Since: 1.0.0

Simple auto-complete. Start typing to filter the list. Selecting an option fills the input.

```tsx
const [inputValue, setInputValue] = useState('');
  const [selectedSport, setSelectedSport] = useState<AutoCompleteOption | null>(null);
  const displayValue = useMemo(() => selectedSport?.label ?? inputValue, [selectedSport, inputValue]);
  return (
    <Block w={400}>
      <AutoComplete
        label="Choose a sport"
        placeholder="Search for a sport..."
        data={sports}
        value={displayValue}
        onChangeText={(value) => {
          setInputValue(value);
          if (!value) setSelectedSport(null);
        }}
        onSelect={(item) => {
          setSelectedSport(item);
          setInputValue(item.label);
        }}
        displayProperty="label"
        minSearchLength={1}
      />
    </Block>
  );
}
```

### Multi-select tags
ID: `AutoComplete.multi` • Tags: multi-select, multiple, selection • Category: features • Status: stable • Since: 1.0.0

Tap an item to add or remove it. Selected genres render as removable chips.

```tsx
const [inputValue, setInputValue] = useState('')
  const [selectedGenres, setSelectedGenres] = useState<AutoCompleteOption[]>([])
  const handleToggle = (option: AutoCompleteOption) => {
    const isSelected = selectedGenres.some((genre) => genre.value === option.value)
    setSelectedGenres((current) =>
      isSelected
        ? current.filter((genre) => genre.value !== option.value)
        : [...current, option],
    )
  }
  return (
    <Block w={400}>
      <AutoComplete
        label="Music genres"
        placeholder="Search genres..."
        data={musicGenres}
        value={inputValue}
        onChangeText={setInputValue}
        onSelect={handleToggle}
        multiSelect
        selectedValues={selectedGenres}
        minSearchLength={0}
        clearable
        onClear={() => {
          setSelectedGenres([])
          setInputValue('')
        }}
        selectedValuesContainerStyle={{ flexWrap: 'wrap', gap: 6 }}
        renderSelectedValue={(item, _index, helpers) => (
          <Chip
            key={item.value}
            size="sm"
            variant="surface"
            endIcon={<Icon name="x" size={12} color="currentColor" />}
            onRemove={helpers.onRemove}
          >
            {item.label}
          </Chip>
        )}
        inputWidth={400}
      />
    </Block>
  )
}
```

### Select-Like Behavior
ID: `AutoComplete.select-like` • Tags: select, dropdown, focus, options • Category: usage • Status: stable • Since: 1.0.0

Behaves like a Select: the field is non-editable (`editable={false}`), so it can't be typed into or filtered. Tapping opens the full option list (`filter={() => true}`) and the value is chosen from it.

```tsx
const [inputValue, setInputValue] = useState('')
  const [selectedCountry, setSelectedCountry] = useState<AutoCompleteOption | null>(null)
  return (
    <Block w={400}>
      <AutoComplete
        label="Country"
        placeholder="Select a country..."
        data={countries}
        value={inputValue}
        onChangeText={(value) => {
          setInputValue(value)
          if (!value) setSelectedCountry(null)
        }}
        onSelect={(item) => {
          setSelectedCountry(item)
          setInputValue(item.label)
        }}
        minSearchLength={0}
        maxSuggestions={countries.length}
        editable={false}
        caretHidden
        filter={() => true}
        highlightMatches={false}
        fullWidth
      />
    </Block>
  )
}
```

### Async auto-complete
ID: `AutoComplete.async` • Tags: async, loading, api, remote • Category: features • Status: stable • Since: 1.0.0

Performs a debounced search against a simulated API before returning matches.

```tsx
const searchLanguages = async (query: string): Promise<AutoCompleteOption[]> => {
  await new Promise((resolve) => setTimeout(resolve, 400))
  const normalized = query.toLowerCase()
  return programmingLanguages.filter((language) =>
    language.label.toLowerCase().includes(normalized),
  )
}
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
```

### Free Solo
ID: `AutoComplete.freesolo` • Tags: freesolo, custom, text-input • Category: features • Status: stable • Since: 1.0.0

Suggests fruits while still accepting custom values.

```tsx
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
      <Text size="xs" color="secondary">
        Current value: {value || '(empty)'}
      </Text>
    </Block>
  )
}
```

### Free Solo (multi-select)
ID: `AutoComplete.freesolo-multi` • Tags: freesolo, multi-select, custom, tags • Category: features • Status: stable • Since: 1.0.0

Suggests fruits but lets you add any custom value as a tag — press Enter to add what you typed.

```tsx
const [inputValue, setInputValue] = useState('')
  const [selected, setSelected] = useState<AutoCompleteOption[]>([])
  const handleToggle = (option: AutoCompleteOption) => {
    const isSelected = selected.some((item) => item.value === option.value)
    setSelected((current) =>
      isSelected
        ? current.filter((item) => item.value !== option.value)
        : [...current, option],
    )
  }
  return (
    <Block w={400}>
      <AutoComplete
        label="Favorite fruits"
        placeholder="Type a fruit and press Enter..."
        data={fruits}
        value={inputValue}
        onChangeText={setInputValue}
        onSelect={handleToggle}
        freeSolo
        multiSelect
        selectedValues={selected}
        minSearchLength={0}
        clearable
        onClear={() => {
          setSelected([])
          setInputValue('')
        }}
        selectedValuesContainerStyle={{ flexWrap: 'wrap', gap: 6 }}
        renderSelectedValue={(item, _index, helpers) => (
          <Chip
            key={item.value}
            size="sm"
            variant="light"
            color="primary"
            endIcon={<Icon name="x" size={8} color="currentColor" />}
            onRemove={helpers.onRemove}
          >
            {item.label}
          </Chip>
        )}
      />
    </Block>
  )
}
```

### Grouped suggestions
ID: `AutoComplete.grouped` • Tags: grouped, categories, sections • Category: features • Status: stable • Since: 1.0.0

Countries are organized by region to make large lists easier to scan.

```tsx
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
```

### Rich Content
ID: `AutoComplete.rich` • Tags: rich, custom-render, complex • Category: features • Status: stable • Since: 1.0.0

AutoComplete with custom rendering and complex data structures.

```tsx
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
```

### Highlight colours
ID: `AutoComplete.highlight-colors` • Tags: highlight, palette, theme • Category: styling • Status: stable • Since: 1.0.0

`highlightMatches` bolds and tints the part of each suggestion that matches what you typed. That tint is derived from `theme.colors.primary` by default; pass `highlightColor` (and optionally `highlightBackgroundColor`) to override it — here with shades from `theme.colors.highlight`. Pick a swatch while the menu is open to see the match repaint.

```tsx
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
        <Text size="xs" color="secondary">
          Type a letter or two, then pick a swatch. The first is the default
          (primary ramp); the rest come from `theme.colors.highlight`, paired
          with a soft tint from the same ramp as the match background.
        </Text>
      </Block>
    </Block>
  )
}
```
