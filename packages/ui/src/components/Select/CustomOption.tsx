import React, { useState } from 'react';
import { Pressable } from 'react-native';

import { useTheme } from '../../core/theme';
import { surfaceInteractionTint } from '../../core/theme/surfaces';

import type { SelectOption } from './Select.types';

export interface CustomOptionProps {
  option: SelectOption;
  selected: boolean;
  render: (option: SelectOption, active: boolean, selected: boolean) => React.ReactNode;
  onSelect: (option: SelectOption) => void;
}

/**
 * A `renderOption` row.
 *
 * The custom node is only the option's *appearance* — the row still has to be
 * pressable, or the dropdown renders fine and selects nothing. It also paints
 * the same neutral hover/pressed tint the built-in rows get from
 * MenuItemButton, so a custom row feels alive under the pointer without every
 * caller reimplementing it. The tint is a translucent overlay *behind* the
 * custom node, so a `renderOption` that paints its own background (a selected
 * state, say) still wins.
 *
 * `active` is passed through for callers that want to go further than the
 * default tint — swapping an icon, showing a chevron, restyling the text.
 */
export function CustomOption({ option, selected, render, onSelect }: CustomOptionProps) {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);
  const disabled = !!option.disabled;
  const active = hovered && !disabled;

  return (
    <Pressable
      onPress={disabled ? undefined : () => onSelect(option)}
      disabled={disabled}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      accessibilityRole="button"
      accessibilityLabel={option.label}
      accessibilityState={{ selected, disabled }}
      style={(state) => {
        // Web reports hover on the style state; native only has `pressed`, so
        // the local hover state covers both.
        const isHovered = (state as any).hovered || hovered;
        if (disabled) return { opacity: 0.45 };
        if (state.pressed) return { backgroundColor: surfaceInteractionTint(theme, 'pressed') };
        if (isHovered) return { backgroundColor: surfaceInteractionTint(theme, 'hover') };
        return {};
      }}
    >
      {render(option, active, selected)}
    </Pressable>
  );
}

export default CustomOption;
