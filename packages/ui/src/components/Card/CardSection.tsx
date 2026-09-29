import React, { useContext } from 'react';
import { View, type ViewStyle } from 'react-native';

import { factory } from '../../core/factory/factory';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveSpacing } from '../../core/theme/tokens';
import type { PlatformBlocksTheme, SizeValue } from '../../core/theme/types';
import { CardContext } from './CardContext';
import type { CardSectionProps } from './types';

const resolvePad = (theme: PlatformBlocksTheme, value: SizeValue | undefined): number | undefined => {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return value;
  const resolved = resolveSpacing(theme, value);
  return typeof resolved === 'number' ? resolved : undefined;
};

/**
 * A region of a `Card` that escapes the card's padding (full-bleed images,
 * banded rows). Arbitrary View props (testID, role, onLayout…) are forwarded.
 */
export const CardSection = factory<{ props: CardSectionProps; ref: View }>(
  ({ children, withBorder, inheritPadding, py, px, style, _isFirst, _isLast, ...rest }, ref) => {
    const theme = useTheme();
    const ctx = useContext(CardContext);
    const padding = ctx?.paddingPx ?? 0;
    const borderColor = ctx?.borderColor ?? theme.backgrounds.border;

    // Negative margins so the section escapes the parent Card's padding.
    // Only escape the edges that touch the Card's outer wall — a middle
    // section keeps the natural vertical flow, only going full-bleed
    // horizontally.
    const escapeStyle: ViewStyle = {
      marginStart: -padding,
      marginEnd: -padding,
      marginTop: _isFirst ? -padding : 0,
      marginBottom: _isLast ? -padding : 0,
    };

    // Optional inside padding overrides
    const explicitPy = resolvePad(theme, py);
    const explicitPx = resolvePad(theme, px);
    const insidePx = explicitPx ?? (inheritPadding ? padding : undefined);
    const insidePadding: ViewStyle = {
      ...(explicitPy !== undefined && { paddingTop: explicitPy, paddingBottom: explicitPy }),
      ...(insidePx !== undefined && { paddingStart: insidePx, paddingEnd: insidePx }),
    };

    // Conditional dividers when withBorder is set on the section
    const dividers: ViewStyle | null = withBorder
      ? {
          ...(!_isFirst && { borderTopWidth: 1, borderTopColor: borderColor }),
          ...(!_isLast && { borderBottomWidth: 1, borderBottomColor: borderColor }),
        }
      : null;

    return (
      <View ref={ref} {...rest} style={[escapeStyle, insidePadding, dividers, style]}>
        {children}
      </View>
    );
  },
  { displayName: 'CardSection' }
);

/** Whether an element type is `Card.Section` (so the parent Card can tag first/last sections). */
export function isCardSection(type: unknown): boolean {
  return type === CardSection;
}
