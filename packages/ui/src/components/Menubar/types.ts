import type React from 'react';
import type { ViewStyle } from 'react-native';
import type { BaseProps } from '../../core/types/base';
import type { MenuProps, MenuDropdownProps } from '../Menu';
import type { ButtonProps } from '../Button';
export interface MenubarProps extends BaseProps<ViewStyle> { children: React.ReactNode; trigger?: 'click' | 'hover'; loop?: boolean; openIndex?: number | null; defaultOpenIndex?: number | null; onOpenChange?: (index: number | null) => void; position?: MenuProps['position'] }
export interface MenubarMenuProps extends Omit<MenuProps, 'children' | 'opened' | 'defaultOpened' | 'onChange' | 'trigger'> { children: React.ReactNode }
export interface MenubarTargetProps extends Omit<ButtonProps, 'title'> { children: React.ReactNode }
export type MenubarDropdownProps = MenuDropdownProps;
