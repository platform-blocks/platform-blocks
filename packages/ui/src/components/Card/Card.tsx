import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';

import { useTheme } from '../../core/theme';
import { createRadiusStyles } from '../../core/theme/radius';
import type { ShadowValue } from '../../core/theme/shadow';
import { getSpacingStyles, extractSpacingProps, extractShadowProps, getShadowStyles, getLayoutStyles, extractLayoutProps } from '../../core/utils';
import { getSpacing, type SizeValue } from '../../core/theme/sizes';
import { resolveBg } from '../../core/theme/resolveColors';
import { resolveGradientStops } from '../../core/theme/variantRoles';
import type { CardProps, PlatformBlocksTheme } from './types';
import { DESIGN_TOKENS } from '../../core/unified-styles';
import { resolveLinearGradient } from '../../utils/optionalDependencies';
import { CardContext } from './CardContext';
import { CardSection } from './CardSection';
import { SurfaceContext } from '../Surface/SurfaceContext';
import { useSurfaceStyles } from '../Surface/useSurfaceStyles';
import type { SurfaceLevel } from '../../core/theme/types';

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
  extraStyle?: Record<string, any>;
  /**
   * Omit to inherit `COMPONENT_SHADOW_DEFAULTS.card`, the single place the
   * resting Card elevation is tuned. Variants that intentionally differ
   * (`elevated`, `outline`, `ghost`) set it explicitly.
   */
  defaultShadow?: ShadowValue;
  pressedStyle: Record<string, any>;
  gradient?: {
    colors: string[];
    start?: { x: number; y: number };
    end?: { x: number; y: number };
  };
}

const DEFAULT_PADDING = DESIGN_TOKENS.spacing.md;

/**
 * Card delegates to the shared `resolveBg` from `core/theme/resolveColors`
 * so Card and Block stay in sync. See that helper for the full lookup rules.
 */
const resolveBackgroundColor = resolveBg;

const resolvePadding = (padding: SizeValue | undefined): number => {
  if (padding === undefined) return DEFAULT_PADDING;
  if (typeof padding === 'number') return padding;
  return getSpacing(padding);
};

const resolveGradientColors = (theme: PlatformBlocksTheme): string[] =>
  // Shared helper keeps Card's gradient identical to Button/Badge/Chip.
  resolveGradientStops(theme as any, 'primary');

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
      const colors = resolveGradientColors(theme);
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

type CardComponent = React.ForwardRefExoticComponent<
  CardProps & React.RefAttributes<View>
> & { Section: typeof CardSection };

export const Card: CardComponent = React.forwardRef<View, CardProps>((allProps, ref) => {
  const { spacingProps, otherProps: propsAfterSpacing } = extractSpacingProps(allProps);
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
    bg,
    clip,
    ...rest
  } = otherProps;

  const theme = useTheme();
  const resolvedVariant: CardVariant = variant ?? 'filled';

  const variantConfig = React.useMemo(
    () => getVariantConfig(theme, resolvedVariant),
    [theme, resolvedVariant]
  );

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
    borderColor:
      borderColor ??
      (variantConfig.borderColorKey === 'subtle'
        ? theme.semantic?.borderSubtle ?? theme.backgrounds.border
        : undefined),
    borderWidth,
    shadow: shadowProps.shadow ?? variantConfig.defaultShadow,
    // `filled` deliberately declares no variant shadow, so it lands on Card's
    // own component default rather than level 1's lighter one.
    componentShadowType: 'card',
    radius: radius || 'md',
  });

  const baseStyles = {
    padding: resolvePadding(padding),
    position: 'relative' as const,
    ...(clip && { overflow: 'hidden' as const }),
  };

  // The gradient overlay is absolutely positioned, so it needs the radius on
  // its own rather than inheriting the container's.
  const radiusStyles = createRadiusStyles(radius || 'md');

  const spacingStyles = getSpacingStyles(spacingProps);
  const layoutStyles = getLayoutStyles(layoutProps);

  const combinedStyles = [
    baseStyles,
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
    if (React.isValidElement(child) && (child.type as any)?.__CARD_SECTION__) {
      sectionIndices.push(i);
    }
  });
  const firstSectionIdx = sectionIndices[0];
  const lastSectionIdx = sectionIndices[sectionIndices.length - 1];
  const enhancedChildren = sectionIndices.length === 0
    ? children
    : React.Children.map(children, (child, i) => {
        if (React.isValidElement(child) && (child.type as any)?.__CARD_SECTION__) {
          return React.cloneElement(child as React.ReactElement<any>, {
            _isFirst: i === firstSectionIdx,
            _isLast: i === lastSectionIdx,
          });
        }
        return child;
      });

  const cardContextValue = {
    paddingPx: baseStyles.padding,
    withBorder: !!wantsBorder || resolvedVariant === 'outline' || resolvedVariant === 'subtle',
    borderColor: borderColor ?? surface.token.border ?? 'rgba(0,0,0,0.08)',
  };

  const surfaceContextValue = { level: surface.level };

  const gradientOverlay = variantConfig.gradient && OptionalLinearGradient
    ? (
        <OptionalLinearGradient
          pointerEvents="none"
          colors={variantConfig.gradient.colors}
          start={variantConfig.gradient.start}
          end={variantConfig.gradient.end}
          style={[StyleSheet.absoluteFill, radiusStyles, {zIndex:-1}]}
        />
      )
    : null;

  // If onPress is provided, wrap in Pressable
  if (onPress) {
    return (
      <SurfaceContext.Provider value={surfaceContextValue}>
        <CardContext.Provider value={cardContextValue}>
          <Pressable
            ref={ref}
            {...rest}
            onPress={disabled ? undefined : onPress}
            disabled={disabled}
            style={({ pressed }) => [
              ...combinedStyles,
              disabled && { opacity: 0.5 },
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
        <View ref={ref} {...rest} style={combinedStyles}>
          {gradientOverlay}
          {enhancedChildren}
        </View>
      </CardContext.Provider>
    </SurfaceContext.Provider>
  );
}) as CardComponent;

Card.displayName = 'Card';

// Attach Section as a static property so consumers can write `<Card.Section>`.
// The component is also exported on its own from the barrel for users who
// prefer named imports.
Card.Section = CardSection;
