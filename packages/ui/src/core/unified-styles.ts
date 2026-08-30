/**
 * Core styling utilities for React UI Library UI
 * 
 * This module provides unified styling utilities to ensure consistency
 * across all components in the library.
 */

// Design tokens and constants
export { DESIGN_TOKENS, createTransition, getResponsiveValue } from './design-tokens';

// Unified sizing system (with prefixed exports to avoid conflicts)
export { 
  COMPONENT_SIZES as UNIFIED_COMPONENT_SIZES, 
  getComponentSize as getUnifiedComponentSize, 
  createInteractiveStyles as createUnifiedInteractiveStyles, 
  getIconSize as getUnifiedIconSize, 
  getSectionSpacing as getUnifiedSectionSpacing 
} from './theme/unified-sizing';

// Interactive states
export {
  createFocusStyles,
  createHoverStyles,
  createPressedStyles,
  createDisabledStyles,
  createInteractiveStateStyles,
  createTransitionStyles,
  type InteractiveStateConfig
} from './interactive-states';

// Component style factory
export {
  createComponentStyles,
  type StyleFactoryConfig
} from './style-factory';

// Reusable components
export { ClearButton, type ClearButtonProps } from './components/ClearButton';
export { InputContainer, type InputContainerProps } from './components/InputContainer';