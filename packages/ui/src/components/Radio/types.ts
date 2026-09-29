import type React from 'react';

import type { WebKeyboardEvent } from '../../core/platform/webProps';
import type { ThemeColor } from '../../core/theme/resolveColors';
import type { SizeValue } from '../../core/theme/types';
import type { FieldBaseProps } from '../_internal/Field/fieldProps';

/**
 * Visual variant of a `RadioGroup`.
 * - `default` — stacked/inline radio dots with labels
 * - `card` — each option is a bordered/padded surface; the selected card gets the colored border + tint
 * - `segmented` — joined buttons sharing borders, like an iOS/macOS segmented control (forced horizontal)
 * - `chip` — compact rounded pills that wrap; great for filters and tag pickers
 */
export type RadioGroupVariant = 'default' | 'card' | 'segmented' | 'chip';

/** Label side for a radio. Logical: `right` = after the dot (the left in RTL). */
export type RadioLabelPosition = 'left' | 'right';

/**
 * Props for a single `Radio`.
 *
 * `style`, spacing and layout props apply to the root (dot + label + footer);
 * `ref` and `testID` go to the focusable radio itself.
 */
export interface RadioProps extends Omit<FieldBaseProps, 'variant' | 'keyboardFocusId' | 'radius'> {
  /** Value reported to `onChange` when this radio is picked. */
  value: string;

  /** Whether this radio is the selected one. */
  checked?: boolean;

  /** Called with `value` when the radio is picked. */
  onChange?: (value: string) => void;

  /** Radio color: a palette token, `'primary.6'` shade syntax, or any CSS color. */
  color?: ThemeColor;

  /** Label side. Default `'right'`. */
  labelPosition?: RadioLabelPosition;

  /** Label content (alternative to `label`; wins when both are set). */
  children?: React.ReactNode;

  /** Icon shown before the label: an icon registry name or any element. */
  icon?: React.ReactNode | string;

  /** Web key handler on the radio (RadioGroup uses it for arrow-key navigation). */
  onKeyDown?: (event: WebKeyboardEvent) => void;

  /**
   * Web tab order of the radio. Groups manage it (only the selected radio is a
   * tab stop); a standalone radio is always a tab stop.
   */
  tabIndex?: 0 | -1;

  /**
   * Length of the select/deselect animation in ms; the center dot grows in and
   * shrinks out against it. `0` applies the state instantly. Always 0 under
   * reduced motion.
   * @default 160
   */
  transitionDuration?: number;

  /** Base id: the control gets it, the label/description/error get `${id}-label` etc. */
  id?: string;
}

export interface RadioGroupOption {
  label: React.ReactNode;
  value: string;
  disabled?: boolean;
  description?: React.ReactNode;
  icon?: React.ReactNode | string;
}

/**
 * Props for `RadioGroup`. The group renders through the shared `Field` frame:
 * `label` / `description` above the options, `error` / `helperText` below, all
 * linked to the `role="radiogroup"` container.
 */
export interface RadioGroupProps extends Omit<FieldBaseProps, 'variant' | 'keyboardFocusId' | 'radius'> {
  /** Available options. */
  options: RadioGroupOption[];

  /** Selected value (controlled). */
  value?: string;
  /** Initially selected value (uncontrolled). */
  defaultValue?: string;
  /** Called with the newly selected value. */
  onChange?: (value: string) => void;

  /** Group orientation. Ignored by `segmented` (always horizontal) and `chip` (wraps). */
  orientation?: 'vertical' | 'horizontal';

  /** Visual variant of the group. Defaults to `'default'`. */
  variant?: RadioGroupVariant;

  /** Radio color: a palette token, `'primary.6'` shade syntax, or any CSS color. */
  color?: ThemeColor;

  /** Gap between options: a spacing token or px. Default 8. */
  gap?: SizeValue | number;

  /** Label position relative to each radio (default variant). */
  labelPosition?: RadioLabelPosition;

  /**
   * Length of each radio's select/deselect animation in ms. `0` applies the
   * state instantly. Always 0 under reduced motion.
   * @default 160
   */
  transitionDuration?: number;

  /** Base id for the group; option radios get `${id}-option-${index}`. */
  id?: string;
}

