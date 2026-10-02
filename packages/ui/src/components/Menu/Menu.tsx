import React, {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactElement, ReactNode, Ref } from 'react';
import { ScrollView, View } from 'react-native';
import type {
  AccessibilityActionEvent,
  GestureResponderEvent,
  LayoutChangeEvent,
  StyleProp,
  ViewProps,
  ViewStyle,
} from 'react-native';

import { Text } from '../Text';
import { Icon } from '../Icon';
import { ListGroup, ListGroupBody } from '../ListGroup';
import { MenuItemButton } from '../MenuItemButton';
import type { MenuItemButtonProps } from '../MenuItemButton';
import { factory, withStatics } from '../../core/factory';
import { mergeSlotProps } from '../../core/utils/mergeSlotProps';
import { useStyleProps } from '../../core/utils/spacing';
import { useMergedRef } from '../../core/utils/mergeRefs';
import { warnOnce } from '../../core/utils/logger';
import { hasDOM, isNative, isWeb, webProps } from '../../core/platform';
import type { WebKeyboardEvent, WebMouseEvent } from '../../core/platform';
import { useFloating } from '../../core/overlay/useFloating';
import type { UseFloatingReturn } from '../../core/overlay/useFloating';
import { createPointAnchor } from '../../core/overlay/pointAnchor';
import { focusContainer, focusElement, resolveDOMElement } from '../../core/overlay/focus';
import { useIsRTL } from '../../core/overlay/placement';
import { useRovingFocus } from '../../core/accessibility/useRovingFocus';
import { useA11yId } from '../../core/accessibility/useA11yId';
import { useLatestCallback } from '../../core/hooks/useLatestCallback';
import { measureElement } from '../../core/utils/positioning-enhanced';
import { useControllableState } from '../../hooks/useControllableState';
import type {
  MenuProps,
  MenuItemProps,
  MenuLabelProps,
  MenuDividerProps,
  MenuDropdownProps,
  MenuSubProps,
  MenuFactoryPayload,
} from './types';
import { useMenuStyles } from './styles';
import { MenuCheckboxItem, MenuRadioGroup, MenuRadioItem } from './MenuChoiceItems';

import { MenuContext, useMenuContext } from './MenuContext';
import type { MenuContextValue } from './MenuContext';
export { useMenuContext } from './MenuContext';
export type { MenuContextValue } from './MenuContext';

/** Where keyboard focus lands when a menu opens. */
export type MenuInitialFocus = 'first' | 'last' | 'none';
type InitialFocus = MenuInitialFocus;

const MENU_ITEM_SELECTOR = '[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"]';

/**
 * Approximate rendered heights of the rows a menu is built from, at the `sm`
 * size the dropdown uses. They only feed the positioner's pre-mount height
 * hint (so the first frame picks the right side); the real size is measured.
 */
const MENU_ITEM_HEIGHT = 34;
const MENU_LABEL_HEIGHT = 30;
const MENU_DIVIDER_HEIGHT = 9;
/** Padding and border the dropdown surface adds around the rows. */
const MENU_CHROME_HEIGHT = 10;
/** The dropdown surface's own max width (see styles.ts). */
const MENU_MAX_WIDTH = 320;
const HOVER_CLOSE_DELAY = 150;
const SUBMENU_CLOSE_DELAY = 220;

function estimateMenuHeight(items: ReactNode, maxHeight: number): number {
  const content = React.Children.toArray(items).reduce<number>((total, child) => {
    if (isValidElement(child)) {
      if (child.type === MenuDivider) return total + MENU_DIVIDER_HEIGHT;
      if (child.type === MenuLabel) return total + MENU_LABEL_HEIGHT;
    }
    return total + MENU_ITEM_HEIGHT;
  }, 0);
  return Math.min(maxHeight, content + MENU_CHROME_HEIGHT);
}

/** React 19 made `ref` an ordinary prop; on 18 it lives on the element (reading `element.ref` on 19 warns). */
function getElementRef(element: ReactElement | null): Ref<unknown> | undefined {
  if (!element) return undefined;
  if (parseInt(React.version, 10) >= 19) {
    return (element.props as { ref?: Ref<unknown> }).ref;
  }
  return (element as unknown as { ref?: Ref<unknown> }).ref;
}

function chain<A extends unknown[]>(
  first: ((...args: A) => void) | undefined,
  second: (...args: A) => void
): (...args: A) => void {
  if (!first) return second;
  return (...args: A) => {
    first(...args);
    second(...args);
  };
}

/** Props a trigger child may carry that the menu chains onto. */
interface TriggerChildProps {
  id?: string;
  onPress?: (event: GestureResponderEvent) => void;
  onLongPress?: (event: GestureResponderEvent) => void;
  onKeyDown?: (event: WebKeyboardEvent) => void;
  onLayout?: (event: LayoutChangeEvent) => void;
  onAccessibilityAction?: (event: AccessibilityActionEvent) => void;
}

function splitMenuChildren(children: ReactNode): {
  triggerElement: ReactElement | null;
  dropdownElement: ReactElement<MenuDropdownProps> | null;
} {
  let triggerElement: ReactElement | null = null;
  let dropdownElement: ReactElement<MenuDropdownProps> | null = null;
  React.Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    if (child.type === MenuDropdown) {
      if (!dropdownElement) dropdownElement = child as ReactElement<MenuDropdownProps>;
    } else if (!triggerElement) {
      triggerElement = child;
    }
  });
  return { triggerElement, dropdownElement };
}

// ---------------------------------------------------------------------------
// MenuList — the dropdown surface shared by Menu and Menu.Sub
// ---------------------------------------------------------------------------

/** @internal shared with ContextMenu */
export interface MenuListProps {
  floating: UseFloatingReturn;
  contextValue: MenuContextValue;
  children: ReactNode;
  style: StyleProp<ViewStyle>;
  maxHeight: number;
  scrollable: boolean;
  initialFocus: InitialFocus;
  /** Bumped to re-run the initial focus while already open (keyboard re-entry). */
  focusRequest: number;
  /** Tab: menus aren't in the tab sequence, so Tab closes them. */
  onTabOut: () => void;
  /** Submenus: the "back" arrow (Left, Right in RTL) closes this level. */
  onNavigateBack?: () => void;
  onNavigateHorizontal?: (direction: -1 | 1) => void;
  labelledBy?: string;
  label?: string;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
  testID?: string;
}

/**
 * The menu surface: role="menu" (via useFloating), roving focus over its own
 * menu items (Arrow keys, Home/End, typeahead — `useRovingFocus`), Space /
 * Enter to activate, Tab to leave. Items are discovered from the DOM so any
 * composition of Menu.Item / Menu.Sub works; keyboard handling is web-only.
 */
export function MenuList({
  floating,
  contextValue,
  children,
  style,
  maxHeight,
  scrollable,
  initialFocus,
  focusRequest,
  onTabOut,
  onNavigateBack,
  onNavigateHorizontal,
  labelledBy,
  label,
  onPointerEnter,
  onPointerLeave,
  testID,
}: MenuListProps) {
  const listRef = useRef<View>(null);
  const itemsRef = useRef<HTMLElement[]>([]);
  const [count, setCount] = useState(0);
  const rtl = useIsRTL();

  /** This menu's own items, in DOM order (not those of a submenu rendered inline inside it). */
  const collectItems = useCallback((): HTMLElement[] => {
    const container = resolveDOMElement(listRef);
    if (!container) {
      itemsRef.current = [];
      return [];
    }
    const items = Array.from(container.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR)).filter(
      (item) => item.closest('[role="menu"]') === container
    );
    itemsRef.current = items;
    return items;
  }, []);

  // Keep the roving-focus item count in step with what is rendered.
  useEffect(() => {
    if (!hasDOM) return;
    const next = collectItems().length;
    setCount((previous) => (previous === next ? previous : next));
  }, [children, collectItems]);

  const getItemText = useCallback((index: number) => itemsRef.current[index]?.textContent?.trim() ?? '', []);
  const isItemDisabled = useCallback(
    (index: number) => itemsRef.current[index]?.getAttribute('aria-disabled') === 'true',
    []
  );
  const focusItemAt = useCallback((index: number) => {
    focusElement(itemsRef.current[index]);
  }, []);

  const { handleKeyDown: handleRovingKeyDown } = useRovingFocus({
    count,
    orientation: 'vertical',
    loop: true,
    moveFocus: false,
    typeahead: getItemText,
    isDisabled: isItemDisabled,
    onActiveChange: focusItemAt,
    rtl,
  });

  const focusInitial = useLatestCallback(() => {
    if (!hasDOM || initialFocus === 'none') return;
    const enabled = collectItems().filter((item) => item.getAttribute('aria-disabled') !== 'true');
    const target = initialFocus === 'last' ? enabled[enabled.length - 1] : enabled[0];
    if (target) {
      focusElement(target);
      return;
    }
    const container = resolveDOMElement(listRef);
    if (container) focusContainer(container);
  });

  useEffect(() => {
    focusInitial();
  }, [focusInitial, focusRequest]);

  const handleKeyDown = useCallback(
    (event: WebKeyboardEvent) => {
      const container = resolveDOMElement(listRef);
      const target = event.target as HTMLElement | null;
      if (!container || !target || typeof target.closest !== 'function') return;
      // Keys from a submenu rendered inline inside this one belong to it.
      if (target !== container && target.closest('[role="menu"]') !== container) return;

      const items = collectItems();
      const index = items.findIndex((item) => item === target || item.contains(target));

      if (event.key === 'Tab') {
        event.preventDefault();
        onTabOut();
        return;
      }
      if (event.key === ' ' && index >= 0) {
        // Enter activates through the pressable; Space only does for buttons.
        event.preventDefault();
        items[index].click();
        return;
      }
      if (onNavigateBack && event.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) {
        event.preventDefault();
        event.stopPropagation();
        onNavigateBack();
        return;
      }
      if (onNavigateHorizontal && (event.key === 'ArrowLeft' || event.key === 'ArrowRight') && items[index]?.getAttribute('aria-haspopup') !== 'menu') {
        event.preventDefault();
        event.stopPropagation();
        onNavigateHorizontal(event.key === 'ArrowRight' ? (rtl ? -1 : 1) : (rtl ? 1 : -1));
        return;
      }
      // From the container itself, Down starts at the top and Up at the bottom.
      const start = index >= 0 ? index : event.key === 'ArrowUp' ? items.length : -1;
      handleRovingKeyDown(event, start);
    },
    [collectItems, handleRovingKeyDown, onNavigateBack, onNavigateHorizontal, onTabOut, rtl]
  );

  const body = scrollable ? (
    <ScrollView style={{ maxHeight, width: '100%' }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <ListGroupBody>{children}</ListGroupBody>
    </ScrollView>
  ) : (
    <View style={{ maxHeight, width: '100%', overflow: 'hidden' }}>
      <ListGroupBody>{children}</ListGroupBody>
    </View>
  );

  const floatingProps = floating.getFloatingProps({
    ref: listRef,
    style,
    testID,
    'aria-label': label,
    ...(isWeb && labelledBy && !label ? { 'aria-labelledby': labelledBy } : null),
    ...webProps({
      onKeyDown: handleKeyDown,
      onMouseEnter: onPointerEnter,
      onMouseLeave: onPointerLeave,
    }),
  });

  return (
    <MenuContext.Provider value={contextValue}>
      <ListGroup variant="default" size="sm" {...(floatingProps as ViewProps)}>
        {body}
      </ListGroup>
    </MenuContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Menu
// ---------------------------------------------------------------------------

function MenuBase(props: MenuProps, ref: Ref<View>) {
  const {
    opened: controlledOpened,
    defaultOpened = false,
    onChange,
    trigger = 'click',
    position = isNative ? 'top' : 'auto',
    offset = 4,
    closeOnClickOutside = true,
    closeOnEscape = true,
    onOpen,
    onClose,
    onNavigateHorizontal,
    w = 'auto',
    mah: maxH = 300,
    shadow = 'md',
    radius = 'md',
    children,
    testID,
    disabled = false,
    strategy = isWeb ? 'fixed' : 'portal',
    style,
    'aria-label': ariaLabel,
    ...spacingProps
  } = props;

  const spacingStyles = useStyleProps(spacingProps);
  const menuStyles = useMenuStyles({ radius, shadow });
  const isHover = trigger === 'hover';
  const isContext = trigger === 'contextmenu';

  const [opened, setOpened] = useControllableState<boolean>({
    value: controlledOpened,
    defaultValue: defaultOpened,
    finalValue: false,
    onChange,
  });
  const [initialFocus, setInitialFocus] = useState<InitialFocus>('first');
  const [focusRequest, setFocusRequest] = useState(0);
  const [triggerWidth, setTriggerWidth] = useState<number | undefined>(undefined);

  // Read by timers and handlers that may outlive the render that made them.
  const openedRef = useRef(opened);
  useEffect(() => {
    openedRef.current = opened;
  }, [opened]);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  }, []);

  const { triggerElement, dropdownElement } = useMemo(() => splitMenuChildren(children), [children]);
  if (!triggerElement) {
    warnOnce('Menu:no-trigger', '[plocks] Menu needs a trigger element (a child other than Menu.Dropdown).');
  }
  const dropdownProps = dropdownElement?.props;
  const items = dropdownProps?.children;
  const dropdownScrollable = dropdownProps?.scrollable;
  const dropdownStyle = dropdownProps?.style;
  const dropdownTestID = dropdownProps?.testID;
  // Style props on Menu.Dropdown style the dropdown surface.
  const dropdownSpacing = useStyleProps(dropdownProps ?? {});

  const openMenu = useCallback((focus: InitialFocus) => {
    if (disabled) return;
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
    if (openedRef.current) return;
    openedRef.current = true;
    setInitialFocus(focus);
    setOpened(true);
    onOpen?.();
  }, [disabled, setOpened, onOpen]);

  const closeMenu = useCallback(() => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
    if (!openedRef.current) return;
    openedRef.current = false;
    setOpened(false);
    onClose?.();
  }, [setOpened, onClose]);

  const isOpen = opened && !disabled && items != null;

  const floating = useFloating({
    opened: isOpen,
    onDismiss: closeMenu,
    placement: isContext ? 'bottom-start' : position,
    offset: isContext ? 0 : offset,
    matchWidth: w === 'target',
    strategy,
    trigger: isHover ? 'hover' : isContext ? 'contextmenu' : 'click',
    role: 'menu',
    closeOnEscape,
    closeOnOutsidePress: isHover ? false : closeOnClickOutside,
    // The menu focuses its first (or last) item itself.
    autoFocus: false,
    restoreFocus: true,
    desiredHeight: estimateMenuHeight(items, maxH),
  });
  const { refs, getReferenceProps, update: updatePosition } = floating;

  // --- anchor ------------------------------------------------------------------
  // The trigger element is the anchor when it forwards a ref; otherwise the
  // wrapper. Refs attach child-first, so the trigger's wins when present.
  // Context menus anchor to the pointer instead (a virtual point anchor).
  const triggerNodeRef = useRef<unknown>(null);
  const rootNodeRef = useRef<unknown>(null);
  const setTriggerNode = useCallback((node: unknown) => {
    triggerNodeRef.current = node;
    if (!isContext && node) refs.setReference(node);
  }, [isContext, refs]);
  const setRootNode = useCallback((node: unknown) => {
    rootNodeRef.current = node;
    if (!isContext && node && !triggerNodeRef.current) refs.setReference(node);
  }, [isContext, refs]);
  const rootRef = useMergedRef<View>(ref, setRootNode);
  const triggerRef = useMergedRef<unknown>(getElementRef(triggerElement), setTriggerNode);

  const openAtPoint = useCallback((x: number, y: number, focus: InitialFocus) => {
    if (disabled) return;
    refs.setReference(createPointAnchor({ x, y }));
    if (openedRef.current) {
      void updatePosition();
      return;
    }
    openMenu(focus);
  }, [disabled, refs, updatePosition, openMenu]);

  /** Keyboard / assistive-technology context menu: open at the trigger's corner. */
  const openAtTrigger = useCallback(() => {
    const node = triggerNodeRef.current ?? rootNodeRef.current;
    void measureElement({ current: node }).then((rect) => {
      openAtPoint(rect.x, rect.y + rect.height, 'first');
    });
  }, [openAtPoint]);

  // --- hover ---------------------------------------------------------------------
  const hoverOpen = useCallback(() => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
    openMenu('none');
  }, [openMenu]);
  const hoverClose = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      hoverTimer.current = null;
      closeMenu();
    }, HOVER_CLOSE_DELAY);
  }, [closeMenu]);

  // --- trigger -----------------------------------------------------------------
  const triggerId = useA11yId(undefined, 'menu-trigger');
  const childProps = (triggerElement?.props ?? {}) as TriggerChildProps;
  const resolvedTriggerId = childProps.id ?? triggerId;

  const handleTriggerKeyDown = (event: WebKeyboardEvent) => {
    childProps.onKeyDown?.(event);
    if (event.defaultPrevented || disabled) return;
    if (isContext) {
      if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) {
        event.preventDefault();
        openAtTrigger();
      }
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (openedRef.current) {
        setInitialFocus(event.key === 'ArrowUp' ? 'last' : 'first');
        setFocusRequest((n) => n + 1);
      } else {
        openMenu(event.key === 'ArrowUp' ? 'last' : 'first');
      }
    }
  };

  const triggerOverrides: Record<string, unknown> = {
    ref: triggerRef,
    onLayout: chain(childProps.onLayout, (event: LayoutChangeEvent) => {
      const width = event.nativeEvent.layout.width;
      setTriggerWidth((previous) => (previous === width ? previous : width));
    }),
  };
  if (isWeb) triggerOverrides.onKeyDown = handleTriggerKeyDown;

  if (isContext) {
    // Native: long-press opens it at the finger; assistive tech gets an action.
    if (!isWeb) {
      triggerOverrides.onLongPress = chain(childProps.onLongPress, (event: GestureResponderEvent) => {
        openAtPoint(event.nativeEvent.pageX, event.nativeEvent.pageY, 'first');
      });
      triggerOverrides.accessibilityActions = [{ name: 'longpress', label: 'Open menu' }];
      triggerOverrides.onAccessibilityAction = chain(childProps.onAccessibilityAction, (event: AccessibilityActionEvent) => {
        if (event.nativeEvent.actionName === 'longpress') openAtTrigger();
      });
    }
  } else {
    Object.assign(triggerOverrides, getReferenceProps({}, { ref: false }));
    triggerOverrides.id = resolvedTriggerId;
    triggerOverrides.onPress = chain(childProps.onPress, () => {
      if (openedRef.current) closeMenu();
      else openMenu('first');
    });
  }
  if (disabled) triggerOverrides.disabled = true;

  const enhancedTrigger = triggerElement ? cloneElement(triggerElement, triggerOverrides) : null;

  const handleContextMenu = useCallback((event: WebMouseEvent) => {
    event.preventDefault();
    openAtPoint(event.clientX ?? 0, event.clientY ?? 0, 'first');
  }, [openAtPoint]);
  const rootWebProps = isWeb
    ? {
        ...(isContext ? { onContextMenu: handleContextMenu } : null),
        ...(isHover ? webProps({ onMouseEnter: hoverOpen, onMouseLeave: hoverClose }) : null),
      }
    : null;

  // --- dropdown ------------------------------------------------------------------
  const position_ = floating.position;
  const resolvedMaxHeight = typeof position_?.maxHeight === 'number' ? Math.min(maxH, position_.maxHeight) : maxH;
  let widthStyle: ViewStyle | null = null;
  if (typeof w === 'number') widthStyle = { width: w };
  else if (w === 'auto' && isNative) widthStyle = { width: Math.min(Math.max(triggerWidth ?? 0, 220), MENU_MAX_WIDTH) };
  else if (w === 'auto' && triggerWidth && !isContext) widthStyle = { minWidth: Math.min(triggerWidth, MENU_MAX_WIDTH) };

  const contextValue = useMemo<MenuContextValue>(() => ({ closeMenu, opened: isOpen }), [closeMenu, isOpen]);

  const content = items != null ? (
    <MenuList
      floating={floating}
      contextValue={contextValue}
      style={[menuStyles.dropdown, widthStyle, dropdownSpacing, dropdownStyle]}
      maxHeight={resolvedMaxHeight}
      scrollable={dropdownScrollable !== false}
      initialFocus={initialFocus}
      focusRequest={focusRequest}
      onTabOut={closeMenu}
      onNavigateHorizontal={onNavigateHorizontal}
      labelledBy={isContext ? undefined : resolvedTriggerId}
      label={ariaLabel}
      onPointerEnter={isHover ? hoverOpen : undefined}
      onPointerLeave={isHover ? hoverClose : undefined}
      testID={dropdownTestID}
    >
      {items}
    </MenuList>
  ) : null;

  return (
    <MenuContext.Provider value={contextValue}>
      <View ref={rootRef} style={[spacingStyles, style]} testID={testID} collapsable={false} {...rootWebProps}>
        {enhancedTrigger}
        {floating.renderFloating(content)}
      </View>
    </MenuContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Menu.Item
// ---------------------------------------------------------------------------

/** Props MenuItemButton forwards to its Pressable but doesn't declare. */
function menuItemA11y(options: {
  disabled: boolean;
  hasPopup?: boolean;
  extra?: Record<string, unknown>;
}): Partial<MenuItemButtonProps> {
  return {
    role: 'menuitem',
    'aria-disabled': options.disabled || undefined,
    ...(options.hasPopup && isWeb ? { 'aria-haspopup': 'menu' } : null),
    // Menus manage focus with the arrow keys; items are never tab stops.
    ...webProps({ tabIndex: -1 }),
    ...options.extra,
  } as Partial<MenuItemButtonProps>;
}

function MenuItemBase(props: MenuItemProps, ref: Ref<View>) {
  const {
    children,
    onPress,
    disabled = false,
    startSection,
    endSection,
    color = 'default',
    closeMenuOnClick = true,
    testID,
    style,
    ...spacingProps
  } = props;

  const { closeMenu } = useMenuContext();

  const handlePress = useCallback(() => {
    if (disabled) return;
    onPress?.();
    if (closeMenuOnClick) closeMenu();
  }, [disabled, onPress, closeMenuOnClick, closeMenu]);

  return (
    <MenuItemButton
      ref={ref}
      onPress={handlePress}
      disabled={disabled}
      startSection={startSection}
      endSection={endSection}
      color={color}
      testID={testID}
      style={style}
      {...spacingProps}
      {...menuItemA11y({ disabled })}
    >
      {children}
    </MenuItemButton>
  );
}

// ---------------------------------------------------------------------------
// Menu.Label / Menu.Divider / Menu.Dropdown
// ---------------------------------------------------------------------------

function MenuLabelBase(props: MenuLabelProps, ref: Ref<View>) {
  const { children, testID, style, textProps, ...spacingProps } = props;
  const styles = useMenuStyles();
  const spacingStyles = useStyleProps(spacingProps);

  return (
    <View ref={ref} style={[styles.label, spacingStyles, style]} testID={testID} role="presentation">
      <Text {...mergeSlotProps({ textRole: 'sectionLabel' }, textProps)}>{children}</Text>
    </View>
  );
}

function MenuDividerBase(props: MenuDividerProps, ref: Ref<View>) {
  const { testID, style, ...spacingProps } = props;
  const styles = useMenuStyles();
  const spacingStyles = useStyleProps(spacingProps);

  return <View ref={ref} role="separator" style={[styles.divider, spacingStyles, style]} testID={testID} />;
}

/** A declaration only: Menu reads its props and renders the items in the dropdown. */
function MenuDropdownBase(_props: MenuDropdownProps, _ref: Ref<View>) {
  return null;
}

// ---------------------------------------------------------------------------
// Menu.Sub — a flyout submenu
// ---------------------------------------------------------------------------
// A trigger row inside the parent dropdown that opens its own menu to the side:
// on hover (web), press, or ArrowRight / Enter / Space (ArrowLeft or Escape
// closes it again and returns focus to the row). Choosing a leaf item closes
// the whole chain; an ancestor closing unmounts it and its overlay.

function MenuSubBase(props: MenuSubProps, ref: Ref<View>) {
  const {
    label,
    children,
    startSection,
    disabled = false,
    color = 'default',
    w = 200,
    mah: maxH = 300,
    testID,
    style,
    ...spacingProps
  } = props;

  const parent = useMenuContext();
  const menuStyles = useMenuStyles();
  const rtl = useIsRTL();

  const [opened, setOpened] = useState(false);
  const [initialFocus, setInitialFocus] = useState<InitialFocus>('none');
  const [focusRequest, setFocusRequest] = useState(0);
  const pendingFocusRef = useRef<InitialFocus>('none');
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);
  useEffect(() => cancelClose, [cancelClose]);

  const openSub = useCallback((focus: InitialFocus) => {
    if (disabled) return;
    cancelClose();
    setInitialFocus(focus);
    if (focus !== 'none') setFocusRequest((n) => n + 1);
    setOpened(true);
  }, [disabled, cancelClose]);

  const closeSub = useCallback(() => {
    cancelClose();
    setOpened(false);
  }, [cancelClose]);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      closeTimer.current = null;
      setOpened(false);
    }, SUBMENU_CLOSE_DELAY);
  }, [cancelClose]);

  const { closeMenu: closeParentChain } = parent;
  const closeChain = useCallback(() => {
    closeSub();
    closeParentChain();
  }, [closeSub, closeParentChain]);

  const isOpen = opened && !disabled;
  const floating = useFloating({
    opened: isOpen,
    onDismiss: closeSub,
    placement: 'right-start',
    fallbackPlacements: ['right-start', 'left-start', 'right', 'left'],
    offset: 2,
    role: 'menu',
    strategy: isWeb ? 'fixed' : 'portal',
    autoFocus: false,
    restoreFocus: true,
    desiredHeight: estimateMenuHeight(children, maxH),
  });

  const anchorRef = useMergedRef<View>(ref, floating.refs.setReference);

  const handleKeyDown = (event: WebKeyboardEvent) => {
    if (disabled) return;
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
    if (event.key === forward) {
      event.preventDefault();
      event.stopPropagation();
      openSub('first');
    } else if (event.key === 'Enter' || event.key === ' ') {
      // The press that follows opens it; keyboard users land inside.
      pendingFocusRef.current = 'first';
    }
  };

  const handlePress = () => {
    const focus = pendingFocusRef.current;
    pendingFocusRef.current = 'none';
    if (!opened) openSub(focus);
    else if (focus !== 'none') openSub(focus);
    // Web opens on hover, so a click never closes it; elsewhere press toggles.
    else if (!isWeb) closeSub();
  };

  const resolvedMaxHeight = typeof floating.position?.maxHeight === 'number'
    ? Math.min(maxH, floating.position.maxHeight)
    : maxH;
  const subContext = useMemo<MenuContextValue>(() => ({ closeMenu: closeChain, opened: isOpen }), [closeChain, isOpen]);

  const content = (
    <MenuList
      floating={floating}
      contextValue={subContext}
      style={[menuStyles.dropdown, { width: w }]}
      maxHeight={resolvedMaxHeight}
      scrollable
      initialFocus={initialFocus}
      focusRequest={focusRequest}
      onTabOut={closeChain}
      onNavigateBack={closeSub}
      label={typeof label === 'string' ? label : undefined}
      onPointerEnter={cancelClose}
      onPointerLeave={scheduleClose}
    >
      {children}
    </MenuList>
  );

  const referenceProps = floating.getReferenceProps({}, { ref: false });

  return (
    <>
      <MenuItemButton
        ref={anchorRef}
        onPress={handlePress}
        disabled={disabled}
        startSection={startSection}
        // Icon mirrors chevrons itself in RTL.
        endSection={<Icon name="chevron-right" size={16} />}
        color={color}
        testID={testID}
        style={style}
        {...spacingProps}
        onHoverIn={isWeb ? () => openSub('none') : undefined}
        onHoverOut={isWeb ? scheduleClose : undefined}
        {...menuItemA11y({
          disabled,
          hasPopup: true,
          extra: { ...referenceProps, ...webProps({ onKeyDown: handleKeyDown }) },
        })}
      >
        {label}
      </MenuItemButton>
      {floating.renderFloating(content)}
    </>
  );
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const MenuItem = factory<{ props: MenuItemProps; ref: View }>(MenuItemBase, { displayName: 'Menu.Item' });
export const MenuLabel = factory<{ props: MenuLabelProps; ref: View }>(MenuLabelBase, { displayName: 'Menu.Label' });
export const MenuDivider = factory<{ props: MenuDividerProps; ref: View }>(MenuDividerBase, { displayName: 'Menu.Divider' });
export const MenuDropdown = factory<{ props: MenuDropdownProps; ref: View }>(MenuDropdownBase, { displayName: 'Menu.Dropdown' });
export const MenuSub = factory<{ props: MenuSubProps; ref: View }>(MenuSubBase, { displayName: 'Menu.Sub' });

const MenuRoot = factory<MenuFactoryPayload>(MenuBase, { displayName: 'Menu' });

/** Dropdown menu of actions. Compound members: `Menu.Item`, `Menu.Label`, `Menu.Divider`, `Menu.Dropdown`, `Menu.Sub`. */
export const Menu = withStatics(MenuRoot, {
  Item: MenuItem,
  Label: MenuLabel,
  Divider: MenuDivider,
  Dropdown: MenuDropdown,
  Sub: MenuSub,
  CheckboxItem: MenuCheckboxItem,
  RadioGroup: MenuRadioGroup,
  RadioItem: MenuRadioItem,
});
