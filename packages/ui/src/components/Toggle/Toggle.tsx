import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';

import { a11yProps } from '../../core/accessibility/a11yProps';
import type { KeyboardEventLike } from '../../core/accessibility/keyboard';
import { getNodeText } from '../../core/accessibility/useA11yId';
import { useRovingFocus, type RovingItemProps } from '../../core/accessibility/useRovingFocus';
import { factory } from '../../core/factory';
import { webProps, webStyle } from '../../core/platform';
import type { RadiusValue } from '../../core/theme/radius';
import { resolveAccentColor, resolveTextColor } from '../../core/theme/resolveColors';
import type { SizeValue } from '../../core/theme/sizes';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getControlSize, onColor, resolveRadius } from '../../core/theme/tokens';
import type { PlatformBlocksTheme } from '../../core/theme/types';
import { extractLayoutProps, getLayoutStyles } from '../../core/utils/layout';
import { warnOnce } from '../../core/utils/logger';
import { useMergedRef } from '../../core/utils/mergeRefs';
import { extractStyleProps, resolveStyleProps } from '../../core/utils/spacing';
import { useControllableState } from '../../hooks/useControllableState';
import { extractDisclaimerProps, useDisclaimer } from '../_internal/Disclaimer';
import { Text } from '../Text';
import type {
  ToggleButtonProps,
  ToggleGroupContextValue,
  ToggleGroupProps,
  ToggleGroupValue,
  ToggleValue,
  ToggleVariant,
} from './types';

interface ToggleGroupInternalContext extends ToggleGroupContextValue {
  orientation: 'horizontal' | 'vertical';
  radius?: RadiusValue;
  isSelected: (value: ToggleValue) => boolean;
  getItemProps: (index: number) => RovingItemProps;
}

const ToggleGroupContext = createContext<ToggleGroupInternalContext | null>(null);
ToggleGroupContext.displayName = 'ToggleGroupContext';

/** A button's position in its group, provided by ToggleGroup around each child. */
interface ToggleItemPosition {
  index: number;
  isFirst: boolean;
  isLast: boolean;
}
const ToggleItemContext = createContext<ToggleItemPosition | null>(null);
ToggleItemContext.displayName = 'ToggleItemContext';

const STANDALONE: ToggleItemPosition = { index: 0, isFirst: true, isLast: true };

interface ToggleStyleParams {
  theme: PlatformBlocksTheme;
  selected: boolean;
  disabled: boolean;
  size: SizeValue;
  color?: string;
  variant: ToggleVariant;
  radius?: RadiusValue;
  position: ToggleItemPosition;
  orientation: 'horizontal' | 'vertical';
}

/** Box + color style of one toggle button (standalone, or a segment of a group). */
function getToggleButtonStyle({
  theme,
  selected,
  disabled,
  size,
  color,
  variant,
  radius,
  position,
  orientation,
}: ToggleStyleParams): { box: ViewStyle; textColor: string } {
  const control = getControlSize(theme, size);
  const accent = resolveAccentColor(theme, color ?? 'primary') ?? theme.text.link;
  const isGhost = variant === 'ghost';
  const r = radius === undefined ? control.radius : resolveRadius(theme, radius);

  const box: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: control.height,
    minHeight: control.height,
    paddingHorizontal: control.paddingX,
    borderWidth: isGhost ? 0 : 1,
    backgroundColor: selected ? (isGhost ? theme.backgrounds.selected : accent) : 'transparent',
    borderColor: isGhost ? 'transparent' : accent,
    opacity: disabled ? 0.5 : 1,
  };

  // Segments share borders and only round the group's outer corners (logical
  // corners, so the group mirrors under RTL).
  const { isFirst, isLast } = position;
  if (isFirst && isLast) {
    box.borderRadius = r;
  } else if (orientation === 'horizontal') {
    box.borderTopStartRadius = isFirst ? r : 0;
    box.borderBottomStartRadius = isFirst ? r : 0;
    box.borderTopEndRadius = isLast ? r : 0;
    box.borderBottomEndRadius = isLast ? r : 0;
    if (!isLast) box.borderEndWidth = 0;
  } else {
    box.borderTopStartRadius = isFirst ? r : 0;
    box.borderTopEndRadius = isFirst ? r : 0;
    box.borderBottomStartRadius = isLast ? r : 0;
    box.borderBottomEndRadius = isLast ? r : 0;
    if (!isLast) box.borderBottomWidth = 0;
  }

  const textColor = selected
    ? isGhost
      ? (resolveTextColor(theme, color ?? 'primary') ?? theme.text.primary)
      : onColor(theme, accent)
    : accent;

  return { box, textColor };
}

/**
 * A toggle button: standalone (a button with `aria-pressed`, controlled by
 * `selected` + `onPress`), or a segment of a ToggleGroup, which supplies its
 * selected state, size, color and keyboard navigation.
 */
export const ToggleButton = factory<{ props: ToggleButtonProps; ref: View }>((props, ref) => {
  const { styleProps, otherProps: propsAfterSpacing } = extractStyleProps(props);
  const { layoutProps, otherProps } = extractLayoutProps(propsAfterSpacing);
  const {
    value,
    selected: selectedProp,
    onPress: onPressProp,
    disabled: disabledProp,
    children,
    size: sizeProp,
    color: colorProp,
    variant: variantProp,
    radius: radiusProp,
    style,
    testID,
    accessibilityLabel,
    ...rest
  } = otherProps;

  const theme = useTheme();
  const group = useContext(ToggleGroupContext);
  const itemPosition = useContext(ToggleItemContext);
  const position = group && itemPosition ? itemPosition : STANDALONE;

  const selected = selectedProp ?? (group ? group.isSelected(value) : false);
  const disabled = disabledProp ?? group?.disabled ?? false;
  const size = sizeProp ?? group?.size ?? 'md';
  // A button's own color wins over the group's.
  const color = colorProp ?? group?.color;
  const variant = variantProp ?? group?.variant ?? 'solid';
  const radius = radiusProp ?? group?.radius;
  const orientation = group?.orientation ?? 'horizontal';

  const { box, textColor } = useMemo(
    () => getToggleButtonStyle({ theme, selected, disabled, size, color, variant, radius, position, orientation }),
    [theme, selected, disabled, size, color, variant, radius, position, orientation]
  );

  const handlePress = useCallback(() => {
    if (disabled) return;
    if (group?.onChange) group.onChange(value);
    else onPressProp?.(value);
  }, [disabled, group, value, onPressProp]);

  const roving = group && itemPosition ? group.getItemProps(itemPosition.index) : undefined;
  const mergedRef = useMergedRef<View>(ref, roving?.ref);
  const isRadio = !!group?.exclusive;

  const handleKeyDown = (event: KeyboardEventLike) => {
    roving?.onKeyDown(event);
    // react-native-web only activates `role="button"` on Space; a radio needs it too.
    if (isRadio && !event.defaultPrevented && event.key === ' ') {
      event.preventDefault?.();
      handlePress();
    }
  };

  if (!accessibilityLabel && !getNodeText(children)) {
    warnOnce('ToggleButton.label', 'ToggleButton: a toggle without text content needs an `accessibilityLabel`.');
  }

  const accessibility = isRadio
    ? a11yProps({ role: 'radio', checked: selected, disabled, label: accessibilityLabel })
    : a11yProps({ role: 'button', pressed: selected, disabled, label: accessibilityLabel });

  const control = getControlSize(theme, size);

  return (
    <Pressable
      {...accessibility}
      {...rest}
      ref={mergedRef}
      style={[
        box,
        // `fullWidth` first, so an explicit `w` wins.
        getLayoutStyles(layoutProps),
        resolveStyleProps(styleProps, theme),
        webStyle({ cursor: disabled ? 'not-allowed' : 'pointer' }),
        style,
      ]}
      onPress={handlePress}
      disabled={disabled}
      testID={testID}
      onFocus={roving?.onFocus}
      {...webProps({ tabIndex: roving?.tabIndex, onKeyDown: roving || isRadio ? handleKeyDown : undefined })}
    >
      {typeof children === 'string' || typeof children === 'number' ? (
        <Text
          size={size}
          fw="600"
          c={textColor}
          selectable={false}
          style={{ lineHeight: Math.round(control.fontSize * 1.3), textAlignVertical: 'center' }}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}, { displayName: 'ToggleButton' });

const toArray = (value: ToggleGroupValue | undefined): ToggleValue[] =>
  Array.isArray(value) ? value : value !== undefined ? [value] : [];

interface ChildInfo {
  value?: ToggleValue;
  disabled?: boolean;
}

/**
 * A group of toggle buttons that manages selection. `exclusive` makes it a
 * radio group (one value); otherwise any number of buttons can be pressed.
 * Keyboard: one tab stop; arrow keys (following `orientation`, mirrored under
 * RTL) move between buttons, Home/End jump to the ends, Space/Enter toggles.
 * Controlled (`value` + `onChange`) or uncontrolled (`defaultValue`).
 */
export const ToggleGroup = factory<{ props: ToggleGroupProps; ref: View }>((props, ref) => {
  const { styleProps, otherProps: propsAfterSpacing } = extractStyleProps(props);
  const { layoutProps, otherProps: propsAfterLayout } = extractLayoutProps(propsAfterSpacing);
  const { disclaimerProps: disclaimerData, otherProps } = extractDisclaimerProps(propsAfterLayout);
  // Spacing wraps the group and its disclaimer; the box props (with `fullWidth`)
  // size the group itself, the element that takes `style`.
  const { w, h, miw, maw, mih, mah, bg, opacity, ...spacingProps } = styleProps;

  const {
    value: valueProp,
    defaultValue,
    onChange,
    exclusive = false,
    disabled = false,
    size = 'md',
    color,
    variant,
    orientation = 'horizontal',
    required = false,
    radius,
    accessibilityLabel,
    style,
    children,
    testID,
  } = otherProps;

  const theme = useTheme();
  const renderDisclaimer = useDisclaimer(disclaimerData.disclaimer, disclaimerData.disclaimerProps);

  const [value, setValue] = useControllableState<ToggleGroupValue>({
    value: valueProp,
    defaultValue,
    finalValue: [],
    onChange,
  });
  const selectedValues = useMemo(() => toArray(value), [value]);

  const childArray = useMemo(() => React.Children.toArray(children).filter(React.isValidElement), [children]);
  const childInfo = useMemo<ChildInfo[]>(
    () => childArray.map((child) => (child.props ?? {}) as ChildInfo),
    [childArray]
  );

  const handleToggle = useCallback(
    (buttonValue: ToggleValue) => {
      const isSelected = selectedValues.includes(buttonValue);
      if (exclusive) {
        // Don't allow deselecting the only value when a selection is required.
        if (isSelected && required) return;
        setValue(isSelected ? [] : buttonValue);
        return;
      }
      if (isSelected) {
        const next = selectedValues.filter((v) => v !== buttonValue);
        if (required && next.length === 0) return;
        setValue(next);
      } else {
        setValue([...selectedValues, buttonValue]);
      }
    },
    [selectedValues, exclusive, required, setValue]
  );

  const firstSelectedIndex = childInfo.findIndex((info) => info.value !== undefined && selectedValues.includes(info.value));
  const isItemDisabled = useCallback((index: number) => disabled || !!childInfo[index]?.disabled, [disabled, childInfo]);
  const { getItemProps } = useRovingFocus({
    count: childArray.length,
    orientation,
    activeIndex: firstSelectedIndex >= 0 ? firstSelectedIndex : undefined,
    isDisabled: isItemDisabled,
  });
  const positions = useMemo<ToggleItemPosition[]>(
    () => childArray.map((_, index) => ({ index, isFirst: index === 0, isLast: index === childArray.length - 1 })),
    [childArray]
  );

  const isSelected = useCallback((v: ToggleValue) => selectedValues.includes(v), [selectedValues]);

  const contextValue = useMemo<ToggleGroupInternalContext>(
    () => ({
      value,
      onChange: handleToggle,
      exclusive,
      disabled,
      size,
      color,
      variant,
      required,
      orientation,
      radius,
      isSelected,
      getItemProps,
    }),
    [value, handleToggle, exclusive, disabled, size, color, variant, required, orientation, radius, isSelected, getItemProps]
  );

  const disclaimerNode = renderDisclaimer();

  return (
    <ToggleGroupContext.Provider value={contextValue}>
      <View style={resolveStyleProps(spacingProps, theme)}>
        <View
          ref={ref}
          style={[
            { flexDirection: orientation === 'horizontal' ? 'row' : 'column', alignItems: 'stretch' },
            // `fullWidth` first, so an explicit `w` wins.
            getLayoutStyles(layoutProps),
            resolveStyleProps({ w, h, miw, maw, mih, mah, bg, opacity }, theme),
            style,
          ]}
          testID={testID}
          {...a11yProps({
            role: exclusive ? 'radiogroup' : 'group',
            label: accessibilityLabel,
            disabled,
            required: exclusive && required,
            orientation: exclusive ? orientation : undefined,
          })}
        >
          {childArray.map((child, index) => (
            <ToggleItemContext.Provider key={child.key ?? index} value={positions[index]}>
              {child}
            </ToggleItemContext.Provider>
          ))}
        </View>
        {disclaimerNode ? <View style={{ width: '100%' }}>{disclaimerNode}</View> : null}
      </View>
    </ToggleGroupContext.Provider>
  );
}, { displayName: 'ToggleGroup' });
