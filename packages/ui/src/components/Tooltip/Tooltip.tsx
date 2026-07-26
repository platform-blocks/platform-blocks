import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { View, ViewStyle, Platform, LayoutChangeEvent, StyleSheet } from 'react-native';
import { Text } from '../Text';

import { factory } from '../../core/factory';
import { getRadius, getSpacing } from '../../core/theme/sizes';
import { createShadowStyles } from '../../core/theme/shadow';
import { useTheme } from '../../core/theme/ThemeProvider';
import { useDirection } from '../../core/providers/DirectionProvider';
import { useOptionalOverlayApi } from '../../core/providers/OverlayProvider';
import { mergeSlotProps, useMergedRef } from '../../core/utils';
import { measureElement, calculateOverlayPositionEnhanced, getViewport } from '../../core/utils/positioning-enhanced';
import type { PositionResult, Rect } from '../../core/utils/positioning-enhanced';
import { TooltipProps, TooltipFactoryPayload, TooltipPositionType } from './types';

const chainHandlers = (
  existing?: (...args: any[]) => void,
  next?: (...args: any[]) => void
) => {
  if (!existing) {
    return next;
  }

  if (!next) {
    return existing;
  }

  return (...args: any[]) => {
    existing(...args);
    next(...args);
  };
};

function TooltipBase(props: TooltipProps, ref: React.Ref<View>) {
  const {
    label,
    position = 'top',
    withArrow = false,
    color,
    radius = 'md',
    offset = 8,
    // `multiline` is accepted for backwards compatibility but no longer read:
    // labels wrap by default, and `width` alone produces a fixed-width bubble.
    width,
    maxWidth = 280,
    lineClamp,
    opened: controlledOpened,
    openDelay = 0,
    closeDelay = 0,
    events,
    children,
    style,
    testID,
    labelProps,
  } = props;

  const [isVisible, setIsVisible] = useState(false);
  const [overlaySize, setOverlaySize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [positionResult, setPositionResult] = useState<PositionResult | null>(null);
  const [resolvedPlacement, setResolvedPlacement] = useState<TooltipPositionType>(position);
  const [overlayStyle, setOverlayStyle] = useState<ViewStyle | null>(null);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const containerRef = useRef<View | null>(null);
  const overlayIdRef = useRef<string | null>(null);
  // The bubble is anchored to the *trigger*, not to the wrapper around it. The
  // wrapper is a plain View, so inside a column it stretches across the whole
  // cross axis — anchoring to it centres the bubble on the row rather than on the
  // control, which reads as the tooltip drifting far off to one side. Neither is
  // walking the wrapper's first child enough: components commonly render a
  // full-width outer box around a hugged control (Button does exactly this).
  //
  // So the trigger reports its own box, best source first:
  //   1. a ref forwarded to the element the child considers its root, and
  //   2. a chained `onLayout`, for children that don't forward refs.
  const triggerRef = useRef<View | null>(null);
  const triggerLayoutRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

  const theme = useTheme();
  const { isRTL } = useDirection();
  // When an OverlayProvider is available (the default via PlatformBlocksProvider),
  // render the popup through the root portal so it floats above the whole UI and is
  // never clipped by an ancestor's overflow/stacking context. Falls back to inline
  // rendering when no provider is present (e.g. standalone usage / tests).
  const overlayApi = useOptionalOverlayApi();
  const usePortal = overlayApi !== null;
  // Latest api captured in a ref so the unmount cleanup can close a lingering overlay
  // without re-subscribing the effect on every render.
  const overlayApiRef = useRef(overlayApi);
  overlayApiRef.current = overlayApi;

  const eventSettings = {
    hover: true,
    focus: false,
    touch: true,
    ...(events || {}),
  };

  const isOpened = controlledOpened !== undefined ? controlledOpened : isVisible;

  useEffect(() => {
    if (!isOpened) {
      setOverlayStyle(null);
      setPositionResult(null);
      setResolvedPlacement(position);
    }
  }, [isOpened, position]);

  const showTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (openDelay > 0) {
      timeoutRef.current = setTimeout(() => setIsVisible(true), openDelay);
    } else {
      setIsVisible(true);
    }
  }, [openDelay]);

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (closeDelay > 0) {
      timeoutRef.current = setTimeout(() => setIsVisible(false), closeDelay);
    } else {
      setIsVisible(false);
    }
  }, [closeDelay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const resolveBasePlacement = useCallback((): TooltipPositionType => {
    if (position === 'left') return isRTL ? 'right' : 'left';
    if (position === 'right') return isRTL ? 'left' : 'right';
    return position;
  }, [position, isRTL]);

  const getFallbackPosition = useCallback((): ViewStyle => {
    const gap = offset + (withArrow ? 8 : 0);
    const fallbackWidth = overlaySize.width || width;
    const basePlacement = resolveBasePlacement();

    switch (basePlacement) {
      case 'top':
        return {
          bottom: '100%' as any,
          left: '50%' as any,
          marginLeft: fallbackWidth ? -fallbackWidth / 2 : undefined,
          marginBottom: gap,
        };
      case 'bottom':
        return {
          top: '100%' as any,
          left: '50%' as any,
          marginLeft: fallbackWidth ? -fallbackWidth / 2 : undefined,
          marginTop: gap,
        };
      case 'left':
        return {
          right: '100%' as any,
          top: '50%' as any,
          marginRight: gap,
          marginTop: -15,
        };
      case 'right':
        return {
          left: '100%' as any,
          top: '50%' as any,
          marginLeft: gap,
          marginTop: -15,
        };
      default:
        return {
          bottom: '100%' as any,
          left: '50%' as any,
          marginLeft: fallbackWidth ? -fallbackWidth / 2 : undefined,
          marginBottom: gap,
        };
    }
  }, [offset, overlaySize.width, resolveBasePlacement, width, withArrow]);

  const childProps = (children.props || {}) as any;

  // React 19 made `ref` an ordinary prop; on 18 it still lives on the element and
  // reading `element.ref` on 19 logs a deprecation warning, so pick by version
  // rather than probing both.
  const childRef: React.Ref<View> | undefined = parseInt(React.version, 10) >= 19
    ? childProps.ref
    : (children as any).ref;
  const setTriggerNode = useMergedRef<View>(triggerRef, childRef);

  const handlePress = (...args: any[]) => {
    if (childProps.onPress) {
      childProps.onPress(...args);
    }

    if (!eventSettings.touch) {
      return;
    }

    if (Platform.OS === 'web' && eventSettings.hover) {
      showTooltip();
      return;
    }

    if (isVisible) {
      hideTooltip();
    } else {
      showTooltip();
    }
  };

  const handleMouseEnter = () => {
    showTooltip();
  };

  const handleMouseLeave = () => {
    hideTooltip();
  };

  const handleFocus = () => {
    showTooltip();
  };

  const handleBlur = () => {
    hideTooltip();
  };

  const handleTriggerLayout = useCallback((event: LayoutChangeEvent) => {
    const { x, y, width: layoutWidth, height: layoutHeight } = event.nativeEvent.layout;
    triggerLayoutRef.current = { x, y, width: layoutWidth, height: layoutHeight };
  }, []);

  /**
   * `trigger` is what the bubble is positioned against; `container` is the wrapper
   * the inline (no-portal) fallback is absolutely positioned within. They differ
   * whenever the wrapper is wider/taller than the element it wraps.
   */
  const measureAnchorRects = useCallback(async (): Promise<{ trigger: Rect; container: Rect }> => {
    const container = await measureElement(containerRef);

    if (triggerRef.current) {
      const trigger = await measureElement(triggerRef);
      if (trigger.width > 0 || trigger.height > 0) {
        return { trigger, container };
      }
    }

    const layout = triggerLayoutRef.current;
    if (layout && (layout.width > 0 || layout.height > 0)) {
      return {
        trigger: {
          x: container.x + layout.x,
          y: container.y + layout.y,
          width: layout.width,
          height: layout.height,
        },
        container,
      };
    }

    return { trigger: container, container };
  }, []);

  const updateOverlayPosition = useCallback(async () => {
    if (!isOpened || !containerRef.current) {
      return;
    }

    const overlayWidth = overlaySize.width || width || 0;
    const overlayHeight = overlaySize.height || 0;

    if (!overlayWidth || !overlayHeight) {
      return;
    }

    try {
      const { trigger: anchorRect, container: containerRect } = await measureAnchorRects();
      const basePlacement = resolveBasePlacement();

      const result = calculateOverlayPositionEnhanced(
        anchorRect,
        { width: overlayWidth, height: overlayHeight },
        {
          placement: basePlacement,
          offset,
          viewport: getViewport(),
          strategy: Platform.OS === 'web' ? 'fixed' : 'absolute',
          fallbackPlacements: ['top', 'bottom', 'right', 'left'],
          boundary: 4,
        }
      );

      if (!isOpened) {
        return;
      }

      setPositionResult(result);
      setOverlayStyle({
        left: result.x - containerRect.x,
        top: result.y - containerRect.y,
      });
      setResolvedPlacement((result.placement.split('-')[0] as TooltipPositionType) || basePlacement);
    } catch (error) {
      const fallbackStyle = getFallbackPosition();
      setOverlayStyle(fallbackStyle);
      setPositionResult(null);
      setResolvedPlacement(resolveBasePlacement());
    }
  }, [getFallbackPosition, isOpened, measureAnchorRects, overlaySize.height, overlaySize.width, offset, resolveBasePlacement, width]);

  useEffect(() => {
    if (!isOpened) {
      return;
    }

    updateOverlayPosition();
  }, [isOpened, overlaySize.height, overlaySize.width, updateOverlayPosition]);

  useEffect(() => {
    if (Platform.OS !== 'web' || !isOpened) {
      return;
    }

    // Coalesced to one reposition per frame.
    //
    // The scroll listener is registered in the capture phase, so it fires for
    // every scrolling ancestor, and each call did an async measure plus three
    // state updates. A single flick of the wheel could queue dozens of them,
    // all landing in the same frame and all but the last immediately stale.
    let frame: number | null = null;
    const handleUpdate = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        updateOverlayPosition();
      });
    };

    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate, true);

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate, true);
    };
  }, [isOpened, updateOverlayPosition]);

  const positionalStyle = overlayStyle ?? getFallbackPosition();
  const isOverlayReady = overlayStyle !== null;
  // Bubbles size to their content and wrap at `maxWidth` (or the fixed `width`
  // when one is given), then clamp again to whatever the viewport actually allows.
  const requestedWidth = width ?? maxWidth;
  const computedMaxWidth = positionResult?.maxWidth !== undefined
    ? Math.min(requestedWidth, positionResult.maxWidth)
    : requestedWidth;
  const computedMaxHeight = positionResult?.maxHeight;
  const arrowPlacement = resolvedPlacement;

  const setContainerNode = useCallback((node: View | null) => {
    containerRef.current = node;

    if (typeof ref === 'function') {
      ref(node);
    } else if (ref && typeof ref !== 'function') {
      (ref as React.MutableRefObject<View | null>).current = node;
    }
  }, [ref]);

  const enhancedChild = React.cloneElement(children, {
    ref: setTriggerNode,
    onLayout: chainHandlers(childProps.onLayout, handleTriggerLayout),
    ...(eventSettings.touch && {
      onPress: handlePress,
    }),
    ...(Platform.OS === 'web' && eventSettings.hover && {
      onMouseEnter: chainHandlers(childProps.onMouseEnter, handleMouseEnter),
      onMouseLeave: chainHandlers(childProps.onMouseLeave, handleMouseLeave),
      onHoverIn: chainHandlers(childProps.onHoverIn, handleMouseEnter),
      onHoverOut: chainHandlers(childProps.onHoverOut, handleMouseLeave),
    }),
    ...(eventSettings.focus && {
      onFocus: chainHandlers(childProps.onFocus, handleFocus),
      onBlur: chainHandlers(childProps.onBlur, handleBlur),
    }),
  } as any);

  const tooltipBackgroundColor = color || (theme.colorScheme === 'dark' ? theme.colors.surface[2] : theme.colors.gray[9]);
  const tooltipTextColor = '#fff';
  // Subtle hairline edge + theme-aware layered elevation so the tooltip reads as a
  // crisp floating surface rather than a flat block.
  const tooltipBorderColor = theme.colorScheme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.08)';
  const elevatedShadow = useMemo(() => createShadowStyles('lg', theme) as ViewStyle, [theme]);

  const handlePopupLayout = useCallback((event: LayoutChangeEvent) => {
    const { width: layoutWidth, height: layoutHeight } = event.nativeEvent.layout;
    setOverlaySize((prev) => {
      if (prev.width === layoutWidth && prev.height === layoutHeight) {
        return prev;
      }
      return { width: layoutWidth, height: layoutHeight };
    });
  }, []);

  // Renders the tooltip bubble. When `portaled`, positioning is handled by the
  // OverlayRenderer via the anchor rect, so the bubble carries no positional style;
  // inline, it is absolutely positioned relative to its wrapper.
  const buildPopup = useCallback((portaled: boolean) => {
    const ready = portaled ? (!!positionResult && overlaySize.width > 0) : isOverlayReady;
    return (
      <View
        style={[
          {
            ...(portaled ? null : { position: 'absolute' as const }),
            backgroundColor: tooltipBackgroundColor,
            borderRadius: getRadius(radius),
            paddingHorizontal: getSpacing('sm'),
            paddingVertical: getSpacing('xs'),
            minHeight: 30,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999999,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: tooltipBorderColor,
            ...elevatedShadow,
            width: width !== undefined ? Math.min(width, computedMaxWidth) : undefined,
            maxWidth: computedMaxWidth,
            maxHeight: computedMaxHeight,
            opacity: ready ? 1 : 0,
          },
          portaled ? null : positionalStyle,
        ]}
        pointerEvents="none"
        onLayout={handlePopupLayout}
      >
        <Text
          {...mergeSlotProps(
            {
              weight: '500' as const,
              // Wrap by default — clamping to one line silently truncated any
              // label longer than the bubble. Opt back in with `lineClamp`.
              numberOfLines: lineClamp,
              style: {
                color: tooltipTextColor,
                fontSize: 13,
                textAlign: 'center' as const,
                lineHeight: 16,
              },
            },
            labelProps,
          )}
        >
          {label}
        </Text>

        {withArrow && (
          <View
            style={{
              position: 'absolute',
              width: 0,
              height: 0,
              ...(arrowPlacement === 'top' && {
                top: '100%',
                left: '50%',
                marginLeft: -5,
                borderLeftWidth: 5,
                borderRightWidth: 5,
                borderTopWidth: 5,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderTopColor: tooltipBackgroundColor,
              }),
              ...(arrowPlacement === 'bottom' && {
                bottom: '100%',
                left: '50%',
                marginLeft: -5,
                borderLeftWidth: 5,
                borderRightWidth: 5,
                borderBottomWidth: 5,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderBottomColor: tooltipBackgroundColor,
              }),
              ...(arrowPlacement === 'left' && {
                left: '100%',
                top: '50%',
                marginTop: -5,
                borderTopWidth: 5,
                borderBottomWidth: 5,
                borderLeftWidth: 5,
                borderTopColor: 'transparent',
                borderBottomColor: 'transparent',
                borderLeftColor: tooltipBackgroundColor,
              }),
              ...(arrowPlacement === 'right' && {
                right: '100%',
                top: '50%',
                marginTop: -5,
                borderTopWidth: 5,
                borderBottomWidth: 5,
                borderRightWidth: 5,
                borderTopColor: 'transparent',
                borderBottomColor: 'transparent',
                borderRightColor: tooltipBackgroundColor,
              }),
            }}
          />
        )}
      </View>
    );
  }, [positionResult, overlaySize.width, isOverlayReady, tooltipBackgroundColor, tooltipTextColor, tooltipBorderColor, elevatedShadow, radius, width, lineClamp, computedMaxWidth, computedMaxHeight, positionalStyle, handlePopupLayout, labelProps, label, withArrow, arrowPlacement]);

  // Sync the portaled tooltip with the overlay layer. Opens on first show, keeps the
  // content + anchor updated as position/size/label change, and closes when hidden.
  useEffect(() => {
    if (!usePortal || !overlayApi) return;

    if (isOpened) {
      // Open on `isOpened` even before a position is computed so the portaled bubble
      // mounts and can measure itself (positioning needs the measured size). Until
      // `positionResult` resolves the bubble renders at opacity 0 via `buildPopup`.
      // Position only — deliberately no size. The renderer treats `anchor.width`
      // as a hard width on the overlay host, and the measured width is rounded
      // down a sub-pixel from what the text needs, which was enough to push short
      // labels onto a second line.
      const anchor = {
        x: positionResult?.x ?? 0,
        y: positionResult?.y ?? 0,
        width: 0,
        height: 0,
      };
      const content = buildPopup(true);
      if (overlayIdRef.current) {
        overlayApi.updateOverlay(overlayIdRef.current, { content, anchor });
      } else {
        overlayIdRef.current = overlayApi.openOverlay({
          content,
          anchor,
          placement: resolvedPlacement,
          trigger: 'hover',
          closeOnClickOutside: false,
          closeOnEscape: false,
          strategy: Platform.OS === 'web' ? 'fixed' : 'portal',
          zIndex: 999999,
        });
      }
    } else if (overlayIdRef.current) {
      overlayApi.closeOverlay(overlayIdRef.current);
      overlayIdRef.current = null;
    }
  }, [usePortal, overlayApi, isOpened, positionResult, overlaySize.width, overlaySize.height, resolvedPlacement, width, buildPopup]);

  // Close any lingering overlay on unmount.
  useEffect(() => () => {
    if (overlayIdRef.current && overlayApiRef.current) {
      overlayApiRef.current.closeOverlay(overlayIdRef.current);
      overlayIdRef.current = null;
    }
  }, []);

  return (
    <View
      ref={setContainerNode}
      style={[{ position: 'relative', }, style]}
      testID={testID}
    >
      {enhancedChild}

      {/* Inline fallback popup — only when no OverlayProvider is available. */}
      {!usePortal && isOpened && buildPopup(false)}
    </View>
  );
}

export const Tooltip = factory<TooltipFactoryPayload>(TooltipBase);

Tooltip.displayName = 'Tooltip';
