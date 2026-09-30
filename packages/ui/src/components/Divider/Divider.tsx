import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { factory } from '../../core/factory/factory';
import { hexToRgb, withAlpha } from '../../core/theme/colorUtils';
import { resolveLineColor } from '../../core/theme/resolveColors';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveSpacing } from '../../core/theme/tokens';
import type { PlocksTheme, SizeValue } from '../../core/theme/types';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import { resolveLinearGradient } from '../../utils/optionalDependencies';
import { Text } from '../Text';
import type { DividerFactoryPayload } from './types';

const { LinearGradient, hasLinearGradient } = resolveLinearGradient();

const px = (theme: PlocksTheme, value: SizeValue): number => {
  const resolved = resolveSpacing(theme, value);
  return typeof resolved === 'number' ? resolved : 0;
};

/** The fully transparent version of `color`, for gradient ends. */
const transparentOf = (color: string) => (hexToRgb(color) ? withAlpha(color, 0) : 'transparent');

const styles = StyleSheet.create({
  horizontalRoot: { width: '100%' },
  verticalRoot: { height: '100%' },
  horizontalStack: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  verticalStack: { flexDirection: 'column', alignItems: 'center', height: '100%' },
  verticalLabel: { alignItems: 'center', alignSelf: 'center' },
});

/**
 * A separator line, optionally with a label. Exposed to assistive technology as
 * `role="separator"` with its orientation (web: `aria-orientation`); a string
 * `label` becomes its accessible name.
 */
export const Divider = factory<DividerFactoryPayload>((props, ref) => {
  const { styleProps, otherProps } = extractStyleProps(props);
  const {
    orientation = 'horizontal',
    variant = 'solid',
    color,
    size = 1,
    label,
    labelPosition = 'center',
    labelProps,
    style,
    testID,
    ...rest
  } = otherProps;

  const spacingStyles = useStyleProps(styleProps);
  const theme = useTheme();
  const dividerColor = resolveLineColor(theme, color) ?? theme.backgrounds.border;
  const dividerSize = typeof size === 'number' ? size : px(theme, size);
  const labelSpacing = px(theme, 'sm');
  const vertical = orientation === 'vertical';

  const renderLabel = () => {
    if (!label) return null;
    if (typeof label === 'string') {
      return (
        <Text size="sm" c="muted" fw="medium" ta={vertical ? 'center' : undefined} {...labelProps}>
          {label}
        </Text>
      );
    }
    return label;
  };

  const borderStyle: 'solid' | 'dashed' | 'dotted' =
    variant === 'dashed' ? 'dashed' : variant === 'dotted' ? 'dotted' : 'solid';

  const renderLine = (flex?: number, edge?: 'leading' | 'trailing') => {
    // Without expo-linear-gradient a gradient divider draws a solid line
    // (the fallback would paint only the transparent first stop).
    if (variant === 'gradient' && hasLinearGradient) {
      // Fade transparent → color → transparent for a true gradient line. When a
      // segment is on the leading edge of a labelled divider we keep the bright
      // side near the label, and vice versa.
      const transparent = transparentOf(dividerColor);
      const colors =
        edge === 'leading'
          ? [transparent, dividerColor]
          : edge === 'trailing'
            ? [dividerColor, transparent]
            : [transparent, dividerColor, transparent];
      const gradientStyle: ViewStyle = vertical
        ? { width: dividerSize, alignSelf: 'center', flex }
        : { height: dividerSize, width: '100%', flex };
      return (
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={vertical ? { x: 0, y: 1 } : { x: 1, y: 0 }}
          style={gradientStyle}
        />
      );
    }

    if (vertical) {
      return (
        <View
          style={{
            borderLeftWidth: dividerSize,
            borderLeftColor: dividerColor,
            borderStyle,
            alignSelf: 'center',
            flex,
          }}
        />
      );
    }

    return (
      <View
        style={{
          height: dividerSize,
          borderTopWidth: dividerSize,
          borderTopColor: dividerColor,
          borderStyle,
          width: '100%',
          flex,
        }}
      />
    );
  };

  // `left` / `right` are the leading / trailing ends of the line: rows mirror in
  // right-to-left layouts, so they follow the reading direction.
  const renderWithLabel = () => (
    <View style={vertical ? styles.verticalStack : styles.horizontalStack}>
      {renderLine(labelPosition === 'left' ? 0.2 : 1, 'leading')}
      <View
        style={
          vertical ? [styles.verticalLabel, { paddingVertical: labelSpacing }] : { paddingHorizontal: labelSpacing }
        }
      >
        {renderLabel()}
      </View>
      {renderLine(labelPosition === 'right' ? 0.2 : 1, 'trailing')}
    </View>
  );

  return (
    <View
      {...a11yProps({
        role: 'separator',
        orientation,
        label: typeof label === 'string' ? label : undefined,
      })}
      {...rest}
      ref={ref}
      style={[
        vertical ? styles.verticalRoot : styles.horizontalRoot,
        spacingStyles,
        style,
      ]}
      testID={testID}
    >
      {label ? renderWithLabel() : renderLine()}
    </View>
  );
}, { displayName: 'Divider' });
