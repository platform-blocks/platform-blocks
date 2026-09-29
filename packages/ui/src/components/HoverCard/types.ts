import type { ReactElement, ReactNode } from 'react';
import type { View } from 'react-native';

import type { BaseProps, RadiusValue } from '../../core/types/base';

export type HoverCardPosition = 'top' | 'bottom' | 'left' | 'right' | 'auto';
export type HoverCardShadow = 'none' | 'sm' | 'md' | 'lg';

export interface HoverCardProps extends BaseProps {
  /** Floating content */
  children: ReactNode;
  /**
   * Element that shows the card. It receives the hover / focus / press
   * handlers directly — no wrapper, so no extra tab stop.
   */
  target: ReactElement;
  /** Position relative to target (written for LTR; mirrored in RTL). @default 'bottom' */
  position?: HoverCardPosition;
  /** Offset gap between target and card */
  offset?: number;
  /** Delay before opening (ms). @default 100 */
  openDelay?: number;
  /** Delay before closing (ms). @default 150 */
  closeDelay?: number;
  /** Controlled opened state */
  opened?: boolean;
  /** Initial opened state when uncontrolled. @default false */
  defaultOpened?: boolean;
  /** Shadow size. @default 'md' */
  shadow?: HoverCardShadow;
  /** Corner radius. @default 'md' */
  radius?: RadiusValue;
  /** Card width. @default fits the content, between 160 and 320 */
  w?: number;
  /** Show directional arrow */
  withArrow?: boolean;
  /** Close on Escape (web) and Android back. @default true */
  closeOnEscape?: boolean;
  /** Called when opened */
  onOpen?: () => void;
  /** Called when closed */
  onClose?: () => void;
  /** Disable interactions */
  disabled?: boolean;
  /** z-index override. @default the theme's `popover` layer */
  zIndex?: number;
  /**
   * `hover` (default): pointer hover or keyboard focus shows it; a press toggles
   * it where there is no hover (touch). `click`: a press toggles it and focus
   * moves into the card.
   */
  trigger?: 'hover' | 'click';
  /** Positioning strategy. @default 'fixed' on web, 'portal' (an RN Modal) on native */
  strategy?: 'fixed' | 'portal';
}

export interface HoverCardFactoryPayload {
  props: HoverCardProps;
  ref: View;
}
