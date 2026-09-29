import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View, type Role, type ViewStyle } from 'react-native';

import { a11yProps, roleFromAccessibilityRole } from '../../core/accessibility/a11yProps';
import { factory, withStatics } from '../../core/factory/factory';
import type { ShadowValue } from '../../core/theme/shadow';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveRadius, resolveSpacing } from '../../core/theme/tokens';
import type { SizeValue, SurfaceLevel } from '../../core/theme/types';
import { resolveGradientStops } from '../../core/theme/variantRoles';
import { extractLayoutProps, getLayoutStyles } from '../../core/utils/layout';
import { warnOnce } from '../../core/utils/logger';
import { extractShadowProps } from '../../core/utils/shadow';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import { resolveLinearGradient } from '../../utils/optionalDependencies';
import { SurfaceContext } from '../Surface/SurfaceContext';
import { useSurfaceStyles } from '../Surface/useSurfaceStyles';
import { CardContext, type CardContextValue } from './CardContext';
import { CardSection, isCardSection } from './CardSection';
import type { CardProps, CardSectionProps, PlatformBlocksTheme } from './types';

const { LinearGradient: OptionalLinearGradient } = resolveLinearGradient();

type CardVariant = NonNullable<CardProps['variant']>;

/**
 * How each variant sits on the shared elevation ladder.
 *
 * `level` picks the background + border color from `theme.surfaces`; `bg`
 * overrides it for the variants that deliberately step off the ladder
 * (transparent ones, and `subtle`, which uses the page's alternate tone).
 * `shadow` is stated per-variant rather than inherited from the level so this
 * refactor preserves Card's existing depth exactly.
 */
interface CardVariantConfig {
  level: SurfaceLevel;
  bg?: string;
  withBorder: boolean | 'auto';
  borderColorKey?: 'default' | 'subtle';
  extraStyle?: ViewStyle;
  /**
   * Omit to inherit `COMPONENT_SHADOW_DEFAULTS.card`, the single place the
   * resting Card elevation is tuned. Variants that intentionally differ
   * (`elevated`, `outline`, `ghost`) set it explicitly.
   */
  defaultShadow?: ShadowValue;
  pressedStyle: ViewStyle;
  gradient?: {
    colors: string[];
    start?: { x: number; y: number };
    end?: { x: number; y: number };
  };
}

const resolvePadding = (theme: PlatformBlocksTheme, padding: SizeValue | undefined): number => {
  if (typeof padding === 'number') return padding;
  const resolved = resolveSpacing(theme, padding ?? 'md');
  return typeof resolved === 'number' ? resolved : 0;
};

const styles = StyleSheet.create({
  base: { position: 'relative' },
  clip: { overflow: 'hidden' },
  disabled: { opacity: 0.5 },
  gradient: { zIndex: -1 },
});

const getVariantConfig = (theme: PlatformBlocksTheme, variant: CardVariant): CardVariantConfig => {
  switch (variant) {
    case 'outline':
      return {
        level: 1,
        bg: 'transparent',
        withBorder: true,
        defaultShadow: 'none',
        pressedStyle: { opacity: 0.9 },
      };
    case 'elevated':
      return {
        level: 2,
        withBorder: 'auto',
        defaultShadow: 'lg',
        pressedStyle: { opacity: 0.94 },
      };
    case 'subtle':
      return {
        level: 1,
        bg: theme.backgrounds.subtle,
        withBorder: true,
        borderColorKey: 'subtle',
        defaultShadow: 'xs',
        pressedStyle: { opacity: 0.92 },
      };
    case 'ghost':
      return {
        level: 1,
        bg: 'transparent',
        withBorder: false,
        defaultShadow: 'none',
        pressedStyle: {
          backgroundColor: theme.backgrounds.subtle,
          opacity: 1,
        },
      };
    case 'gradient': {
      // Shared helper keeps Card's gradient identical to Button/Badge/Chip.
      const colors = resolveGradientStops(theme, 'primary');
      return {
        level: 1,
        bg: colors[0],
        withBorder: false,
        extraStyle: { overflow: 'hidden' },
        defaultShadow: 'md',
        pressedStyle: { opacity: 0.9 },
        gradient: {
          colors,
          start: { x: 0, y: 0 },
          end: { x: 1, y: 1 },
        },
      };
    }
    case 'filled':
    default:
      // No `defaultShadow` — falls through to `COMPONENT_SHADOW_DEFAULTS.card`.
      return {
        level: 1,
        withBorder: 'auto',
        pressedStyle: { opacity: 0.95 },
      };
  }
};

const CardRoot = factory<{ props: CardProps; ref: View }>((allProps, ref) => {
  // `bg` replaces the variant's fill on the surface ladder below, so it stays
  // out of the style props (one background, resolved once).
  const { bg, ...propsWithoutBg } = allProps;
  const { styleProps, otherProps: propsAfterSpacing } = extractStyleProps(propsWithoutBg);
  const { shadowProps, otherProps: propsAfterShadow } = extractShadowProps(propsAfterSpacing);
  const { layoutProps, otherProps } = extractLayoutProps(propsAfterShadow);
  const {
    children,
    variant,
    padding,
    radius,
    style,
    onPress,
    disabled,
    withBorder,
    borderColor,
    borderWidth,
    clip,
    role,
    accessibilityRole,
    accessibilityState,
    ...rest
  } = otherProps;

  const theme = useTheme();
  const resolvedVariant: CardVariant = variant ?? 'filled';

  const variantConfig = useMemo(() => getVariantConfig(theme, resolvedVariant), [theme, resolvedVariant]);

  // Compose `withBorder` / `borderColor` / `borderWidth` on top of the variant.
  // Setting any of these activates a 1px theme border by default, which the
  // user can override per-prop. This composes with `outline`/`subtle` variants
  // (which already set a border) — the override wins.
  const wantsBorder = withBorder || borderColor !== undefined || borderWidth !== undefined;

  // Card is a Surface with padding and Section semantics — the background,
  // border color and elevation all come from the shared ladder rather than
  // from Card picking theme colors itself.
  const surface = useSurfaceStyles({
    level: variantConfig.level,
    bg: bg ?? variantConfig.bg,
    withBorder: wantsBorder ? true : variantConfig.withBorder,
    borderColor: borderColor ?? (variantConfig.borderColorKey === 'subtle' ? theme.backgrounds.border : undefined),
    borderWidth,
    shadow: shadowProps.shadow ?? variantConfig.defaultShadow,
    // `filled` deliberately declares no variant shadow, so it lands on Card's
    // own component default rather than level 1's lighter one.
    componentShadowType: 'card',
    radius: radius || 'md',
  });

  const paddingPx = resolvePadding(theme, padding);
  const paddingStyle = useMemo(() => ({ padding: paddingPx }), [paddingPx]);

  // The gradient overlay is absolutely positioned, so it needs the radius on
  // its own rather than inheriting the container's.
  const borderRadius = resolveRadius(theme, radius || 'md');

  const spacingStyles = useStyleProps(styleProps);
  const layoutStyles = getLayoutStyles(layoutProps);

  const combinedStyles = [
    styles.base,
    paddingStyle,
    clip && styles.clip,
    surface.style,
    variantConfig.extraStyle,
    surface.shadowStyle,
    spacingStyles,
    layoutStyles,
    style,
  ];

  // Walk children to identify Card.Section instances and inject position
  // metadata (`_isFirst` / `_isLast`), so a section can negate the parent's
  // padding only on the edges it actually touches.
  // Note: this only inspects DIRECT children — Sections wrapped in fragments
  // or extra Views won't be recognized.
  const childArray = React.Children.toArray(children);
  const sectionIndices: number[] = [];
  childArray.forEach((child, i) => {
    if (React.isValidElement(child) && isCardSection(child.type)) sectionIndices.push(i);
  });
  const firstSectionIdx = sectionIndices[0];
  const lastSectionIdx = sectionIndices[sectionIndices.length - 1];
  const enhancedChildren =
    sectionIndices.length === 0
      ? children
      : childArray.map((child, i) =>
          React.isValidElement<CardSectionProps>(child) && isCardSection(child.type)
            ? React.cloneElement(child, { _isFirst: i === firstSectionIdx, _isLast: i === lastSectionIdx })
            : child
        );

  const sectionBorderColor = borderColor ?? surface.token.border ?? theme.backgrounds.border;
  const hasBorder = !!wantsBorder || resolvedVariant === 'outline' || resolvedVariant === 'subtle';
  const cardContextValue = useMemo<CardContextValue>(
    () => ({ paddingPx, withBorder: hasBorder, borderColor: sectionBorderColor }),
    [paddingPx, hasBorder, sectionBorderColor]
  );
  const surfaceContextValue = useMemo(() => ({ level: surface.level }), [surface.level]);

  const gradientOverlay = variantConfig.gradient ? (
    <OptionalLinearGradient
      pointerEvents="none"
      colors={variantConfig.gradient.colors}
      start={variantConfig.gradient.start}
      end={variantConfig.gradient.end}
      style={[StyleSheet.absoluteFill, { borderRadius }, styles.gradient]}
    />
  ) : null;

  // Legacy a11y props: `accessibilityRole` → `role`, `accessibilityState` →
  // aria-* (react-native-web ignores accessibilityState).
  if (accessibilityState) {
    warnOnce(
      'Card.accessibilityState',
      '[platform-blocks] Card `accessibilityState` is deprecated; pass aria-* props (aria-checked, aria-selected, …) instead.'
    );
  }
  const resolvedRole = role ?? (roleFromAccessibilityRole(accessibilityRole) as Role | undefined);
  const legacyA11y = accessibilityState
    ? a11yProps({
        checked: accessibilityState.checked,
        selected: accessibilityState.selected,
        expanded: accessibilityState.expanded,
        busy: accessibilityState.busy,
      })
    : null;

  if (onPress) {
    return (
      <SurfaceContext.Provider value={surfaceContextValue}>
        <CardContext.Provider value={cardContextValue}>
          <Pressable
            ref={ref}
            {...a11yProps({ role: resolvedRole ?? 'button', disabled: disabled || accessibilityState?.disabled })}
            {...legacyA11y}
            {...rest}
            onPress={disabled ? undefined : onPress}
            disabled={disabled}
            style={({ pressed }) => [
              ...combinedStyles,
              disabled && styles.disabled,
              pressed && !disabled ? variantConfig.pressedStyle : null,
            ]}
          >
            {gradientOverlay}
            {enhancedChildren}
          </Pressable>
        </CardContext.Provider>
      </SurfaceContext.Provider>
    );
  }

  return (
    <SurfaceContext.Provider value={surfaceContextValue}>
      <CardContext.Provider value={cardContextValue}>
        <View
          ref={ref}
          {...a11yProps({ role: resolvedRole, disabled: disabled || accessibilityState?.disabled })}
          {...legacyA11y}
          {...rest}
          style={combinedStyles}
        >
          {gradientOverlay}
          {enhancedChildren}
        </View>
      </CardContext.Provider>
    </SurfaceContext.Provider>
  );
}, { displayName: 'Card' });

/**
 * A padded surface for grouping content. `Card.Section` children can bleed to
 * the card's edges. With `onPress` the card is a button (or the `role` given).
 */
export const Card = withStatics(CardRoot, { Section: CardSection });
