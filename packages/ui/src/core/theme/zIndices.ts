/**
 * Stacking scale shared by every layered component. Components never hard-code
 * a z-index above 10; they read a layer from here (or `theme.zIndices`) so a
 * popover opened inside a dialog always stacks above it.
 */
export interface ZIndices {
  base: number;
  dropdown: number;
  sticky: number;
  header: number;
  overlay: number;
  modal: number;
  popover: number;
  toast: number;
  tooltip: number;
  max: number;
}

export type ZIndexLayer = keyof ZIndices;

export const DEFAULT_Z_INDICES: ZIndices = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  header: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  toast: 1600,
  tooltip: 1700,
  max: 2000,
};

/** Resolves a layer against the theme, falling back to the default scale. */
export function getZIndex(theme: { zIndices?: Partial<ZIndices> } | null | undefined, layer: ZIndexLayer): number {
  return theme?.zIndices?.[layer] ?? DEFAULT_Z_INDICES[layer];
}
