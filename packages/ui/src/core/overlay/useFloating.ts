import React, { useCallback, useEffect, useId, useMemo, useRef } from 'react';
import type { MutableRefObject, ReactElement, ReactNode, Ref, RefObject } from 'react';
import type { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';

import { usePopoverPositioning } from '../hooks/usePopoverPositioning';
import { useLatestCallback } from '../hooks/useLatestCallback';
import { useOptionalOverlayApi } from '../providers/OverlayProvider';
import type { OverlayLayerOptions } from '../providers/OverlayProvider';
import { useTheme } from '../theme/ThemeProvider';
import { getZIndex } from '../theme/zIndices';
import { isWeb } from '../platform';
import { warnOnce } from '../utils/logger';
import { mergeRefs } from '../utils/mergeRefs';
import type { PlacementType, PositioningOptions, PositionResult } from '../utils/positioning-enhanced';
import { FloatingPortal } from './FloatingPortal';
import type { FloatingDismissReason, FloatingPortalState, FloatingRenderOptions } from './FloatingPortal';
import { resolvePlacementForDirection, useIsRTL } from './placement';
import { sanitizeId, useParentLayerId } from './useLayer';

export type { FloatingDismissReason, FloatingRenderOptions };

/** z-index layer of the theme scale a floating element sits on. */
export type FloatingLayer = 'dropdown' | 'popover' | 'tooltip';

/** Value of the trigger's `aria-haspopup`. */
export type FloatingPopupType = 'dialog' | 'menu' | 'listbox' | 'tree' | 'grid' | boolean;

export type FloatingTrigger = 'click' | 'hover' | 'focus' | 'contextmenu' | 'manual';

export interface UseFloatingOptions {
  /** Whether the floating element is open. */
  opened: boolean;
  /** Escape / Android back / outside press (or an external close) asked it to close. */
  onDismiss?: (reason: FloatingDismissReason) => void;
  /**
   * Placement relative to the anchor, written for LTR: in RTL `left`/`right`
   * and the `-start`/`-end` alignment of `top`/`bottom` are mirrored.
   * @default 'bottom'
   */
  placement?: PlacementType;
  /** Gap between anchor and floating element, px. @default 8 */
  offset?: number;
  /** Flip to the opposite side when it doesn't fit. @default true */
  flip?: boolean;
  /** Shift along the anchor to stay in the viewport. @default true */
  shift?: boolean;
  /** Match the anchor's width. @default false */
  matchWidth?: boolean;
  /**
   * 'fixed' (default): web `position: fixed`; native plain view in the nearest
   * overlay renderer. 'absolute': web `position: absolute`. 'portal': native
   * RN Modal at the app root (inside an OverlayHost it is a plain view).
   */
  strategy?: 'fixed' | 'absolute' | 'portal';
  /** What opens it. Hover/focus-triggered elements don't take focus or close on outside press. @default 'click' */
  trigger?: FloatingTrigger;
  /** Modal: traps focus, blocks layers below from Escape/back/outside press. @default false */
  modal?: boolean;
  /** Role of the floating element. `null` for none. @default 'dialog' */
  role?: string | null;
  /** The trigger's `aria-haspopup`. @default derived from `role` ('menu', 'listbox', 'tree', 'grid', else 'dialog') */
  popupType?: FloatingPopupType;
  /** Emit role/aria-* props at all. @default true */
  withRoles?: boolean;
  /** id of the floating element (the trigger's `aria-controls` target). @default generated */
  id?: string;
  /** Theme z-index layer. @default 'popover' */
  layer?: FloatingLayer;
  /** Explicit z-index (overrides `layer`). */
  zIndex?: number;
  /** @default true */
  closeOnEscape?: boolean;
  /** @default closeOnEscape */
  closeOnBack?: boolean;
  /** @default true, false for hover/focus triggers */
  closeOnOutsidePress?: boolean;
  /** Trap Tab inside the floating element (web). @default modal */
  trapFocus?: boolean;
  /** Move focus into the floating element on open. @default true for click/contextmenu/manual triggers */
  autoFocus?: boolean;
  /** @default 'first-tabbable' when trapping focus, otherwise 'container' */
  initialFocus?: 'first-tabbable' | 'container';
  initialFocusRef?: RefObject<unknown>;
  /** Return focus on close (when focus is still inside). @default true */
  restoreFocus?: boolean;
  /**
   * Where focus returns on close when `restoreFocus` is on — e.g. an input
   * that should get focus back instead of the anchor. @default the anchor (reference)
   */
  restoreFocusRef?: RefObject<unknown>;
  /** Minimum distance from the viewport edges, px. */
  boundary?: number;
  /** Placements to try when the preferred one doesn't fit (mirrored in RTL too). */
  fallbackPlacements?: PlacementType[];
  viewport?: PositioningOptions['viewport'];
  /** Avoid the on-screen keyboard. @default true */
  keyboardAvoidance?: boolean;
  /** Expected height before measuring, so the first frame picks the right side. */
  desiredHeight?: number;
  /** Reposition on scroll / resize / rotation. @default true */
  autoUpdate?: boolean;
  /** Layout direction override. @default DirectionProvider / platform */
  direction?: 'ltr' | 'rtl';
}

type AnyProps = Record<string, unknown>;

export interface FloatingRefs {
  /**
   * The anchor (measured for positioning, exempt from outside press, focus
   * returns to it): a host view / DOM node, or a point anchor (`createPointAnchor`).
   */
  reference: MutableRefObject<unknown>;
  /** The floating element (measured for its size, focus container). */
  floating: MutableRefObject<unknown>;
  setReference: (node: unknown) => void;
  setFloating: (node: unknown) => void;
}

export interface UseFloatingReturn {
  opened: boolean;
  /** id carried by the floating element. */
  floatingId: string;
  /** Physical placement on screen (after RTL mirroring and flipping). */
  placement: PlacementType;
  position: PositionResult | null;
  /** True once the floating element has been measured and placed. */
  isPositioned: boolean;
  zIndex: number;
  /** False when rendering inline because no OverlayProvider is mounted. */
  hasOverlayProvider: boolean;
  refs: FloatingRefs;
  /**
   * Props for the trigger: `aria-haspopup` / `aria-expanded` / `aria-controls`
   * (web; native gets `aria-expanded`) and the reference ref. Pass
   * `{ ref: false }` to omit the ref when another element is the anchor.
   */
  getReferenceProps: (userProps?: AnyProps, options?: { ref?: boolean }) => AnyProps;
  /** Props for the floating element: `id`, `role`, `aria-modal`, ref, `onLayout`, `style`. */
  getFloatingProps: (userProps?: AnyProps) => AnyProps;
  /** Re-measure and reposition now. */
  update: () => Promise<void>;
  /**
   * Returns an element to render anywhere in the component: it opens `content`
   * in the nearest overlay host while open (rendering nothing itself), or
   * renders it inline next to the anchor when there is no OverlayProvider.
   */
  renderFloating: (content: ReactNode, options?: FloatingRenderOptions) => ReactElement | null;
}

function popupTypeForRole(role: string | null | undefined): FloatingPopupType {
  if (role === 'menu' || role === 'listbox' || role === 'tree' || role === 'grid') return role;
  return 'dialog';
}

/**
 * The anchored-overlay primitive: positions a floating element next to an
 * anchor, opens it through the nearest overlay host, registers it in the
 * layer stack (Escape / back / outside press / focus), and returns the ARIA
 * wiring for trigger and floating element.
 *
 * @example
 * const floating = useFloating({ opened, onDismiss: () => setOpened(false), placement: 'bottom-start' });
 * return (
 *   <>
 *     <Pressable {...floating.getReferenceProps()} onPress={() => setOpened(o => !o)}>…</Pressable>
 *     {floating.renderFloating(<View {...floating.getFloatingProps({ style: styles.card })}>…</View>)}
 *   </>
 * );
 */
export function useFloating(options: UseFloatingOptions): UseFloatingReturn {
  const {
    opened,
    placement = 'bottom',
    offset = 8,
    flip = true,
    shift = true,
    matchWidth = false,
    strategy = 'fixed',
    trigger = 'click',
    modal = false,
    role = 'dialog',
    withRoles = true,
    layer = 'popover',
    closeOnEscape = true,
    boundary,
    fallbackPlacements,
    viewport,
    keyboardAvoidance = true,
    desiredHeight,
    autoUpdate = true,
  } = options;

  const theme = useTheme();
  const overlayApi = useOptionalOverlayApi();
  const hasOverlayProvider = !!overlayApi;
  // Only worth a warning once something actually opens without a provider —
  // a closed Tooltip/Menu in a provider-less test or story is harmless.
  useEffect(() => {
    if (!opened || hasOverlayProvider) return;
    warnOnce(
      'useFloating:no-provider',
      '[plocks] An overlay (Popover, Menu, …) was opened outside an OverlayProvider; it renders inline ' +
        'without flipping or viewport clamping. Wrap the app in <PlocksProvider> (or <OverlayProvider> + <OverlayRenderer />).'
    );
  }, [opened, hasOverlayProvider]);

  const parentLayerId = useParentLayerId();
  const contextIsRTL = useIsRTL();
  const isRTL = options.direction ? options.direction === 'rtl' : contextIsRTL;

  const generatedId = useId();
  const floatingId = options.id ?? `plocks-floating-${sanitizeId(generatedId)}`;
  const zIndex = options.zIndex ?? getZIndex(theme, layer);

  const isPointerTrigger = trigger === 'hover' || trigger === 'focus';
  const trapFocus = options.trapFocus ?? modal;
  const closeOnOutsidePress = options.closeOnOutsidePress ?? !isPointerTrigger;
  const autoFocus = options.autoFocus ?? !isPointerTrigger;
  const initialFocus = options.initialFocus ?? (trapFocus ? 'first-tabbable' : 'container');
  const restoreFocus = options.restoreFocus ?? true;
  const closeOnBack = options.closeOnBack ?? closeOnEscape;

  const {
    position,
    anchorRef,
    popoverRef,
    updatePosition,
  } = usePopoverPositioning<unknown, unknown>(opened && hasOverlayProvider, {
    placement,
    fallbackPlacements,
    direction: isRTL ? 'rtl' : 'ltr',
    offset,
    flip,
    shift,
    boundary,
    viewport,
    keyboardAvoidance,
    desiredHeight,
    autoUpdate,
    matchAnchorWidth: matchWidth,
    strategy: strategy === 'absolute' ? 'absolute' : 'fixed',
  });

  const isPositioned = !!position && (position as PositionResult & { _hasMeasuredPopover?: boolean })._hasMeasuredPopover === true;
  const physicalPlacement = position?.placement ?? resolvePlacementForDirection(placement, isRTL);

  // --- re-measure when the floating element's size changes -----------------
  const lastSizeRef = useRef<{ width: number; height: number } | null>(null);
  const frameRef = useRef<number | null>(null);
  const scheduleUpdate = useCallback(() => {
    if (frameRef.current !== null) return;
    const run = () => {
      frameRef.current = null;
      void updatePosition({ silent: true });
    };
    if (typeof requestAnimationFrame === 'function') {
      frameRef.current = requestAnimationFrame(run) as unknown as number;
    } else {
      frameRef.current = setTimeout(run, 16) as unknown as number;
    }
  }, [updatePosition]);

  useEffect(() => {
    if (!opened) lastSizeRef.current = null;
  }, [opened]);

  useEffect(() => () => {
    if (frameRef.current !== null && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(frameRef.current);
    }
  }, []);

  const handleFloatingLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    const last = lastSizeRef.current;
    if (last && last.width === width && last.height === height) return;
    lastSizeRef.current = { width, height };
    scheduleUpdate();
  }, [scheduleUpdate]);

  // --- refs -------------------------------------------------------------------
  const setReference = useCallback((node: unknown) => {
    anchorRef.current = node;
  }, [anchorRef]);
  const setFloating = useCallback((node: unknown) => {
    popoverRef.current = node;
  }, [popoverRef]);

  const refs = useMemo<FloatingRefs>(() => ({
    reference: anchorRef as MutableRefObject<unknown>,
    floating: popoverRef as MutableRefObject<unknown>,
    setReference,
    setFloating,
  }), [anchorRef, popoverRef, setReference, setFloating]);

  // --- dismissal ----------------------------------------------------------------
  const onDismissRequest = useLatestCallback((reason: FloatingDismissReason) => {
    options.onDismiss?.(reason);
  }) as (reason: FloatingDismissReason) => void;

  const layerOptions = useMemo<OverlayLayerOptions>(() => ({
    closeOnEscape,
    closeOnBack,
    closeOnOutsidePress,
    modal,
    trapFocus,
    autoFocus,
    initialFocus,
    initialFocusRef: options.initialFocusRef,
    restoreFocus,
    restoreFocusRef: options.restoreFocusRef ?? (anchorRef as RefObject<unknown>),
  }), [closeOnEscape, closeOnBack, closeOnOutsidePress, modal, trapFocus, autoFocus, initialFocus, options.initialFocusRef, restoreFocus, options.restoreFocusRef, anchorRef]);

  const portalState = useMemo<FloatingPortalState>(() => ({
    opened,
    position,
    requestedPlacement: placement,
    offset,
    matchWidth,
    zIndex,
    strategy,
    trigger,
    layer: layerOptions,
    anchorRef: anchorRef as MutableRefObject<unknown>,
    parentLayerId,
    onDismissRequest,
  }), [opened, position, placement, offset, matchWidth, zIndex, strategy, trigger, layerOptions, anchorRef, parentLayerId, onDismissRequest]);

  // --- prop getters -----------------------------------------------------------
  const popupType = options.popupType ?? popupTypeForRole(role);

  const getReferenceProps = useCallback((userProps: AnyProps = {}, getterOptions?: { ref?: boolean }): AnyProps => {
    const props: AnyProps = { ...userProps };
    if (getterOptions?.ref !== false) {
      const userRef = userProps.ref as Ref<unknown> | undefined;
      props.ref = userRef ? mergeRefs<unknown>(setReference, userRef) : setReference;
    }
    if (withRoles) {
      props['aria-expanded'] = opened;
      if (isWeb) {
        props['aria-haspopup'] = popupType;
        props['aria-controls'] = opened ? floatingId : undefined;
      }
    }
    return props;
  }, [setReference, withRoles, opened, popupType, floatingId]);

  const getFloatingProps = useCallback((userProps: AnyProps = {}): AnyProps => {
    const userRef = userProps.ref as Ref<unknown> | undefined;
    const userOnLayout = userProps.onLayout as ((event: LayoutChangeEvent) => void) | undefined;
    // Web: keep it invisible until measured, so it never paints at a guessed spot.
    const hidden = isWeb && hasOverlayProvider && !isPositioned;
    return {
      ...userProps,
      ref: userRef ? mergeRefs<unknown>(setFloating, userRef) : setFloating,
      id: floatingId,
      nativeID: floatingId,
      ...(withRoles && role ? { role } : null),
      ...(withRoles && modal ? { 'aria-modal': true } : null),
      onLayout: (event: LayoutChangeEvent) => {
        userOnLayout?.(event);
        handleFloatingLayout(event);
      },
      style: hidden
        ? [userProps.style as StyleProp<ViewStyle>, HIDDEN_STYLE]
        : userProps.style,
    };
  }, [setFloating, floatingId, withRoles, role, modal, handleFloatingLayout, hasOverlayProvider, isPositioned]);

  const renderFloating = useCallback((content: ReactNode, renderOptions?: FloatingRenderOptions) => (
    React.createElement(FloatingPortal, { state: portalState, content, renderOptions })
  ), [portalState]);

  return useMemo<UseFloatingReturn>(() => ({
    opened,
    floatingId,
    placement: physicalPlacement,
    position,
    isPositioned,
    zIndex,
    hasOverlayProvider,
    refs,
    getReferenceProps,
    getFloatingProps,
    update: () => updatePosition(),
    renderFloating,
  }), [opened, floatingId, physicalPlacement, position, isPositioned, zIndex, hasOverlayProvider, refs, getReferenceProps, getFloatingProps, updatePosition, renderFloating]);
}

const HIDDEN_STYLE: ViewStyle = { opacity: 0 };
