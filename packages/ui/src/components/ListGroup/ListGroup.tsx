import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { View, Pressable, ViewStyle, TextStyle } from 'react-native';
import { Text } from '../Text';
import { useTheme } from '../../core/theme';
import { useDirection } from '../../core/providers/DirectionProvider';
import { getFontSize } from '../../core/theme/sizes';
import { resolveComponentSize, type ComponentSize, type ComponentSizeValue } from '../../core/theme/componentSize';
import type { ListGroupProps, ListGroupItemProps, ListGroupContextValue, ListGroupMetrics } from './types';
import { factory } from '../../core/factory';
import { useHover } from '../../hooks';
import { surfaceInteractionTint } from '../../core/theme/surfaces';
import { useSurfaceStyles } from '../Surface/useSurfaceStyles';

// Types moved to ./types

const ListGroupContext = createContext<ListGroupContextValue | null>(null);
const useListGroup = () => useContext(ListGroupContext);

const LIST_GROUP_ALLOWED_SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
const LIST_GROUP_ALLOWED_SIZES_ARRAY: ComponentSize[] = [...LIST_GROUP_ALLOWED_SIZES];

const LIST_GROUP_SIZE_SCALE: Partial<Record<ComponentSize, ListGroupMetrics>> = {
  xs: { paddingVertical: 4, paddingHorizontal: 8, gap: 6, dividerInset: 12, textSize: 'xs' },
  sm: { paddingVertical: 6, paddingHorizontal: 10, gap: 8, dividerInset: 12, textSize: 'sm' },
  md: { paddingVertical: 8, paddingHorizontal: 12, gap: 10, dividerInset: 12, textSize: 'md' },
  lg: { paddingVertical: 10, paddingHorizontal: 14, gap: 12, dividerInset: 14, textSize: 'lg' },
  xl: { paddingVertical: 12, paddingHorizontal: 16, gap: 14, dividerInset: 16, textSize: 'xl' },
};

const BASE_LIST_GROUP_METRICS: ListGroupMetrics = LIST_GROUP_SIZE_SCALE.md ?? {
  paddingVertical: 8,
  paddingHorizontal: 12,
  gap: 10,
  dividerInset: 12,
  textSize: 'md',
};

const BASE_TEXT_SIZE = getFontSize('md');
const DEFAULT_LIST_GROUP_METRICS = BASE_LIST_GROUP_METRICS;

function resolveListGroupMetrics(value: ComponentSizeValue | undefined): ListGroupMetrics {
  const resolved = resolveComponentSize(value, LIST_GROUP_SIZE_SCALE, {
    allowedSizes: LIST_GROUP_ALLOWED_SIZES_ARRAY,
    fallback: 'md',
  });

  if (typeof resolved === 'number') {
    return calculateNumericMetrics(resolved);
  }

  return resolved;
}

function calculateNumericMetrics(fontSize: number): ListGroupMetrics {
  const baseFont = BASE_TEXT_SIZE || 14;
  const scale = fontSize / baseFont;
  const scaleAndClamp = (measurement: number, minimum: number) => Math.max(minimum, Math.round(measurement * scale));

  return {
    paddingVertical: scaleAndClamp(BASE_LIST_GROUP_METRICS.paddingVertical, 4),
    paddingHorizontal: scaleAndClamp(BASE_LIST_GROUP_METRICS.paddingHorizontal, 6),
    gap: scaleAndClamp(BASE_LIST_GROUP_METRICS.gap, 4),
    dividerInset: scaleAndClamp(BASE_LIST_GROUP_METRICS.dividerInset, 6),
    textSize: fontSize,
  };
}

export const ListGroup = factory<{ props: ListGroupProps; ref: View }>((props, ref) => {
  const {
    children,
    variant = 'default',
    size = 'md',
    radius = 'md',
    dividers = true,
    insetDividers = false,
    style,
    ...rest
  } = props;
  const theme = useTheme();
  const metrics = useMemo(() => resolveListGroupMetrics(size), [size]);
  const contextValue = useMemo<ListGroupContextValue>(() => ({
    size: metrics.textSize,
    metrics,
    dividers,
    insetDividers,
  }), [metrics, dividers, insetDividers]);
  // Theme radii are CSS strings (e.g. '6px'), so Number() yields NaN — parse the
  // numeric part so token values actually round the corners.
  const rawRadius = typeof radius === 'number' ? radius : (theme as any).radii?.[radius];
  const parsedRadius = typeof rawRadius === 'string' ? parseFloat(rawRadius) : rawRadius;
  const r = Number.isFinite(parsedRadius) ? parsedRadius : 0;

  // The group paints the surface it sits on rather than a fixed palette shade,
  // so a list inside a level-2 dropdown matches the dropdown instead of
  // stamping a grey rectangle onto it. `flush` opts out entirely and lets the
  // parent surface show through.
  const surface = useSurfaceStyles({
    withBorder: variant === 'bordered',
    shadow: 'none',
  });

  const containerStyle: ViewStyle = {
    borderRadius: r,
    overflow: 'hidden',
    ...surface.style,
    ...(variant === 'flush' ? { backgroundColor: 'transparent' } : {}),
    ...(variant === 'bordered' ? {} : { borderWidth: 0, borderColor: 'transparent' }),
  };

  return (
    <ListGroupContext.Provider value={contextValue}>
  <View ref={ref} style={[containerStyle, style]} {...rest}>
        {children}
      </View>
    </ListGroupContext.Provider>
  );
});

export const ListGroupItem = factory<{ props: ListGroupItemProps; ref: View }>((props, ref) => {
  const group = useListGroup();
  const theme = useTheme();
  const { isRTL } = useDirection();
  const {
    children,
    label,
    description,
    value,
    onPress,
    disabled,
    active,
    danger,
    startSection,
    endSection,
    style,
    textStyle,
    descriptionStyle,
    numberOfLines,
    ...rest
  } = props;

  const metrics = group?.metrics ?? DEFAULT_LIST_GROUP_METRICS;
  const textSize = group?.size ?? metrics.textSize;
  const isPressable = !!onPress && !disabled;
  const isDark = theme.colorScheme === 'dark';
  const sectionSpacing = Math.max(4, Math.round(metrics.paddingHorizontal * 0.3));

  const baseColor = danger
    ? (isDark ? theme.colors.error[2] : theme.colors.error[0])
    : 'transparent';
  // Neutral states are translucent overlays so they read correctly at any
  // elevation — an opaque grey is only ever right on one background.
  const activeBg = danger
    ? (isDark ? theme.colors.error[3] : theme.colors.error[1])
    : surfaceInteractionTint(theme, 'pressed');

  const itemStyle: ViewStyle = {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    paddingVertical: metrics.paddingVertical,
    paddingHorizontal: metrics.paddingHorizontal,
    gap: metrics.gap,
    backgroundColor: active ? activeBg : baseColor,
    opacity: disabled ? 0.5 : 1,
    // Divider handled by parent rendering sequence; last item no divider
  };

  const hoverBg = danger
    ? (isDark ? theme.colors.error[2] : theme.colors.error[0])
    : surfaceInteractionTint(theme, 'hover');

  const [hovered, hoverHandlers] = useHover();
  // Keep the local names so the spread + JSX below stays unchanged.
  const onMouseEnter = hoverHandlers.onMouseEnter;
  const onMouseLeave = hoverHandlers.onMouseLeave;

  const primaryColor = danger ? theme.colors.error[6] : theme.text.primary;

  // `label`/`description` build a stacked block, so they can't share the
  // single-line path — that one renders straight into a `<Text>` and a nested
  // layout view inside text lays out unpredictably across platforms.
  const isTwoLine = label != null || description != null;

  const content = isTwoLine ? (
    <View style={{ flex: 1, minWidth: 0 }}>
      {label != null ? (
        <Text size={textSize} style={[{ color: primaryColor }, textStyle]} numberOfLines={numberOfLines}>
          {label}
        </Text>
      ) : null}
      {description != null ? (
        <Text
          size="sm"
          style={[{ color: theme.text.muted }, descriptionStyle]}
          numberOfLines={numberOfLines}
        >
          {description}
        </Text>
      ) : null}
    </View>
  ) : (
    <Text size={textSize} style={[{ flexShrink: 1, color: primaryColor }, textStyle]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );

  // A two-line block already claims the free space with `flex: 1`, so the
  // trailing content needs no push. Single-line content only takes its natural
  // width, so the first trailing element gets an `auto` margin to right-align
  // the whole tail — putting it on both would strand `value` next to the label.
  const push: ViewStyle | undefined = isTwoLine
    ? undefined
    : isRTL
      ? { marginRight: 'auto' }
      : { marginLeft: 'auto' };

  const valueContent =
    value != null ? (
      <Text size="sm" style={[{ color: theme.text.muted }, push]}>
        {value}
      </Text>
    ) : null;

  const startContent = startSection ? (
    <View style={isRTL ? { marginLeft: sectionSpacing } : { marginRight: sectionSpacing }}>
      {startSection}
    </View>
  ) : null;

  const endContent = endSection ? (
    <View style={valueContent ? undefined : push}>{endSection}</View>
  ) : null;

  if (isPressable) {
    return (
      <Pressable
        ref={ref as any}
        onPress={onPress}
        disabled={disabled}
        onMouseEnter={onMouseEnter as any}
        onMouseLeave={onMouseLeave as any}
        style={({ pressed }) => [
          itemStyle,
          style,
          // Pressed or active state overrides hover
          !active && !disabled && pressed && { backgroundColor: activeBg },
          !active && !disabled && !pressed && hovered && { backgroundColor: hoverBg },
        ]}
        {...rest as any}
      >
        {startContent}
        {content}
        {valueContent}
        {endContent}
      </Pressable>
    );
  }

  return (
    <View style={[itemStyle, style]} ref={ref} {...rest}>
      {startContent}
      {content}
      {valueContent}
      {endContent}
    </View>
  );
});

export const ListGroupDivider = React.forwardRef<
  View,
  { inset?: boolean; style?: ViewStyle }
>(({ inset, style }, ref) => {
  const group = useListGroup();
  const { isRTL } = useDirection();
  const surface = useSurfaceStyles({ shadow: 'none' });
  const useInset = inset ?? group?.insetDividers;
  const metrics = group?.metrics ?? DEFAULT_LIST_GROUP_METRICS;
  const insetOffset = useInset ? metrics.dividerInset : 0;
  return (
    <View
      ref={ref}
      style={[{
        height: 1,
        // Hairline matched to the surface it divides.
        backgroundColor: surface.token.border,
        ...(isRTL
          ? { marginRight: insetOffset, marginLeft: 0 }
          : { marginLeft: insetOffset, marginRight: 0 }),
      }, style]}
    />
  );
});

ListGroupDivider.displayName = 'ListGroupDivider';

// Helper to auto-insert dividers between children if dividers enabled
export const ListGroupBody: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const group = useListGroup();
  if (!group?.dividers) return <>{children}</>;
  const arr = React.Children.toArray(children);
  return (
    <>
      {arr.map((child, idx) => (
        <React.Fragment key={idx}>
          {child}
          {idx < arr.length - 1 && <ListGroupDivider />}
        </React.Fragment>
      ))}
    </>
  );
};

export default ListGroup;
