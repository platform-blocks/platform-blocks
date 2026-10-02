# Search

Search provides a text field with debouncing, loading feedback, and a clear control.

## Metadata

- Import: `import { Search } from '@plocks/ui';`
- Tags: search, input, filter, debounce
- Docs: https://plocks.dev/components/Search
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Search

## Props

- `value`: string — Controlled query.
- `defaultValue`: string — Initial query while uncontrolled.
- `onChangeText`: (value: string) => void — Called with the query as the user types (after `debounce` ms when set).
- `onSubmit`: (value: string) => void — Called with the query on Enter, and with `''` when cleared.
- `placeholder`: string
- `size`: SizeValue
- `radius`: RadiusValue
- `autoFocus`: boolean
- `debounce`: number — Delay (ms) before `onChangeText` fires; typing still shows immediately.
- `clearButton`: boolean — Show a clear button while there is a query. Default true.
- `clearButtonLabel`: string — Accessible name of the clear button. Default `'Clear search'`.
- `loading`: boolean — Show a loading indicator in place of the clear button.
- `endSection`: React.ReactNode
- `accessibilityLabel`: string — Accessible name of the field (or the button in `buttonMode`). Default `'Search'`.
- `disabled`: boolean
- `buttonMode`: boolean — When true, renders as a button (e.g. a Spotlight launcher) instead of a typeable input
- `onPress`: () => void — Called when the button is pressed (buttonMode only)
- `rightComponent`: React.ReactNode — Component to render on the right side (useful for button mode to show shortcuts like CMD+K)
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Examples

### Basics

Control the `Search` value with local state so you can react to user input and mirror the query elsewhere in your UI.

```tsx
import { useState } from 'react';
import { Block, Search, Text } from '@plocks/ui';

export function Demo() {
  const [query, setQuery] = useState('');

  return (
    <Block maw={320} w="100%">
      <Search value={query} onChangeText={setQuery} placeholder="Search docs" />
      <Text size="xs" c="muted">
        Current query: {query || '—'}
      </Text>
    </Block>
  );
}
```

### Button mode

Set `buttonMode` to turn `Search` into a pressable launcher — for example `onPress={() => spotlight.open()}` with `@plocks/spotlight` — and pass a `rightComponent` with `KeyCap` shortcuts so users discover keyboard access.

```tsx
import { KeyCap, Row, Search, useToast } from '@plocks/ui';

export function Demo() {
  const toast = useToast();

  return (
    <Search
      buttonMode
      maw={420}
      placeholder="Search the workspace"
      onPress={() => toast.show({ message: 'Open your search here' })}
      rightComponent={(
        <Row gap="xs" align="center">
          <KeyCap size="xs">⌘</KeyCap>
          <KeyCap size="xs">K</KeyCap>
        </Row>
      )}
    />
  );
}
```
