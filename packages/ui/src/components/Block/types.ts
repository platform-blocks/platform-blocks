import React from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import type { SpacingProps } from '../../core/utils/spacing';
import type { PolymorphicFactory } from '../../core/factory';

/**
 * Base styling props for the Block component
 */
export interface BlockStyleProps {
  /** Background color for the block */
  bg?: string;
  
  /** Border radius for rounded corners */
  radius?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  
  /** Border width */
  borderWidth?: number;
  
  /** Border color */
  borderColor?: string;
  
  /** Shadow depth (0-5) */
  shadow?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /** Opacity (0-1) */
  opacity?: number;
  
  /** Width of the block */
  w?: number | string | 'auto' | 'full';
  
  /** Height of the block */
  h?: number | string | 'auto' | 'full';
  
  /** Whether to take full width (100%) - shorthand for w="full" */
  fullWidth?: boolean;
  
  /** Makes block take full available height (flex: 1) - useful for scrollable containers */
  fluid?: boolean;
  
  /** Minimum width */
  minW?: number | string;
  
  /** Minimum height */
  minH?: number | string;
  
  /** Maximum width */
  maxW?: number | string;
  
  /** Maximum height */
  maxH?: number | string;
  
  /** Flex grow */
  grow?: boolean | number;
  
  /** Flex shrink */
  shrink?: boolean | number;
  
  /** Flex basis */
  basis?: number | string;
  
  /** Flex direction */
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  
  /** Align items */
  align?: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline';
  
  /** Justify content */
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  
  /** Flex wrap */
  wrap?: boolean | 'nowrap' | 'wrap' | 'wrap-reverse';
  
  /** Gap between children. Defaults to `'sm'`; pass `0` to remove it. */
  gap?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /** Position type */
  position?: 'relative' | 'absolute';
  
  /** Top position */
  top?: number | string;
  
  /** Right position */
  right?: number | string;
  
  /** Bottom position */
  bottom?: number | string;
  
  /** Left position */
  left?: number | string;
  
  /** Start position (logical property - becomes left in LTR, right in RTL) */
  start?: number | string;
  
  /** End position (logical property - becomes right in LTR, left in RTL) */
  end?: number | string;
  
  /** Z-index */
  zIndex?: number;
  
  /** Whether to render as a flex container */
  flex?: boolean;
}

/**
 * Props for the Block component.
 * A polymorphic building block component that can render as any element.
 */
export interface BlockProps extends SpacingProps, BlockStyleProps {
  /** Child elements to render inside the block */
  children?: React.ReactNode;
  
  /** The component to render as */
  component?: React.ElementType;
  
  /** Custom style object */
  style?: StyleProp<ViewStyle>;
  
  /** Test ID for testing purposes */
  testID?: string;
  
  /** Accessibility label */
  accessibilityLabel?: string;
  
  /** Whether the element is accessible */
  accessible?: boolean;
  
  /** Accessibility role */
  accessibilityRole?: string;
  
  /** Custom className (for web) */
  className?: string;
}

/**
 * Factory type for the Block component
 */
export type BlockFactory = PolymorphicFactory<{
  props: BlockProps;
  ref: HTMLDivElement;
  defaultComponent: 'div';
  defaultRef: HTMLDivElement;
}>;