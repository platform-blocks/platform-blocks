/**
 * The component contract (DESIGN §5).
 *
 * Every public component's props extend `BaseProps<S>` with the style type of
 * its root host element. `VisibilityProps` are implemented ONCE — by the
 * component factory (`core/factory`), or by `useVisibility` for components that
 * are not built with it — never by individual components.
 */
import type { AccessibilityProps, StyleProp, ViewStyle } from 'react-native';

import type { ThemeColor } from '../theme/resolveColors';
import type { SizeToken, StyleProps } from '../theme/types';

export type { BoxProps, DimensionProp, SpacingProps, SpacingValue, SizeToken, SizeValue, StyleProps } from '../theme/types';

/** Named breakpoints accepted by `hiddenFrom` / `visibleFrom` (values come from `theme.breakpoints`). */
export type BreakpointToken = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Conditional rendering by color scheme and viewport. A hidden component
 * renders `null` (it is not merely `display: none`).
 */
export interface VisibilityProps {
  /** Do not render in the light color scheme. */
  lightHidden?: boolean;
  /** Do not render in the dark color scheme. */
  darkHidden?: boolean;
  /** Do not render when the viewport is at least this breakpoint wide (`width >= theme.breakpoints[bp]`). */
  hiddenFrom?: BreakpointToken;
  /** Render only when the viewport is at least this breakpoint wide. */
  visibleFrom?: BreakpointToken;
}

/** The keys of `VisibilityProps`, for stripping them off a props object. */
export const VISIBILITY_PROP_KEYS = ['lightHidden', 'darkHidden', 'hiddenFrom', 'visibleFrom'] as const;

/**
 * Props every public component accepts: the style props (spacing + box), the
 * visibility props, `style` and `testID`. `S` is the root element's style type.
 */
export type BaseProps<S = ViewStyle> = StyleProps &
  VisibilityProps & {
    /** Style for the root element — merged last, after the component's own styles. */
    style?: StyleProp<S>;
    /** Test identifier for the root element. */
    testID?: string;
  };

/**
 * Imperative handle for text-entry fields whose ref cannot be the underlying
 * `TextInput` itself.
 */
export interface FieldHandle {
  focus(): void;
  blur(): void;
  clear?(): void;
  isFocused?(): boolean;
}

/** A radius prop: size token (`theme.radii`), px number, `'none'` or `'full'`. */
export type RadiusValue = SizeToken | 'none' | 'full' | number;

/** A color prop: palette token (`'primary'`), `'primary.6'` shade syntax, or any CSS color. */
export type ColorProp = ThemeColor;

/**
 * React Native's accessibility props minus the legacy state/value/role props
 * (react-native-web drops the first two; use `aria-*` / `role`). Components
 * pass these straight through to their interactive host element.
 */
export type PassthroughAccessibilityProps = Omit<
  AccessibilityProps,
  'accessibilityState' | 'accessibilityValue' | 'accessibilityRole'
>;
