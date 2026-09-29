import type React from 'react';

import type { ThemeColor } from '../../core/theme/resolveColors';
import type { FieldBaseProps } from '../_internal/Field/fieldProps';
import type { ChoiceLabelPosition } from '../Checkbox/ChoiceField';

/**
 * Visual style of the switch.
 * - `filled` (default): solid track that fills with `color` when on, light thumb.
 * - `outline`: transparent track with a colored border and a colored thumb when on.
 * - `ios`: iOS-style pill — a large light thumb that nearly fills a rounded track.
 * - `android`: Material-3-style — an outlined track with a small dot thumb that
 *   grows and turns light as the switch turns on.
 */
export type SwitchVariant = 'filled' | 'outline' | 'ios' | 'android';

export type SwitchLabelPosition = ChoiceLabelPosition;

/**
 * Props for `Switch`.
 *
 * `style`, spacing and layout props apply to the root (switch + label +
 * footer); `ref` and `testID` go to the focusable switch itself.
 */
export interface SwitchProps extends Omit<FieldBaseProps, 'variant' | 'keyboardFocusId' | 'radius'> {
  /** Controlled on state. */
  checked?: boolean;
  /** Initial on state for uncontrolled usage. */
  defaultChecked?: boolean;
  /** Called with the next on state. */
  onChange?: (checked: boolean) => void;

  /** Visual style. Default `'filled'`. */
  variant?: SwitchVariant;

  /** Track color when on: a palette token, `'primary.6'` shade syntax, or any CSS color. */
  color?: ThemeColor;

  /**
   * Length of the on/off transition in ms. `0` moves the thumb instantly.
   * When omitted the switch keeps its spring animation; any explicit value
   * (including 0) swaps it for a timing curve. Always 0 under reduced motion.
   */
  transitionDuration?: number;

  /**
   * Label position relative to the switch. `left` / `right` follow the reading
   * direction (`right` = after the switch). Default `'right'`.
   */
  labelPosition?: SwitchLabelPosition;

  /** Label content (alternative to `label`; wins when both are set). */
  children?: React.ReactNode;

  /** Icon inside the thumb while on. */
  onIcon?: React.ReactNode;
  /** Icon inside the thumb while off. */
  offIcon?: React.ReactNode;

  /** Spoken state while on (native). Default `'On'`. */
  onLabel?: string;
  /** Spoken state while off (native). Default `'Off'`. */
  offLabel?: string;

  /** Id of the element the switch shows/hides (web `aria-controls`). */
  controls?: string;

  /** Base id: the control gets it, the label/description/error get `${id}-label` etc. */
  id?: string;
}
