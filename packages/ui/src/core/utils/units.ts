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
    return `var(--plocks-${prefix}-${size}, ${size})`;
  }

  return size;
}

/**
 * Reference a theme color as a CSS variable — `getColor('primary', 6)` yields
 * `var(--plocks-palette-primary-6)`, one of the variables `CSSVariables`
 * emits (palettes are published as `--plocks-palette-<name>-<index>`;
 * the old `--plocks-color-*` names are gone).
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
    return `var(--plocks-palette-${color}-${shade})`;
  }

  return `var(--plocks-palette-${color}-5)`; // Default to middle shade
}
