# AutoComplete

Provide search functionality with suggestions, supporting single/multi-select, async data loading, and rich content display.

## Metadata

- Import: `import { AutoComplete } from '@plocks/ui';`
- Tags: input, search, typeahead, autocomplete, suggestions
- Docs: https://plocks.dev/components/AutoComplete
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/AutoComplete

## Props

- `testID`: string — Test identifier, forwarded to the underlying text input (the field's focusable element); the root gets `${testID}-root`.
- `data`: AutoCompleteOption[] = EMPTY_OPTIONS — Data source for suggestions
- `onSearch`: (query: string) => Promise<AutoCompleteOption[]> — Async data fetcher
- `minSearchLength`: number = 2 — Minimum characters to trigger search
- `searchDelay`: number = 300 — Debounce delay for `onSearch`, in ms (local `data` filters immediately).
- `renderItem`: ( item: AutoCompleteOption, index: number, options: { query: string; onSelect: (item: AutoCompleteOption) => void; isHighlighted?: boolean; isSelected?: boolean; } ) => React.ReactNode — Custom item renderer (the row stays an accessible option).
- `onSelect`: (item: AutoCompleteOption) => void — Selection handler
- `renderValue`: ( item: AutoCompleteOption, context: { focused: boolean; clear: () => void; } ) => React.ReactNode — Custom renderer for the selected option shown inside the single-select input. When provided and an option is selected, the returned node is overlaid on the text field while it is not focused (focusing the field reveals the editable text so the query can be changed). Ignored in multiSelect mode — use `renderSelectedValue` for chips there.
- `maxSuggestions`: number = 10 — Maximum number of suggestions to display (0 = no limit).
- `showSuggestionsOnFocus`: boolean = true — Whether to show suggestions on focus (default: true)
- `renderEmptyState`: () => React.ReactNode — Custom empty state component
- `renderLoadingState`: () => React.ReactNode — Custom loading state component
- `filter`: (item: AutoCompleteOption, query: string) => boolean = defaultFilter — Filter function for local data
- `highlightMatches`: boolean = true — Whether to highlight matching text
- `highlightColor`: string — Text color for the matched substring when `highlightMatches` is on. Defaults to the theme's link (accent text) color.
- `highlightBackgroundColor`: string = 'transparent' — Background color painted behind the matched substring (default: transparent — the match is distinguished by color and weight).
- `suggestionsStyle`: StyleProp<ViewStyle> — Styles for the suggestions surface.
- `suggestionItemStyle`: StyleProp<ViewStyle> — Styles for each suggestion row.
- `groupLabelProps`: Omit<TextProps, 'children'> — Override props for each group header `<Text>` (style, weight, size, color, uppercase…). Headers use the theme's `sectionLabel` text role by default.
- `multiSelect`: boolean = false — Enable multi-select mode
- `selectedValues`: AutoCompleteOption[] = EMPTY_OPTIONS — Selected values for multi-select mode
- `renderSelectedValue`: ( item: AutoCompleteOption, index: number, context: { onRemove: () => void; disabled: boolean; isFocused: boolean; inputValue: string; source: 'input' | 'modal'; } ) => React.ReactNode — Custom renderer for each selected value chip in multi-select mode
- `selectedValuesContainerStyle`: StyleProp<ViewStyle> — Optional style override for the selected values container
- `selectedValueChipProps`: Partial<ChipProps> — Additional props applied to the default Chip renderer for selected values
- `refocusAfterSelect`: boolean — Controls whether the input regains focus after selecting an option
- `freeSolo`: boolean = false — Whether to allow free-form input (Enter commits the typed text as an option)
- `displayProperty`: 'label' | 'value' = 'label' — Which field of the selected option is written into the input: its human-readable `label`, or its `value`.
- `useModal`: boolean — Present suggestions in a modal sheet (true) or an anchored dropdown (false). Default: sheet on native and small screens, dropdown on desktop web.
- `textInputProps`: Omit<TextInputProps, 'value' | 'onChangeText' | 'placeholder'> — Additional TextInput props
- `placement`: 'top' | 'bottom' | 'left' | 'right' | 'auto' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end' = 'bottom-start' — Placement preference for the suggestions dropdown (default: 'bottom-start')
- `fallbackPlacements`: PlacementType[] = DEFAULT_FALLBACK_PLACEMENTS — Placements to try when the preferred one doesn't fit.
- `offset`: number = 4 — Gap between the field and the dropdown, px (default: 4)
- `flip`: boolean = true — Enable flipping to opposite side when dropdown would go off-screen (default: true)
- `shift`: boolean = false — Enable shifting within bounds when dropdown would go off-screen (default: false)
- `boundary`: number = 12 — Distance from viewport edges in pixels (default: 12)
- `autoReposition`: boolean = true — Enable automatic repositioning on scroll/resize (default: true)
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — field (`label` `description` `error` `helperText` `required` `withAsterisk` `disabled` `readOnly` `size` `radius` `variant` `name` `accessibilityLabel` `accessibilityHint` `keyboardFocusId` `labelProps` `descriptionProps` `onFocus` `onBlur`), text field (`value` `defaultValue` `onChangeText` `placeholder` `placeholderTextColor` `clearable` `clearButtonLabel` `onClear` `onEnter` `startSection` `endSection` `startSectionProps` `endSectionProps`), base (`style`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), sizing (`fullWidth`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`), disclaimer (`disclaimer` `disclaimerProps`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface AutoCompleteOption {
  label: string;
  value: string;
  group?: string;
  disabled?: boolean;
  /** Additional data for the option (free-form; read it back in `renderItem` / `onSelect`). */
  data?: unknown;
}
```

## Examples

### Basics

Simple auto-complete. Start typing to filter the list. Selecting an option fills the input.

```tsx
import { AutoComplete, Block } from '@plocks/ui';

const sports = [
  { label: 'Football', value: 'football' },
  { label: 'Basketball', value: 'basketball' },
  { label: 'Soccer', value: 'soccer' },
  { label: 'Baseball', value: 'baseball' },
  { label: 'Tennis', value: 'tennis' },
  { label: 'Golf', value: 'golf' },
  { label: 'Swimming', value: 'swimming' },
  { label: 'Volleyball', value: 'volleyball' },
  { label: 'Cricket', value: 'cricket' },
  { label: 'Rugby', value: 'rugby' },
  { label: 'Softball', value: 'softball' },
  { label: 'Hockey', value: 'hockey' },
];

export function Demo() {
  return (
    <Block fullWidth>
      <AutoComplete
        label="Choose a sport"
        placeholder="Search for a sport..."
        data={sports}
        minSearchLength={1}
        fullWidth
      />
    </Block>
  );
}
```

### Multi-select tags

Tap an item to add or remove it. Selected genres render as removable chips.

```tsx
import { useState } from 'react';
import { AutoComplete, Block } from '@plocks/ui';
import type { AutoCompleteOption } from '@plocks/ui';

const genres = [
  { label: 'Pop', value: 'pop' },
  { label: 'Rock', value: 'rock' },
  { label: 'Hip Hop', value: 'hiphop' },
  { label: 'Jazz', value: 'jazz' },
  { label: 'Classical', value: 'classical' },
  { label: 'Electronic', value: 'electronic' },
  { label: 'Country', value: 'country' },
  { label: 'R&B', value: 'rnb' },
];

export function Demo() {
  const [selectedGenres, setSelectedGenres] = useState<AutoCompleteOption[]>([]);

  const handleToggle = (option: AutoCompleteOption) => {
    const isSelected = selectedGenres.some((genre) => genre.value === option.value);

    setSelectedGenres((current) =>
      isSelected
        ? current.filter((genre) => genre.value !== option.value)
        : [...current, option],
    );
  };

  return (
    <Block fullWidth>
      <AutoComplete
        label="Music genres"
        placeholder="Search genres..."
        data={genres}
        onSelect={handleToggle}
        multiSelect
        selectedValues={selectedGenres}
        minSearchLength={0}
        fullWidth
      />
    </Block>
  );
}
```

### Variants

Compare the default, filled, outline, and unstyled field shells on AutoComplete.

```tsx
import { Column, AutoComplete } from '@plocks/ui';

const options = ['Apple', 'Banana', 'Cherry'].map(value => ({ label: value, value: value.toLowerCase() }));

const variants = ['default', 'filled', 'outline', 'unstyled'] as const;

export function Demo() {
  return (
    <Column gap="md" fullWidth>
      {variants.map(variant => (
        <AutoComplete key={variant} variant={variant} label={`${variant} variant`} data={options} placeholder="Choose a fruit" />
      ))}
    </Column>
  );
}
```

### Select-Like Behavior

Behaves like a Select: the field is non-editable (`editable={false}`), so it can't be typed into or filtered. Tapping opens the full option list (`filter={() => true}`) and the value is chosen from it.

```tsx
import { AutoComplete, Block } from '@plocks/ui';

const countries = [
  { label: 'United States', value: 'us' },
  { label: 'Canada', value: 'ca' },
  { label: 'United Kingdom', value: 'uk' },
  { label: 'Germany', value: 'de' },
  { label: 'France', value: 'fr' },
  { label: 'Italy', value: 'it' },
  { label: 'Spain', value: 'es' },
  { label: 'Netherlands', value: 'nl' },
  { label: 'Australia', value: 'au' },
  { label: 'Japan', value: 'jp' },
  { label: 'South Korea', value: 'kr' },
  { label: 'Brazil', value: 'br' },
  { label: 'Mexico', value: 'mx' },
  { label: 'India', value: 'in' },
  { label: 'China', value: 'cn' },
];

export function Demo() {
  return (
    <Block fullWidth>
      <AutoComplete
        label="Country"
        placeholder="Select a country..."
        data={countries}
        maxSuggestions={countries.length}
        editable={false}
        caretHidden
        filter={() => true}
        highlightMatches={false}
        fullWidth
      />
    </Block>
  );
}
```

### Async auto-complete

Performs a debounced search against a simulated API before returning matches.

```tsx
import { AutoComplete, Block } from '@plocks/ui';

const languages = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Python', value: 'python' },
  { label: 'Java', value: 'java' },
  { label: 'C++', value: 'cpp' },
  { label: 'C#', value: 'csharp' },
  { label: 'Go', value: 'go' },
  { label: 'Rust', value: 'rust' },
  { label: 'Swift', value: 'swift' },
  { label: 'Kotlin', value: 'kotlin' },
];

const searchLanguages = async (query: string) => {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const normalized = query.toLowerCase();
  return languages.filter((language) => language.label.toLowerCase().includes(normalized));
};

export function Demo() {
  return (
    <Block fullWidth>
      <AutoComplete
        label="Search programming languages"
        placeholder="Start typing..."
        onSearch={searchLanguages}
        fullWidth
      />
    </Block>
  );
}
```

### Free Solo

Suggests fruits while still accepting custom values.

```tsx
import { AutoComplete, Block } from '@plocks/ui';

const fruits = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Orange', value: 'orange' },
  { label: 'Grape', value: 'grape' },
  { label: 'Mango', value: 'mango' },
  { label: 'Pineapple', value: 'pineapple' },
];

export function Demo() {
  return (
    <Block fullWidth>
      <AutoComplete
        label="Favorite fruit"
        placeholder="Type anything..."
        data={fruits}
        freeSolo
        minSearchLength={0}
        fullWidth
      />
    </Block>
  );
}
```

### Free Solo (multi-select)

Suggests fruits but lets you add any custom value as a tag — press Enter to add what you typed.

```tsx
import { useState } from 'react';
import { AutoComplete, Block } from '@plocks/ui';
import type { AutoCompleteOption } from '@plocks/ui';

const fruits = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Orange', value: 'orange' },
  { label: 'Grape', value: 'grape' },
  { label: 'Mango', value: 'mango' },
  { label: 'Pineapple', value: 'pineapple' },
];

export function Demo() {
  const [selected, setSelected] = useState<AutoCompleteOption[]>([]);

  const handleToggle = (option: AutoCompleteOption) => {
    const isSelected = selected.some((item) => item.value === option.value);

    setSelected((current) =>
      isSelected
        ? current.filter((item) => item.value !== option.value)
        : [...current, option],
    );
  };

  return (
    <Block fullWidth>
      <AutoComplete
        label="Favorite fruits"
        placeholder="Type a fruit and press Enter..."
        data={fruits}
        onSelect={handleToggle}
        freeSolo
        multiSelect
        selectedValues={selected}
        minSearchLength={0}
        fullWidth
      />
    </Block>
  );
}
```

### Grouped suggestions

Countries are organized by region to make large lists easier to scan.

```tsx
import { AutoComplete, Block } from '@plocks/ui';

const countries = [
  { label: 'United States', value: 'us', group: 'North America' },
  { label: 'Canada', value: 'ca', group: 'North America' },
  { label: 'Mexico', value: 'mx', group: 'North America' },
  { label: 'United Kingdom', value: 'uk', group: 'Europe' },
  { label: 'Germany', value: 'de', group: 'Europe' },
  { label: 'France', value: 'fr', group: 'Europe' },
  { label: 'Japan', value: 'jp', group: 'Asia' },
  { label: 'India', value: 'in', group: 'Asia' },
  { label: 'Australia', value: 'au', group: 'Oceania' },
  { label: 'Brazil', value: 'br', group: 'South America' },
];

export function Demo() {
  return (
    <Block fullWidth>
      <AutoComplete
        label="Search countries"
        placeholder="Search for a country..."
        data={countries}
        minSearchLength={1}
        fullWidth
      />
    </Block>
  );
}
```

### Rich Content

Pass `renderItem` to lay out each suggestion and `renderValue` to draw the chosen option inside the field; `refocusAfterSelect={false}` blurs the field on select so that value shows right away.

```tsx
import { AutoComplete, Block, Column, Icon, MenuItemButton, Row, Text } from '@plocks/ui';

interface RichSportOption {
  label: string;
  value: string;
  emoji: string;
  color: string;
  price: number;
  duration: string;
}

const sports: RichSportOption[] = [
  { label: 'Soccer', value: 'soccer', emoji: '⚽', color: '#22c55e', price: 75.5, duration: '90 min' },
  { label: 'Basketball', value: 'basketball', emoji: '🏀', color: '#f97316', price: 120.0, duration: '48 min' },
  { label: 'Football', value: 'football', emoji: '🏈', color: '#92400e', price: 180.0, duration: '60 min' },
  { label: 'Volleyball', value: 'volleyball', emoji: '🏐', color: '#fbbf24', price: 60.0, duration: 'Best of 5' },
  { label: 'Baseball', value: 'baseball', emoji: '⚾', color: '#ef4444', price: 85.0, duration: '9 innings' },
  { label: 'Golf', value: 'golf', emoji: '⛳', color: '#15803d', price: 110.0, duration: '4 hrs' },
];

const tint = (hex: string, alpha: string) => `${hex}${alpha}`;

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
);

export function Demo() {
  return (
    <Block fullWidth>
      <AutoComplete
        label="Search sports"
        placeholder="Search sports..."
        data={sports}
        refocusAfterSelect={false}
        renderItem={(item, _index, helpers) => {
          const sport = item as RichSportOption;

          return (
            <MenuItemButton
              rounded={false}
              compact
              fullWidth
              active={helpers.isHighlighted || helpers.isSelected}
              onPress={() => helpers.onSelect(sport)}
              style={{ alignItems: 'stretch', gap: 0 }}
            >
              <Row align="center" gap="md" px="md" py="sm" fullWidth>
                {renderTile(sport, 40)}

                <Column grow={1} gap="xs">
                  <Text size="sm" fw="semibold" numberOfLines={1}>
                    {sport.label}
                  </Text>
                  <Text size="xs" c="secondary" numberOfLines={1}>
                    {sport.duration}
                  </Text>
                </Column>

                <Column align="flex-end" gap="xs">
                  <Text size="sm" fw="semibold">
                    ${sport.price.toFixed(2)}
                  </Text>
                  <Text size="xs" c="secondary">
                    avg ticket
                  </Text>
                </Column>

                {helpers.isSelected ? (
                  <Icon name="check" size={16} stroke={3} color={sport.color} />
                ) : (
                  <Block w={16} />
                )}
              </Row>
            </MenuItemButton>
          );
        }}
        renderValue={(item) => {
          const sport = item as RichSportOption;

          return (
            <Row align="center" gap="sm" grow={1}>
              {renderTile(sport, 24)}
              <Text size="sm" fw="semibold">{sport.label}</Text>
              <Text size="xs" c="secondary">
                {sport.duration}
              </Text>
              <Block grow={1} />
              <Text size="sm" fw="semibold">
                ${sport.price.toFixed(2)}
              </Text>
            </Row>
          );
        }}
        minSearchLength={1}
        fullWidth
      />
    </Block>
  );
}
```

### Highlight colours

`highlightMatches` bolds and tints the part of each suggestion that matches what you typed. Pass `highlightColor` (a CSS color or a palette shade such as `'highlight.8'`) to change that tint, and optionally `highlightBackgroundColor` to fill behind it.

```tsx
import { AutoComplete, Block } from '@plocks/ui';

const fruits = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Date', value: 'date' },
  { label: 'Elderberry', value: 'elderberry' },
  { label: 'Fig', value: 'fig' },
  { label: 'Grape', value: 'grape' },
  { label: 'Honeydew', value: 'honeydew' },
];

export function Demo() {
  return (
    <Block fullWidth>
      <AutoComplete
        label="Search fruits"
        placeholder="Type to search fruits..."
        data={fruits}
        highlightColor="highlight.8"
        minSearchLength={0}
        fullWidth
      />
    </Block>
  );
}
```
