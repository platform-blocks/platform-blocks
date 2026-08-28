import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  cloneElement,
  isValidElement,
  ReactNode,
  useMemo,
} from 'react';
import { View, ScrollView, Pressable, Platform, ViewStyle } from 'react-native';
import { Text } from '../Text';
import { Icon } from '../Icon';
import { ListGroup, ListGroupBody, ListGroupDivider } from '../ListGroup';
import { factory } from '../../core/factory';
import { useTheme } from '../../core/theme';
import { useOverlayApi } from '../../core/providers/OverlayProvider';
import { measureElement, calculateOverlayPositionEnhanced, type PlacementType } from '../../core/utils/positioning-enhanced';
import { getSpacingStyles, extractSpacingProps } from '../../core/utils';
import { MenuItemButton } from '../MenuItemButton';
import {
  MenuProps,
  MenuItemProps,
  MenuLabelProps,
  MenuDividerProps,
  MenuDropdownProps,
  MenuSubProps,
} from './types';
import { useMenuStyles } from './styles';
import { useControllableState } from '../../hooks/useControllableState';

interface MenuContextValue {
  closeMenu: () => void;
  opened: boolean;
}

const MenuContext = createContext<MenuContextValue | null>(null);

/**
 * Approximate rendered heights of the rows a menu is built from, at the `sm`
 * size the dropdown uses.
 *
 * These only feed the positioner's pre-mount height hint, so a few pixels either
 * way is harmless: they shift the point at which the menu decides to open upward
 * rather than downward, never the final layout — that comes from the `maxHeight`
 * the positioner returns.
 */
const MENU_ITEM_HEIGHT = 34;
const MENU_LABEL_HEIGHT = 30;
const MENU_DIVIDER_HEIGHT = 9;
/** Padding and border the dropdown surface adds around the rows. */
const MENU_CHROME_HEIGHT = 10;

/**
 * How tall the menu will be once mounted, capped at its `maxH`.
 *
 * Supplying this is what lets the menu pick its side correctly on the first and
 * only positioning pass. It previously used a flat `120` — "typical menu with
 * 3-4 items" — so a longer menu near the bottom of the window concluded it fitted
 * below and rendered its remaining items off-screen. Unlike Select, the menu is
 * positioned once at open and never re-measured, so nothing corrected it after.
 */
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

export function useMenuContext() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('Menu compound components must be used within Menu');
  }
  return context;
}

interface MenuFactoryPayload {
  props: MenuProps;
  ref: View;
}

/**
 * Which edge a content-sized panel should hug inside the (wider) box the
 * positioner laid out for it — the same edge the placement anchored to, so the
 * panel's visible edge still lines up with the trigger.
 */
function alignForPlacement(placement: string): ViewStyle['alignItems'] {
  if (placement.endsWith('-end')) return 'flex-end';
  if (placement.endsWith('-start')) return 'flex-start';
  // A bare 'top'/'bottom' is centred on the trigger; anything horizontal
  // ('left'/'right') already sits beside it, so its box is its own width.
  return placement === 'top' || placement === 'bottom' ? 'center' : 'flex-start';
}

function MenuBase(props: MenuProps, ref: React.Ref<View>) {
  const {
    opened: controlledOpened,
    trigger = 'click',
    position = 'auto',
    offset = 4,
    closeOnClickOutside = true,
    closeOnEscape = true,
    onOpen,
    onClose,
  w = 'auto',
    maxH = 300,
    shadow = 'md',
    radius = 'md',
    children,
    testID,
    disabled = false,
    strategy = Platform.OS === 'web' ? 'fixed' : 'portal',
    ...spacingProps
  } = props;

  const [isOpened, setOpened] = useControllableState<boolean>({
    value: controlledOpened,
    defaultValue: false,
  });
  // Derive menu dropdown items from children each render for reactivity
  const { menuItems, menuDropdownProps } = useMemo(() => {
    const childArray = React.Children.toArray(children);
    const menuDropdown = childArray.find(child => 
      isValidElement(child) && child.type === MenuDropdown
    );
    if (menuDropdown && isValidElement(menuDropdown)) {
      return {
        menuItems: (menuDropdown.props as any).children,
        menuDropdownProps: menuDropdown.props as MenuDropdownProps,
      };
    }
    return { menuItems: null, menuDropdownProps: undefined };
  }, [children]);
  // Build a stable signature from menu items' keys to avoid unnecessary overlay updates.
  const menuItemsSignature = useMemo(() => {
    if (!menuItems) {
      return (menuDropdownProps?.scrollable === false ? 'no-scroll' : 'scroll') + (menuDropdownProps?.testID ? `:${menuDropdownProps.testID}` : '');
    }
    const arr = React.Children.toArray(menuItems);
    const scrollSig = menuDropdownProps?.scrollable === false ? 'no-scroll' : 'scroll';
    const testIDSig = menuDropdownProps?.testID ? `:${menuDropdownProps.testID}` : '';
    const itemSig = arr.map((c: any, idx) => {
      const base = (isValidElement(c) && c.key != null ? c.key : idx);
      if (isValidElement(c)) {
        const propsAny = c.props as any;
        if (propsAny && propsAny['data-overlay-hash']) {
          return base + ':' + propsAny['data-overlay-hash'];
        }
      }
      return base;
    }).join('|');
    return `${scrollSig}${testIDSig}|${itemSig}`;
  }, [menuItems, menuDropdownProps]);
  const lastSignatureRef = useRef<string>('');
  // Keep a ref in sync with latest open state to avoid stale closures blocking first re-open click
  const isOpenedRef = useRef(false);
  const containerRef = useRef<View>(null);
  const triggerRef = useRef<View>(null);
  const { openOverlay, closeOverlay, updateOverlay } = useOverlayApi();
  const overlayIdRef = useRef<string | null>(null);
  const lastResolvedWidthRef = useRef<number | undefined>(undefined);
  const lastAutoSizeRef = useRef<{ minWidth: number; align: ViewStyle['alignItems'] } | undefined>(undefined);
  /** The panel's real width, once it has laid out. Feeds the next placement. */
  const measuredWidthRef = useRef<number | undefined>(undefined);
  const repositionRef = useRef<(() => void) | null>(null);
  const lastResolvedMaxHeightRef = useRef<number | undefined>(undefined);
  const theme = useTheme();
  const styles = useMenuStyles();
  const dropdownSpacingStyles = useMemo(() => {
    if (!menuDropdownProps) return undefined;
    return getSpacingStyles(extractSpacingProps(menuDropdownProps as any).spacingProps);
  }, [menuDropdownProps]);

  isOpenedRef.current = isOpened;

  // Overlay content update effect moved below handleClose definition

  // Track last pointer position for context menu
  const lastPointerPosRef = useRef<{x: number; y: number} | null>(null);

  const handleClose = useCallback(() => {
    if (!isOpenedRef.current) return;
    if (overlayIdRef.current) {
      // This will trigger the lightweight onClose we passed to openOverlay
      closeOverlay(overlayIdRef.current);
      overlayIdRef.current = null;
    }
    // Ensure state sync even if overlay already closing
    setOpened(false);
    isOpenedRef.current = false;
    // onClose is invoked in overlay onClose; avoid double-calling
  }, [closeOverlay]);

  const menuContextValueOpened = useMemo(() => ({ closeMenu: handleClose, opened: true }), [handleClose]);

  /**
   * `resolvedMaxHeight` is the smaller of the caller's `maxH` and the space the
   * positioner found on the side it chose. Applying it is what keeps a long menu
   * on screen: it scrolls within the available space instead of running off the
   * bottom edge.
   */
  const buildMenuDropdown = useCallback((
    resolvedWidth: number | undefined,
    resolvedMaxHeight: number = maxH,
    autoSize?: { minWidth: number; align: ViewStyle['alignItems'] },
  ) => {
    if (!menuItems) return null;
    const scrollable = menuDropdownProps?.scrollable !== false;
    const listGroupStyle: ViewStyle = {
      ...(styles.dropdown as any),
      ...(dropdownSpacingStyles || {}),
      maxHeight: resolvedMaxHeight,
      width: resolvedWidth,
      // `w="auto"` means *auto*: no explicit width, so the panel is as wide as
      // its longest item and no wider. It still never gets narrower than the
      // trigger it hangs off — a menu tucked inside its own button reads as a
      // mistake — and `styles.dropdown.maxWidth` still caps it.
      ...(autoSize ? { minWidth: autoSize.minWidth } : null),
    };

    const panel = (
        <ListGroup
          variant="default"
          size="sm"
          style={listGroupStyle}
        >
          {scrollable ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: resolvedMaxHeight }}
            >
              <ListGroupBody>{menuItems}</ListGroupBody>
            </ScrollView>
          ) : (
            <View style={{ maxHeight: resolvedMaxHeight, overflow: 'hidden' }}>
              <ListGroupBody>{menuItems}</ListGroupBody>
            </View>
          )}
        </ListGroup>
    );

    return (
      <MenuContext.Provider value={menuContextValueOpened}>
        {autoSize ? (
          // The overlay box is positioned from an *estimated* width, so a panel
          // that shrank to its content has slack on one side. Aligning it to
          // the edge the placement chose puts that slack where nobody looks:
          // an end-placed menu still lines its right edge up with the trigger.
          // `box-none` keeps the empty strip from eating outside clicks.
          <View pointerEvents="box-none" style={{ width: '100%', alignItems: autoSize.align }}>
            <View
              onLayout={(event) => {
                // First paint placed the menu from an estimated width; this is
                // the first moment the real one is known. Re-place only when
                // they differ, so a correct estimate costs nothing.
                const measured = event.nativeEvent.layout.width;
                if (!measured || Math.abs((measuredWidthRef.current ?? 0) - measured) < 1) return;
                measuredWidthRef.current = measured;
                repositionRef.current?.();
              }}
            >
              {panel}
            </View>
          </View>
        ) : panel}
      </MenuContext.Provider>
    );
  }, [menuItems, menuDropdownProps, styles.dropdown, dropdownSpacingStyles, maxH, menuContextValueOpened]);

  /**
   * Measure the trigger and work out where the menu belongs.
   *
   * Split out of `handleOpen` so the same computation can run again while the
   * menu is open — the menu is anchored to a trigger that scrolls with the page,
   * so its viewport coordinates go stale the moment anything scrolls.
   *
   * `retryOnEmpty` is wanted only on open, where a zero measurement means the
   * trigger hasn't laid out yet and is worth waiting for. On a reposition a zero
   * measurement means the trigger has been scrolled out of existence, and
   * blocking a scroll frame on a 100ms sleep would be the wrong answer.
   */
  const computeMenuGeometry = useCallback(async (
    opts?: { clientX?: number; clientY?: number; retryOnEmpty?: boolean }
  ) => {
    if (!menuItems) return null;

    const anchorRef = containerRef.current ? containerRef : triggerRef;
    const triggerRect = await measureElement(anchorRef);

    if (triggerRect.width === 0 && triggerRect.height === 0) {
      if (!opts?.retryOnEmpty) return null;
      await new Promise(resolve => setTimeout(resolve, 100));
      const retryRect = await measureElement(anchorRef);
      if (retryRect.width > 0 || retryRect.height > 0) {
        Object.assign(triggerRect, retryRect);
      }
    }

    // Height is derived from the actual items rather than assumed, so the side
    // choice is right the first time rather than being corrected after paint.
    const menuHeight = estimateMenuHeight(menuItems, maxH);
    // Two different widths. `resolvedWidth` is what the panel is told to be —
    // undefined under `auto`, so it lays out to its own content. `layoutWidth`
    // is what the positioner reasons about, which has to be a number; the
    // long-standing 200 estimate stays, and `buildMenuDropdown` absorbs the
    // difference by aligning the panel inside the box it produces.
    const isAutoWidth = w !== 'target' && typeof w !== 'number';
    const resolvedWidth = w === 'target' ? triggerRect.width : (typeof w === 'number' ? w : undefined);
    const layoutWidth = resolvedWidth ?? measuredWidthRef.current ?? 200;
    const overlaySize = { width: layoutWidth, height: menuHeight };

    // If contextmenu trigger, prefer cursor coordinates
    let positionResult: { x: number; y: number; placement?: PlacementType; maxHeight?: number; anchorEdge?: 'top' | 'bottom'; anchorOffset?: number };
    if (trigger === 'contextmenu') {
      const cursorX = opts?.clientX ?? lastPointerPosRef.current?.x ?? 0;
      const cursorY = opts?.clientY ?? lastPointerPosRef.current?.y ?? 0;
      // Basic viewport clamping (assume available via window for web)
      if (typeof window !== 'undefined') {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        positionResult = {
          x: Math.min(cursorX, vw - (overlaySize.width || 200) - 4),
          y: Math.min(cursorY, vh - overlaySize.height - 4),
        };
      } else {
        positionResult = { x: cursorX, y: cursorY };
      }
    } else {
      positionResult = calculateOverlayPositionEnhanced(triggerRect, overlaySize, {
        placement: position,
        offset,
        strategy: strategy === 'portal' ? 'fixed' : strategy,
        // Both the side choice and the height cap come from this.
        desiredHeight: menuHeight,
      });
    }

    // Never taller than the space the positioner found on the side it picked.
    const resolvedMaxHeight = typeof positionResult.maxHeight === 'number'
      ? Math.min(maxH, positionResult.maxHeight)
      : maxH;

    const autoSize = isAutoWidth
      ? { minWidth: triggerRect.width, align: alignForPlacement(positionResult.placement || position) }
      : undefined;

    return { positionResult, overlaySize, resolvedWidth, resolvedMaxHeight, autoSize };
  }, [menuItems, maxH, w, trigger, position, offset, strategy]);

  const handleOpen = useCallback(async (opts?: { clientX?: number; clientY?: number }) => {
    // Use ref to avoid stale isOpened value after async close from backdrop click
    if (disabled || isOpenedRef.current || !menuItems) return;

    try {
      // Add a small delay to ensure element is mounted
      await new Promise(resolve => setTimeout(resolve, 10));

      const geometry = await computeMenuGeometry({ ...opts, retryOnEmpty: true });
      if (!geometry) return;

      const { positionResult, overlaySize, resolvedWidth, resolvedMaxHeight, autoSize } = geometry;

      lastResolvedWidthRef.current = resolvedWidth;
      lastResolvedMaxHeightRef.current = resolvedMaxHeight;
      lastAutoSizeRef.current = autoSize;

      // Create menu dropdown content
      const menuDropdown = buildMenuDropdown(resolvedWidth, resolvedMaxHeight, autoSize);
      if (!menuDropdown) return;

      const overlayId = openOverlay({
        content: menuDropdown,
        anchor: { x: positionResult.x, y: positionResult.y, width: overlaySize.width, height: overlaySize.height },
        // Pin to the trigger-adjacent edge when the positioner supplied one, so
        // an upward-opening menu grows away from the trigger instead of having
        // its top edge computed from an assumed height.
        pinEdge: positionResult.anchorEdge,
        pinOffset: positionResult.anchorOffset,
        anchorNode: containerRef.current ?? triggerRef.current,
        placement: positionResult.placement || position,
        closeOnClickOutside,
        closeOnEscape,
        strategy,
        // Provide lightweight onClose that only resets state; actual closing is already in progress
        onClose: () => {
          overlayIdRef.current = null;
          setOpened(false);
          isOpenedRef.current = false;
          onClose?.();
        },
      });

      overlayIdRef.current = overlayId;
    setOpened(true);
    isOpenedRef.current = true;
      onOpen?.();
    } catch (error) {
      console.warn('Failed to open menu:', error);
    }
  }, [disabled, position, strategy, closeOnClickOutside, closeOnEscape, onOpen, menuItems, buildMenuDropdown, onClose, computeMenuGeometry, openOverlay]);

  /**
   * Keep an open menu docked to its trigger.
   *
   * Without this the menu is positioned once, at open, and holds those viewport
   * coordinates forever — scrolling the page slides the trigger away and leaves
   * the menu floating where the trigger used to be. Every other overlay in the
   * library tracks; this was the last one that didn't.
   *
   * Context menus are excluded on purpose: they are anchored to the point where
   * the pointer was, not to an element, so there is nothing to track them to.
   */
  useEffect(() => {
    if (Platform.OS !== 'web' || !isOpened || trigger === 'contextmenu') return;

    let frame: number | null = null;
    let cancelled = false;

    const reposition = async () => {
      if (cancelled) return;
      const geometry = await computeMenuGeometry();
      if (cancelled || !geometry || !overlayIdRef.current) return;

      const { positionResult, overlaySize, resolvedWidth, resolvedMaxHeight, autoSize } = geometry;
      lastResolvedWidthRef.current = resolvedWidth;
      lastResolvedMaxHeightRef.current = resolvedMaxHeight;
      lastAutoSizeRef.current = autoSize;

      // `updateOverlay` diffs before committing, so a scroll that doesn't move
      // the trigger costs a measurement and nothing more.
      updateOverlay(overlayIdRef.current, {
        anchor: { x: positionResult.x, y: positionResult.y, width: overlaySize.width, height: overlaySize.height },
        pinEdge: positionResult.anchorEdge,
        pinOffset: positionResult.anchorOffset,
      });
    };

    // Coalesced to one reposition per frame: the scroll listener is registered
    // in the capture phase so it fires for every scrolling ancestor.
    const handleUpdate = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        reposition();
      });
    };

    // `onLayout` on the panel calls this once it knows its real width, which is
    // the only moment the placement estimate can be corrected.
    repositionRef.current = handleUpdate;

    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    return () => {
      cancelled = true;
      repositionRef.current = null;
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [isOpened, trigger, computeMenuGeometry, updateOverlay]);

  // When menu content changes while open, update overlay content in place
  useEffect(() => {
    if (!isOpenedRef.current || !overlayIdRef.current) return;
    if (!menuItems) return;
    if (lastSignatureRef.current === menuItemsSignature) return; // no structural change
    lastSignatureRef.current = menuItemsSignature;
    // Different items, different width — the cached measurement is stale.
    measuredWidthRef.current = undefined;
    const currentId = overlayIdRef.current;
    const resolvedWidth = lastResolvedWidthRef.current ?? (typeof w === 'number' ? w : undefined);
    const menuDropdown = buildMenuDropdown(resolvedWidth, lastResolvedMaxHeightRef.current, lastAutoSizeRef.current);
    if (!menuDropdown) return;
    updateOverlay(currentId, {
      content: menuDropdown,
    });
  }, [menuItemsSignature, menuItems, updateOverlay, w, buildMenuDropdown]);

  const handleToggle = useCallback(() => {
    if (isOpenedRef.current) {
      handleClose();
    } else {
      handleOpen();
    }
  }, [handleOpen, handleClose]);

  // Find trigger element (first non-MenuDropdown child)
  const findTriggerElement = (children: ReactNode): React.ReactElement => {
    const childArray = React.Children.toArray(children);
    const triggerChild = childArray.find(child => 
      isValidElement(child) && child.type !== MenuDropdown
    );
    
    if (!triggerChild || !isValidElement(triggerChild)) {
      throw new Error('Menu must have a trigger element (non-MenuDropdown child)');
    }
    
    return triggerChild;
  };

  const triggerElement = findTriggerElement(children);
  
  // Create a callback ref that works better with React Native Web
  const triggerCallbackRef = useCallback((node: any) => {
    triggerRef.current = node;
    // console.log('Trigger ref set to:', node);
  }, []);
  
  const enhancedTrigger = isValidElement(triggerElement) 
    ? cloneElement(triggerElement, {
        ref: triggerCallbackRef,
        ...(triggerElement.props as any),
        ...(trigger === 'click' && { onPress: handleToggle }),
        ...(trigger === 'hover' && Platform.OS === 'web' && {
          onMouseEnter: handleOpen,
          onMouseLeave: handleClose,
        }),
        ...(trigger === 'contextmenu' && Platform.OS === 'web' && {
          onContextMenu: (e: any) => {
            e.preventDefault();
            lastPointerPosRef.current = { x: e.clientX, y: e.clientY };
            handleOpen({ clientX: e.clientX, clientY: e.clientY });
          },
        }),
        ...(disabled && { opacity: 0.5 }),
      })
    : triggerElement;

  // Create a callback ref that forwards to both internal and external refs
  const combinedRef = useCallback((node: View | null) => {
    containerRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      (ref as any).current = node;
    }
    // console.log('Combined ref set to:', node);
  }, [ref]);

  return (
    <MenuContext.Provider value={{ closeMenu: handleClose, opened: isOpened }}>
      <View 
        ref={combinedRef}
        style={getSpacingStyles(extractSpacingProps(spacingProps).spacingProps)} 
        testID={testID}
        {...(trigger === 'contextmenu' && Platform.OS === 'web'
          ? {
              onContextMenu: (e: any) => {
                // Ensure we intercept the native browser context menu
                if (e?.preventDefault) e.preventDefault();
                const x = (e?.clientX ?? 0);
                const y = (e?.clientY ?? 0);
                lastPointerPosRef.current = { x, y };
                handleOpen({ clientX: x, clientY: y });
              },
            }
          : {})}
        onLayout={() => {
          // Force a re-render to ensure ref is available
          if (containerRef.current) {
            // console.log('Menu container onLayout - container ref available:', containerRef.current);
          }
        }}
      >
        {enhancedTrigger}
      </View>
    </MenuContext.Provider>
  );
}

// Menu.Item component
function MenuItemBase(props: MenuItemProps, ref: React.Ref<View>) {
  const { spacingProps, otherProps } = extractSpacingProps(props as any);
  const {
    children,
    onPress,
    disabled = false,
    startSection,
    endSection,
    color = 'default',
    closeMenuOnClick = true,
    testID,
    ...restProps
  } = otherProps as MenuItemProps;

  const { closeMenu } = useMenuContext();

  const handlePress = useCallback(() => {
    if (disabled) return;
    onPress?.();
    if (closeMenuOnClick) closeMenu();
  }, [disabled, onPress, closeMenuOnClick, closeMenu]);

  const tone: 'default' | 'danger' | 'success' | 'warning' =
    color === 'danger'
      ? 'danger'
      : color === 'success'
        ? 'success'
        : color === 'warning'
          ? 'warning'
          : 'default';

  return (
    <MenuItemButton
      ref={ref as any}
      onPress={handlePress}
      disabled={disabled}
      startIcon={startSection}
      endIcon={endSection}
      tone={tone}
      testID={testID}
      {...spacingProps}
      {...restProps}
    >
      {children}
    </MenuItemButton>
  );
}

// Menu.Label component
function MenuLabelBase(props: MenuLabelProps, ref: React.Ref<View>) {
  const { children, testID, ...spacingProps } = props;
  const styles = useMenuStyles();
  const spacingStyles = getSpacingStyles(extractSpacingProps(spacingProps).spacingProps);

  return (
    <View ref={ref} style={[styles.label, spacingStyles]} testID={testID}>
      <Text variant="small" colorVariant="secondary">
        {children}
      </Text>
    </View>
  );
}

// Menu.Divider component
function MenuDividerBase(props: MenuDividerProps, ref: React.Ref<View>) {
  const { testID, ...spacingProps } = props;
  const styles = useMenuStyles();
  const spacingStyles = getSpacingStyles(extractSpacingProps(spacingProps).spacingProps);

  return (
    <View ref={ref} style={[styles.divider, spacingStyles]} testID={testID} />
  );
}

// Menu.Dropdown component - This is just a container, it doesn't render anything itself
function MenuDropdownBase(props: MenuDropdownProps, ref: React.Ref<View>) {
  // MenuDropdown doesn't render anything in the main tree
  // Its children are extracted and rendered in the overlay
  return null;
}

// Menu.Sub component — a flyout submenu, like nested context menus.
// Renders a trigger row inside the parent dropdown that opens its own overlay
// to the side (hover on web, press elsewhere). Nested overlays unmount as a
// cascade when any ancestor closes (see the unmount cleanup below), so selecting
// a leaf item or dismissing the root tears the whole chain down.
const SUBMENU_CLOSE_DELAY = 220;

function MenuSubBase(props: MenuSubProps, ref: React.Ref<View>) {
  const { spacingProps, otherProps } = extractSpacingProps(props as any);
  const {
    label,
    children,
    startSection,
    disabled = false,
    color = 'default',
    w = 200,
    maxH = 300,
    testID,
  } = otherProps as MenuSubProps;

  const parentContext = useMenuContext();
  const { openOverlay, closeOverlay, updateOverlay } = useOverlayApi();
  const styles = useMenuStyles();

  const itemRef = useRef<View>(null);
  const overlayIdRef = useRef<string | null>(null);
  const openRef = useRef(false);
  const closeTimerRef = useRef<any>(null);
  const [, forceOpenState] = useState(false);

  const tone: 'default' | 'danger' | 'success' | 'warning' =
    color === 'danger' ? 'danger' : color === 'success' ? 'success' : color === 'warning' ? 'warning' : 'default';

  const cancelScheduledClose = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const closeSelf = useCallback(() => {
    cancelScheduledClose();
    if (overlayIdRef.current) {
      closeOverlay(overlayIdRef.current);
      overlayIdRef.current = null;
    }
    openRef.current = false;
    forceOpenState(false);
  }, [cancelScheduledClose, closeOverlay]);

  // Selecting a leaf item closes this submenu *and* bubbles up so the whole chain
  // (including the root menu) dismisses.
  const closeChain = useCallback(() => {
    closeSelf();
    parentContext.closeMenu();
  }, [closeSelf, parentContext]);

  const scheduleClose = useCallback(() => {
    cancelScheduledClose();
    closeTimerRef.current = setTimeout(() => closeSelf(), SUBMENU_CLOSE_DELAY);
  }, [cancelScheduledClose, closeSelf]);

  const subContextValue = useMemo(
    () => ({ closeMenu: closeChain, opened: true }),
    [closeChain]
  );

  const buildSubContent = useCallback((resolvedWidth: number) => {
    const listGroupStyle: ViewStyle = {
      ...(styles.dropdown as any),
      maxHeight: maxH,
      width: resolvedWidth,
    };
    return (
      <MenuContext.Provider value={subContextValue}>
        <View
          {...(Platform.OS === 'web'
            ? { onMouseEnter: cancelScheduledClose, onMouseLeave: scheduleClose }
            : {})}
        >
          <ListGroup variant="default" size="sm" style={listGroupStyle}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: maxH }}
            >
              <ListGroupBody>{children}</ListGroupBody>
            </ScrollView>
          </ListGroup>
        </View>
      </MenuContext.Provider>
    );
  }, [styles.dropdown, maxH, subContextValue, children, cancelScheduledClose, scheduleClose]);

  const openSub = useCallback(async () => {
    if (disabled || openRef.current) return;
    openRef.current = true;

    const resolvedWidth = typeof w === 'number' ? w : 200;
    const triggerRect = await measureElement(itemRef);
    const subHeight = estimateMenuHeight(children, maxH);
    const overlaySize = { width: resolvedWidth, height: subHeight };
    const positionResult = calculateOverlayPositionEnhanced(triggerRect, overlaySize, {
      placement: 'right-start',
      offset: 2,
      strategy: Platform.OS === 'web' ? 'fixed' : 'absolute',
      fallbackPlacements: ['right-start', 'left-start', 'right', 'left'],
      desiredHeight: subHeight,
    });

    const overlayId = openOverlay({
      content: buildSubContent(resolvedWidth),
      anchor: { x: positionResult.x, y: positionResult.y, width: overlaySize.width, height: overlaySize.height },
      anchorNode: itemRef.current,
      placement: (positionResult as any).placement || 'right-start',
      closeOnClickOutside: true,
      closeOnEscape: true,
      strategy: Platform.OS === 'web' ? 'fixed' : 'portal',
      onClose: () => {
        overlayIdRef.current = null;
        openRef.current = false;
        forceOpenState(false);
      },
    });
    overlayIdRef.current = overlayId;
    forceOpenState(true);
  }, [disabled, w, maxH, buildSubContent, openOverlay]);

  // Keep the submenu content in sync when its children change while open.
  useEffect(() => {
    if (!openRef.current || !overlayIdRef.current) return;
    updateOverlay(overlayIdRef.current, { content: buildSubContent(typeof w === 'number' ? w : 200) });
  }, [buildSubContent, updateOverlay, w]);

  // Cascade cleanup: when an ancestor overlay closes, this component unmounts and
  // tears down its own overlay + timer.
  useEffect(() => () => {
    if (overlayIdRef.current) closeOverlay(overlayIdRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, [closeOverlay]);

  const combinedRef = useCallback((node: any) => {
    itemRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as any).current = node;
  }, [ref]);

  return (
    <MenuItemButton
      ref={combinedRef}
      onPress={() => (openRef.current ? closeSelf() : openSub())}
      disabled={disabled}
      startIcon={startSection}
      endIcon={<Icon name="chevron-right" size={16} />}
      tone={tone}
      testID={testID}
      {...spacingProps}
      {...(Platform.OS === 'web'
        ? {
            onHoverIn: () => {
              cancelScheduledClose();
              openSub();
            },
            onHoverOut: scheduleClose,
          }
        : {})}
    >
      {label}
    </MenuItemButton>
  );
}

// Create factory components
export const Menu = factory<MenuFactoryPayload>(MenuBase);
export const MenuItem = factory<{ props: MenuItemProps; ref: View }>(MenuItemBase);
export const MenuLabel = factory<{ props: MenuLabelProps; ref: View }>(MenuLabelBase);
export const MenuDivider = factory<{ props: MenuDividerProps; ref: View }>(MenuDividerBase);
export const MenuDropdown = factory<{ props: MenuDropdownProps; ref: View }>(MenuDropdownBase);
export const MenuSub = factory<{ props: MenuSubProps; ref: View }>(MenuSubBase);

// Add compound components with type assertion
(Menu as any).Item = MenuItem;
(Menu as any).Label = MenuLabel;
(Menu as any).Divider = MenuDivider;
(Menu as any).Dropdown = MenuDropdown;
(Menu as any).Sub = MenuSub;

Menu.displayName = 'Menu';
MenuItem.displayName = 'Menu.Item';
MenuLabel.displayName = 'Menu.Label';
MenuDivider.displayName = 'Menu.Divider';
MenuDropdown.displayName = 'Menu.Dropdown';
MenuSub.displayName = 'Menu.Sub';
