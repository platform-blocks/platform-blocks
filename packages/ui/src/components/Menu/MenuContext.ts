import { createContext, useContext } from 'react';
import { warnOnce } from '../../core/utils/logger';
/** State shared by menu items and nested menu content. */
export interface MenuContextValue { closeMenu: () => void; opened: boolean }
export const MenuContext = createContext<MenuContextValue | null>(null);
const FALLBACK_MENU_CONTEXT: MenuContextValue = { closeMenu: () => {}, opened: false };
/** Returns the enclosing menu state for custom items. */
export function useMenuContext(): MenuContextValue {
  const context = useContext(MenuContext);
  if (!context) { warnOnce('Menu:no-context', '[plocks] Menu.Item / Menu.Sub was rendered outside a <Menu>; it renders as a plain item.'); return FALLBACK_MENU_CONTEXT; }
  return context;
}
