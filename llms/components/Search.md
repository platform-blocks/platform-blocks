# Search

The Search component provides a search input with debouncing, loading states, and customizable clear functionality.

## Metadata

- Canonical name: `Search`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Search } from '@platform-blocks/react-ui-library';`
- Category: input
- Tags: search, input, filter, debounce
- Docs: https://react-ui-library.com/components/Search
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Search

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | string | No |  |  |
| `defaultValue` | string | No |  |  |
| `onChange` | (value: string) => void | No |  |  |
| `onSubmit` | (value: string) => void | No |  |  |
| `placeholder` | string | No |  |  |
| `size` | SizeValue | No |  |  |
| `radius` | any | No |  |  |
| `autoFocus` | boolean | No |  |  |
| `debounce` | number | No |  |  |
| `clearButton` | boolean | No |  |  |
| `loading` | boolean | No |  |  |
| `endSection` | React.ReactNode | No |  |  |
| `accessibilityLabel` | string | No |  |  |
| `style` | any | No |  |  |
| `buttonMode` | boolean | No |  | When true, renders as a button that opens the spotlight instead of a typeable input |
| `onPress` | () => void | No |  | Callback when search button is pressed (only used in buttonMode) |
| `rightComponent` | React.ReactNode | No |  | Component to render on the right side (useful for button mode to show shortcuts like CMD+K) |
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

## Examples

### Basic search
ID: `Search.basic` • Tags: controlled, input • Category: basics • Status: stable • Since: 0.3.0

Control the `Search` value with local state so you can react to user input and mirror the query elsewhere in your UI.

```tsx
const [query, setQuery] = useState('');
  return (
    <Block maxW={320} w="100%">
      <Search value={query} onChange={setQuery} placeholder="Search docs" />
      <Text size="xs" color="muted">
        Current query: {query || '—'}
      </Text>
    </Block>
  );
}
```

### Button mode
ID: `Search.button-mode` • Tags: spotlight, shortcuts • Category: behavior • Status: stable • Since: 0.3.0

Set `buttonMode` to turn `Search` into a pressable launcher and pass a `rightComponent` with `KeyCap` shortcuts so users discover keyboard access.

```tsx
const toast = useToast();
  const handleCustomPress = () => {
    toast.show({ message: 'Launching saved search…' });
  };
  return (
    <Block maxW={420} w="100%">
      <Block>
        <Text size="xs" color="muted">
          Default Spotlight launcher
        </Text>
        <Search
          buttonMode
          placeholder="Search the workspace"
          rightComponent={(
            <Row gap="xs" align="center">
              <KeyCap size="xs">⌘</KeyCap>
              <KeyCap size="xs">K</KeyCap>
            </Row>
          )}
        />
      </Block>
      <Block>
        <Text size="xs" color="muted">
          Custom handler with shortcut hint
        </Text>
        <Search
          buttonMode
          placeholder="Search analytics"
          onPress={handleCustomPress}
          rightComponent={(
            <Row gap="xs" align="center">
              <KeyCap size="xs" variant="outline">
                Ctrl
              </KeyCap>
              <KeyCap size="xs" variant="outline">
                F
              </KeyCap>
            </Row>
          )}
        />
      </Block>
    </Block>
  );
}
```
