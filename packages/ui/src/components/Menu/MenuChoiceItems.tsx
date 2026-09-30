import React, { createContext, useContext } from 'react';
import { View } from 'react-native';
import { factory } from '../../core/factory';
import { a11yProps } from '../../core/accessibility/a11yProps';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import { useControllableState } from '../../hooks/useControllableState';
import { Icon } from '../Icon';
import { MenuItemButton } from '../MenuItemButton';
import { useMenuContext } from './MenuContext';
import type { MenuCheckboxItemProps, MenuRadioGroupProps, MenuRadioItemProps } from './types';
const RadioContext = createContext<{ value?: string; setValue: (value: string) => void } | null>(null);
export const MenuCheckboxItem = factory<{ props: MenuCheckboxItemProps; ref: View }>((all, ref) => {
  const { styleProps, otherProps: { children, checked, defaultChecked, onChange, closeMenuOnClick = false, disabled, startSection, endSection, color, style, testID } } = extractStyleProps(all);
  const spacing = useStyleProps(styleProps); const { closeMenu } = useMenuContext();
  const [active, setActive] = useControllableState({ value: checked, defaultValue: defaultChecked, finalValue: false, onChange });
  return <MenuItemButton ref={ref} {...a11yProps({ role: 'menuitemcheckbox', checked: active, disabled: !!disabled })} disabled={disabled} startSection={startSection ?? (active ? <Icon name="check" size="sm" /> : <View style={{ width: 16 }} />)} endSection={endSection} color={color} testID={testID} style={[spacing, style]} onPress={() => { if (disabled) return; setActive(!active); if (closeMenuOnClick) closeMenu(); }}>{children}</MenuItemButton>;
}, { displayName: 'Menu.CheckboxItem' });
export const MenuRadioGroup = factory<{ props: MenuRadioGroupProps; ref: View }>((all, ref) => {
  const { styleProps, otherProps: { children, value, defaultValue, onChange, style, testID } } = extractStyleProps(all);
  const spacing = useStyleProps(styleProps);
  const [selected, setSelected] = useControllableState<string | undefined>({ value, defaultValue, finalValue: undefined, onChange });
  return <RadioContext.Provider value={{ value: selected, setValue: setSelected }}><View ref={ref} role="group" testID={testID} style={[spacing, style]}>{children}</View></RadioContext.Provider>;
}, { displayName: 'Menu.RadioGroup' });
export const MenuRadioItem = factory<{ props: MenuRadioItemProps; ref: View }>((all, ref) => {
  const { styleProps, otherProps: { children, value, closeMenuOnClick = false, disabled, startSection, endSection, color, style, testID } } = extractStyleProps(all);
  const spacing = useStyleProps(styleProps); const group = useContext(RadioContext); const { closeMenu } = useMenuContext();
  const active = group?.value === value;
  return <MenuItemButton ref={ref} {...a11yProps({ role: 'menuitemradio', checked: active, disabled: !!disabled })} disabled={disabled} startSection={startSection ?? (active ? <Icon name="radio" size="sm" /> : <View style={{ width: 16 }} />)} endSection={endSection} color={color} testID={testID} style={[spacing, style]} onPress={() => { if (disabled) return; group?.setValue(value); if (closeMenuOnClick) closeMenu(); }}>{children}</MenuItemButton>;
}, { displayName: 'Menu.RadioItem' });
