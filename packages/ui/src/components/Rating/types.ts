import type React from 'react';
import type { View } from 'react-native';

import type { SizeValue } from '../../core/theme/types';
import type { FieldBaseProps } from '../_internal/Field/fieldProps';
import type { ExternalIconComponent } from '../Icon/types';

/**
 * Anything that can stand in for the default star: a registry icon name
 * (`'heart'`), an icon library component, or a ready-made element.
 */
export type RatingIcon = string | ExternalIconComponent | React.ReactElement;

/**
 * Props for `Rating`.
 *
 * `style`, spacing and layout props apply to the root (label + stars +
 * footer); `ref` and `testID` go to the row of stars — the control itself.
 */
export interface RatingProps extends Omit<FieldBaseProps, 'variant' | 'keyboardFocusId' | 'radius' | 'size'> {
  /** Current rating value (controlled). */
  value?: number;

  /**
   * Initial rating value for uncontrolled usage.
   * @default 0
   */
  defaultValue?: number;

  /**
   * Number of rating items (stars) to render.
   * @default 5
   */
  count?: number;

  /**
   * Display only: the rating shows its value (as an image with a spoken
   * "4 out of 5") and takes no input.
   * @default false
   */
  readOnly?: boolean;

  /**
   * Disables the rating: blocks input, dims the control and reports it disabled
   * to assistive technology.
   * @default false
   */
  disabled?: boolean;

  /**
   * Allows partial values so a star can be filled fractionally.
   * @default false
   */
  allowFraction?: boolean;

  /**
   * Smallest increment a value is rounded to when `allowFraction` is enabled.
   * Clamped to the `0.01`–`1` range.
   * @default 0.1 when `allowFraction`, otherwise 1
   */
  precision?: number;

  /**
   * Size of each rating item — a theme size token or an explicit pixel size.
   * @default 'md'
   */
  size?: SizeValue;

  /** Color of filled items. Defaults to the theme warning color. */
  color?: string;

  /** Color of empty items. Defaults to `theme.text.muted`. */
  emptyColor?: string;

  /** Color of items while hovering/dragging. Defaults to a deeper theme warning color. */
  hoverColor?: string;

  /** Called with the new value when the rating changes. */
  onChange?: (value: number) => void;

  /** Called with the previewed value while hovering (web only). */
  onHover?: (value: number) => void;

  /**
   * Allows clearing the rating by selecting the value that is already set.
   * @default false
   */
  clearable?: boolean;

  /**
   * Shows a tooltip with the current value out of `count` while hovering.
   * @default false
   */
  showTooltip?: boolean;

  /**
   * Formats the tooltip text. Receives the previewed value and `count`;
   * defaults to `4.5 / 5`.
   */
  getTooltipLabel?: (value: number, count: number) => string;

  /**
   * Icon rendered for each item instead of the default star. Accepts an icon
   * registry name (`'heart'`), an icon library component, or an element.
   * Takes precedence over `character`.
   */
  icon?: RatingIcon;

  /**
   * Icon rendered for empty items. Defaults to `icon`, so the same glyph is
   * drawn in `emptyColor` unless a different empty icon is supplied.
   */
  emptyIcon?: RatingIcon;

  /**
   * Character or node rendered for filled items. Custom strings render as text
   * glyphs, a React element is cloned with `size` and `color`, and the default
   * star character renders the built-in star icon. Ignored when `icon` is set.
   * @default '★'
   */
  character?: string | React.ReactNode;

  /**
   * Character or node rendered for empty items. Ignored when `icon` or
   * `emptyIcon` is set.
   * @default '☆'
   */
  emptyCharacter?: string | React.ReactNode;

  /**
   * Spacing between rating items — a theme size token or an explicit pixel value.
   * @default 'xs'
   */
  gap?: SizeValue;

  /**
   * Placement of the label relative to the rating (`left` / `right` follow the
   * reading direction).
   * @default 'above'
   */
  labelPosition?: 'left' | 'right' | 'above' | 'below';

  /**
   * Spacing between the label and the rating — a theme size token or pixel value.
   * @default 'xs'
   */
  labelGap?: SizeValue;

  /** Base id: the control gets it, the label/description/error get `${id}-label` etc. */
  id?: string;
}

export interface RatingFactoryPayload {
  props: RatingProps;
  ref: View;
}
