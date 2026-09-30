import type { ViewStyle, View } from 'react-native';
import type { BaseProps, RadiusValue } from '../../core/types/base';
import type { SizeValue } from '../../core/theme/types';

export type SkeletonShape =
  | 'text'
  | 'chip'
  | 'avatar'
  | 'button'
  | 'card'
  | 'circle'
  | 'rectangle'
  | 'rounded';

export interface SkeletonProps extends BaseProps<ViewStyle> {
  /** Shape of the skeleton placeholder */
  shape?: SkeletonShape;
  /** Size of the skeleton component (a control-size token or px; `w`/`h` win) */
  size?: SizeValue;
  /** Corner radius: theme radius token, px, `'none'` or `'full'`. Defaults per shape. */
  radius?: RadiusValue;
  /** Whether to show the loading (pulse) animation. Never runs while reduced motion is on. */
  animate?: boolean;
  /** Duration of the loading animation in milliseconds */
  animationDuration?: number;
  /** Base and highlight colors of the pulse. Defaults to `backgrounds.border` / `backgrounds.borderStrong`. */
  colors?: [string, string];
  /**
   * Announce the placeholder as a loading status with this name
   * (`role="status"`, `aria-busy`). Without it the skeleton is decorative and
   * hidden from assistive technology — label the region that is loading instead.
   */
  accessibilityLabel?: string;
}

export interface SkeletonFactoryPayload {
  props: SkeletonProps;
  ref: View;
}
