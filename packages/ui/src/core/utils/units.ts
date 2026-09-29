/**
 * Converts pixel values to rem units
 */
export function rem(value: number | string): string {
  if (typeof value === 'string') {
    return value;
  }
  return `${value / 16}rem`;
}

/**
 * Converts values to px
 */
export function px(value: string | number): number {
  if (typeof value === 'number') {
    return value;
  }

  if (value.includes('rem')) {
    return parseFloat(value) * 16;
  }

  if (value.includes('px')) {
    return parseFloat(value);
  }

  return parseFloat(value);
}

/** The part of a theme `getSize` reads: its spacing scale. */
export interface SizeTheme {
  spacing?: { readonly [key: string]: string | number | undefined };
}

/**
 * Gets a size value from theme or returns the value if it's a string
 */
export function getSize(
  size: string | number | undefined,
  prefix: string,
  theme?: SizeTheme
): string | undefined {
  if (size === undefined) {
    return undefined;
  }

  if (typeof size === 'number') {
    return rem(size);
  }

  if (typeof size === 'string') {
    // Check if it's a theme size key
    const themeValue = theme?.spacing?.[size];
    if (themeValue) {
      return typeof themeValue === 'number' ? rem(themeValue) : themeValue;
    }

    // Return as CSS custom property
    return `var(--platform-blocks-${prefix}-${size}, ${size})`;
  }

  return size;
}

/**
 * Gets font size value
 *
 * @deprecated Returns a web-only CSS variable string that is inert on React Native and unused by the library; read `theme.fontSizes` instead. Will be removed in the next major.
 */
export function getFontSize(size: string | undefined): string | undefined {
  if (!size) {
    return undefined;
  }

  return `var(--platform-blocks-font-size-${size})`;
}

/**
 * Gets radius value
 *
 * @deprecated Returns a web-only CSS variable string that is inert on React Native and unused by the library; read `theme.radii` instead. Will be removed in the next major.
 */
export function getRadius(radius: string | number | undefined): string | undefined {
  if (radius === undefined) {
    return undefined;
  }

  if (typeof radius === 'number') {
    return rem(radius);
  }

  return `var(--platform-blocks-radius-${radius})`;
}

/**
 * Gets shadow value
 *
 * @deprecated Returns a web-only CSS variable string that is inert on React Native and unused by the library; read `theme.shadows` instead. Will be removed in the next major.
 */
export function getShadow(shadow: string | undefined): string | undefined {
  if (!shadow) {
    return undefined;
  }

  return `var(--platform-blocks-shadow-${shadow})`;
}

/**
 * Reference a theme color as a CSS variable — `getColor('primary', 6)` yields
 * `var(--platform-blocks-palette-primary-6)`, one of the variables `CSSVariables`
 * emits (palettes are published as `--platform-blocks-palette-<name>-<index>`;
 * the old `--platform-blocks-color-*` names are gone).
 *
 * **Web only.** React Native has no `var()`, so the returned string is inert on
 * native. To resolve a color prop to a concrete value on every platform, use
 * `resolveColorProp` (or `resolveTextColor` / `resolveBg` / `resolveAccentColor`
 * / `resolveLineColor`) from `core/theme` — that is what the components use.
 */
export function getColor(color: string | undefined, shade?: number | string): string | undefined {
  if (!color) {
    return undefined;
  }

  if (color.startsWith('#') || color.startsWith('rgb') || color.startsWith('hsl')) {
    return color;
  }

  if (shade !== undefined) {
    return `var(--platform-blocks-palette-${color}-${shade})`;
  }

  return `var(--platform-blocks-palette-${color}-5)`; // Default to middle shade
}
