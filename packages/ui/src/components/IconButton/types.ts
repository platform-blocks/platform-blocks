import type React from 'react';

import type { ColorProp } from '../../core/types/base';
import type { ButtonProps } from '../Button/types';
import type { ExternalIconComponent, IconProps } from '../Icon/types';

export type IconButtonVariant = 'default' | 'filled' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'none';

export interface IconButtonProps
  extends Omit<
    ButtonProps,
    | 'variant'
    | 'icon'
    | 'children'
    | 'title'
    | 'loadingTitle'
    | 'startSection'
    | 'endSection'
    | 'startIcon'
    | 'endIcon'
    | 'labelProps'
    | 'textColor'
  > {
  /**
   * Icon to render. Accepts a registry name, or an external icon library
   * component/element (e.g. a Tabler icon) for use without registration.
   */
  icon: string | ExternalIconComponent | React.ReactElement;
  /**
   * Button visual variant. `default` is the neutral button, matching `Button`;
   * a solid primary fill is opt-in via `filled`.
   * @default 'default'
   */
  variant?: IconButtonVariant;
  /**
   * Tint for the button: a palette token (`'primary'`), `'primary.6'` shade
   * syntax, or any CSS color. `filled`, `secondary` and `outline` tint the
   * container; `ghost` and the neutral `default`/`none` keep their chrome and
   * tint only the icon.
   */
  color?: ColorProp;
  /** Explicit icon color override (else derived automatically from variant & color) */
  iconColor?: ColorProp;
  /** Icon variant override */
  iconVariant?: IconProps['variant'];
  /** Icon size override (defaults to half the button height) */
  iconSize?: IconProps['size'];
  /**
   * Accessible name. Icon-only buttons need one: pass this, or a `tooltip`
   * (whose text is then used as the name). A dev warning fires when neither is set.
   */
  accessibilityLabel?: string;
}
