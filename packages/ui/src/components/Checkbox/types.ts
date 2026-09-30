import type React from 'react';

import type { ThemeColor } from '../../core/theme/resolveColors';
import type { FieldBaseProps } from '../_internal/Field/fieldProps';
import type { ChoiceLabelPosition } from './ChoiceField';

export type CheckboxLabelPosition = ChoiceLabelPosition;

/**
 * Props for `Checkbox`.
 *
 * `style`, spacing and layout props apply to the root (control + label +
 * footer); `ref` and `testID` go to the focusable control itself.
 */
export interface CheckboxProps extends Omit<FieldBaseProps, 'variant' | 'keyboardFocusId'> {
  /** Controlled checked state. */
  checked?: boolean;
  /** Initial checked state for uncontrolled usage. */
  defaultChecked?: boolean;
  /** Called with the next checked state. */
  onChange?: (checked: boolean) => void;

  /** Mixed state for partial selections (`aria-checked="mixed"`). Pressing it checks the box. */
  indeterminate?: boolean;

  /** Indicator color: a palette token (`'success'`), `'primary.6'` shade syntax, or any CSS color. */
  color?: ThemeColor;

  /** Icon shown when checked. */
  icon?: React.ReactNode;
  /** Icon shown when indeterminate. */
  indeterminateIcon?: React.ReactNode;

  /**
   * Label position relative to the box. `left` / `right` follow the reading
   * direction (`right` = after the box). Default `'right'`.
   */
  labelPosition?: CheckboxLabelPosition;

  /**
   * Length of the check/uncheck animation in ms; the fill and mark phases scale
   * against it. `0` applies the state instantly. Always 0 under reduced motion.
   * @default 160
   */
  transitionDuration?: number;

  /** Label content (alternative to `label`; wins when both are set). */
  children?: React.ReactNode;

  /** Base id: the control gets it, the label/description/error get `${id}-label` etc. */
  id?: string;
}
