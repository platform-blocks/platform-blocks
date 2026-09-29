// CSS unit / CSS-variable helpers live in ./units so modules that need only
// `px` or `rem` can import them without pulling in this whole barrel.
export { rem, px, getSize, getFontSize, getRadius, getShadow, getColor } from './units';

// Export spacing utilities
export { BoxProps, DimensionProp, SpacingProps, StyleProps, resolveStyleProps, extractStyleProps, useStyleProps } from './spacing';

// Slot-prop helper used by every component that exposes `labelProps` /
// `titleProps` / `bodyProps` / etc.
export { mergeSlotProps } from './mergeSlotProps';

export { mergeRefs, useMergedRef } from './mergeRefs';

// Export universal props system
export { 
  UniversalProps, 
  ResponsiveProps, 
  UniversalSystemProps, 
  getUniversalClasses, 
  extractUniversalProps, 
  shouldHideComponent,
  shouldHideForBreakpoint,
  useUniversalStyles
} from './universal';

// Export universal props utilities
export { withUniversalProps, useUniversalProps } from './withUniversalProps';

// Export layout utilities
export { LayoutProps, getLayoutStyles, extractLayoutProps } from './layout';

// Export shadow utilities
export { extractShadowProps, getShadowStyles } from './shadow';

// Export RTL utilities
export {
  flipDirection,
  flipHorizontal,
  getLogicalProperty,
  transformRTLStyle,
  flipAlignment,
  shouldMirrorIcon,
  getIconMirrorTransform,
  swapStartEnd,
  getWritingDirection,
  getDefaultTextAlign,
  mirrorPlacement,
  reverseArray,
  DEFAULT_MIRRORABLE_ICONS,
} from './rtl';

// Export performance utilities
export { debounce, throttle, measurePerformance, measureAsyncPerformance } from './debounce';
export { INPUT_PERFORMANCE_CONFIG, PERFORMANCE_THRESHOLDS, buildInputComponents } from './performance';

// Export positioning utilities (unified from positioning-enhanced)
export { 
  calculateOverlayPositionEnhanced,
  getViewport, 
  measureElement, 
  pointInRect, 
  getScrollPosition,
  clearOverlayPositionCache
} from './positioning-enhanced';
export type { Rect, Viewport, PositionResult, PlacementType, PositioningOptions } from './positioning-enhanced';
