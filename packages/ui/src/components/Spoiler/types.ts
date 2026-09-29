import type React from 'react';
import type { ViewStyle } from 'react-native';

import type { SizeValue } from '../../core/theme/types';
import type { BaseProps } from '../../core/types/base';
import type { TextProps } from '../Text';

/** Arguments passed to `renderControl`. */
export interface SpoilerControlArgs {
  /** Whether the content is currently expanded. */
  expanded: boolean;
  /** @deprecated Use `expanded`. */
  opened: boolean;
  toggle: () => void;
  showLabel: string;
  hideLabel: string;
}

export interface SpoilerProps extends BaseProps<ViewStyle> {
  /** Content to hide/show */
  children: React.ReactNode;
  /** Height in px the content collapses to — the content's, not the root's. @default 120 */
  mah?: number;
  /** Controlled expanded state. Pair with `onExpandedChange`. */
  expanded?: boolean;
  /** Initial expanded state when uncontrolled. @default false */
  defaultExpanded?: boolean;
  /** Called with the requested expanded state whenever the control is pressed. */
  onExpandedChange?: (expanded: boolean) => void;
  /** @deprecated Use `defaultExpanded` instead. */
  initiallyOpen?: boolean;
  /** @deprecated Use `expanded` instead. */
  opened?: boolean;
  /** @deprecated Use `onExpandedChange` instead. */
  onToggle?: (opened: boolean) => void;
  /** Label for show more */
  showLabel?: string;
  /** Label for hide */
  hideLabel?: string;
  /** Transition duration ms (`0` — or reduced motion — disables the transition). @default 180 */
  transitionDuration?: number;
  /** Size token for the show/hide control font size */
  size?: SizeValue;
  /** Disable toggle */
  disabled?: boolean;
  /** Render custom control (it is wrapped in the toggle button, so render no pressable of your own) */
  renderControl?: (args: SpoilerControlArgs) => React.ReactNode;
  /** If true (default) fade bottom of clamped content to transparent using CSS mask on web */
  transparentFade?: boolean;
  /** Fallback overlay gradient end color (used only when transparentFade=false) */
  fadeColor?: string;
  /** Disable gradient fade animation (debug / perf). Default false (animation enabled). */
  disableFadeAnimation?: boolean;
  /** Override props applied to the show/hide control `<Text>` (style, weight, ff, size, color). */
  controlProps?: Omit<TextProps, 'children'>;
}
