import type { ViewStyle } from 'react-native';

/**
 * `fullWidth` — for the components that take it. Width, height and their
 * min / max bounds are box props (`w`, `h`, `miw`, `maw`, `mih`, `mah`) that
 * every component takes through `BaseProps`.
 */
export interface LayoutProps {
  /** Makes the component fill the full width of its parent. An explicit `w` wins. */
  fullWidth?: boolean;
}

/** The style for the layout props: `fullWidth` → `width: '100%'`. */
export function getLayoutStyles(props: LayoutProps): Partial<ViewStyle> {
  return props.fullWidth ? { width: '100%' } : {};
}

/** Splits the layout props off a props object. */
export function extractLayoutProps<T extends LayoutProps>(
  props: T
): { layoutProps: LayoutProps; otherProps: Omit<T, keyof LayoutProps> } {
  const { fullWidth, ...otherProps } = props;
  return { layoutProps: { fullWidth }, otherProps };
}
