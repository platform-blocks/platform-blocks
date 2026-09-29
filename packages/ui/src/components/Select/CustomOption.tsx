import React, { useState } from 'react';
import { Pressable } from 'react-native';

import type { ListNavigationOptionProps } from '../../core/accessibility/useListNavigation';
import { webProps, webStyle } from '../../core/platform';
import { useTheme } from '../../core/theme/ThemeProvider';

import type { SelectOption } from './Select.types';

export interface CustomOptionProps<T> {
  option: SelectOption<T>;
  index: number;
  /** `role="option"`, id and state from the list navigation. */
  optionProps: ListNavigationOptionProps;
  selected: boolean;
  /** Keyboard / pointer highlight. */
  active: boolean;
  /** Real focus stays on the trigger (anchored dropdown): rows aren't tab stops and don't steal focus. */
  virtualFocus: boolean;
  render: (option: SelectOption<T>, active: boolean, selected: boolean) => React.ReactNode;
  onSelect: (index: number) => void;
  onHover: (index: number) => void;
}

const preventDefault = (event: { preventDefault(): void }) => event.preventDefault();

/**
 * A `renderOption` row.
 *
 * The custom node is only the option's *appearance*: the row is still a
 * pressable `role="option"` with `aria-selected` and the option's label as its
 * accessible name, so a custom look never costs selection or semantics. It
 * paints the same neutral hover / pressed tints the built-in rows use, behind
 * the custom node, so a `renderOption` that paints its own background wins.
 *
 * `active` is the keyboard / pointer highlight, for callers that restyle it.
 */
export function CustomOption<T>({
  option,
  index,
  optionProps,
  selected,
  active,
  virtualFocus,
  render,
  onSelect,
  onHover,
}: CustomOptionProps<T>) {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);
  const disabled = !!option.disabled;
  const highlighted = (active || hovered) && !disabled;

  return (
    <Pressable
      {...optionProps}
      aria-selected={selected}
      aria-label={option.label}
      onPress={disabled ? undefined : () => onSelect(index)}
      disabled={disabled}
      onHoverIn={() => {
        setHovered(true);
        if (!disabled) onHover(index);
      }}
      onHoverOut={() => setHovered(false)}
      {...webProps({ tabIndex: virtualFocus ? -1 : undefined, onMouseDown: virtualFocus ? preventDefault : undefined })}
      style={({ pressed }) => [
        disabled ? { opacity: 0.45 } : null,
        pressed && !disabled
          ? { backgroundColor: theme.backgrounds.pressed }
          : highlighted
            ? { backgroundColor: theme.backgrounds.hover }
            : null,
        webStyle({ cursor: disabled ? 'not-allowed' : 'pointer' }),
      ]}
    >
      {render(option, highlighted, selected)}
    </Pressable>
  );
}

export default CustomOption;
