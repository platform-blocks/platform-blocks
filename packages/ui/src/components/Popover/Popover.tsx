import React, {
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View } from 'react-native';
import type { ViewProps, ViewStyle } from 'react-native';

import { factory, withStatics } from '../../core/factory';
import { resolveSurface } from '../../core/theme/surfaces';
import { useStyleProps } from '../../core/utils/spacing';
import { mergeRefs } from '../../core/utils/mergeRefs';
import { isWeb, webProps } from '../../core/platform';
import type { WebKeyboardEvent, WebMouseEvent } from '../../core/platform';
import { useFloating } from '../../core/overlay/useFloating';
import type { FloatingDismissReason } from '../../core/overlay/useFloating';
import { sanitizeId } from '../../core/overlay/useLayer';
import type { PlacementType } from '../../core/utils/positioning-enhanced';

import { createPopoverStyles } from './styles';
import type {
  PopoverProps,
  PopoverFactoryPayload,
  PopoverTargetProps,
  PopoverDropdownProps,
  RegisteredDropdown,
  ArrowPosition,
} from './types';
import { PlatformBlocksThemeProvider, useTheme } from '../../core/theme/ThemeProvider';
import { useControllableState } from '../../hooks/useControllableState';

interface PopoverContextValue {
  opened: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  hoverOpen: () => void;
  hoverClose: () => void;
  registerDropdown: (dropdown: RegisteredDropdown) => void;
  unregisterDropdown: () => void;
  /** Ref of the Target's wrapper view — the positioning anchor. */
  anchorRef: React.MutableRefObject<unknown>;
  setAnchor: (node: unknown) => void;
  /** Trigger ARIA props from useFloating (aria-expanded; web: aria-haspopup, aria-controls). */
  getTriggerAriaProps: () => Record<string, unknown>;
  targetId: string;
  dropdownId: string;
  withRoles: boolean;
  disabled: boolean;
  returnFocus: boolean;
  trigger: 'click' | 'hover';
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

/**
 * Inline fallback dropdown (no OverlayProvider), rendered by the Target next
 * to the trigger. A separate context so that a new element each render only
 * re-renders the Target — not Popover.Dropdown, which re-registers its content.
 */
const PopoverInlineFloatingContext = createContext<React.ReactNode>(null);

function usePopoverContext(component: string): PopoverContextValue {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error(`${component} must be used within Popover`);
  }
  return context;
}

type CloseReason = 'programmatic' | 'dismiss';

const DEFAULT_ARROW_SIZE = 7;
const HOVER_CLOSE_DELAY = 150;

const PopoverBase = (props: PopoverProps, ref: React.Ref<View>) => {
  const {
    children,
    opened: controlledOpened,
    defaultOpened = false,
    onChange,
    onOpen,
    onClose,
    onDismiss,
    trigger = 'click',
    disabled = false,
    closeOnClickOutside = true,
    closeOnEscape = true,
    trapFocus = false,
    keepMounted = false,
    returnFocus = true,
    w,
    miw: minW,
    mih: minH,
    maw: maxW,
    mah: maxH,
    radius,
    shadow,
    zIndex,
    position = 'bottom',
    offset = 8,
    floatingStrategy = 'fixed',
    middlewares,
    preventPositionChangeWhenVisible = false,
    viewport,
    keyboardAvoidance = true,
    fallbackPlacements,
    boundary,
    withRoles = true,
    id,
    withArrow = false,
    arrowSize = DEFAULT_ARROW_SIZE,
    arrowRadius = 0,
    arrowOffset = 5,
    arrowPosition = 'center',
    onPositionChange,
    testID,
    style,
    ...spacingProps
  } = props;

  const theme = useTheme();
  const spacingStyles = useStyleProps(spacingProps);

  const [opened, setOpened] = useControllableState<boolean>({
    value: controlledOpened,
    defaultValue: defaultOpened,
    finalValue: false,
    onChange,
  });
  const [dropdownState, setDropdownState] = useState<RegisteredDropdown | null>(null);
  const openedRef = useRef(opened);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    openedRef.current = opened;
  }, [opened]);

  // Cleanup hover timeout on unmount
  useEffect(() => () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  }, []);

  const resolvedOffset = typeof offset === 'number' ? offset : offset?.mainAxis ?? 8;
  const resolvedFlip = !preventPositionChangeWhenVisible && middlewares?.flip !== false;
  const resolvedShift = !preventPositionChangeWhenVisible && middlewares?.shift !== false;

  const commitOpen = useCallback(() => {
    if (openedRef.current || disabled) return;
    setOpened(true);
    onOpen?.();
    openedRef.current = true;
  }, [disabled, setOpened, onOpen]);

  const commitClose = useCallback((reason: CloseReason) => {
    if (!openedRef.current) return;
    setOpened(false);
    onClose?.();
    if (reason === 'dismiss') {
      onDismiss?.();
    }
    openedRef.current = false;
  }, [setOpened, onClose, onDismiss]);

  const openPopover = useCallback(() => {
    if (disabled) return;
    commitOpen();
  }, [commitOpen, disabled]);

  const closePopover = useCallback(() => {
    commitClose('programmatic');
  }, [commitClose]);

  const togglePopover = useCallback(() => {
    if (openedRef.current) {
      closePopover();
    } else {
      openPopover();
    }
  }, [closePopover, openPopover]);

  const handleDismiss = useCallback((reason: FloatingDismissReason) => {
    commitClose(reason === 'closed-externally' ? 'programmatic' : 'dismiss');
  }, [commitClose]);

  // Hover-specific handlers with delay to prevent glitching when moving between target and dropdown
  const handleHoverOpen = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    openPopover();
  }, [openPopover]);

  const handleHoverClose = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      closePopover();
      hoverTimeoutRef.current = null;
    }, HOVER_CLOSE_DELAY);
  }, [closePopover]);

  const generatedId = sanitizeId(useId());
  const targetId = id ? `${id}-target` : `popover-target-${generatedId}`;
  const dropdownId = id ? `${id}-dropdown` : `popover-dropdown-${generatedId}`;

  const containerProps = dropdownState?.containerProps as (Record<string, unknown> & { role?: ViewProps['role'] }) | undefined;
  const dropdownRole = containerProps?.role ?? 'dialog';
  const focusTrapped = trapFocus || !!dropdownState?.trapFocus;
  const isOpen = opened && !disabled && !!dropdownState;

  const floating = useFloating({
    opened: isOpen,
    onDismiss: handleDismiss,
    placement: position,
    offset: resolvedOffset,
    flip: resolvedFlip,
    shift: resolvedShift,
    matchWidth: w === 'target',
    strategy: floatingStrategy === 'absolute' ? 'absolute' : 'fixed',
    trigger,
    role: dropdownRole,
    withRoles,
    id: dropdownId,
    layer: 'popover',
    zIndex,
    closeOnEscape,
    closeOnOutsidePress: trigger === 'hover' ? false : closeOnClickOutside,
    trapFocus: focusTrapped,
    // Click-opened popovers take focus so keyboard users can reach the content
    // (it renders at the end of the tree). Without a trap, focus lands on the
    // dropdown itself — Tab then enters it — and no input autofocuses.
    autoFocus: trigger === 'click',
    initialFocus: focusTrapped ? 'first-tabbable' : 'container',
    restoreFocus: returnFocus,
    boundary,
    fallbackPlacements,
    viewport,
    keyboardAvoidance,
  });

  const positioningResult = floating.position;

  const popoverStyles = useMemo(() => createPopoverStyles(theme)({
    radius,
    shadow,
    arrowSize,
  }), [theme, radius, shadow, arrowSize]);

  const hoverHandlersRef = useRef({ open: handleHoverOpen, close: handleHoverClose });
  useEffect(() => {
    hoverHandlersRef.current = { open: handleHoverOpen, close: handleHoverClose };
  }, [handleHoverOpen, handleHoverClose]);

  // Report placement changes (e.g. after a flip) once the dropdown is placed.
  const lastReportedPlacementRef = useRef<PlacementType | null>(null);
  useEffect(() => {
    if (!isOpen) {
      lastReportedPlacementRef.current = null;
      return;
    }
    if (!positioningResult) return;
    if (lastReportedPlacementRef.current === floating.placement) return;
    lastReportedPlacementRef.current = floating.placement;
    onPositionChange?.(floating.placement);
  }, [isOpen, positioningResult, floating.placement, onPositionChange]);

  // Same sizing as before the move to useFloating: an explicit `w`, the
  // anchor width for 'target', otherwise the measured content width.
  const computedFinalWidth = positioningResult?.finalWidth && positioningResult.finalWidth > 0
    ? positioningResult.finalWidth
    : undefined;
  const widthOverride = typeof w === 'number' ? w : computedFinalWidth;

  const computedMaxHeight = positioningResult?.maxHeight;
  const resolvedMaxHeight = typeof maxH === 'number'
    ? (typeof computedMaxHeight === 'number' ? Math.min(maxH, computedMaxHeight) : maxH)
    : computedMaxHeight;

  let floatingElement: React.ReactNode = null;
  if (dropdownState) {
    const sizeStyles: Record<string, number> = {};
    if (typeof minW === 'number') sizeStyles.minWidth = minW;
    if (typeof minH === 'number') sizeStyles.minHeight = minH;
    if (typeof maxW === 'number') sizeStyles.maxWidth = maxW;
    if (typeof resolvedMaxHeight === 'number') sizeStyles.maxHeight = resolvedMaxHeight;

    // Hover handlers keep a hover popover open while the pointer moves onto it.
    const dropdownHoverHandlers = trigger === 'hover'
      ? webProps({
          onMouseEnter: () => hoverHandlersRef.current.open(),
          onMouseLeave: () => hoverHandlersRef.current.close(),
        })
      : null;

    const { role: _role, ...restContainerProps } = containerProps ?? {};
    void _role;

    const floatingProps = floating.getFloatingProps({
      ...restContainerProps,
      ...dropdownHoverHandlers,
      testID: dropdownState.testID,
      pointerEvents: trigger === 'hover' ? 'auto' : 'box-none',
      style: [popoverStyles.wrapper, widthOverride ? { width: widthOverride } : null],
    });

    const content = (
      <View {...(floatingProps as ViewProps)}>
        <View style={[popoverStyles.dropdown, dropdownState.style, sizeStyles]}>
          {dropdownState.content}
        </View>
        {withArrow && (
          <View style={getArrowStyle(floating.placement, arrowSize, arrowRadius, arrowOffset, arrowPosition, theme)} />
        )}
      </View>
    );

    floatingElement = floating.renderFloating(content, {
      width: widthOverride,
      maxHeight: resolvedMaxHeight,
    });
  }

  const registerDropdown = useCallback((dropdown: RegisteredDropdown) => {
    setDropdownState(dropdown);
  }, []);

  const unregisterDropdown = useCallback(() => {
    if (!keepMounted) {
      setDropdownState(null);
    }
  }, [keepMounted]);

  const { getReferenceProps, refs } = floating;
  const getTriggerAriaProps = useCallback(
    () => getReferenceProps({}, { ref: false }),
    [getReferenceProps]
  );

  // With an OverlayProvider the element above renders nothing where it is
  // mounted; without one it is the inline dropdown, which the Target renders
  // inside its wrapper so it sits next to the trigger.
  const inlineFloating = floating.hasOverlayProvider ? null : floatingElement;

  const contextValue = useMemo<PopoverContextValue>(() => ({
    opened,
    open: openPopover,
    close: closePopover,
    toggle: togglePopover,
    hoverOpen: handleHoverOpen,
    hoverClose: handleHoverClose,
    registerDropdown,
    unregisterDropdown,
    anchorRef: refs.reference,
    setAnchor: refs.setReference,
    getTriggerAriaProps,
    targetId,
    dropdownId,
    withRoles,
    disabled,
    returnFocus,
    trigger,
  }), [opened, openPopover, closePopover, togglePopover, handleHoverOpen, handleHoverClose, registerDropdown, unregisterDropdown, refs, getTriggerAriaProps, targetId, dropdownId, withRoles, disabled, returnFocus, trigger]);

  return (
    <PopoverContext.Provider value={contextValue}>
      <PopoverInlineFloatingContext.Provider value={inlineFloating}>
        <View ref={ref} style={[spacingStyles, style]} testID={testID}>
          {children}
          {floating.hasOverlayProvider ? floatingElement : null}
        </View>
      </PopoverInlineFloatingContext.Provider>
    </PopoverContext.Provider>
  );
};

type Handler = (...args: never[]) => void;

/** Handlers the Target chains: the child's own, then `targetProps`', then the popover's. */
interface TriggerHandlers {
  onPress?: Handler;
  onKeyDown?: (event: WebKeyboardEvent) => void;
  onMouseEnter?: (event: WebMouseEvent) => void;
  onMouseLeave?: (event: WebMouseEvent) => void;
  role?: string;
  ref?: React.Ref<unknown>;
}

function callAll<A extends unknown[]>(...handlers: Array<((...args: A) => void) | undefined>) {
  return (...args: A) => {
    handlers.forEach((handler) => handler?.(...args));
  };
}

const PopoverTargetBase = (props: PopoverTargetProps, ref: React.Ref<View>) => {
  const { children, popupType = 'dialog', refProp = 'ref', targetProps } = props;
  const context = usePopoverContext('Popover.Target');
  const inlineFloating = useContext(PopoverInlineFloatingContext);

  if (!isValidElement(children)) {
    throw new Error('Popover.Target expects a single React element child');
  }

  const childProps = children.props as TriggerHandlers;
  const sanitizedTargetProps: Record<string, unknown> & TriggerHandlers = { ...(targetProps ?? {}) };

  let externalTargetRef: React.Ref<unknown> | undefined;
  if (refProp && Object.prototype.hasOwnProperty.call(sanitizedTargetProps, refProp)) {
    externalTargetRef = sanitizedTargetProps[refProp] as React.Ref<unknown>;
    delete sanitizedTargetProps[refProp];
  }
  const targetHandlers = sanitizedTargetProps as TriggerHandlers;

  // aria-expanded everywhere; on web also role, aria-haspopup and an
  // aria-controls that points at the dropdown's real id while it is open.
  const accessibilityProps: Record<string, unknown> = context.withRoles
    ? {
        ...context.getTriggerAriaProps(),
        ...(isWeb ? { role: childProps.role ?? 'button', 'aria-haspopup': popupType } : null),
        id: context.targetId,
      }
    : { id: context.targetId };

  // React 19 made `ref` an ordinary prop; on 18 it still lives on the element and
  // reading `element.ref` on 19 logs a deprecation warning, so pick by version
  // (same as Tooltip) rather than probing both.
  const childRef: React.Ref<unknown> | undefined = parseInt(React.version, 10) >= 19
    ? childProps.ref
    : (children as unknown as { ref?: React.Ref<unknown> }).ref;
  const composedRef = mergeRefs<unknown>(childRef, externalTargetRef);

  const triggerHandlers: TriggerHandlers = {};
  let wrapperHoverHandlers: ReturnType<typeof webProps> | null = null;

  // Click trigger: toggle on press
  if (context.trigger === 'click') {
    triggerHandlers.onPress = callAll(targetHandlers.onPress, childProps.onPress, () => context.toggle());
  }

  // Hover trigger: open/close on pointer enter/leave (web), on the wrapper View
  // so the whole target counts.
  if (context.trigger === 'hover') {
    wrapperHoverHandlers = webProps({
      onMouseEnter: callAll(targetHandlers.onMouseEnter, childProps.onMouseEnter, () => context.hoverOpen()),
      onMouseLeave: callAll(targetHandlers.onMouseLeave, childProps.onMouseLeave, () => context.hoverClose()),
    });
  }

  // Escape is handled by the layer stack (topmost layer only), not here.
  if (isWeb) {
    triggerHandlers.onKeyDown = (event: WebKeyboardEvent) => {
      targetHandlers.onKeyDown?.(event);
      childProps.onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if ((event.key === 'Enter' || event.key === ' ') && !context.opened) {
        event.preventDefault();
        context.open();
      }
    };
  }

  // Remove handlers that we're overriding from sanitizedTargetProps
  if (context.trigger === 'click') delete sanitizedTargetProps.onPress;
  if (context.trigger === 'hover') {
    delete sanitizedTargetProps.onMouseEnter;
    delete sanitizedTargetProps.onMouseLeave;
  }
  delete sanitizedTargetProps.onKeyDown;

  const mergedProps: Record<string, unknown> = {
    ...sanitizedTargetProps,
    ...triggerHandlers,
    ...accessibilityProps,
    [refProp]: composedRef,
  };

  if (context.disabled) {
    mergedProps.disabled = true;
  }

  const anchorWrapperRef = mergeRefs<View>(context.setAnchor, ref);

  return (
    <View ref={anchorWrapperRef} collapsable={false} {...wrapperHoverHandlers}>
      {cloneElement(children, mergedProps)}
      {inlineFloating}
    </View>
  );
};

const PopoverDropdownBase = (props: PopoverDropdownProps, _ref: React.Ref<View>) => {
  const { children, trapFocus = false, keepMounted, style, testID, ...restProps } = props;
  const context = usePopoverContext('Popover.Dropdown');
  const theme = useTheme();
  // `rest` is a new object every render; keep its identity while its contents
  // are unchanged so an unrelated re-render doesn't re-register the dropdown.
  const rest = useShallowStable(restProps);

  const dropdownValue = useMemo<RegisteredDropdown>(() => ({
    content: (
      <PlatformBlocksThemeProvider theme={theme} inherit>
        {children}
      </PlatformBlocksThemeProvider>
    ),
    style,
    trapFocus,
    keepMounted,
    testID,
    containerProps: rest,
  }), [children, rest, style, trapFocus, keepMounted, testID, theme]);

  useEffect(() => {
    context.registerDropdown(dropdownValue);
    return () => context.unregisterDropdown();
  }, [context, dropdownValue]);

  if (keepMounted) {
    return (
      <View style={{ display: 'none' }}>
        {children}
      </View>
    );
  }

  return null;
};

function useShallowStable<T extends Record<string, unknown>>(value: T): T {
  const ref = useRef(value);
  const previous = ref.current;
  const keys = Object.keys(value);
  const same = keys.length === Object.keys(previous).length
    && keys.every((key) => Object.is(previous[key], value[key]));
  if (!same) ref.current = value;
  return same ? previous : value;
}

function getArrowStyle(
  placement: PlacementType,
  arrowSize: number,
  arrowRadius: number,
  arrowOffset: number,
  arrowPosition: ArrowPosition,
  theme: ReturnType<typeof useTheme>
): ViewStyle {
  if (!isWeb) {
    return HIDDEN_ARROW;
  }
  // Web only, so CSS `calc()` offsets are fine here.
  const edge = (value: string | number) => value as ViewStyle['left'];
  // Same level-2 token the dropdown uses — the arrow is a continuation of that
  // surface, so it has to resolve identically.
  const arrowSurface = resolveSurface(theme, 2);
  const base: ViewStyle = {
    position: 'absolute',
    width: arrowSize * 2,
    height: arrowSize * 2,
    backgroundColor: arrowSurface.background,
    transform: [{ rotate: '45deg' }],
    borderRadius: arrowRadius,
    borderColor: arrowSurface.border,
    borderWidth: 1,
  };

  // `placement` is physical (already mirrored for RTL by useFloating).
  const [side, alignment] = placement.split('-') as [PlacementType, string | undefined];

  switch (side) {
    case 'top':
      // Arrow points down, hide the borders that overlap with content (top-left corner after rotation)
      return {
        ...base,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        bottom: -arrowSize,
        left: edge(alignment === 'end'
          ? `calc(100% - ${(arrowPosition === 'side' ? arrowOffset : arrowSize)}px)`
          : alignment === 'start'
            ? (arrowPosition === 'side' ? arrowOffset : arrowSize)
            : '50%'),
        marginLeft: alignment || arrowPosition === 'side' ? 0 : -arrowSize,
      };
    case 'bottom':
      // Arrow points up, hide the borders that overlap with content (bottom-right corner after rotation)
      return {
        ...base,
        borderBottomWidth: 0,
        borderRightWidth: 0,
        top: -arrowSize,
        left: edge(alignment === 'end'
          ? `calc(100% - ${(arrowPosition === 'side' ? arrowOffset : arrowSize)}px)`
          : alignment === 'start'
            ? (arrowPosition === 'side' ? arrowOffset : arrowSize)
            : '50%'),
        marginLeft: alignment || arrowPosition === 'side' ? 0 : -arrowSize,
      };
    case 'left':
      // Arrow points right, hide the borders that overlap with content (bottom-left corner after rotation)
      return {
        ...base,
        borderBottomWidth: 0,
        borderLeftWidth: 0,
        right: -arrowSize,
        top: edge(alignment === 'end'
          ? `calc(100% - ${(arrowPosition === 'side' ? arrowOffset : arrowSize)}px)`
          : alignment === 'start'
            ? (arrowPosition === 'side' ? arrowOffset : arrowSize)
            : '50%'),
        marginTop: alignment || arrowPosition === 'side' ? 0 : -arrowSize,
      };
    case 'right':
      // Arrow points left, hide the borders that overlap with content (top-right corner after rotation)
      return {
        ...base,
        borderTopWidth: 0,
        borderRightWidth: 0,
        left: -arrowSize,
        top: edge(alignment === 'end'
          ? `calc(100% - ${(arrowPosition === 'side' ? arrowOffset : arrowSize)}px)`
          : alignment === 'start'
            ? (arrowPosition === 'side' ? arrowOffset : arrowSize)
            : '50%'),
        marginTop: alignment || arrowPosition === 'side' ? 0 : -arrowSize,
      };
    default:
      return base;
  }
}

const HIDDEN_ARROW: ViewStyle = { width: 0, height: 0, opacity: 0 };

const PopoverComponent = factory<PopoverFactoryPayload>(PopoverBase, { displayName: 'Popover' });
const PopoverTarget = factory<{ props: PopoverTargetProps; ref: View }>(PopoverTargetBase, { displayName: 'Popover.Target' });
const PopoverDropdown = factory<{ props: PopoverDropdownProps; ref: View }>(PopoverDropdownBase, { displayName: 'Popover.Dropdown' });

/** Floating content anchored to a target. Compound parts: `Popover.Target`, `Popover.Dropdown`. */
const Popover = withStatics(PopoverComponent, {
  Target: PopoverTarget,
  Dropdown: PopoverDropdown,
});

export { Popover };
