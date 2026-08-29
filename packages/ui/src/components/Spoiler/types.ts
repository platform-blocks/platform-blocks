import React from 'react';
import { SpacingProps } from '../../core/utils';
import { SizeValue } from '../../core/theme/sizes';
import type { TextProps } from '../Text';

export interface SpoilerProps extends SpacingProps {
  /** Content to hide/show */
  children: React.ReactNode;
  /** Max height (in px) when collapsed */
  maxHeight?: number;
  /** Whether component starts initially opened */
  initiallyOpen?: boolean;
  /** Label for show more */
  showLabel?: string;
  /** Label for hide */
  hideLabel?: string;
  /** Transition duration ms */
  transitionDuration?: number;
  /** Size token for the show/hide control font size */
  size?: SizeValue;
  /** Optional controlled open state */
  opened?: boolean;
  /** Callback when toggle */
  onToggle?: (opened: boolean) => void;
  /** Disable toggle */
  disabled?: boolean;
  /** Optional style */
  style?: any;
  /** Render custom control */
  renderControl?: (args: { opened: boolean; toggle: () => void; showLabel: string; hideLabel: string }) => React.ReactNode;
  /** If true (default) fade bottom of clamped content to transparent using CSS mask on web */
  transparentFade?: boolean;
  /** Fallback overlay gradient end color (used only when transparentFade=false) */
  fadeColor?: string;
  /** Disable gradient fade animation (debug / perf). Default false (animation enabled). */
  disableFadeAnimation?: boolean;
  /** Override props applied to the show/hide control `<Text>` (style, weight, ff, size, color). */
  controlProps?: Omit<TextProps, 'children'>;
}
