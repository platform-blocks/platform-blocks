/**
 * RTL Utility Functions
 * 
 * Helper functions for handling Right-to-Left (RTL) layouts and styling.
 * These utilities help components adapt to RTL direction automatically.
 */

import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

/**
 * Type for flex direction values
 */
type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';

/**
 * Type for alignment values
 */
type Alignment = 'left' | 'right' | 'center' | 'flex-start' | 'flex-end';

/**
 * Flip horizontal flex direction based on RTL state
 * 
 * @param direction - The flex direction to potentially flip
 * @param isRTL - Whether the current direction is RTL
 * @returns The flipped direction if RTL and horizontal, otherwise original
 * 
 * @example
 * ```tsx
 * const { isRTL } = useDirection();
 * const flexDirection = flipDirection('row', isRTL); // 'row-reverse' in RTL
 * ```
 */
export function flipDirection(direction: FlexDirection, isRTL: boolean): FlexDirection {
  if (!isRTL) return direction;
  
  switch (direction) {
    case 'row':
      return 'row-reverse';
    case 'row-reverse':
      return 'row';
    case 'column':
    case 'column-reverse':
      // Vertical directions are not affected by RTL
      return direction;
    default:
      return direction;
  }
}

/**
 * Flip horizontal value (useful for transforms, positions)
 * 
 * @param value - The numeric value to flip
 * @param isRTL - Whether the current direction is RTL
 * @returns Negative value if RTL, positive if LTR
 * 
 * @example
 * ```tsx
 * const translateX = flipHorizontal(100, isRTL); // -100 in RTL
 * ```
 */
export function flipHorizontal(value: number, isRTL: boolean): number {
  return isRTL ? -value : value;
}

/**
 * Get physical property name from logical property
 * 
 * @param prop - Logical property name ('start' or 'end')
 * @param isRTL - Whether the current direction is RTL
 * @returns Physical property name ('left' or 'right')
 * 
 * @example
 * ```tsx
 * const side = getLogicalProperty('start', isRTL); // 'right' in RTL, 'left' in LTR
 * ```
 */
export function getLogicalProperty(prop: 'start' | 'end', isRTL: boolean): 'left' | 'right' {
  if (prop === 'start') {
    return isRTL ? 'right' : 'left';
  } else {
    return isRTL ? 'left' : 'right';
  }
}

/**
 * Swap left/right values in a style object for RTL
 * 
 * @param style - Style object to transform
 * @param isRTL - Whether the current direction is RTL
 * @returns Transformed style object
 * 
 * @example
 * ```tsx
 * const style = transformRTLStyle({ marginLeft: 10, marginRight: 20 }, true);
 * // Returns: { marginLeft: 20, marginRight: 10 }
 * ```
 */
export function transformRTLStyle<T extends ViewStyle | TextStyle | ImageStyle>(
  style: T,
  isRTL: boolean
): T {
  if (!isRTL || !style) return style;

  // Style objects are plain records; work on them by key so one helper covers
  // every left/right pair, including ones only some of the style types declare.
  const source = style as Record<string, unknown>;
  const transformed: Record<string, unknown> = { ...source };

  const swapPair = (leftKey: string, rightKey: string) => {
    if (!(leftKey in source) && !(rightKey in source)) return;
    const left = source[leftKey];
    const right = source[rightKey];
    if (left !== undefined) transformed[rightKey] = left;
    if (right !== undefined) transformed[leftKey] = right;
  };

  swapPair('marginLeft', 'marginRight');
  swapPair('paddingLeft', 'paddingRight');
  swapPair('borderLeftWidth', 'borderRightWidth');
  swapPair('borderLeftColor', 'borderRightColor');
  swapPair('left', 'right');

  // Flip flex direction
  if (source.flexDirection) {
    transformed.flexDirection = flipDirection(source.flexDirection as FlexDirection, isRTL);
  }

  // Flip text alignment
  if (source.textAlign) {
    transformed.textAlign = flipAlignment(source.textAlign as Alignment, isRTL);
  }

  return transformed as T;
}

/**
 * Flip text alignment for RTL
 * 
 * @param align - The alignment to flip
 * @param isRTL - Whether the current direction is RTL
 * @returns Flipped alignment
 */
export function flipAlignment(align: Alignment, isRTL: boolean): Alignment {
  if (!isRTL) return align;
  
  switch (align) {
    case 'left':
      return 'right';
    case 'right':
      return 'left';
    case 'flex-start':
      return 'flex-end';
    case 'flex-end':
      return 'flex-start';
    default:
      return align;
  }
}

/**
 * List of icon names that should be mirrored in RTL
 * These are directional icons that point left or right
 */
const DEFAULT_MIRRORABLE_ICONS = [
  'chevron-left',
  'chevron-right',
  'arrow-left',
  'arrow-right',
  'caret-left',
  'caret-right',
  'arrow-back',
  'arrow-forward',
  'align-left',
  'align-right',
  'angle-left',
  'angle-right',
  'double-chevron-left',
  'double-chevron-right',
  'triangle-left',
  'triangle-right',
];

/**
 * Check if an icon should be mirrored in RTL
 * 
 * @param iconName - The name of the icon
 * @param isRTL - Whether the current direction is RTL
 * @param customMirrorableIcons - Optional custom list of mirrorable icons
 * @returns Whether the icon should be mirrored
 * 
 * @example
 * ```tsx
 * const shouldMirror = shouldMirrorIcon('chevron-right', isRTL);
 * const transform = shouldMirror ? [{ scaleX: -1 }] : undefined;
 * ```
 */
export function shouldMirrorIcon(
  iconName: string,
  isRTL: boolean,
  customMirrorableIcons?: string[]
): boolean {
  if (!isRTL) return false;
  
  const mirrorableIcons = customMirrorableIcons || DEFAULT_MIRRORABLE_ICONS;
  return mirrorableIcons.includes(iconName);
}

/**
 * Get transform style for mirroring an icon
 * 
 * @param iconName - The name of the icon
 * @param isRTL - Whether the current direction is RTL
 * @param customMirrorableIcons - Optional custom list of mirrorable icons
 * @returns Transform array for horizontal flip or undefined
 * 
 * @example
 * ```tsx
 * const transform = getIconMirrorTransform('chevron-right', isRTL);
 * <Icon style={{ transform }} />
 * ```
 */
export function getIconMirrorTransform(
  iconName: string,
  isRTL: boolean,
  customMirrorableIcons?: string[]
): { scaleX: number }[] | undefined {
  return shouldMirrorIcon(iconName, isRTL, customMirrorableIcons)
    ? [{ scaleX: -1 }]
    : undefined;
}

/**
 * Swap start and end values in an object
 * Useful for converting logical property values
 * 
 * @example
 * ```tsx
 * const spacing = { start: 10, end: 20 };
 * const swapped = swapStartEnd(spacing, isRTL);
 * // Returns: { start: 20, end: 10 } in RTL
 * ```
 */
export function swapStartEnd<T extends object>(
  obj: T,
  isRTL: boolean
): T {
  if (!isRTL) return obj;

  const result = { ...obj } as Record<string, unknown>;
  if ('start' in obj && 'end' in obj) {
    const temp = result.start;
    result.start = result.end;
    result.end = temp;
  }

  return result as T;
}

/**
 * Get text writing direction for TextInput
 * 
 * @param isRTL - Whether the current direction is RTL
 * @returns 'rtl' or 'ltr'
 */
export function getWritingDirection(isRTL: boolean): 'rtl' | 'ltr' {
  return isRTL ? 'rtl' : 'ltr';
}

/**
 * Get default text alignment based on direction
 * 
 * @param isRTL - Whether the current direction is RTL
 * @returns 'right' in RTL, 'left' in LTR
 */
export function getDefaultTextAlign(isRTL: boolean): 'left' | 'right' {
  return isRTL ? 'right' : 'left';
}

/**
 * Mirror a placement string (e.g., for tooltips, popovers)
 * 
 * @param placement - Placement string (e.g., 'left', 'right', 'top-start')
 * @param isRTL - Whether the current direction is RTL
 * @returns Mirrored placement
 * 
 * @example
 * ```tsx
 * const placement = mirrorPlacement('left-start', isRTL);
 * // Returns 'right-start' in RTL
 * ```
 */
export function mirrorPlacement(placement: string, isRTL: boolean): string {
  if (!isRTL) return placement;
  
  return placement
    .replace(/\bleft\b/g, '__LEFT__')
    .replace(/\bright\b/g, 'left')
    .replace(/__LEFT__/g, 'right')
    .replace(/\bstart\b/g, '__START__')
    .replace(/\bend\b/g, 'start')
    .replace(/__START__/g, 'end');
}

/**
 * Reverse an array if RTL
 * Useful for reversing breadcrumbs, pagination, etc.
 * 
 * @param array - Array to potentially reverse
 * @param isRTL - Whether the current direction is RTL
 * @returns Reversed array if RTL, original if LTR
 * 
 * @example
 * ```tsx
 * const items = [1, 2, 3];
 * const displayed = reverseArray(items, isRTL);
 * // Returns [3, 2, 1] in RTL
 * ```
 */
export function reverseArray<T>(array: T[], isRTL: boolean): T[] {
  return isRTL ? [...array].reverse() : array;
}

/**
 * Export the default list of mirrorable icons for customization
 */
export { DEFAULT_MIRRORABLE_ICONS };
