import type { ReactNode } from 'react';
import type { View } from 'react-native';

import type { BaseProps, RadiusValue } from '../../core/types/base';
import type { ShadowToken } from '../../core/theme/tokens';
import type { PlacementType } from '../../core/utils/positioning-enhanced';
import type { MenuItemColor } from '../MenuItemButton';
import type { TextProps } from '../Text';

export type MenuPosition = PlacementType;

export interface MenuProps extends BaseProps {
  /** Controlled open state. */
  opened?: boolean;
  /** Initial open state when uncontrolled. @default false */
  defaultOpened?: boolean;
  /** Called with the requested open state (both modes). */
  onChange?: (opened: boolean) => void;
  /**
   * What opens the menu: a press on the trigger (`click`), the pointer resting
   * on it (`hover`, web), or a right-click / long-press (`contextmenu`) — the
   * menu then opens at the pointer.
   * @default 'click'
   */
  trigger?: 'click' | 'hover' | 'contextmenu';
  /**
   * Placement relative to the trigger, written for LTR (mirrored in RTL).
   * @default 'auto'
   */
  position?: MenuPosition;
  /** Gap between trigger and menu, px. @default 4 */
  offset?: number;
  /** Close when pressing outside the menu. @default true */
  closeOnClickOutside?: boolean;
  /** Close on Escape (web) / Android back. Only the topmost overlay closes. @default true */
  closeOnEscape?: boolean;
  /** Called when the menu opens. */
  onOpen?: () => void;
  /** Called when the menu closes. */
  onClose?: () => void;
  /** @internal Menubar moves to another top-level menu on horizontal arrows. */
  onNavigateHorizontal?: (direction: -1 | 1) => void;
  /**
   * Menu width: a number, `'target'` (the trigger's width) or `'auto'` (as wide
   * as the longest item, never narrower than the trigger).
   * @default 'auto'
   */
  w?: number | 'target' | 'auto';
  /** Maximum height before the items scroll. @default 300 */
  mah?: number;
  /** Menu shadow. @default 'md' */
  shadow?: ShadowToken;
  /** Menu corner radius. @default 'md' */
  radius?: RadiusValue;
  /** The trigger element followed by a `Menu.Dropdown`. */
  children: ReactNode;
  /** Disable the trigger. */
  disabled?: boolean;
  /**
   * 'fixed' (web default): viewport-fixed; 'absolute'; 'portal' (native
   * default): rendered in an RN Modal at the app root.
   */
  strategy?: 'absolute' | 'fixed' | 'portal';
  /** Accessible name of the menu. Defaults to the trigger labelling it (web). */
  'aria-label'?: string;
}

export interface MenuItemProps extends BaseProps {
  /** Item content */
  children: ReactNode;
  /** Press handler */
  onPress?: () => void;
  /** Whether the item is disabled (skipped by arrow keys, announced as disabled) */
  disabled?: boolean;
  /** Content before the label */
  startSection?: ReactNode;
  /** Content after the label (shortcut hint, badge) */
  endSection?: ReactNode;
  /** Item color. */
  color?: MenuItemColor;
  /** Close the menu when the item is pressed. @default true */
  closeMenuOnClick?: boolean;
}

export interface MenuLabelProps extends BaseProps {
  /** Label content */
  children: ReactNode;
  /** Override props for the label `<Text>`; the theme's `sectionLabel` text role by default. */
  textProps?: Omit<TextProps, 'children'>;
}

export type MenuDividerProps = BaseProps;

export interface MenuDropdownProps extends BaseProps {
  /** Dropdown content: Menu.Item / Menu.Label / Menu.Divider / Menu.Sub */
  children: ReactNode;
  /** Wrap the items in a scroll container. @default true */
  scrollable?: boolean;
}

export interface MenuSubProps extends BaseProps {
  /** Trigger label shown in the parent dropdown */
  label: ReactNode;
  /** Submenu items (Menu.Item / Menu.Divider / nested Menu.Sub) */
  children: ReactNode;
  /** Content before the trigger label */
  startSection?: ReactNode;
  /** Whether the submenu trigger is disabled */
  disabled?: boolean;
  /** Trigger color. */
  color?: MenuItemColor;
  /** Submenu width. @default 200 */
  w?: number;
  /** Maximum height before the submenu scrolls. @default 300 */
  mah?: number;
}

export interface MenuFactoryPayload {
  props: MenuProps;
  ref: View;
}

export interface MenuCheckboxItemProps extends Omit<MenuItemProps, 'onPress' | 'closeMenuOnClick'> {
  /** Controlled checked state. */ checked?: boolean;
  /** Initial checked state. @default false */ defaultChecked?: boolean;
  /** Called when toggled. */ onChange?: (checked: boolean) => void;
  /** Close the menu after toggling. @default false */ closeMenuOnClick?: boolean;
}
export interface MenuRadioGroupProps extends BaseProps { children: ReactNode; value?: string; defaultValue?: string; onChange?: (value: string) => void }
export interface MenuRadioItemProps extends Omit<MenuItemProps, 'onPress' | 'closeMenuOnClick'> { value: string; closeMenuOnClick?: boolean }
