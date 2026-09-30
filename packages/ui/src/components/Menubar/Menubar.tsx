import React, { createContext, useContext, useRef } from 'react';
import { View } from 'react-native';
import { factory, withStatics } from '../../core/factory';
import { webProps } from '../../core/platform';
import type { WebKeyboardEvent } from '../../core/platform';
import { useDirection } from '../../core/providers/DirectionProvider';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import { useControllableState } from '../../hooks/useControllableState';
import { Button } from '../Button';
import { Menu, MenuDropdown } from '../Menu';
import type { MenubarDropdownProps, MenubarMenuProps, MenubarProps, MenubarTargetProps } from './types';
type ContextValue = { openIndex: number | null; setOpen: (index: number | null) => void; focus: (index: number) => void; refs: React.MutableRefObject<Array<View | null>>; count: number; loop: boolean; trigger: 'click' | 'hover'; position: MenubarProps['position'] };
const Context = createContext<ContextValue | null>(null);
const Index = createContext(0);
export const MenubarTarget = factory<{ props: MenubarTargetProps; ref: View }>((props, ref) => {
  const context = useContext(Context); const index = useContext(Index); const { isRTL } = useDirection();
  const { children, onHoverIn, onPress, onKeyDown, ...rest } = props as MenubarTargetProps & { onKeyDown?: (event: WebKeyboardEvent) => void };
  return <Button ref={(node) => { if (context) context.refs.current[index] = node; if (typeof ref === 'function') ref(node); else if (ref) ref.current = node; }} size="sm" variant="ghost" role="menuitem" aria-haspopup="menu" aria-expanded={context?.openIndex === index} onHoverIn={() => { onHoverIn?.(); if (context && (context.trigger === 'hover' || context.openIndex != null)) context.setOpen(index); }} onPress={() => { onPress?.(); }} {...rest} {...webProps({ tabIndex: context?.openIndex === index || (context?.openIndex == null && index === 0) ? 0 : -1, onKeyDown: (event) => { if (!context) { onKeyDown?.(event); return; } const forward = isRTL ? -1 : 1; let next: number | null = null; if (event.key === 'ArrowRight') next = index + forward; else if (event.key === 'ArrowLeft') next = index - forward; else if (event.key === 'Home') next = 0; else if (event.key === 'End') next = context.count - 1; if (next != null) { event.preventDefault(); if (context.loop) next = (next + context.count) % context.count; else next = Math.max(0, Math.min(context.count - 1, next)); context.focus(next); if (context.openIndex != null) context.setOpen(next); } else onKeyDown?.(event); } })}>{children}</Button>;
}, { displayName: 'Menubar.Target' });
export const MenubarDropdown = factory<{ props: MenubarDropdownProps; ref: View }>((props, ref) => <MenuDropdown ref={ref} {...props} />, { displayName: 'Menubar.Dropdown' });
export const MenubarMenu = factory<{ props: MenubarMenuProps; ref: View }>((props, ref) => {
  const context = useContext(Context); const index = useContext(Index);
  const { children, position, ...rest } = props;
  const target = React.Children.toArray(children).find((child) => React.isValidElement(child) && child.type === MenubarTarget);
  const dropdown = React.Children.toArray(children).find((child): child is React.ReactElement<MenubarDropdownProps> => React.isValidElement(child) && child.type === MenubarDropdown);
  return <Menu ref={ref} {...rest} position={position ?? context?.position ?? 'bottom-start'} trigger="click" opened={context?.openIndex === index} onNavigateHorizontal={(delta) => { if (!context) return; const next = context.loop ? (index + delta + context.count) % context.count : Math.max(0, Math.min(context.count - 1, index + delta)); context.setOpen(next); context.focus(next); }} onChange={(opened) => context?.setOpen(opened ? index : null)}>{target}<MenuDropdown {...dropdown?.props}>{dropdown?.props.children}</MenuDropdown></Menu>;
}, { displayName: 'Menubar.Menu' });
const Root = factory<{ props: MenubarProps; ref: View }>((all, ref) => {
  const { styleProps, otherProps: { children, trigger = 'click', loop = true, openIndex, defaultOpenIndex, onOpenChange, position = 'bottom-start', style, testID } } = extractStyleProps(all);
  const spacing = useStyleProps(styleProps); const refs = useRef<Array<View | null>>([]);
  const [active, setActive] = useControllableState<number | null>({ value: openIndex, defaultValue: defaultOpenIndex, finalValue: null, onChange: onOpenChange });
  const menus = React.Children.toArray(children).filter((child) => React.isValidElement(child) && child.type === MenubarMenu);
  const focus = (index: number) => { const node = refs.current[index] as unknown as HTMLElement | undefined; node?.focus?.(); };
  return <Context.Provider value={{ openIndex: active, setOpen: setActive, focus, refs, count: menus.length, loop, trigger, position }}><View ref={ref} testID={testID} role="menubar" aria-orientation="horizontal" style={[{ flexDirection: 'row', alignItems: 'center' }, spacing, style]}>{menus.map((menu, i) => <Index.Provider key={i} value={i}>{menu}</Index.Provider>)}</View></Context.Provider>;
}, { displayName: 'Menubar' });
export const Menubar = withStatics(Root, { Menu: MenubarMenu, Target: MenubarTarget, Dropdown: MenubarDropdown });
