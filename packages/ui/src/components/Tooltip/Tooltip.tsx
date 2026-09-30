import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Ref } from 'react';
import { View } from 'react-native';
import type { GestureResponderEvent, NativeSyntheticEvent, TargetedEvent, ViewStyle } from 'react-native';

import { Text } from '../Text';
import { factory } from '../../core/factory';
import { useTheme } from '../../core/theme/ThemeProvider';
import { onColor, resolveRadius, resolveShadow, resolveSpacing } from '../../core/theme/tokens';
import { resolveAccentColor } from '../../core/theme/resolveColors';
import { mergeSlotProps } from '../../core/utils/mergeSlotProps';
import { useMergedRef } from '../../core/utils/mergeRefs';
import { useStyleProps } from '../../core/utils/spacing';
import { isWeb, webProps } from '../../core/platform';
import type { WebMouseEvent } from '../../core/platform';
import { useFloating } from '../../core/overlay/useFloating';
import { resolvePlacementForDirection, useIsRTL } from '../../core/overlay/placement';
import { getNodeText } from '../../core/accessibility/useA11yId';
import { useLatestCallback } from '../../core/hooks/useLatestCallback';
import type { PlacementType } from '../../core/utils/positioning-enhanced';
import type { TooltipProps, TooltipFactoryPayload } from './types';

const ARROW_SIZE = 5;
const TOOLTIP_FONT_SIZE = 13;
const TOOLTIP_LINE_HEIGHT = 16;
const TOOLTIP_MIN_HEIGHT = 30;
/**
 * Grace period before a hover-opened tooltip hides, so the pointer can travel
 * from the trigger onto the bubble (WCAG 1.4.13: hover content is hoverable).
 */
const HOVER_GRACE_MS = 100;
const FALLBACK_PLACEMENTS: PlacementType[] = ['top', 'bottom', 'right', 'left'];
const NO_POINTER: ViewStyle = { pointerEvents: 'none' };

/** Handlers a trigger child may carry that the tooltip chains onto. */
interface TriggerChildProps {
  onPress?: (event: GestureResponderEvent) => void;
  onFocus?: (event: NativeSyntheticEvent<TargetedEvent>) => void;
  onBlur?: (event: NativeSyntheticEvent<TargetedEvent>) => void;
  onHoverIn?: (event: unknown) => void;
  onHoverOut?: (event: unknown) => void;
  onMouseEnter?: (event: WebMouseEvent) => void;
  onMouseLeave?: (event: WebMouseEvent) => void;
  'aria-describedby'?: string;
  accessibilityHint?: string;
  'aria-label'?: string;
  accessibilityLabel?: string;
}

const normalizeName = (text: string) => text.trim().replace(/\s+/g, ' ').toLowerCase();

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
 * Arrow drawn as a border triangle on the bubble's edge facing the trigger.
 * `placement` is physical (already RTL-mirrored by useFloating); mirroring is
 * its own inverse, so mirroring it again gives the logical side, which maps
 * onto start/end style keys that RN's RTL swap and the web's `dir` both honour.
 */
function getArrowStyle(placement: PlacementType, color: string, isRTL: boolean): ViewStyle {
  const side = resolvePlacementForDirection(placement, isRTL).split('-')[0];
  const base: ViewStyle = { position: 'absolute', width: 0, height: 0 };

  switch (side) {
    case 'bottom':
      return {
        ...base,
        bottom: '100%',
        start: '50%',
        marginStart: -ARROW_SIZE,
        borderStartWidth: ARROW_SIZE,
        borderEndWidth: ARROW_SIZE,
        borderBottomWidth: ARROW_SIZE,
        borderStartColor: 'transparent',
        borderEndColor: 'transparent',
        borderBottomColor: color,
      };
    case 'left':
      // Bubble on the trigger's start side: the arrow sits past its end edge.
      return {
        ...base,
        start: '100%',
        top: '50%',
        marginTop: -ARROW_SIZE,
        borderTopWidth: ARROW_SIZE,
        borderBottomWidth: ARROW_SIZE,
        borderStartWidth: ARROW_SIZE,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderStartColor: color,
      };
    case 'right':
      // Bubble on the trigger's end side: the arrow sits past its start edge.
      return {
        ...base,
        end: '100%',
        top: '50%',
        marginTop: -ARROW_SIZE,
        borderTopWidth: ARROW_SIZE,
        borderBottomWidth: ARROW_SIZE,
        borderEndWidth: ARROW_SIZE,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderEndColor: color,
      };
    case 'top':
    default:
      return {
        ...base,
        top: '100%',
        start: '50%',
        marginStart: -ARROW_SIZE,
        borderStartWidth: ARROW_SIZE,
        borderEndWidth: ARROW_SIZE,
        borderTopWidth: ARROW_SIZE,
        borderStartColor: 'transparent',
        borderEndColor: 'transparent',
        borderTopColor: color,
      };
  }
}

function TooltipBase(props: TooltipProps, ref: Ref<View>) {
  const {
    label,
    position = 'top',
    withArrow = false,
    color,
    radius = 'md',
    offset = 8,
    w: width,
    maw: maxWidth = 280,
    lineClamp,
    opened: controlledOpened,
    defaultOpened = false,
    onOpen,
    onClose,
    openDelay = 0,
    closeDelay = 0,
    events,
    disabled = false,
    children,
    style,
    testID,
    labelProps,
    ...spacingProps
  } = props;

  const theme = useTheme();
  const isRTL = useIsRTL();
  const spacingStyles = useStyleProps(spacingProps);

  const eventSettings = {
    hover: events?.hover ?? true,
    // On by default: keyboard users would otherwise never see the tooltip.
    focus: events?.focus ?? true,
    touch: events?.touch ?? true,
  };

  const [uncontrolledOpened, setUncontrolledOpened] = useState(defaultOpened);
  const isControlled = controlledOpened !== undefined;
  const opened = isControlled ? controlledOpened : uncontrolledOpened;
  const hasLabel = label !== null && label !== undefined && label !== false && label !== '';
  const isOpen = opened && !disabled && hasLabel;

  const onOpenLatest = useLatestCallback(onOpen);
  const onCloseLatest = useLatestCallback(onClose);
  const openedRef = useRef(opened);
  useEffect(() => {
    openedRef.current = opened;
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);
  useEffect(() => clearTimer, [clearTimer]);

  const setOpened = useCallback((next: boolean) => {
    if (openedRef.current === next) return;
    openedRef.current = next;
    if (!isControlled) setUncontrolledOpened(next);
    if (next) onOpenLatest();
    else onCloseLatest();
  }, [isControlled, onOpenLatest, onCloseLatest]);

  const show = useCallback(() => {
    if (disabled) return;
    clearTimer();
    if (openDelay > 0) {
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        setOpened(true);
      }, openDelay);
    } else {
      setOpened(true);
    }
  }, [disabled, clearTimer, openDelay, setOpened]);

  const hide = useCallback((delay: number = closeDelay) => {
    clearTimer();
    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        setOpened(false);
      }, delay);
    } else {
      setOpened(false);
    }
  }, [clearTimer, closeDelay, setOpened]);

  const hideNow = useCallback(() => hide(0), [hide]);
  const hideAfterHover = useCallback(() => hide(Math.max(closeDelay, HOVER_GRACE_MS)), [hide, closeDelay]);

  const floating = useFloating({
    opened: isOpen,
    // Escape (WCAG 1.4.13: dismissible without moving pointer or focus).
    onDismiss: hideNow,
    placement: position,
    offset: offset + (withArrow ? ARROW_SIZE : 0),
    fallbackPlacements: FALLBACK_PLACEMENTS,
    boundary: 4,
    trigger: 'hover',
    role: 'tooltip',
    layer: 'tooltip',
    autoFocus: false,
    restoreFocus: false,
    closeOnEscape: true,
    closeOnOutsidePress: false,
  });

  // --- anchor: the trigger when it forwards a ref, else the wrapper -------------
  // Refs attach child-first, so the trigger's wins when it exists. The wrapper
  // can be wider than the control it wraps (it stretches in a column), which
  // would centre the bubble on the row rather than on the control.
  const { refs } = floating;
  const triggerNodeRef = useRef<unknown>(null);
  const setTriggerNode = useCallback((node: unknown) => {
    triggerNodeRef.current = node;
    if (node) refs.setReference(node);
  }, [refs]);
  const setWrapperNode = useCallback((node: unknown) => {
    if (node && !triggerNodeRef.current) refs.setReference(node);
  }, [refs]);
  const wrapperRef = useMergedRef<View>(ref, setWrapperNode);

  const childProps = (children.props ?? {}) as TriggerChildProps;
  // React 19 made `ref` an ordinary prop; on 18 it still lives on the element and
  // reading `element.ref` on 19 logs a deprecation warning, so pick by version
  // rather than probing both.
  const childRef: Ref<unknown> | undefined = parseInt(React.version, 10) >= 19
    ? (childProps as { ref?: Ref<unknown> }).ref
    : (children as unknown as { ref?: Ref<unknown> }).ref;
  const triggerRef = useMergedRef<unknown>(childRef, setTriggerNode);

  const labelText = typeof label === 'string' || typeof label === 'number' ? String(label) : getNodeText(label);

  // A tooltip that only repeats the trigger's accessible name (an icon button
  // labelled by its tooltip, a Progress section named after it) would be read
  // twice; the name already carries it.
  const triggerName = childProps['aria-label'] ?? childProps.accessibilityLabel;
  const repeatsTriggerName =
    !!labelText && typeof triggerName === 'string' && normalizeName(triggerName) === normalizeName(labelText);

  const triggerOverrides: Record<string, unknown> = { ref: triggerRef };
  if (hasLabel && !disabled && !repeatsTriggerName) {
    if (isWeb) {
      // The trigger is described by the tooltip (read when it gets focus).
      const describedBy = [childProps['aria-describedby'], floating.floatingId].filter(Boolean).join(' ');
      triggerOverrides['aria-describedby'] = describedBy;
    } else if (labelText && !childProps.accessibilityHint) {
      // Native screen readers never reach the bubble; they get it as the hint.
      triggerOverrides.accessibilityHint = labelText;
    }
  }
  if (eventSettings.touch) {
    triggerOverrides.onPress = chain(childProps.onPress, () => {
      if (isWeb && eventSettings.hover) {
        show();
        return;
      }
      if (openedRef.current) hideNow();
      else show();
    });
  }
  if (isWeb && eventSettings.hover) {
    Object.assign(
      triggerOverrides,
      webProps({
        onMouseEnter: chain(childProps.onMouseEnter, () => show()),
        onMouseLeave: chain(childProps.onMouseLeave, () => hideAfterHover()),
      })
    );
    triggerOverrides.onHoverIn = chain(childProps.onHoverIn, () => show());
    triggerOverrides.onHoverOut = chain(childProps.onHoverOut, () => hideAfterHover());
  }
  if (eventSettings.focus) {
    triggerOverrides.onFocus = chain(childProps.onFocus, () => show());
    triggerOverrides.onBlur = chain(childProps.onBlur, () => hide());
  }

  const enhancedChild = React.cloneElement(children, triggerOverrides);

  // --- bubble --------------------------------------------------------------------
  // An inverted surface by default: the page's text color as the fill, with the
  // label picked for contrast (so an explicit `color` always stays readable too).
  const background = resolveAccentColor(theme, color) ?? theme.text.primary;
  const foreground = onColor(theme, background);

  const bubbleStyle = useMemo<ViewStyle>(() => ({
    backgroundColor: background,
    borderRadius: resolveRadius(theme, radius),
    paddingHorizontal: resolveSpacing(theme, 'sm') as number,
    paddingVertical: resolveSpacing(theme, 'xs') as number,
    minHeight: TOOLTIP_MIN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    ...resolveShadow(theme, 'lg'),
  }), [background, theme, radius]);

  // Bubbles size to their content and wrap at `maw` (or the fixed `w` when one
  // is given), then clamp again to whatever the viewport allows.
  const requestedWidth = width ?? maxWidth;
  const positionMaxWidth = floating.position?.maxWidth;
  const computedMaxWidth = typeof positionMaxWidth === 'number'
    ? Math.min(requestedWidth, positionMaxWidth)
    : requestedWidth;

  const hoverable = isWeb && eventSettings.hover;
  const floatingProps = floating.getFloatingProps({
    style: [
      bubbleStyle,
      {
        width: width !== undefined ? Math.min(width, computedMaxWidth) : undefined,
        maxWidth: computedMaxWidth,
        maxHeight: floating.position?.maxHeight,
      },
      hoverable ? null : NO_POINTER,
    ],
    // Hoverable: the pointer may move onto the bubble without it vanishing.
    ...(hoverable ? webProps({ onMouseEnter: clearTimer, onMouseLeave: hideAfterHover }) : null),
  });

  const bubble = isOpen ? (
    <View {...floatingProps}>
      <Text
        {...mergeSlotProps(
          {
            fw: '500' as const,
            // Wrap by default — clamping to one line silently truncated any
            // label longer than the bubble. Opt back in with `lineClamp`.
            numberOfLines: lineClamp,
            style: {
              color: foreground,
              fontSize: TOOLTIP_FONT_SIZE,
              textAlign: 'center' as const,
              lineHeight: TOOLTIP_LINE_HEIGHT,
            },
          },
          labelProps,
        )}
      >
        {label}
      </Text>
      {withArrow && <View style={getArrowStyle(floating.placement, background, isRTL)} />}
    </View>
  ) : null;

  return (
    <View ref={wrapperRef} style={[{ position: 'relative' }, spacingStyles, style]} testID={testID}>
      {enhancedChild}
      {floating.renderFloating(bubble)}
    </View>
  );
}

export const Tooltip = factory<TooltipFactoryPayload>(TooltipBase, { displayName: 'Tooltip' });
