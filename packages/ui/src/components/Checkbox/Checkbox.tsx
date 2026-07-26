import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useControllableState } from '../../hooks/useControllableState';
import { View, Pressable, Animated, Platform } from 'react-native';
import { useTheme } from '../../core/theme';
import { Text } from '../Text';
import { FieldHeader } from '../_internal/FieldHeader';
import { Icon } from '../Icon';
import { CheckboxProps } from './types';
import { useCheckboxStyles } from './styles';
import { Row, Column } from '../Layout';
import { useDirection } from '../../core/providers/DirectionProvider';
import { useTransitionDuration } from '../../core/motion/useTransitionDuration';

/** Length of the default check-on animation; other phases scale against it. */
const CHECKBOX_BASE_DURATION = 160;

export const Checkbox = React.forwardRef<View, CheckboxProps>((props, ref) => {
  const {
    checked,
    defaultChecked = false,
    onChange,
    indeterminate = false,
    color,
    colorVariant = 'primary',
    size = 'md',
    label,
    disabled = false,
    required = false,
    error,
    description,
    icon,
    indeterminateIcon,
    labelPosition = 'right',
    labelProps,
    descriptionProps,
    transitionDuration,
    children,
    testID,
    style,
    accessibilityLabel,
    ...spacingProps
  } = props;

  const theme = useTheme();
  const { isRTL } = useDirection();
  const [effectiveChecked, setChecked] = useControllableState<boolean>({
    value: checked,
    defaultValue: defaultChecked,
    finalValue: false,
    onChange,
  });

  // Resolve color from colorVariant or direct color prop
  const resolveColor = () => {
    // Direct color prop takes precedence
    if (color) {
      return color;
    }

    // Fall back to colorVariant
    if (colorVariant && (theme.colors as any)[colorVariant]) {
      const colorPalette = (theme.colors as any)[colorVariant];
      return colorPalette[5] || colorPalette[0] || colorPalette;
    }

    // Default fallback
    return theme.colors.primary[5];
  };

  const resolvedColor = resolveColor();

  const styles = useCheckboxStyles({
    checked: effectiveChecked,
    indeterminate,
    disabled,
    error: !!error,
    size,
    color: resolvedColor,
    colorVariant,
    labelPosition,
    theme
  });

  const handlePress = useCallback(() => {
    if (disabled) return;
    setChecked((previous) => (indeterminate ? true : !previous));
  }, [indeterminate, disabled, setChecked]);

  // Whether a glyph (check or minus) should currently be showing
  const active = effectiveChecked || indeterminate;

  // Pixel size of the box — drives how far the mark travels as it flies in.
  const checkboxSizeMap: Record<string, number> = {
    xs: 16, sm: 20, md: 24, lg: 28, xl: 32, '2xl': 36, '3xl': 40,
  };
  const checkboxSize = checkboxSizeMap[size as string] ?? 24;

  // Interior of the box (inside the 2px border) — the fill rises to cover this.
  const interior = checkboxSize - 4;

  // Keep the last-shown glyph mounted while it animates out so "off" reverses
  // the "on" motion instead of just disappearing.
  const [iconType, setIconType] = useState<'check' | 'minus' | null>(
    indeterminate ? 'minus' : effectiveChecked ? 'check' : null
  );

  // Two-phase drivers: the colored fill slides up first (`fill`), then the
  // checkmark grows from the center (`mark`). Reversed on uncheck.
  const fill = useRef(new Animated.Value(active ? 1 : 0)).current;
  const mark = useRef(new Animated.Value(active ? 1 : 0)).current;
  const motionDuration = useTransitionDuration(transitionDuration, CHECKBOX_BASE_DURATION);

  useEffect(() => {
    const native = Platform.OS !== 'web';
    // `transitionDuration={0}` (and reduced motion) land on the end state with
    // no animation; any other explicit value scales both phases proportionally.
    if (motionDuration === 0) {
      fill.setValue(active ? 1 : 0);
      mark.setValue(active ? 1 : 0);
      setIconType(active ? (indeterminate ? 'minus' : 'check') : null);
      return;
    }
    const scale = motionDuration / CHECKBOX_BASE_DURATION;
    const ms = (base: number) => Math.round(base * scale);
    if (active) {
      setIconType(indeterminate ? 'minus' : 'check');
      // Fill rises; the mark starts growing before the fill fully lands so the
      // two phases overlap slightly instead of running strictly back-to-back.
      Animated.parallel([
        // Fill height can't run on the native driver, so keep it on JS.
        Animated.timing(fill, { toValue: 1, duration: ms(160), useNativeDriver: false }),
        Animated.sequence([
          Animated.delay(ms(110)),
          // A spring can't honor an explicit duration, so opt into timing when one is given.
          transitionDuration == null
            ? Animated.spring(mark, { toValue: 1, friction: 5, tension: 200, useNativeDriver: native })
            : Animated.timing(mark, { toValue: 1, duration: ms(160), useNativeDriver: native }),
        ]),
      ]).start();
    } else {
      // Mark shrinks; the fill starts sliding down before it's fully gone.
      Animated.parallel([
        Animated.timing(mark, { toValue: 0, duration: ms(100), useNativeDriver: native }),
        Animated.sequence([
          Animated.delay(ms(60)),
          Animated.timing(fill, { toValue: 0, duration: ms(150), useNativeDriver: false }),
        ]),
      ]).start(({ finished }) => {
        if (finished) setIconType(null);
      });
    }
  }, [active, indeterminate, fill, mark, motionDuration, transitionDuration]);

  const glyphColor = disabled ? theme.text.disabled : theme.text.onPrimary || 'white';

  // Base (unfilled) box color, revealed above the rising fill during the slide.
  const unfilledBg = theme.colors.gray[1];

  // Colored fill that rises from the bottom of the box.
  const fillColor = disabled ? theme.colors.gray[3] : resolvedColor;
  const fillOverlay = (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: fill.interpolate({ inputRange: [0, 1], outputRange: [0, interior] }),
        backgroundColor: fillColor,
      }}
    />
  );

  const renderCheckIcon = () => {
    if (!iconType) return null;

    const custom = iconType === 'minus' ? indeterminateIcon : icon;

    const glyph = custom || (
      <Icon
        name={iconType === 'minus' ? 'minus' : 'check'}
        size={size}
        stroke={5}
        color={glyphColor}
      />
    );

    return (
      <Animated.View
        style={{
          // Grows from the center once the fill has risen.
          transform: [
            { scale: mark.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.15] }) },
          ],
          opacity: mark,
        }}
      >
        {glyph}
      </Animated.View>
    );
  };

  const labelContent = children || label || undefined;

  // Determine layout direction based on label position
  const isVertical = labelPosition === 'top' || labelPosition === 'bottom';

  const checkboxElement = (
    <View style={styles.checkboxContainer}>
      <Pressable
        ref={ref}
        // Keep the box body unfilled so the animated fill is what colors it in.
        // The border still switches to the active color for a crisp frame.
        style={[styles.checkbox, { backgroundColor: unfilledBg }, style]}
        onPress={handlePress}
        disabled={disabled}
        testID={testID}
        hitSlop={12} // Increase hitbox by 12px on all sides
        accessibilityRole="checkbox"
        accessibilityState={{
          checked: indeterminate ? 'mixed' : effectiveChecked,
          disabled
        }}
        accessibilityLabel={accessibilityLabel ?? (typeof labelContent === 'string' ? labelContent : undefined)}
      >
        {fillOverlay}
        <View style={styles.checkboxInner}>
          {renderCheckIcon()}
        </View>
      </Pressable>
    </View>
  );

  const labelElement = labelContent && (
    <Pressable
      style={styles.labelContainer}
      onPress={handlePress}
      disabled={disabled}
      hitSlop={8}
    >
      <FieldHeader
        label={labelContent}
        description={!error ? description : undefined}
        required={required}
        withAsterisk={true}
        disabled={disabled}
        error={!!error}
        size={size as any}
        marginBottom={isVertical ? 0 : (error ? 2 : undefined)}
        labelProps={labelProps}
        descriptionProps={descriptionProps}
      />
      {error ? (
        <Text style={styles.error} size="sm" selectable={false}>{error}</Text>
      ) : null}
    </Pressable>
  );

  const containerStyle = [
    styles.container,
  ];

  // Use the already defined isVertical variable
  const LayoutComponent = isVertical ? Column : Row;

  // For vertical layouts (top/bottom), we want tighter spacing and center alignment
  const layoutProps = isVertical
    ? { gap: 'xs' as const, align: 'center' as const }
    : { gap: 'sm' as const, align: 'center' as const };

  // Swap label positions in RTL
  const effectiveLabelPosition = (() => {
    if (labelPosition === 'left') return isRTL ? 'right' : 'left';
    if (labelPosition === 'right') return isRTL ? 'left' : 'right';
    return labelPosition;
  })();

  return (
    <LayoutComponent {...layoutProps}>
      {effectiveLabelPosition === 'top' && labelElement}
      {effectiveLabelPosition === 'left' && labelElement}
      {checkboxElement}
      {effectiveLabelPosition === 'right' && labelElement}
      {effectiveLabelPosition === 'bottom' && labelElement}
    </LayoutComponent>
  );
});

Checkbox.displayName = 'Checkbox';
