import type { ReactElement, ReactNode } from 'react';
import type { View, ViewProps } from 'react-native';
import type { PlacementType, PositioningOptions } from '../../core/utils/positioning-enhanced';
import type { RadiusValue } from '../../core/theme/radius';
import type { ShadowValue } from '../../core/theme/shadow';
import type { BaseProps } from '../../core/types/base';

export type FloatingStrategy = 'absolute' | 'fixed';
export type ArrowPosition = 'center' | 'side';

export interface PopoverMiddlewares {
  flip?: boolean | { padding?: number };
  shift?: boolean | { padding?: number };
  inline?: boolean;
}

export interface PopoverProps extends BaseProps {
  children: ReactNode;
  /** Controlled open state */
  opened?: boolean;
  /** Initial open state in uncontrolled mode */
  defaultOpened?: boolean;
  /** Called when open state changes */
  onChange?: (opened: boolean) => void;
  /** Called when popover opens */
  onOpen?: () => void;
  /** Called when popover closes */
  onClose?: () => void;
  /** Called when popover is dismissed via outside click or escape */
  onDismiss?: () => void;
  /** How the popover is triggered: 'click' (default) or 'hover' (mostly useful for devices with a mouse) */
  trigger?: 'click' | 'hover';
  /** Disable popover entirely */
  disabled?: boolean;
  /** Close when clicking outside */
  closeOnClickOutside?: boolean;
  /**
   * Close when pressing Escape (web) or the Android back button. Only the
   * topmost open overlay closes, so Escape in a nested popover closes just that one.
   */
  closeOnEscape?: boolean;
  /**
   * Trap focus within the dropdown (web): focus moves to its first focusable
   * element on open and Tab / Shift+Tab cycle inside it until it closes.
   * Without it, a click-opened dropdown still receives focus (on the dropdown
   * itself) so keyboard users can Tab into it.
   */
  trapFocus?: boolean;
  /** Keep dropdown mounted when hidden */
  keepMounted?: boolean;
  /**
   * Return focus to the target after close (when focus was inside the
   * dropdown — closing by clicking elsewhere never steals focus back).
   * @default true
   */
  returnFocus?: boolean;
  /** Dropdown width, number or 'target' to match target width */
  w?: number | 'target';
  /** Dropdown max-width */
  maw?: number;
  /** Dropdown max-height */
  mah?: number;
  /** Dropdown min-width */
  miw?: number;
  /** Dropdown min-height */
  mih?: number;
  /** Border radius */
  radius?: RadiusValue | number;
  /** Box shadow */
  shadow?: ShadowValue;
  /** Dropdown z-index. @default the theme's `popover` layer (`getZIndex(theme, 'popover')`) */
  zIndex?: number;
  /**
   * Popover position relative to target, written for left-to-right layouts:
   * in RTL `left`/`right` and the `-start`/`-end` of `top`/`bottom` are mirrored.
   */
  position?: PlacementType;
  /** Offset from target */
  offset?: number | { mainAxis?: number; crossAxis?: number };
  /** Floating strategy for positioning */
  floatingStrategy?: FloatingStrategy;
  /** Custom positioning options */
  middlewares?: PopoverMiddlewares;
  /** Prevent flipping/shifting when visible */
  preventPositionChangeWhenVisible?: boolean;
  /** Override viewport padding */
  viewport?: PositioningOptions['viewport'];
  /** Whether positioning should avoid the on-screen keyboard */
  keyboardAvoidance?: boolean;
  /** Override fallback placements */
  fallbackPlacements?: PlacementType[];
  /** Override boundary padding */
  boundary?: number;
  /** Render ARIA roles */
  withRoles?: boolean;
  /** Unique id base for accessibility */
  id?: string;
  /** Render arrow */
  withArrow?: boolean;
  /** Arrow size */
  arrowSize?: number;
  /** Arrow border radius */
  arrowRadius?: number;
  /** Arrow offset */
  arrowOffset?: number;
  /** Arrow position for start/end placements */
  arrowPosition?: ArrowPosition;
  /** Called when the dropdown's physical placement changes (after flipping / RTL mirroring) */
  onPositionChange?: (placement: PlacementType) => void;
}

export interface PopoverTargetProps {
  children: ReactElement;
  popupType?: 'dialog' | 'menu' | 'listbox' | 'tree' | 'grid';
  refProp?: string;
  /** Additional props merged onto target */
  targetProps?: Record<string, unknown>;
}

export interface PopoverFactoryPayload {
  props: PopoverProps;
  ref: View;
}

export interface PopoverDropdownProps extends ViewProps {
  children: ReactNode;
  /** ARIA role of the dropdown; the target's `aria-controls` points at it. @default 'dialog' */
  role?: ViewProps['role'];
  /** Whether dropdown content should trap focus (web only); same as Popover's `trapFocus` */
  trapFocus?: boolean;
  /** Keep dropdown mounted */
  keepMounted?: boolean;
}

export interface RegisteredDropdown {
  content: ReactNode;
  style?: PopoverDropdownProps['style'];
  trapFocus: boolean;
  keepMounted?: boolean;
  testID?: string;
  containerProps?: Omit<PopoverDropdownProps, 'children' | 'style' | 'trapFocus' | 'keepMounted' | 'testID'>;
}
