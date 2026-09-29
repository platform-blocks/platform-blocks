import React, { useMemo } from 'react';
import { View, type Role } from 'react-native';

import { roleFromAccessibilityRole } from '../../core/accessibility/a11yProps';
import { factory } from '../../core/factory/factory';
import { useTheme } from '../../core/theme/ThemeProvider';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import type { BlockProps, BlockStyleProps } from './types';
import { getBlockStyles } from './utils';

const BLOCK_STYLE_PROP_KEYS: Array<keyof BlockStyleProps> = [
  'radius',
  'borderWidth',
  'borderColor',
  'shadow',
  'grow',
  'shrink',
  'basis',
  'direction',
  'align',
  'justify',
  'wrap',
  'gap',
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'start',
  'end',
  'zIndex',
  'flex',
];

const BLOCK_STYLE_PROP_SET: ReadonlySet<string> = new Set(BLOCK_STYLE_PROP_KEYS);

/** Spacing applied between children when no `gap` prop is supplied. */
const DEFAULT_BLOCK_GAP: BlockStyleProps['gap'] = 'sm';

const partitionBlockProps = <P extends object>(source: P) => {
  const style: Record<string, unknown> = {};
  const passthrough: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(source)) {
    if (BLOCK_STYLE_PROP_SET.has(key)) {
      if (value !== undefined) style[key] = value;
    } else {
      passthrough[key] = value;
    }
  }

  return { style: style as Partial<BlockStyleProps>, passthrough: passthrough as Omit<P, keyof BlockStyleProps> };
};

/** A stable key for the layout props, so the resolved style is memoized on their values. */
const layoutKey = (props: Partial<BlockStyleProps>) => JSON.stringify(props);

/**
 * Block - A polymorphic building block component
 * 
 * The Block component serves as a foundational building block that can replace View components
 * throughout the application. It provides a consistent API for styling, spacing, and layout
 * while supporting a custom root component via the `component` prop.
 * 
 * Key features:
 * - Custom root: render a custom component via the `component` prop
 * - Spacing system: Supports margin/padding shorthand props (m, p, mx, py, etc.)
 * - Layout utilities: Flexbox, positioning, dimensions
 * - Theming: Consistent radius, shadow, and color values
 * - Accessibility: Full accessibility prop support
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <Block bg="blue.500" p="md" radius="lg">
 *   Content
 * </Block>
 * 
 * // With semantics
 * <Block role="list" gap="xs">
 *   …
 * </Block>
 * 
 * // Flex layout
 * <Block direction="row" justify="space-between" align="center" gap="md">
 *   <Block>Item 1</Block>
 *   <Block>Item 2</Block>
 * </Block>
 * ```
 */
export const Block = factory<{ props: BlockProps; ref: View }>((props, ref) => {
  const theme = useTheme();
  const { styleProps, otherProps } = extractStyleProps(props);

  const {
    children,
    style,
    component = View,
    className,
    fluid,
    fullWidth,
    role,
    accessibilityRole,
    ...restProps
  } = otherProps;

  const { style: layoutPropsRaw, passthrough: forwardedProps } = partitionBlockProps(restProps);

  // Layout prop values are primitives: key the memo on their serialized form
  // (not on the props object, which is new every render).
  const key = layoutKey(layoutPropsRaw);
  const blockStyles = useMemo(() => {
    const layoutProps = JSON.parse(key) as Partial<BlockStyleProps>;
    return getBlockStyles(
      {
        // Block stacks its children, so it carries a default gap. Pass an
        // explicit `gap` (including `0`) to override it.
        gap: DEFAULT_BLOCK_GAP,
        ...layoutProps,
      },
      theme
    );
  }, [theme, key]);

  // Style props: spacing plus the box props (`w`, `maw`, `bg` through
  // `resolveBg`, `opacity`, …). An explicit `w` wins over `fullWidth`.
  const propStyles = useStyleProps(styleProps);

  const finalStyle = [blockStyles, fullWidth && FULL_WIDTH_STYLE, propStyles, fluid && FLUID_STYLE, style];

  // A legacy `accessibilityRole` with an ARIA equivalent becomes `role`; others
  // (`text`, `keyboardkey`) are passed through unchanged.
  const mappedRole = role ?? (roleFromAccessibilityRole(accessibilityRole) as Role | undefined);
  const a11y = {
    role: mappedRole,
    accessibilityRole: mappedRole ? undefined : accessibilityRole,
  };

  // HTML tag names render a View on every platform (react-native-web decides the element from `role`).
  if (component === View || typeof component === 'string') {
    return (
      <View ref={ref} style={finalStyle} {...a11y} {...forwardedProps}>
        {children}
      </View>
    );
  }

  // A consumer-supplied component: its prop types are its own business.
  const Component = component as React.ComponentType<Record<string, unknown> & { ref?: React.Ref<View> }>;
  return (
    <Component ref={ref} style={finalStyle} className={className} {...a11y} {...forwardedProps}>
      {children}
    </Component>
  );
}, { displayName: 'Block' });

const FULL_WIDTH_STYLE = { width: '100%' } as const;
const FLUID_STYLE = { flex: 1 } as const;
