import type React from 'react';
import type { ViewProps, ViewStyle } from 'react-native';

import type { PolymorphicFactory } from '../../core/factory/polymorphicFactory';
import type { ShadowToken } from '../../core/theme/tokens';
import type { BaseProps, RadiusValue } from '../../core/types/base';

/**
 * Layout props for the Block component. Size, background and opacity (`w`,
 * `h`, `miw`, `maw`, `mih`, `mah`, `bg`, `opacity`) are the shared box props
 * from `BaseProps`.
 */
export interface BlockStyleProps {
  /** Border radius: a `theme.radii` token, px number, `'none'` or `'full'`. */
  radius?: RadiusValue;
  
  /** Border width */
  borderWidth?: number;
  
  /** Border color */
  borderColor?: string;
  
  /** Shadow: a `theme.shadows` token, or a legacy depth 0–5 (0 = none … 5 = xl). */
  shadow?: number | ShadowToken;
  
  /** Whether to take full width (100%) - shorthand for w="full"; an explicit `w` wins */
  fullWidth?: boolean;
  
  /** Makes block take full available height (flex: 1) - useful for scrollable containers */
  fluid?: boolean;
  
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
  
  /** Gap between children (`theme.spacing` token or px). Defaults to `'sm'`; pass `0` to remove it. */
  gap?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  
  /** Position type */
  position?: 'relative' | 'absolute';
  
  /** Top position */
  top?: number | string;
  
  /** Right position (physical; use `end` to mirror in right-to-left layouts) */
  right?: number | string;
  
  /** Bottom position */
  bottom?: number | string;
  
  /** Left position (physical; use `start` to mirror in right-to-left layouts) */
  left?: number | string;
  
  /** Start inset (logical: left in LTR, right in RTL) */
  start?: number | string;
  
  /** End inset (logical: right in LTR, left in RTL) */
  end?: number | string;
  
  /** Z-index */
  zIndex?: number;
  
  /** Whether to render as a flex container */
  flex?: boolean;
}

/**
 * Props for the Block component. Besides its layout props, Block accepts every
 * React Native `View` prop (`role`, `aria-*`, `onLayout`, `pointerEvents`, …)
 * and forwards them to the rendered element.
 */
export interface BlockProps
  extends BaseProps<ViewStyle>,
    BlockStyleProps,
    Omit<ViewProps, 'style' | 'testID' | 'children'> {
  /** Child elements to render inside the block */
  children?: React.ReactNode;

  /**
   * A custom component to render instead of `View`. It receives the resolved
   * `style` and every other forwarded prop. HTML tag names (`'div'`,
   * `'button'`, …) render a `View` — use `role` for semantics.
   */
  component?: React.ElementType;

  /** Custom className, forwarded to a custom `component` only (web). */
  className?: string;
}

/**
 * @deprecated Block is built with `factory`; this polymorphic type is unused and
 * will be removed with `polymorphicFactory`.
 */
export type BlockFactory = PolymorphicFactory<{
  props: BlockProps;
  ref: HTMLDivElement;
  defaultComponent: 'div';
  defaultRef: HTMLDivElement;
}>;
