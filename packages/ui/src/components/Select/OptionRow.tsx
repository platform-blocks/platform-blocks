import React, { memo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import type { ListNavigationOptionProps } from '../../core/accessibility/useListNavigation';
import { webProps, webStyle } from '../../core/platform';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getControlSize } from '../../core/theme/tokens';
import type { SizeValue } from '../../core/theme/types';
import { Icon } from '../Icon';

export interface OptionRowProps {
  /** `role="option"`, id and state from `useListNavigation().getOptionProps(i)`. */
  optionProps: ListNavigationOptionProps;
  /** Row label: plain text, or a node (e.g. a `Highlight`). */
  label: React.ReactNode;
  /** Muted second line. */
  description?: string;
  /** The chosen value — shows the check mark and sets `aria-selected`. */
  selected: boolean;
  /** Highlighted by the keyboard / pointer (the `aria-activedescendant`). */
  active: boolean;
  disabled?: boolean;
  /** Position in the list; passed back to `onSelect` / `onHover` so they can be stable. */
  index: number;
  onSelect: (index: number) => void;
  /** Pointer hover — moves the highlight here. */
  onHover?: (index: number) => void;
  size?: SizeValue;
  /**
   * Keep real focus on the input / trigger (anchored listbox with
   * `aria-activedescendant`): the row can't take focus and a pointer press
   * doesn't steal it. `false` in a modal sheet, where rows are tabbable.
   */
  virtualFocus?: boolean;
  /** Always reserve the check slot (multi-select lists), so rows don't shift. */
  reserveCheckSpace?: boolean;
  /** Hide the selection check mark. @default true */
  showCheckIcon?: boolean;
  /** Position of the selection check mark. @default 'start' */
  checkIconPosition?: 'start' | 'end';
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

const preventDefault = (event: { preventDefault(): void }) => event.preventDefault();

/**
 * Internal: one listbox option for Select / AutoComplete — `role="option"`
 * with `aria-selected` (the chosen value) and `aria-disabled`, a check mark
 * on the selected row, theme hover / pressed / active fills.
 */
export const OptionRow = memo(function OptionRow({
  optionProps,
  label,
  description,
  selected,
  active,
  disabled = false,
  index,
  onSelect,
  onHover,
  size = 'md',
  virtualFocus = true,
  reserveCheckSpace = false,
  showCheckIcon = true,
  checkIconPosition = 'start',
  testID,
  style,
}: OptionRowProps) {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);
  const metrics = getControlSize(theme, size);
  const checkSize = Math.max(12, Math.round(metrics.iconSize * 0.875));
  const labelColor = disabled ? theme.text.disabled : theme.text.primary;
  const highlighted = !disabled && (active || hovered);

  return (
    <Pressable
      {...optionProps}
      aria-selected={selected}
      onPress={disabled ? undefined : () => onSelect(index)}
      disabled={disabled}
      onHoverIn={() => {
        setHovered(true);
        if (!disabled) onHover?.(index);
      }}
      onHoverOut={() => setHovered(false)}
      testID={testID}
      {...webProps({ tabIndex: virtualFocus ? -1 : undefined, onMouseDown: virtualFocus ? preventDefault : undefined })}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: metrics.gap,
          minHeight: Math.max(32, metrics.height - 4),
          paddingHorizontal: metrics.paddingX,
          paddingVertical: Math.max(4, Math.round(metrics.gap)),
          opacity: disabled ? 0.45 : 1,
        },
        pressed && !disabled
          ? { backgroundColor: theme.backgrounds.pressed }
          : highlighted
            ? { backgroundColor: theme.backgrounds.hover }
            : null,
        webStyle({ cursor: disabled ? 'not-allowed' : 'pointer', userSelect: 'none' }),
        style,
      ]}
    >
      {checkIconPosition === 'start' && showCheckIcon && (selected || reserveCheckSpace) ? (
        <View style={{ width: checkSize, height: checkSize, alignItems: 'center', justifyContent: 'center' }}>
          {selected ? <Icon name="check" size={checkSize} color={theme.colors.primary[5]} decorative /> : null}
        </View>
      ) : null}
      <View style={{ flex: 1, minWidth: 0 }}>
        {typeof label === 'string' || typeof label === 'number' ? (
          <Text
            numberOfLines={1}
            style={{
              fontSize: metrics.fontSize,
              fontFamily: theme.fontFamily,
              fontWeight: selected ? '600' : '500',
              color: labelColor,
            }}
          >
            {label}
          </Text>
        ) : (
          label
        )}
        {description ? (
          <Text
            numberOfLines={2}
            style={{
              fontSize: Math.max(11, metrics.fontSize - 2),
              fontFamily: theme.fontFamily,
              color: disabled ? theme.text.disabled : theme.text.muted,
            }}
          >
            {description}
          </Text>
        ) : null}
      </View>
      {checkIconPosition === 'end' && showCheckIcon && (selected || reserveCheckSpace) ? (
        <View style={{ width: checkSize, height: checkSize, alignItems: 'center', justifyContent: 'center' }}>
          {selected ? <Icon name="check" size={checkSize} color={theme.colors.primary[5]} decorative /> : null}
        </View>
      ) : null}
    </Pressable>
  );
});
