import React from 'react';
import type { ViewProps } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import {
  a11yProps,
  factory,
  isWeb,
  resolveIconSize,
  resolveStyleProps,
  useTheme,
  warnOnce,
} from '@plocks/ui';
import type { A11yProps, BaseProps, SizeValue } from '@plocks/ui';
import { brandIcons, type BrandName } from '../../registry';

export interface BrandIconProps extends BaseProps {
  /** Brand name from the registry. */
  brand: BrandName;
  /** Size token or px. */
  size?: SizeValue;
  /** Override all colors with a single color (brand logos otherwise keep their official colors). */
  color?: string;
  /** Icon variant - 'full' for multi-color, 'mono' for single-color with clipping */
  variant?: 'full' | 'mono';
  /**
   * Accessible name. A labelled brand icon is announced as an image; without a
   * label it is decorative (hidden from assistive technology).
   */
  label?: string;
  /** Alias of `label`. */
  accessibilityLabel?: string;
  /**
   * Hide the icon from assistive technology. Defaults to `true` unless a `label`
   * is given — a logo next to (or inside) labelled content adds only noise.
   */
  decorative?: boolean;
  /** Whether to automatically invert black colors in dark mode */
  invertInDarkMode?: boolean;
  /** Force color scheme for testing (overrides automatic detection) */
  colorScheme?: 'light' | 'dark';
}

/** One shape of a multi-shape brand mark. */
export interface BrandShape {
  d?: string;
  cx?: number | string;
  cy?: number | string;
  r?: number | string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number | string;
  fillRule?: string;
  clipRule?: string;
  opacity?: number | string;
  transform?: string;
  /** Whether `color` may recolor this shape in the `full` variant. */
  allowOverride?: boolean;
}

type BrandContent = string | readonly BrandShape[];

interface BrandGradient {
  id: string;
  x1?: string | number;
  y1?: string | number;
  x2?: string | number;
  y2?: string | number;
  gradientUnits?: string;
  gradientTransform?: string;
  stops: ReadonlyArray<{ offset: string | number; stopColor: string; stopOpacity?: number }>;
}

/** The shape of a brand registry entry. */
export interface BrandIconDefinition {
  content?: BrandContent;
  full?: BrandContent;
  mono?: BrandContent;
  viewBox?: string;
  variant?: string;
  /** Pure-black marks flip to white in dark mode. */
  supportsDarkMode?: boolean;
  defs?: { linearGradients?: readonly BrandGradient[] };
}

const REGISTRY: Record<string, BrandIconDefinition | undefined> = brandIcons;

type BrandIconA11yProps = A11yProps & Pick<ViewProps, 'importantForAccessibility'>;

/** See Icon: hidden from AT without hiding the element from queries. */
const DECORATIVE_A11Y: BrandIconA11yProps = isWeb ? a11yProps({ hidden: true }) : { importantForAccessibility: 'no' };

/** Black (and near-black keywords) → white in dark mode, when inversion applies. */
const transformColorForDarkMode = (originalColor: string | undefined, isDark: boolean, shouldInvert: boolean) => {
  if (!shouldInvert || !originalColor) return originalColor;
  if (originalColor === '#000000' || originalColor === '#000' || originalColor === 'black') {
    // Brand marks: literal black/white are the logo's own colors.
    return isDark ? '#ffffff' : '#000000';
  }
  return originalColor;
};

const toFillRule = (value: string | undefined): 'evenodd' | 'nonzero' | undefined =>
  value === 'evenodd' || value === 'nonzero' ? value : undefined;

const toGradientUnits = (value: string | undefined): 'userSpaceOnUse' | 'objectBoundingBox' | undefined =>
  value === 'userSpaceOnUse' || value === 'objectBoundingBox' ? value : undefined;

function resolveContent(def: BrandIconDefinition, variant: 'full' | 'mono'): BrandContent | undefined {
  return def[variant] ?? def.content;
}

/**
 * A brand logo from the built-in registry, in its official colors (or one
 * `color`). Decorative unless labelled.
 */
export const BrandIcon = factory<{ props: BrandIconProps; ref: Svg }>((props, ref) => {
  const {
    brand,
    size = 'md',
    color,
    variant,
    style,
    label,
    accessibilityLabel,
    decorative,
    invertInDarkMode = false,
    colorScheme: forcedColorScheme,
    testID,
    ...spacingProps
  } = props;

  const theme = useTheme();
  const brandIconDef = REGISTRY[brand];

  if (!brandIconDef) {
    warnOnce(`brand-icon:${brand}`, `Brand icon "${brand}" not found in registry`);
    return null;
  }

  const isDarkMode = (forcedColorScheme ?? theme.colorScheme) === 'dark';
  const resolvedSize = resolveIconSize(theme, size);
  // Default to 'full' unless a color override is provided.
  const resolvedVariant = variant ?? (color ? 'mono' : 'full');
  const shouldInvert = invertInDarkMode || brandIconDef.supportsDarkMode === true;
  const iconContent = resolveContent(brandIconDef, resolvedVariant);

  if (!iconContent) {
    warnOnce(
      `brand-icon:${brand}:${resolvedVariant}`,
      `Brand icon "${brand}" does not have content for variant "${resolvedVariant}"`
    );
    return null;
  }

  const accessibleName = label ?? accessibilityLabel;
  const a11y =
    decorative ?? !accessibleName
      ? DECORATIVE_A11Y
      : a11yProps({ role: 'img', label: accessibleName || `${brand} logo`, accessible: true });

  const gradients = brandIconDef.defs?.linearGradients;

  return (
    <Svg
      ref={ref}
      width={resolvedSize}
      height={resolvedSize}
      viewBox={brandIconDef.viewBox}
      style={[resolveStyleProps(spacingProps, theme), style]}
      testID={testID}
      {...a11y}
    >
      {gradients ? (
        <Defs>
          {gradients.map((g, idx) => (
            <LinearGradient
              key={`lg-${g.id || idx}`}
              id={g.id}
              x1={g.x1}
              y1={g.y1}
              x2={g.x2}
              y2={g.y2}
              gradientUnits={toGradientUnits(g.gradientUnits)}
              gradientTransform={g.gradientTransform}
            >
              {g.stops.map((s, sidx) => (
                <Stop
                  key={`stop-${sidx}`}
                  offset={s.offset}
                  stopColor={color || transformColorForDarkMode(s.stopColor, isDarkMode, shouldInvert)}
                  stopOpacity={s.stopOpacity}
                />
              ))}
            </LinearGradient>
          ))}
        </Defs>
      ) : null}
      {typeof iconContent === 'string' ? (
        // Single path brand icon
        <Path d={iconContent} fill={color || transformColorForDarkMode('#000000', isDarkMode, shouldInvert)} />
      ) : (
        // Multi-shape brand icon (paths, circles)
        iconContent.map((item, index) => {
          const shouldOverride = Boolean(color) && (item.allowOverride === true || resolvedVariant === 'mono');
          const fillColor = shouldOverride ? color : transformColorForDarkMode(item.fill, isDarkMode, shouldInvert);
          const strokeColor = item.stroke
            ? shouldOverride
              ? color
              : transformColorForDarkMode(item.stroke, isDarkMode, shouldInvert)
            : undefined;

          if (typeof item.d === 'string') {
            return (
              <Path
                key={index}
                d={item.d}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={item.strokeWidth}
                fillRule={toFillRule(item.fillRule)}
                clipRule={toFillRule(item.clipRule)}
                opacity={item.opacity}
                transform={item.transform}
              />
            );
          }
          if (item.cx !== undefined && item.cy !== undefined && item.r !== undefined) {
            return (
              <Circle
                key={index}
                cx={item.cx}
                cy={item.cy}
                r={item.r}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={item.strokeWidth}
                opacity={item.opacity}
              />
            );
          }
          return null;
        })
      )}
    </Svg>
  );
}, { displayName: 'BrandIcon' });

export default BrandIcon;
