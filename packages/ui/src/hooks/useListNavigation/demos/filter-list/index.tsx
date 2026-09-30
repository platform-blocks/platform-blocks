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
