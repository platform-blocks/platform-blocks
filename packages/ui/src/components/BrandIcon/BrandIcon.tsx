import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import type { StyleProp, ViewStyle } from 'react-native';
import { getIconSize, SizeValue } from '../../core/theme/sizes';
import { brandIcons, resolveBrandName, type BrandName, type DeprecatedBrandName } from './brands';
import { useTheme } from '../../core/theme/ThemeProvider';

export type { BrandName, DeprecatedBrandName };

export interface BrandIconProps {
  /** Brand name from the registry. camelCase names are deprecated aliases. */
  brand: BrandName | DeprecatedBrandName;
  /** Size of the icon */
  size?: SizeValue;
  /** Override all colors with a single color */
  color?: string;
  /** Icon variant - 'full' for multi-color, 'mono' for single-color with clipping */
  variant?: 'full' | 'mono';
  /** Additional styles */
  style?: StyleProp<ViewStyle>;
  /** Accessibility label */
  label?: string;
  /** Whether the icon is purely decorative (skip a11y) */
  decorative?: boolean;
  /** Whether to automatically invert black colors in dark mode */
  invertInDarkMode?: boolean;
  /** Force color scheme for testing (overrides automatic detection) */
  colorScheme?: 'light' | 'dark';
}

/**
 * Helper function to transform black colors to white in dark mode
 */
const transformColorForDarkMode = (
  originalColor: string, 
  isDark: boolean, 
  shouldInvert: boolean
): string => {
  // If we shouldn't invert, return original color
  if (!shouldInvert) return originalColor;
  
  // Transform black and near-black colors to white in dark mode, back to black in light mode
  if (originalColor === '#000000' || originalColor === '#000' || originalColor === 'black') {
    return isDark ? '#ffffff' : '#000000';
  }
  
  return originalColor;
};

export const BrandIcon = React.forwardRef<Svg, BrandIconProps>(({
  brand,
  size = 'md',
  color,
  variant,
  style,
  label,
  decorative = false,
  invertInDarkMode = false,
  colorScheme: forcedColorScheme,
}, ref) => {
  // Use UI package's color scheme detection
  const theme = useTheme();
  const systemColorScheme = theme.colorScheme;

  // Get brand icon definition from registry (resolving deprecated camelCase aliases)
  const brandIconDef = brandIcons[resolveBrandName(brand)];

  if (!brandIconDef) {
    console.warn(`Brand icon "${brand}" not found in registry`);
    return null;
  }

  // Detect color scheme (use forced scheme if provided, otherwise use system)
  const currentColorScheme = forcedColorScheme || systemColorScheme;
  const isDarkMode = currentColorScheme === 'dark';

  // Resolve size using UI package's size system
  const resolvedSize = getIconSize(size);

  // Resolve variant - default to 'full' unless color override is provided
  const resolvedVariant = variant ?? (color ? 'mono' : 'full');

  // Get icon content based on variant
  const brandDef = brandIconDef as any;
  
  // Check if this brand supports dark mode and should auto-invert
  const shouldAutoInvert = brandDef.supportsDarkMode === true;
  const shouldInvert = invertInDarkMode || shouldAutoInvert;
  let iconContent;
  
  // Check if the variant exists as a direct property (new structure)
  if (brandDef[resolvedVariant]) {
    iconContent = brandDef[resolvedVariant];
  }
  // Fallback to old nested variants structure for backward compatibility
  else if (brandDef.variants && brandDef.variants[resolvedVariant]) {
    iconContent = brandDef.variants[resolvedVariant].content || brandDef.variants[resolvedVariant];
  }
  // Default to content property
  else {
    iconContent = brandDef.content;
  }

  if (!iconContent) {
    console.warn(`Brand icon "${brand}" does not have content for variant "${resolvedVariant}"`);
    return null;
  }

  // Render SVG with optional color override
  return (
    <Svg
      ref={ref}
      width={resolvedSize}
      height={resolvedSize}
      viewBox={(brandIconDef as any).viewBox}
      style={style}
      accessibilityLabel={decorative ? undefined : (label || `${brand} logo`)}
      accessibilityRole={decorative ? 'none' : 'image'}
    >
      {/* Optional SVG defs such as gradients */}
      {(() => {
        const defs = (brandIconDef as any).defs as
          | undefined
          | {
              linearGradients?: Array<{
                id: string;
                x1?: string | number;
                y1?: string | number;
                x2?: string | number;
                y2?: string | number;
                gradientUnits?: 'userSpaceOnUse' | 'objectBoundingBox';
                gradientTransform?: string;
                stops: Array<{ offset: string | number; stopColor: string; stopOpacity?: number }>;
              }>;
            };
        if (!defs) return null;
        return (
          <Defs>
            {defs.linearGradients?.map((g, idx) => (
              <LinearGradient
                key={`lg-${g.id || idx}`}
                id={g.id}
                x1={g.x1 as any}
                y1={g.y1 as any}
                x2={g.x2 as any}
                y2={g.y2 as any}
                gradientUnits={g.gradientUnits as any}
                gradientTransform={g.gradientTransform}
              >
                {g.stops.map((s, sidx) => (
                  <Stop
                    key={`stop-${sidx}`}
                    offset={s.offset as any}
                    stopColor={color || transformColorForDarkMode(s.stopColor, isDarkMode, shouldInvert)}
                    stopOpacity={s.stopOpacity}
                  />
                ))}
              </LinearGradient>
            ))}
          </Defs>
        );
      })()}
      {Array.isArray(iconContent) ? (
        // Multi-shape brand icon (paths, circles, etc.)
        iconContent.map((item: any, index: number) => {
          const shouldOverride = Boolean(color) && (item?.allowOverride === true || resolvedVariant === 'mono');
          
          // Determine fill color with dark mode support
          let fillColor = item.fill;
          if (shouldOverride) {
            fillColor = color;
          } else {
            fillColor = transformColorForDarkMode(item.fill, isDarkMode, shouldInvert);
          }

          // Determine stroke color with dark mode support  
          let strokeColor = item.stroke;
          if (item.stroke) {
            if (shouldOverride) {
              strokeColor = color;
            } else {
              strokeColor = transformColorForDarkMode(item.stroke, isDarkMode, shouldInvert);
            }
          }
          
          if (typeof item?.d === 'string') {
            return (
              <Path
                key={index}
                d={item.d}
                fill={fillColor as any}
                stroke={strokeColor as any}
                strokeWidth={item.strokeWidth as any}
                fillRule={item.fillRule as any}
                clipRule={item.clipRule as any}
                opacity={item.opacity as any}
                transform={item.transform}
              />
            );
          }
          if (item && typeof item.cx !== 'undefined' && typeof item.cy !== 'undefined' && typeof item.r !== 'undefined') {
            return (
              <Circle
                key={index}
                cx={item.cx as any}
                cy={item.cy as any}
                r={item.r as any}
                fill={fillColor as any}
                stroke={strokeColor as any}
                strokeWidth={item.strokeWidth as any}
                opacity={item.opacity as any}
              />
            );
          }
          return null;
        })
      ) : (
        // Single path brand icon
        <Path 
          d={iconContent as string} 
          fill={color || transformColorForDarkMode('#currentColor', isDarkMode, shouldInvert)} 
        />
      )}
    </Svg>
  );
});

BrandIcon.displayName = 'BrandIcon';

export default BrandIcon;