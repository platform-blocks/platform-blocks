import type { ReactNode } from 'react';
import type {
  AccessibilityActionEvent,
  AccessibilityActionInfo,
  GestureResponderEvent,
  View,
} from 'react-native';

import type { BaseProps } from '../../core/types/base';
import type { WebKeyboardEvent, WebMouseEvent } from '../../core/platform';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  onSelect?: () => void;
}

/**
 * Handlers the `children` render prop receives. Spread them onto the trigger
 * element: right-click (web), long-press (native), Shift+F10 / the ContextMenu
 * key (web keyboard) and the screen-reader "long press" / "Open menu" actions
 * all open the menu.
 */
export interface ContextMenuTriggerProps {
  /** Web: right-click, or the keyboard ContextMenu key. */
  onContextMenu: (event: WebMouseEvent) => void;
  /** Native long-press timer start. */
  onPressIn: (event: GestureResponderEvent) => void;
  /** Native long-press timer cancel. */
  onPressOut: () => void;
  /** Web keyboard: Shift+F10 / ContextMenu key. */
  onKeyDown?: (event: WebKeyboardEvent) => void;
  /** Screen readers: "long press" and a labelled "Open menu" action. */
  accessibilityActions: ReadonlyArray<AccessibilityActionInfo>;
  onAccessibilityAction: (event: AccessibilityActionEvent) => void;
  /** Web: `menu` — the trigger opens one. */
  'aria-haspopup'?: 'menu';
}

export interface ContextMenuProps extends BaseProps {
  /** Render prop for the trigger: spread the given props onto it. */
  children: (props: ContextMenuTriggerProps) => ReactNode;
  items: ContextMenuItem[];
  /** Close after selection. @default true */
  closeOnSelect?: boolean;
  /** Long press duration (ms) for native. @default 350 */
  longPressDelay?: number;
  /** Menu max height before the items scroll (not the root's). @default 280 */
  mah?: number;
  /** Called when menu opens */
  onOpen?: () => void;
  /** Called when menu closes */
  onClose?: () => void;
  /** Controlled open state. */
  opened?: boolean;
  /** Initial open state when uncontrolled. @default false */
  defaultOpened?: boolean;
  /** Controlled position (web: viewport coordinates; native: page coordinates). */
  position?: { x: number; y: number };
  /** Accessible name of the menu. @default 'Context menu' */
  'aria-label'?: string;
}

export interface ContextMenuFactoryPayload {
  props: ContextMenuProps;
  ref: View;
}
