import type { PlatformBlocksTheme } from './types';

/**
 * Resolve a `bg` (background) prop to a CSS color string:
 *
 *   • `'primary'`, `'gray'`, `'success'`, `'warning'`, `'error'`, `'secondary'`
 *     → that palette's shade-1 (subtle tint, the conventional "background" shade)
 *   • `'primary.5'` → palette[5]
 *   • `'surface'` / `'subtle'` / `'elevated'` / `'base'` / `'border'`
 *     → `theme.backgrounds.<key>`
 *   • Any other CSS color string passes through unchanged.
 *
 * Used by Card, Block, and any other Box-rendering component that accepts the
 * `bg` shorthand. Centralized so the lookup rules stay consistent across
 * components.
 */
export function resolveBg(theme: PlatformBlocksTheme, value?: string): string | undefined {
  if (!value) return undefined;

  // Theme background keys (theme.backgrounds.surface etc.)
  const bgKey = (theme.backgrounds as any)?.[value];
  if (typeof bgKey === 'string') return bgKey;

  // Palette + shade syntax: 'primary.5'
  if (value.includes('.')) {
    const [paletteName, shade] = value.split('.');
    const palette = (theme.colors as any)?.[paletteName];
    if (Array.isArray(palette)) {
      const idx = parseInt(shade, 10);
      if (!Number.isNaN(idx)) return palette[idx] ?? palette[1] ?? palette[0];
    }
  }

  // Bare palette name → shade-1 (subtle tint)
  const palette = (theme.colors as any)?.[value];
  if (Array.isArray(palette)) return palette[1] ?? palette[0] ?? value;
  if (typeof palette === 'string') return palette;

  return value;
}

/**
 * Resolve a `c` / `color` text-color prop:
 *
 *   • `'dimmed'` → `theme.text.muted`
 *   • `'primary' | 'secondary' | 'muted' | 'disabled' | 'link'` → `theme.text.<key>`
 *   • `'primary.6'` → palette[6]
 *   • Bare palette name → palette[6] (the conventional "text" shade — readable)
 *   • Any other CSS color string passes through.
 */
export function resolveTextColor(theme: PlatformBlocksTheme, value?: string): string | undefined {
  if (!value) return undefined;

  // 'dimmed' is an alias for the muted text token
  if (value === 'dimmed') return theme.text?.muted ?? value;

  // Theme text keys (theme.text.muted etc.)
  const textKey = (theme.text as any)?.[value];
  if (typeof textKey === 'string') return textKey;

  // Palette + shade syntax: 'primary.6'
  if (value.includes('.')) {
    const [paletteName, shade] = value.split('.');
    const palette = (theme.colors as any)?.[paletteName];
    if (Array.isArray(palette)) {
      const idx = parseInt(shade, 10);
      if (!Number.isNaN(idx)) return palette[idx] ?? palette[6] ?? palette[5];
    }
  }

  // Bare palette name → shade-6 (conventional readable text shade)
  const palette = (theme.colors as any)?.[value];
  if (Array.isArray(palette)) return palette[6] ?? palette[5] ?? value;
  if (typeof palette === 'string') return palette;

  return value;
}
