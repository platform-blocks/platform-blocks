import React, { createContext, useContext, useMemo, useState } from 'react';
import { Dimensions, View } from 'react-native';
import { factory, withStatics } from '../../core/factory';
import { useDragGesture } from '../../core/gestures/useDragGesture';
import { ViewportPortal } from '../../core/overlay/ViewportPortal';
import { webProps, webStyle } from '../../core/platform';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getZIndex } from '../../core/theme/zIndices';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import { Surface } from '../Surface';
import type { FloatingWindowDragHandleProps, FloatingWindowProps, FloatingWindowResizeHandleProps } from './types';
import { useFloatingWindow } from './useFloatingWindow';
type ContextValue = { drag: ReturnType<typeof useDragGesture>; resize: ReturnType<typeof useDragGesture>; resizeBy: (dw: number, dh: number) => void; size: { width: number; height: number }; limits: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number } };
const Context = createContext<ContextValue | null>(null);
export const FloatingWindowDragHandle = factory<{ props: FloatingWindowDragHandleProps; ref: View }>((all, ref) => {
  const { styleProps, otherProps: { children, style, testID } } = extractStyleProps(all); const spacing = useStyleProps(styleProps); const context = useContext(Context);
  return <View ref={(node) => { if (typeof ref === 'function') ref(node); else if (ref) ref.current = node; if (context) context.drag.ref.current = node; }} onLayout={context?.drag.onLayout} {...context?.drag.panHandlers} testID={testID} style={[context?.drag.surfaceStyle, spacing, style]}>{children}</View>;
}, { displayName: 'FloatingWindow.DragHandle' });
export const FloatingWindowResizeHandle = factory<{ props: FloatingWindowResizeHandleProps; ref: View }>((all, ref) => {
  const { styleProps, otherProps: { children, style, testID } } = extractStyleProps(all); const spacing = useStyleProps(styleProps); const context = useContext(Context); const theme = useTheme();
  return <View ref={(node) => { if (typeof ref === 'function') ref(node); else if (ref) ref.current = node; if (context) context.resize.ref.current = node; }} onLayout={context?.resize.onLayout} {...context?.resize.panHandlers} {...webProps({ tabIndex: 0, onKeyDown: (event) => { if (!context) return; const step = event.shiftKey ? 20 : 10; if (event.key === 'ArrowRight') context.resizeBy(step, 0); else if (event.key === 'ArrowLeft') context.resizeBy(-step, 0); else if (event.key === 'ArrowDown') context.resizeBy(0, step); else if (event.key === 'ArrowUp') context.resizeBy(0, -step); else if (event.key === 'Home') context.resizeBy(context.limits.minWidth - context.size.width, context.limits.minHeight - context.size.height); else if (event.key === 'End') context.resizeBy(context.limits.maxWidth - context.size.width, context.limits.maxHeight - context.size.height); else return; event.preventDefault(); } })} role="separator" aria-label="Resize window" testID={testID} style={[{ alignSelf: 'flex-end', width: 18, height: 18, borderEndWidth: 3, borderBottomWidth: 3, borderColor: theme.text.muted }, webStyle({ cursor: 'nwse-resize' }), context?.resize.surfaceStyle, spacing, style]}>{children}</View>;
}, { displayName: 'FloatingWindow.ResizeHandle' });
const Root = factory<{ props: FloatingWindowProps; ref: View }>((all, ref) => {
  const { styleProps, otherProps: { children, dimensions, initialPosition, enabled, constrainToViewport, constrainOffset, axis, onPositionChange, onDragStart, onDragEnd, setPositionRef, onSizeChange, onResizeStart, onResizeEnd, withBorder = true, radius = 'md', shadow = 'sm', zIndex, withinPortal = true, style, testID } } = extractStyleProps(all);
  const spacing = useStyleProps(styleProps); const theme = useTheme();
  const [size, setSize] = useState({ width: dimensions?.initialWidth, height: dimensions?.initialHeight });
  const window = useFloatingWindow({ initialPosition, enabled, constrainToViewport, constrainOffset, axis, onPositionChange, onDragStart, onDragEnd, setPositionRef });
  const viewport = Dimensions.get('window');
  const limits = { minWidth: dimensions?.minWidth ?? 120, maxWidth: Math.min(dimensions?.maxWidth ?? 10000, constrainToViewport === false ? 10000 : viewport.width - window.position.x - (constrainOffset ?? 0)), minHeight: dimensions?.minHeight ?? 60, maxHeight: Math.min(dimensions?.maxHeight ?? 10000, constrainToViewport === false ? 10000 : viewport.height - window.position.y - (constrainOffset ?? 0)) };
  const startSize = React.useRef({ width: 0, height: 0 });
  const resizeBy = (dw: number, dh: number) => { const next = { width: Math.max(limits.minWidth, Math.min(limits.maxWidth, (size.width ?? 0) + dw)), height: Math.max(limits.minHeight, Math.min(limits.maxHeight, (size.height ?? 0) + dh)) }; setSize(next); onSizeChange?.(next); };
  const resize = useDragGesture({ cursor: 'nwse-resize', onStart: () => { startSize.current = { width: size.width ?? 0, height: size.height ?? 0 }; onResizeStart?.(); }, onMove: (point) => { setSize({ width: Math.max(limits.minWidth, Math.min(limits.maxWidth, startSize.current.width + point.dx)), height: Math.max(limits.minHeight, Math.min(limits.maxHeight, startSize.current.height + point.dy)) }); }, onEnd: (point) => { const next = { width: Math.max(limits.minWidth, Math.min(limits.maxWidth, startSize.current.width + point.dx)), height: Math.max(limits.minHeight, Math.min(limits.maxHeight, startSize.current.height + point.dy)) }; setSize(next); onSizeChange?.(next); onResizeEnd?.(); } });
  const hasHandle = useMemo(() => React.Children.toArray(children).some((child) => React.isValidElement(child) && child.type === FloatingWindowDragHandle), [children]);
  return <ViewportPortal withinPortal={withinPortal} zIndex={zIndex ?? getZIndex(theme, 'popover')}><Context.Provider value={{ drag: window.dragHandlers, resize, resizeBy, size: { width: size.width ?? 0, height: size.height ?? 0 }, limits }}><Surface ref={(node) => { if (typeof ref === 'function') ref(node); else if (ref) ref.current = node; if (!hasHandle) window.dragHandlers.ref.current = node; }} onLayout={(event) => { const box = event.nativeEvent.layout; window.setSize(box.width, box.height); setSize((previous) => previous.width != null && previous.height != null ? previous : { width: previous.width ?? box.width, height: previous.height ?? box.height }); if (!hasHandle) window.dragHandlers.onLayout(event); }} {...(!hasHandle ? window.dragHandlers.panHandlers : {})} raised withBorder={withBorder} radius={radius} shadow={window.isDragging ? 'md' : shadow} testID={testID} style={[{ position: 'absolute', top: window.position.y, left: window.position.x, width: size.width, height: size.height }, !hasHandle && window.dragHandlers.surfaceStyle, spacing, style]}>{children}</Surface></Context.Provider></ViewportPortal>;
}, { displayName: 'FloatingWindow' });
export const FloatingWindow = withStatics(Root, { DragHandle: FloatingWindowDragHandle, ResizeHandle: FloatingWindowResizeHandle });
