import React, { createContext, useContext, useMemo } from 'react';
import { View, Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { Text } from '../Text';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveFontSize, resolveRadius } from '../../core/theme/tokens';
import type { PlatformBlocksTheme } from '../../core/theme/types';
import { resolveComponentSize, type ComponentSize, type ComponentSizeValue } from '../../core/theme/componentSize';
import type {
  ListGroupProps,
  ListGroupItemProps,
  ListGroupDividerProps,
  ListGroupContextValue,
  ListGroupMetrics,
} from './types';
import { factory } from '../../core/factory/factory';
import { useHover } from '../../hooks/useHover/useHover';
import { surfaceInteractionTint } from '../../core/theme/surfaces';
import { resolveStyleProps, extractStyleProps } from '../../core/utils/spacing';
import { useSurfaceStyles } from '../Surface/useSurfaceStyles';

const ListGroupContext = createContext<ListGroupContextValue | null>(null);
const useListGroup = () => useContext(ListGroupContext);

const LIST_GROUP_ALLOWED_SIZES: ComponentSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

// Row padding / gap per size (the text size itself comes from the theme's font-size tokens).
const LIST_GROUP_SIZE_SCALE: Partial<Record<ComponentSize, ListGroupMetrics>> = {
  xs: { paddingVertical: 4, paddingHorizontal: 8, gap: 6, dividerInset: 12, textSize: 'xs' },
  sm: { paddingVertical: 6, paddingHorizontal: 10, gap: 8, dividerInset: 12, textSize: 'sm' },
  md: { paddingVertical: 8, paddingHorizontal: 12, gap: 10, dividerInset: 12, textSize: 'md' },
  lg: { paddingVertical: 10, paddingHorizontal: 14, gap: 12, dividerInset: 14, textSize: 'lg' },
  xl: { paddingVertical: 12, paddingHorizontal: 16, gap: 14, dividerInset: 16, textSize: 'xl' },
};

const DEFAULT_LIST_GROUP_METRICS: ListGroupMetrics = LIST_GROUP_SIZE_SCALE.md ?? {
  paddingVertical: 8,
  paddingHorizontal: 12,
  gap: 10,
  dividerInset: 12,
  textSize: 'md',
};

function resolveListGroupMetrics(theme: PlatformBlocksTheme, value: ComponentSizeValue | undefined): ListGroupMetrics {
  const resolved = resolveComponentSize(value, LIST_GROUP_SIZE_SCALE, {
    allowedSizes: LIST_GROUP_ALLOWED_SIZES,
    fallback: 'md',
  });
  return typeof resolved === 'number' ? calculateNumericMetrics(theme, resolved) : resolved;
}

// A numeric size is a font size; padding and gaps scale from the md row.
function calculateNumericMetrics(theme: PlatformBlocksTheme, fontSize: number): ListGroupMetrics {
  const scale = fontSize / (resolveFontSize(theme, 'md') || 14);
  const scaleAndClamp = (measurement: number, minimum: number) => Math.max(minimum, Math.round(measurement * scale));

  return {
    paddingVertical: scaleAndClamp(DEFAULT_LIST_GROUP_METRICS.paddingVertical, 4),
    paddingHorizontal: scaleAndClamp(DEFAULT_LIST_GROUP_METRICS.paddingHorizontal, 6),
    gap: scaleAndClamp(DEFAULT_LIST_GROUP_METRICS.gap, 4),
    dividerInset: scaleAndClamp(DEFAULT_LIST_GROUP_METRICS.dividerInset, 6),
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
  const { styleProps, otherProps } = extractStyleProps(rest);
  const metrics = useMemo(() => resolveListGroupMetrics(theme, size), [theme, size]);
  const contextValue = useMemo<ListGroupContextValue>(
    () => ({
      size: metrics.textSize,
      metrics,
      dividers,
      insetDividers,
    }),
    [metrics, dividers, insetDividers]
  );

  // The group paints the surface it sits on rather than a fixed palette shade,
  // so a list inside a level-2 dropdown matches the dropdown instead of
  // stamping a grey rectangle onto it. `flush` opts out entirely and lets the
  // parent surface show through.
  const surface = useSurfaceStyles({
    withBorder: variant === 'bordered',
    shadow: 'none',
  });

  return (
    <ListGroupContext.Provider value={contextValue}>
      <View
        ref={ref}
        {...otherProps}
        style={[
          styles.group,
          { borderRadius: resolveRadius(theme, radius) },
          surface.style,
          variant === 'flush' ? styles.transparent : null,
          variant === 'bordered' ? null : styles.borderless,
          resolveStyleProps(styleProps, theme),
          style,
        ]}
      >
        {children}
      </View>
    </ListGroupContext.Provider>
  );
}, { displayName: 'ListGroup' });

export const ListGroupItem = factory<{ props: ListGroupItemProps; ref: View }>((props, ref) => {
  const group = useListGroup();
  const theme = useTheme();
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
  const { styleProps, otherProps } = extractStyleProps(rest);

  const metrics = group?.metrics ?? DEFAULT_LIST_GROUP_METRICS;
  const textSize = group?.size ?? metrics.textSize;
  const isPressable = !!onPress && !disabled;
  const sectionSpacing = Math.max(4, Math.round(metrics.paddingHorizontal * 0.3));

  // The error palette runs light → dark in the light theme and dark → light in
  // the dark theme, so the low indices are the tint for either scheme.
  const baseColor = danger ? theme.colors.error[0] : 'transparent';
  // Neutral states are translucent overlays so they read correctly at any
  // elevation — an opaque grey is only ever right on one background.
  const activeBg = danger ? theme.colors.error[1] : surfaceInteractionTint(theme, 'pressed');
  const hoverBg = danger ? theme.colors.error[0] : surfaceInteractionTint(theme, 'hover');

  const itemStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: metrics.paddingVertical,
    paddingHorizontal: metrics.paddingHorizontal,
    gap: metrics.gap,
    backgroundColor: active ? activeBg : baseColor,
    opacity: disabled ? 0.5 : 1,
  };

  const [hovered, hoverHandlers] = useHover();

  const primaryColor = danger ? theme.colors.error[6] : theme.text.primary;

  // `label`/`description` build a stacked block, so they can't share the
  // single-line path — that one renders straight into a `<Text>` and a nested
  // layout view inside text lays out unpredictably across platforms.
  const isTwoLine = label != null || description != null;

  const content = isTwoLine ? (
    <View style={styles.twoLine}>
      {label != null ? (
        <Text size={textSize} style={[{ color: primaryColor }, textStyle]} numberOfLines={numberOfLines}>
          {label}
        </Text>
      ) : null}
      {description != null ? (
        <Text size="sm" style={[{ color: theme.text.muted }, descriptionStyle]} numberOfLines={numberOfLines}>
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
  // width, so the first trailing element gets an `auto` start margin to push the
  // whole tail to the end edge — putting it on both would strand `value` next
  // to the label. The logical margin follows the layout direction.
  const push: ViewStyle | undefined = isTwoLine ? undefined : styles.pushToEnd;

  const valueContent =
    value != null ? (
      <Text size="sm" style={[{ color: theme.text.muted }, push]}>
        {value}
      </Text>
    ) : null;

  const startContent = startSection ? <View style={{ marginEnd: sectionSpacing }}>{startSection}</View> : null;

  const endContent = endSection ? <View style={valueContent ? undefined : push}>{endSection}</View> : null;

  const spacingStyle = resolveStyleProps(styleProps, theme);

  if (isPressable) {
    return (
      <Pressable
        ref={ref}
        onPress={onPress}
        disabled={disabled}
        onHoverIn={hoverHandlers.onHoverIn}
        onHoverOut={hoverHandlers.onHoverOut}
        role="button"
        {...otherProps}
        style={({ pressed }) => [
          itemStyle,
          spacingStyle,
          style,
          // Pressed or active state overrides hover
          !active && !disabled && pressed && { backgroundColor: activeBg },
          !active && !disabled && !pressed && hovered && { backgroundColor: hoverBg },
        ]}
      >
        {startContent}
        {content}
        {valueContent}
        {endContent}
      </Pressable>
    );
  }

  return (
    <View
      ref={ref}
      {...(disabled ? { 'aria-disabled': true } : null)}
      {...otherProps}
      style={[itemStyle, spacingStyle, style]}
    >
      {startContent}
      {content}
      {valueContent}
      {endContent}
    </View>
  );
}, { displayName: 'ListGroupItem' });

export const ListGroupDivider = factory<{ props: ListGroupDividerProps; ref: View }>(({ inset, style, ...rest }, ref) => {
  const group = useListGroup();
  const surface = useSurfaceStyles({ shadow: 'none' });
  const useInset = inset ?? group?.insetDividers;
  const metrics = group?.metrics ?? DEFAULT_LIST_GROUP_METRICS;
  return (
    <View
      ref={ref}
      role="separator"
      {...rest}
      style={[
        styles.divider,
        // Hairline matched to the surface it divides; the inset sits on the leading edge.
        { backgroundColor: surface.token.border, marginStart: useInset ? metrics.dividerInset : 0 },
        style,
      ]}
    />
  );
}, { displayName: 'ListGroupDivider' });

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

const styles = StyleSheet.create({
  borderless: {
    borderColor: 'transparent',
    borderWidth: 0,
  },
  divider: {
    height: 1,
  },
  group: {
    overflow: 'hidden',
  },
  pushToEnd: {
    marginStart: 'auto',
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  twoLine: {
    flex: 1,
    minWidth: 0,
  },
});

export default ListGroup;
