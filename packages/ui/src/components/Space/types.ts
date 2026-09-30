import type { ViewProps, ViewStyle } from 'react-native';

import type { DimensionProp, SizeValue } from '../../core/theme/types';
import type { BaseProps } from '../../core/types/base';

export interface SpaceProps extends BaseProps<ViewStyle>, Omit<ViewProps, 'style' | 'testID' | 'children'> {
  /** Height of the spacer: a `theme.spacing` token, px, or any box dimension (`'full'`, `'50%'`). */
  h?: SizeValue | DimensionProp;
  /** Width of the spacer: a `theme.spacing` token, px, or any box dimension (`'full'`, `'50%'`). */
  w?: SizeValue | DimensionProp;
  /**
   * Fallback size when neither `h` nor `w` is provided.
   * Defaults to `md` so the component always occupies some space.
   */
  size?: SizeValue;
  /** Space is presentational only, so children are not supported. */
  children?: never;
}
