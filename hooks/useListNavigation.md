# useListNavigation

Keyboard navigation for a combobox or listbox with virtual focus. Real focus stays in the input while `aria-activedescendant` follows the highlighted option.

## Metadata

- Import: `import { useListNavigation } from '@plocks/ui';`
- Tags: accessibility, keyboard, combobox, listbox
- Docs: https://plocks.dev/hooks/useListNavigation
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/core/accessibility/useListNavigation.ts

## Definition

```ts
export interface UseListNavigationOptions {
  /** Number of options. */
  count: number;
  /** Highlighted option (virtual focus); -1 for none. Controlled. */
  activeIndex: number;
  onActiveChange: (index: number) => void;
  /** Enter on the highlighted option. */
  onSelect?: (index: number) => void;
  /** Wrap past the ends. Default `true`. */
  loop?: boolean;
  /** DOM id of option `i` (referenced by `aria-activedescendant`). */
  getId: (index: number) => string;
  /** Options to skip. */
  isDisabled?: (index: number) => boolean;
  /** Whether the list is showing. Default `true`. Arrows open a closed list via `onOpen`. */
  opened?: boolean;
  onOpen?: () => void;
  /** Escape. */
  onClose?: () => void;
  /** Id of the listbox element (`aria-controls`). */
  listId?: string;
  /**
   * Home/End move the highlight. Default `false`: in an editable combobox they
   * move the text caret. Turn on for non-editable pickers (Select).
   */
  homeEndKeys?: boolean;
  /** Options moved by PageUp/PageDown. Default 10. */
  pageSize?: number;
}

export interface UseListNavigationResult {
  /** Spread on the input / trigger that keeps real focus (combobox). */
  inputProps: ListNavigationInputProps;
  /** Spread on the list container. */
  listProps: A11yProps;
  /** Spread on option `index`. */
  getOptionProps: (index: number) => ListNavigationOptionProps;
  /** The key handler, for inputs that route keys themselves. Returns true when handled. */
  handleKeyDown: (event: KeyboardEventLike) => boolean;
  /** Move virtual focus without a keyboard event. */
  moveNext: () => void;
  movePrevious: () => void;
  /** Select the active option, optionally using the first when none is active. */
  selectActive: (fallbackToFirst?: boolean) => void;
  /** Id of the highlighted option, if any. */
  activeId: string | undefined;
}

export type ListNavigationInputProps = A11yProps & {
  'aria-autocomplete'?: 'list' | 'none' | 'inline' | 'both';

export type ListNavigationOptionProps = A11yProps & { id: string };

export function useListNavigation(options: UseListNavigationOptions): UseListNavigationResult;
```

## Examples

### Filterable list

Type to filter. ↑/↓ move the highlight (skipping disabled options, and wrapping unless `loop: false`), PageUp/PageDown jump by `pageSize` (default 10), and Enter picks the highlighted option. You own the highlight: pass `activeIndex` / `onActiveChange`, `onSelect`, `getId(i)` and `listId`, then spread the returned `inputProps` (combobox role, `aria-expanded`, `aria-controls`, `aria-activedescendant`), `listProps` and `getOptionProps(i)`. react-native-web reports a `TextInput`'s keys through `onKeyPress`, so the demo moves `inputProps.onKeyDown` there; you can also call `handleKeyDown` yourself. For a popup list, pass `opened`, `onOpen` (↑/↓ open it) and `onClose` (Escape closes it), and set `homeEndKeys` for pickers that have no text caret.

```tsx
import { useState } from 'react';
import { Pressable, TextInput } from 'react-native';
import { Block, Text, useA11yId, useListNavigation, useTheme, webProps } from '@plocks/ui';

const FRUITS = ['Apple', 'Apricot', 'Banana', 'Blueberry', 'Cherry', 'Grape', 'Mango', 'Peach'];

// A pointer press on an option must not move focus out of the input.
const keepInputFocus = (event: { preventDefault(): void }) => event.preventDefault();

export function Demo() {
  const theme = useTheme();
  const listId = useA11yId(undefined, 'fruits');
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  const search = query.trim().toLowerCase();
  const options = FRUITS.filter((fruit) => fruit.toLowerCase().includes(search));

  const pick = (index: number) => {
    setQuery(options[index]);
    setActiveIndex(-1);
  };

  const nav = useListNavigation({
    count: options.length,
    activeIndex,
    onActiveChange: setActiveIndex,
    onSelect: pick,
    getId: (index) => `${listId}-option-${index}`,
    listId,
  });

  // react-native-web reports a TextInput's keys through onKeyPress, not onKeyDown.
  const { onKeyDown, ...comboboxProps } = nav.inputProps;

  return (
    <Block fullWidth maw={320} gap="xs">
      <TextInput
        {...comboboxProps}
        aria-label="Fruit"
        placeholder="Search fruit"
        placeholderTextColor={theme.text.muted}
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          setActiveIndex(-1);
        }}
        onKeyPress={onKeyDown}
        autoCapitalize="none"
        autoCorrect={false}
        style={{
          borderWidth: 1,
          borderColor: theme.backgrounds.borderStrong,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 8,
          fontSize: 14,
          fontFamily: theme.fontFamily,
          color: theme.text.primary,
        }}
      />

      <Block {...nav.listProps} gap={0}>
        {options.map((fruit, index) => (
          <Pressable
            key={fruit}
            {...nav.getOptionProps(index)}
            {...webProps({ tabIndex: -1, onMouseDown: keepInputFocus })}
            onPress={() => pick(index)}
            onHoverIn={() => setActiveIndex(index)}
          >
            <Block px="sm" py="xs" radius="sm" bg={index === activeIndex ? 'hover' : undefined}>
              <Text selectable={false}>{fruit}</Text>
            </Block>
          </Pressable>
        ))}
      </Block>
    </Block>
  );
}
```
