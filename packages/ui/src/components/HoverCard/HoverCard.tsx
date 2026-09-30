import React, { cloneElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Ref } from 'react';
import { View } from 'react-native';
import type { GestureResponderEvent, NativeSyntheticEvent, TargetedEvent, ViewStyle } from 'react-native';

import { factory } from '../../core/factory';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveSurface } from '../../core/theme/surfaces';
import { resolveRadius, resolveShadow, resolveSpacing } from '../../core/theme/tokens';
import { useMergedRef } from '../../core/utils/mergeRefs';
import { useStyleProps } from '../../core/utils/spacing';
import { isNative, isWeb, webProps } from '../../core/platform';
import type { WebMouseEvent } from '../../core/platform';
import { useFloating } from '../../core/overlay/useFloating';
import { resolvePlacementForDirection, useIsRTL } from '../../core/overlay/placement';
import { useLatestCallback } from '../../core/hooks/useLatestCallback';
import type { PlacementType } from '../../core/utils/positioning-enhanced';
import type { HoverCardProps, HoverCardFactoryPayload } from './types';

const ARROW_SIZE = 6;
/** Distance of the arrow from the card's start / top edge. */
const ARROW_INSET = 12;

/** Handlers a target may carry that the card chains onto. */
interface TargetProps {
  onPress?: (event: GestureResponderEvent) => void;
  onFocus?: (event: NativeSyntheticEvent<TargetedEvent>) => void;
  onBlur?: (event: NativeSyntheticEvent<TargetedEvent>) => void;
  onHoverIn?: (event: unknown) => void;
  onHoverOut?: (event: unknown) => void;
  onMouseEnter?: (event: WebMouseEvent) => void;
  onMouseLeave?: (event: WebMouseEvent) => void;
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

/**
 * Border-triangle arrow on the card edge facing the target. `placement` is
 * physical; mirroring it again (its own inverse) gives the logical side, which
 * maps onto start/end keys that RN's RTL swap and the web's `dir` both honour.
 */
function getArrowStyle(placement: PlacementType, color: string, isRTL: boolean): ViewStyle {
  const side = resolvePlacementForDirection(placement, isRTL).split('-')[0];
  const base: ViewStyle = { position: 'absolute', width: 0, height: 0 };
  switch (side) {
    case 'top':
      return {
        ...base,
        top: '100%',
        start: ARROW_INSET,
        borderStartWidth: ARROW_SIZE,
        borderEndWidth: ARROW_SIZE,
        borderTopWidth: ARROW_SIZE,
        borderStartColor: 'transparent',
        borderEndColor: 'transparent',
        borderTopColor: color,
      };
    case 'left':
      // Card on the target's start side: the arrow sits past its end edge.
      return {
        ...base,
        start: '100%',
        top: ARROW_INSET,
        borderTopWidth: ARROW_SIZE,
        borderBottomWidth: ARROW_SIZE,
        borderStartWidth: ARROW_SIZE,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderStartColor: color,
      };
    case 'right':
      // Card on the target's end side: the arrow sits past its start edge.
      return {
        ...base,
        end: '100%',
        top: ARROW_INSET,
        borderTopWidth: ARROW_SIZE,
        borderBottomWidth: ARROW_SIZE,
        borderEndWidth: ARROW_SIZE,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderEndColor: color,
      };
    case 'bottom':
    default:
      return {
        ...base,
        bottom: '100%',
        start: ARROW_INSET,
        borderStartWidth: ARROW_SIZE,
        borderEndWidth: ARROW_SIZE,
        borderBottomWidth: ARROW_SIZE,
        borderStartColor: 'transparent',
        borderEndColor: 'transparent',
        borderBottomColor: color,
      };
  }
}

/** A hover- (or press-) activated floating card anchored to its target. */
function HoverCardBase(props: HoverCardProps, ref: Ref<View>) {
  const {
    children,
    target,
    position = 'bottom',
    offset = 8,
    openDelay = 100,
    closeDelay = 150,
    opened: controlledOpened,
    defaultOpened = false,
    shadow = 'md',
    radius = 'md',
    w,
    withArrow = false,
    closeOnEscape = true,
    onOpen,
    onClose,
    disabled = false,
    style,
    testID,
    zIndex,
    trigger = 'hover',
    strategy = isWeb ? 'fixed' : 'portal',
    ...spacingProps
  } = props;

  const theme = useTheme();
  const isRTL = useIsRTL();
  const spacingStyles = useStyleProps(spacingProps);

  const [uncontrolledOpened, setUncontrolledOpened] = useState(defaultOpened);
  const isControlled = controlledOpened !== undefined;
  const opened = isControlled ? controlledOpened : uncontrolledOpened;
  const isOpen = opened && !disabled;

  const onOpenLatest = useLatestCallback(onOpen);
  const onCloseLatest = useLatestCallback(onClose);
  const openedRef = useRef(opened);
  useEffect(() => {
    openedRef.current = opened;
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);
  useEffect(() => clearTimer, [clearTimer]);

  const setOpened = useCallback((next: boolean) => {
    if (next && disabled) return;
    if (openedRef.current === next) return;
    openedRef.current = next;
    if (!isControlled) setUncontrolledOpened(next);
    if (next) onOpenLatest();
    else onCloseLatest();
  }, [disabled, isControlled, onOpenLatest, onCloseLatest]);

  const openNow = useCallback(() => {
    clearTimer();
    setOpened(true);
  }, [clearTimer, setOpened]);
  const closeNow = useCallback(() => {
    clearTimer();
    setOpened(false);
  }, [clearTimer, setOpened]);
  const scheduleOpen = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setOpened(true);
    }, openDelay);
  }, [clearTimer, setOpened, openDelay]);
  const scheduleClose = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setOpened(false);
    }, closeDelay);
  }, [clearTimer, setOpened, closeDelay]);
  const toggle = useCallback(() => {
    if (openedRef.current) closeNow();
    else openNow();
  }, [closeNow, openNow]);

  const isHover = trigger === 'hover';
  const floating = useFloating({
    opened: isOpen,
    onDismiss: closeNow,
    placement: position === 'auto' ? 'auto' : position,
    offset: offset + (withArrow ? ARROW_SIZE : 0),
    strategy,
    trigger: isHover ? 'hover' : 'click',
    role: 'dialog',
    zIndex,
    closeOnEscape,
    // Touch has no hover: a tap elsewhere is the natural way to dismiss it.
    closeOnOutsidePress: !isHover || isNative,
    restoreFocus: true,
  });

  // --- anchor: the target when it forwards a ref, else the wrapper ------------------
  const { refs } = floating;
  const targetNodeRef = useRef<unknown>(null);
  const setTargetNode = useCallback((node: unknown) => {
    targetNodeRef.current = node;
    if (node) refs.setReference(node);
  }, [refs]);
  const setWrapperNode = useCallback((node: unknown) => {
    if (node && !targetNodeRef.current) refs.setReference(node);
  }, [refs]);
  const wrapperRef = useMergedRef<View>(ref, setWrapperNode);

  const targetProps = (target.props ?? {}) as TargetProps;
  const targetRef: Ref<unknown> | undefined = parseInt(React.version, 10) >= 19
    ? (targetProps as { ref?: Ref<unknown> }).ref
    : (target as unknown as { ref?: Ref<unknown> }).ref;
  const mergedTargetRef = useMergedRef<unknown>(targetRef, setTargetNode);

  const overrides: Record<string, unknown> = {
    ref: mergedTargetRef,
    ...floating.getReferenceProps({}, { ref: false }),
  };
  if (!isHover || isNative) {
    // Click trigger, and hover's touch fallback: a press toggles it.
    overrides.onPress = chain(targetProps.onPress, toggle);
  }
  if (isHover && isWeb) {
    Object.assign(overrides, webProps({
      onMouseEnter: chain(targetProps.onMouseEnter, scheduleOpen),
      onMouseLeave: chain(targetProps.onMouseLeave, scheduleClose),
    }));
    overrides.onHoverIn = chain(targetProps.onHoverIn, scheduleOpen);
    overrides.onHoverOut = chain(targetProps.onHoverOut, scheduleClose);
  }
  if (isHover) {
    // Keyboard users get the same card when the target takes focus.
    overrides.onFocus = chain(targetProps.onFocus, scheduleOpen);
    overrides.onBlur = chain(targetProps.onBlur, scheduleClose);
  }
  if (disabled) overrides.disabled = true;
  const enhancedTarget = cloneElement(target, overrides);

  // --- card ------------------------------------------------------------------------
  // Level 2 of the elevation ladder, like every surface floating over content.
  const surface = resolveSurface(theme, 2);
  const cardStyle = useMemo<ViewStyle>(() => ({
    backgroundColor: surface.background,
    borderColor: surface.border,
    borderWidth: 1,
    borderRadius: resolveRadius(theme, radius),
    paddingHorizontal: resolveSpacing(theme, 'md') as number,
    paddingVertical: resolveSpacing(theme, 'sm') as number,
    minWidth: w ?? 160,
    maxWidth: w ?? 320,
    ...resolveShadow(theme, shadow),
  }), [surface.background, surface.border, theme, radius, w, shadow]);

  const card = isOpen ? (
    <View
      {...floating.getFloatingProps({
        style: cardStyle,
        testID: testID ? `${testID}-card` : undefined,
        // The pointer may travel onto the card without it closing.
        ...(isHover && isWeb ? webProps({ onMouseEnter: clearTimer, onMouseLeave: scheduleClose }) : null),
      })}
    >
      {children}
      {withArrow && <View style={getArrowStyle(floating.placement, surface.background, isRTL)} />}
    </View>
  ) : null;

  return (
    <View ref={wrapperRef} style={[{ alignSelf: 'flex-start' }, spacingStyles, style]} testID={testID}>
      {enhancedTarget}
      {floating.renderFloating(card)}
    </View>
  );
}

export const HoverCard = factory<HoverCardFactoryPayload>(HoverCardBase, { displayName: 'HoverCard' });
