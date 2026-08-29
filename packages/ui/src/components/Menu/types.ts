import { SpacingProps } from '../../core/utils';
import type { MenuItemColor } from '../MenuItemButton';

export interface MenuProps extends SpacingProps {
  /** Whether the menu is open */
  opened?: boolean;
  /** Menu trigger event type */
  trigger?: 'click' | 'hover' | 'contextmenu';
  /** Position relative to trigger */
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end';
  /** Offset from trigger element */
  offset?: number;
  /** Whether to close when clicking outside */
  closeOnClickOutside?: boolean;
  /** Whether to close when pressing escape */
  closeOnEscape?: boolean;
  /** Callback when menu opens */
  onOpen?: () => void;
  /** Callback when menu closes */
  onClose?: () => void;
  /** Menu content width */
  w?: number | 'target' | 'auto';
  /** Maximum height for scrollable content */
  maxH?: number;
  /** Menu content shadow */
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Border radius */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Menu trigger element and dropdown */
  children: React.ReactNode;
  /** Test ID for testing */
  testID?: string;
  /** Whether menu is disabled */
  disabled?: boolean;
  /** Menu placement strategy */
  strategy?: 'absolute' | 'fixed' | 'portal';
}

export interface MenuItemProps extends SpacingProps {
  /** Item content */
  children: React.ReactNode;
  /** Click handler */
  onPress?: () => void;
  /** Whether item is disabled */
  disabled?: boolean;
  /** Left section content */
  startSection?: React.ReactNode;
  /** Right section content */
  endSection?: React.ReactNode;
  /** Item color. */
  color?: MenuItemColor;
  /** Whether item should close menu when pressed */
  closeMenuOnClick?: boolean;
  /** Test ID for testing */
  testID?: string;
}

export interface MenuLabelProps extends SpacingProps {
  /** Label content */
  children: React.ReactNode;
  /** Test ID for testing */
  testID?: string;
}

export interface MenuDividerProps extends SpacingProps {
  /** Test ID for testing */
  testID?: string;
}

export interface MenuDropdownProps extends SpacingProps {
  /** Dropdown content */
  children: React.ReactNode;
  /** Disable internal scroll container (render content directly) */
  scrollable?: boolean;
  /** Test ID for testing */
  testID?: string;
}

export interface MenuSubProps extends SpacingProps {
  /** Trigger label shown in the parent dropdown */
  label: React.ReactNode;
  /** Submenu items (Menu.Item / Menu.Divider / nested Menu.Sub) */
  children: React.ReactNode;
  /** Left section content on the trigger row */
  startSection?: React.ReactNode;
  /** Whether the submenu trigger is disabled */
  disabled?: boolean;
  /** Trigger color. */
  color?: MenuItemColor;
  /** Submenu content width */
  w?: number;
  /** Maximum height for scrollable submenu content */
  maxH?: number;
  /** Test ID for testing */
  testID?: string;
}
