import React, { useMemo } from 'react';
import { View, ViewStyle } from 'react-native';
import { factory } from '../../core/factory';
import { useTheme } from '../../core/theme';
import { extractSpacingProps, getSpacingStyles } from '../../core/utils';
import { useSurfaceStyles } from '../Surface/useSurfaceStyles';
import { Text } from '../Text';
import { Divider } from '../Divider';
import { ControlFieldGroupProvider } from './context';
import type { ControlFieldGroupContextValue, ControlFieldGroupProps } from './types';
import type { SizeValue } from '../../core/theme/types';

/** Row padding scale — control rows sit a little taller than plain list rows. */
const PADDING_SCALE: Record<string, { py: number; px: number }> = {
  xs: { py: 8, px: 10 },
  sm: { py: 10, px: 12 },
  md: { py: 12, px: 14 },
  lg: { py: 14, px: 16 },
  xl: { py: 16, px: 18 },
};

function resolvePadding(size?: SizeValue) {
  if (typeof size === 'number') {
    const scale = size / 24;
    return { py: Math.max(8, Math.round(12 * scale)), px: Math.max(10, Math.round(14 * scale)) };
  }
  return PADDING_SCALE[(size as string) ?? 'md'] ?? PADDING_SCALE.md;
}

/**
 * Theme radii are stored as CSS strings (e.g. `'8px'`), so `Number()` yields
 * NaN — parse the numeric part and fall back to a clearly-rounded default.
 */
function resolveRadius(radius: ControlFieldGroupProps['radius'], theme: any): number {
  if (typeof radius === 'number') return radius;
  const raw = theme?.radii?.[radius as string];
  const n = typeof raw === 'string' ? parseFloat(raw) : raw;
  return Number.isFinite(n) ? n : 12;
}

export const ControlFieldGroup = factory<{ props: ControlFieldGroupProps; ref: View }>((rawProps, ref) => {
  const { spacingProps, otherProps } = extractSpacingProps(rawProps);
  const spacingStyles = getSpacingStyles(spacingProps);

  const {
    children,
    variant = 'default',
    dividers = true,
    insetDividers = false,
    radius = 'lg',
    size,
    title,
    footer,
    style,
    testID,
  } = otherProps as ControlFieldGroupProps;

  const theme = useTheme();
  const { py, px } = resolvePadding(size);

  const r = resolveRadius(radius, theme);

  const groupCtx = useMemo<ControlFieldGroupContextValue>(() => ({ size }), [size]);

  // `raised` preserves the original intent — the group must stand out from
  // whatever it sits on so control off-states (a gray switch track, a checkbox
  // box) stay visible against it — but expresses it as one step up the ladder
  // rather than a fixed palette index, so it still holds inside a card.
  const groupSurface = useSurfaceStyles({
    raised: true,
    withBorder: variant === 'bordered',
    shadow: 'none',
  });

  const surfaceStyle: ViewStyle = {
    borderRadius: r,
    overflow: 'hidden',
    backgroundColor: variant === 'flush' ? 'transparent' : groupSurface.token.background,
    borderWidth: variant === 'bordered' ? 1 : 0,
    borderColor: variant === 'bordered' ? groupSurface.token.border : 'transparent',
  };

  // Each row gets its horizontal + vertical padding injected onto the field's
  // Pressable (via its `style` prop) so the whole padded row stays tappable —
  // padding on an outer wrapper would leave dead gutters.
  const rowPadding: ViewStyle = { paddingVertical: py, paddingHorizontal: px };

  const items = React.Children.toArray(children).filter(Boolean) as React.ReactElement<any>[];

  return (
    <ControlFieldGroupProvider value={groupCtx}>
      <View style={spacingStyles} testID={testID}>
        {title != null ? (
          <Text
            size="sm"
            selectable={false}
            style={{ color: theme.text.muted, marginBottom: 6, marginLeft: px, textTransform: 'uppercase', letterSpacing: 0.4 }}
          >
            {title}
          </Text>
        ) : null}

        <View ref={ref} style={[surfaceStyle, style]}>
          {items.map((child, index) => {
            const el = child as React.ReactElement<{ style?: any }>;
            const padded = React.isValidElement(el)
              ? React.cloneElement(el, { style: [rowPadding, el.props.style] })
              : el;
            return (
              <React.Fragment key={el.key ?? index}>
                {padded}
                {dividers && index < items.length - 1 ? (
                  <Divider
                    color="border"
                    style={insetDividers ? { marginLeft: px } : undefined}
                  />
                ) : null}
              </React.Fragment>
            );
          })}
        </View>

        {footer != null ? (
          <Text size="sm" selectable={false} style={{ color: theme.text.muted, marginTop: 6, marginLeft: px }}>
            {footer}
          </Text>
        ) : null}
      </View>
    </ControlFieldGroupProvider>
  );
}, { displayName: 'ControlField.Group' });
