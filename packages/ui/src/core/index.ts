// Internal core barrel — NOT a package entry point and not imported by any
// module in the package (components import the specific core module instead,
// so a subpath import does not drag in sound, i18n, a11y, gestures, ...).
// Kept for in-repo consumers such as the docs app.
// Core exports
export * from './theme';
export * from './factory';
export * from './providers';
export * from './responsive';
export * from './i18n';
export * from './accessibility';
export * from './sound';

// Utils exports (avoiding conflicts)
export {
  resolveStyleProps,
  extractStyleProps,
  useStyleProps,
  getLayoutStyles,
  extractLayoutProps,
  UniversalProps,
  ResponsiveProps
} from './utils';

// Unified styling system
export { 
  DESIGN_TOKENS, 
  createTransition, 
  getResponsiveValue 
} from './design-tokens';

export {
  createFocusStyles,
  createHoverStyles,
  createPressedStyles,
  createDisabledStyles,
  createInteractiveStateStyles,
  createTransitionStyles,
  type InteractiveStateConfig
} from './interactive-states';

// Shared gesture plumbing for draggable value controls
export {
  useDragGesture,
  getGestureSurfaceStyle,
  GESTURE_RESPONDER_LOCK,
  acquirePageScrollLock,
  releasePageScrollLock,
  acquireTextSelectionLock,
  releaseTextSelectionLock,
  type DragAxis,
  type DragPoint,
  type UseDragGestureOptions,
  type UseDragGestureResult,
  type GestureSurfaceStyleOptions,
} from './gestures';

// Reusable components
export { ClearButton, type ClearButtonProps } from './components/ClearButton';

// Utils exports (excluding conflicting names)
export {
  rem,
  px,
  getSize,
  getShadow,
  getColor
} from './utils';
