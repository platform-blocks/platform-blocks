import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import type { Ref } from 'react';
import { View } from 'react-native';
import type { AccessibilityActionEvent, AccessibilityActionInfo, GestureResponderEvent } from 'react-native';

import { MenuItem, MenuList } from '../Menu/Menu';
import type { MenuContextValue } from '../Menu/Menu';
import { useMenuStyles } from '../Menu/styles';
import { factory } from '../../core/factory';
import { useStyleProps } from '../../core/utils/spacing';
import { useMergedRef } from '../../core/utils/mergeRefs';
import { warnOnce } from '../../core/utils/logger';
import { isWeb } from '../../core/platform';
import type { WebKeyboardEvent, WebMouseEvent } from '../../core/platform';
import { useFloating } from '../../core/overlay/useFloating';
import { createPointAnchor } from '../../core/overlay/pointAnchor';
import { resolveDOMElement } from '../../core/overlay/focus';
import { measureElement } from '../../core/utils/positioning-enhanced';
import { useControllableState } from '../../hooks/useControllableState';
import type { ContextMenuFactoryPayload, ContextMenuItem, ContextMenuProps, ContextMenuTriggerProps } from './types';

export type { ContextMenuItem, ContextMenuProps, ContextMenuTriggerProps } from './types';

const OPEN_MENU_ACTION = 'openContextMenu';
const ACCESSIBILITY_ACTIONS: ReadonlyArray<AccessibilityActionInfo> = [
  // Double-tap-and-hold in VoiceOver / TalkBack.
  { name: 'longpress', label: 'Open menu' },
  // Listed in the actions rotor / menu.
  { name: OPEN_MENU_ACTION, label: 'Open menu' },
];

interface Point {
  x: number;
  y: number;
}

/**
 * A menu of actions opened at the pointer: right-click (web), long-press
 * (native), Shift+F10 / the ContextMenu key (web keyboard) or a screen-reader
 * action. Renders through the shared overlay primitives (flip / shift to stay
 * on screen, Escape / back / outside press, focus moved in and restored) with
 * the same keyboard-navigable menu as `Menu`.
 */
function ContextMenuBase(props: ContextMenuProps, ref: Ref<View>) {
  const {
    children,
    items,
    closeOnSelect = true,
    longPressDelay = 350,
    mah: maxHeight = 280,
    onOpen,
    onClose,
    opened: openedProp,
    defaultOpened = false,
    open: legacyOpen,
    position: controlledPosition,
    style,
    testID,
    'aria-label': ariaLabel = 'Context menu',
    ...spacingProps
  } = props;

  if (legacyOpen !== undefined) {
    warnOnce('ContextMenu.open', '[platform-blocks] ContextMenu `open` is deprecated; use `opened`.');
  }
  const spacingStyles = useStyleProps(spacingProps);
  const menuStyles = useMenuStyles();

  const [opened, setOpened] = useControllableState<boolean>({
    value: openedProp ?? legacyOpen,
    defaultValue: defaultOpened,
    finalValue: false,
  });
  const openedRef = useRef(opened);
  useEffect(() => {
    openedRef.current = opened;
  });

  const rootRef = useRef<View>(null);
  const hasPointAnchorRef = useRef(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }, []);

  const close = useCallback(() => {
    if (!openedRef.current) return;
    openedRef.current = false;
    setOpened(false);
    onClose?.();
  }, [setOpened, onClose]);

  const floating = useFloating({
    opened: opened && items.length > 0,
    onDismiss: close,
    placement: 'bottom-start',
    offset: 0,
    trigger: 'contextmenu',
    role: 'menu',
    autoFocus: false,
    restoreFocus: true,
    desiredHeight: Math.min(maxHeight, items.length * 34 + 10),
  });
  const { refs, update: updatePosition } = floating;

  // Until a point is known (controlled `opened` without `position`), anchor to the wrapper.
  const setWrapperAnchor = useCallback((node: unknown) => {
    if (node && !hasPointAnchorRef.current) refs.setReference(node);
  }, [refs]);
  const mergedRef = useMergedRef<View>(ref, rootRef, setWrapperAnchor);

  // A controlled position is the anchor whenever it is given.
  const controlledX = controlledPosition?.x;
  const controlledY = controlledPosition?.y;
  useEffect(() => {
    if (controlledX === undefined || controlledY === undefined) return;
    hasPointAnchorRef.current = true;
    refs.setReference(createPointAnchor({ x: controlledX, y: controlledY }));
    if (openedRef.current) void updatePosition();
  }, [controlledX, controlledY, refs, updatePosition]);

  const openAt = useCallback((point: Point) => {
    if (controlledX === undefined || controlledY === undefined) {
      hasPointAnchorRef.current = true;
      refs.setReference(createPointAnchor(point));
    }
    if (openedRef.current) {
      void updatePosition();
      return;
    }
    openedRef.current = true;
    setOpened(true);
    onOpen?.();
  }, [controlledX, controlledY, refs, updatePosition, setOpened, onOpen]);

  /** Keyboard / assistive tech: open at the element's bottom-start corner. */
  const openAtNode = useCallback((node: unknown) => {
    void measureElement({ current: node ?? rootRef.current }).then((rect) => {
      openAt({ x: rect.x, y: rect.y + rect.height });
    });
  }, [openAt]);

  const triggerProps = useMemo<ContextMenuTriggerProps>(() => ({
    onContextMenu: (event: WebMouseEvent) => {
      event.preventDefault();
      const x = event.clientX ?? 0;
      const y = event.clientY ?? 0;
      // The keyboard ContextMenu key fires this event without pointer coordinates.
      if (x === 0 && y === 0) {
        openAtNode(resolveDOMElement(event.currentTarget) ?? rootRef.current);
        return;
      }
      openAt({ x, y });
    },
    onPressIn: (event: GestureResponderEvent) => {
      if (isWeb) return; // the contextmenu event covers web
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
      const { pageX, pageY } = event.nativeEvent;
      longPressTimer.current = setTimeout(() => {
        longPressTimer.current = null;
        openAt({ x: pageX, y: pageY });
      }, longPressDelay);
    },
    onPressOut: () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    },
    ...(isWeb
      ? {
          onKeyDown: (event: WebKeyboardEvent) => {
            if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) {
              event.preventDefault();
              openAtNode(resolveDOMElement(event.currentTarget) ?? rootRef.current);
            }
          },
          'aria-haspopup': 'menu' as const,
        }
      : null),
    accessibilityActions: ACCESSIBILITY_ACTIONS,
    onAccessibilityAction: (event: AccessibilityActionEvent) => {
      const action = event.nativeEvent.actionName;
      if (action === 'longpress' || action === OPEN_MENU_ACTION) openAtNode(rootRef.current);
    },
  }), [openAt, openAtNode, longPressDelay]);

  const contextValue = useMemo<MenuContextValue>(() => ({ closeMenu: close, opened }), [close, opened]);
  const resolvedMaxHeight = typeof floating.position?.maxHeight === 'number'
    ? Math.min(maxHeight, floating.position.maxHeight)
    : maxHeight;

  const content = (
    <MenuList
      floating={floating}
      contextValue={contextValue}
      style={[menuStyles.dropdown, { minWidth: 160 }]}
      maxHeight={resolvedMaxHeight}
      scrollable
      initialFocus="first"
      focusRequest={0}
      onTabOut={close}
      label={ariaLabel}
      testID={testID ? `${testID}-menu` : undefined}
    >
      {items.map((item: ContextMenuItem) => (
        <MenuItem
          key={item.id}
          disabled={item.disabled}
          color={item.danger ? 'error' : 'default'}
          startSection={item.icon}
          closeMenuOnClick={closeOnSelect}
          onPress={item.onSelect}
        >
          {item.label}
        </MenuItem>
      ))}
    </MenuList>
  );

  return (
    <View ref={mergedRef} style={[spacingStyles, style]} testID={testID}>
      {children(triggerProps)}
      {floating.renderFloating(content)}
    </View>
  );
}

export const ContextMenu = factory<ContextMenuFactoryPayload>(ContextMenuBase, { displayName: 'ContextMenu' });

export default ContextMenu;
