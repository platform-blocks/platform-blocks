// Utility functions for color conversion
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/** `#RGB` or `#RRGGBB` (the `#` is required). */
export function isValidHex(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

/** Adds the leading `#` to a bare hex string (`'f00'` → `'#f00'`); other input is returned as is. */
export function withHash(text: string): string {
  const trimmed = text.trim();
  return /^[A-Fa-f0-9]{3}$|^[A-Fa-f0-9]{6}$/.test(trimmed) ? `#${trimmed}` : trimmed;
}

/** `#rgb` / `rgb` / `#rrggbb` → `#RRGGBB` (upper case, long form). */
export function normalizeHex(hex: string): string {
  let value = hex.trim();
  if (!value.startsWith('#')) {
    value = '#' + value;
  }
  if (value.length === 4) {
    // Convert #RGB to #RRGGBB
    value = '#' + value[1] + value[1] + value[2] + value[2] + value[3] + value[3];
  }
  return value.toUpperCase();
}

/**
 * Whether two color strings name the same color: hex values compare after
 * normalization (`#abc` equals `#AABBCC`), anything else case-insensitively.
 */
export function isSameColor(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  if (isValidHex(a) && isValidHex(b)) return normalizeHex(a) === normalizeHex(b);
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}
