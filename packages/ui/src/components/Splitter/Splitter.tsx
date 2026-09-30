import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import type { DimensionValue } from 'react-native';
import { factory, withStatics } from '../../core/factory';
import { useDragGesture } from '../../core/gestures/useDragGesture';
import { webProps, webStyle } from '../../core/platform';
import { useDirection } from '../../core/providers/DirectionProvider';
import { useTheme } from '../../core/theme/ThemeProvider';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import type {
  SplitterPaneProps,
  SplitterPaneSize,
  SplitterProps,
  UseSplitterReturn,
} from './types';
import { useSplitter } from './useSplitter';

export const SplitterPane = factory<{ props: SplitterPaneProps; ref: View }>(
  (all, ref) => {
    const {
      styleProps,
      otherProps: { children, style, testID },
    } = extractStyleProps(all);
    const spacing = useStyleProps(styleProps);
    return (
      <View
        ref={ref}
        testID={testID}
        style={[{ flex: 1, minWidth: 0, minHeight: 0, overflow: 'hidden' }, spacing, style]}
      >
        {children}
      </View>
    );
  },
  { displayName: 'Splitter.Pane' },
);

function Handle({
  index,
  orientation,
  splitter,
  step,
  shiftStep,
  lineSize,
  handleColor,
  withHandle,
  handleIcon,
  onResizeStart,
  onResizeEnd,
  resetOnDoubleClick,
  defaultSizes,
  paneId,
}: {
  index: number;
  orientation: 'horizontal' | 'vertical';
  splitter: UseSplitterReturn;
  step: number;
  shiftStep: number;
  lineSize: number;
  handleColor: string;
  withHandle: boolean;
  handleIcon?: React.ReactNode;
  onResizeStart?: (index: number) => void;
  onResizeEnd?: (index: number) => void;
  resetOnDoubleClick?: boolean;
  defaultSizes: SplitterPaneSize[];
  paneId: string;
}) {
  const start = useRef(0);
  const { isRTL } = useDirection();
  const horizontal = orientation === 'horizontal';
  const drag = useDragGesture({
    axis: horizontal ? 'x' : 'y',
    cursor: horizontal ? 'col-resize' : 'row-resize',
    onStart: () => {
      start.current = 0;
      onResizeStart?.(index);
    },
    onMove: (point) => {
      const delta = (horizontal ? point.dx : point.dy) * (horizontal && isRTL ? -1 : 1);
      splitter.resize(index, delta - start.current);
      start.current = delta;
    },
    onEnd: () => onResizeEnd?.(index),
  });
  const current = splitter.sizes[index];
  const value =
    typeof current === 'number'
      ? current
      : current.endsWith('px')
        ? splitter.containerSize
          ? (parseFloat(current) / splitter.containerSize) * 100
          : 0
        : current.endsWith('rem')
          ? splitter.containerSize
            ? ((parseFloat(current) * 16) / splitter.containerSize) * 100
            : 0
          : parseFloat(current);
  return (
    <View
      ref={drag.ref}
      onLayout={drag.onLayout}
      {...drag.panHandlers}
      {...webProps({
        tabIndex: 0,
        onKeyDown: (event) => {
          const direction = horizontal
            ? event.key === 'ArrowRight'
              ? 1
              : event.key === 'ArrowLeft'
                ? -1
                : 0
            : event.key === 'ArrowDown'
              ? 1
              : event.key === 'ArrowUp'
                ? -1
                : 0;
          const multiplier = horizontal && isRTL ? -1 : 1;
          if (direction)
            splitter.resize(
              index,
              ((splitter.containerSize * (event.shiftKey ? shiftStep : step)) / 100) *
                direction *
                multiplier,
            );
          else if (event.key === 'Home') splitter.resize(index, -splitter.containerSize);
          else if (event.key === 'End') splitter.resize(index, splitter.containerSize);
          else if (event.key === 'Enter') splitter.toggleCollapse(index);
          else return;
          event.preventDefault();
        },
        onClick: resetOnDoubleClick
          ? (event) => {
              if ((event.nativeEvent as { detail?: number } | undefined)?.detail === 2)
                splitter.setSizes(defaultSizes);
            }
          : undefined,
      })}
      role="separator"
      accessibilityActions={[
        { name: 'increment', label: 'Increase first pane' },
        { name: 'decrement', label: 'Decrease first pane' },
      ]}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === 'increment')
          splitter.resize(index, (splitter.containerSize * step) / 100);
        else if (event.nativeEvent.actionName === 'decrement')
          splitter.resize(index, (-splitter.containerSize * step) / 100);
      }}
      aria-orientation={horizontal ? 'vertical' : 'horizontal'}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-controls={paneId}
      onTouchEnd={resetOnDoubleClick ? undefined : undefined}
      style={[
        {
          flexShrink: 0,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent',
        },
        horizontal
          ? { width: Math.max(12, lineSize), height: '100%' }
          : { height: Math.max(12, lineSize), width: '100%' },
        drag.surfaceStyle,
        webStyle({ cursor: horizontal ? 'col-resize' : 'row-resize' }),
      ]}
    >
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          width: horizontal ? lineSize : '100%',
          height: horizontal ? '100%' : lineSize,
          backgroundColor: handleColor,
        }}
      />
      {withHandle &&
        (handleIcon ?? (
          <View
            pointerEvents="none"
            style={{
              width: horizontal ? 8 : 36,
              height: horizontal ? 36 : 8,
              borderRadius: 4,
              backgroundColor: handleColor,
            }}
          />
        ))}
    </View>
  );
}

const Root = factory<{ props: SplitterProps; ref: View }>(
  (all, ref) => {
    const {
      styleProps,
      otherProps: {
        children,
        orientation = 'horizontal',
        sizes,
        onSizeChange,
        onCollapseChange,
        redistribute,
        onResizeStart,
        onResizeEnd,
        step = 1,
        shiftStep = 10,
        lineSize = 1,
        handleColor,
        withHandle = true,
        handleIcon,
        resetOnDoubleClick,
        splitterRef,
        style,
        testID,
      },
    } = extractStyleProps(all);
    const spacing = useStyleProps(styleProps);
    const theme = useTheme();
    const panes = React.Children.toArray(children).filter(
      (child): child is React.ReactElement<SplitterPaneProps> =>
        React.isValidElement(child) && child.type === SplitterPane,
    );
    const splitter = useSplitter({
      panels: panes.map((pane) => pane.props),
      orientation,
      sizes,
      onSizeChange,
      onCollapseChange,
      redistribute,
    });
    useEffect(() => {
      if (splitterRef) splitterRef.current = splitter;
      return () => {
        if (splitterRef) splitterRef.current = null;
      };
    }, [splitterRef, splitter]);
    const id = React.useId();
    const defaultSizes = panes.map((pane) => pane.props.defaultSize ?? 100 / panes.length);
    const hasFixed = splitter.sizes.some(
      (item) => typeof item === 'string' && (item.endsWith('px') || item.endsWith('rem')),
    );
    return (
      <View
        ref={ref}
        testID={testID}
        onLayout={splitter.onLayout}
        style={[
          { flexDirection: orientation === 'horizontal' ? 'row' : 'column', overflow: 'hidden' },
          spacing,
          style,
        ]}
      >
        {panes.map((pane, i) => {
          const size = splitter.sizes[i] ?? 100 / panes.length;
          const fixed = typeof size === 'string' && (size.endsWith('px') || size.endsWith('rem'));
          const basis: DimensionValue = fixed
            ? size.endsWith('rem')
              ? parseFloat(size) * 16
              : parseFloat(size)
            : (`${typeof size === 'number' ? size : parseFloat(size)}%` as DimensionValue);
          return (
            <React.Fragment key={pane.key ?? i}>
              {i > 0 && (
                <Handle
                  index={i - 1}
                  orientation={orientation}
                  splitter={splitter}
                  step={step}
                  shiftStep={shiftStep}
                  lineSize={lineSize}
                  handleColor={handleColor ?? theme.backgrounds.border}
                  withHandle={withHandle}
                  handleIcon={handleIcon}
                  onResizeStart={onResizeStart}
                  onResizeEnd={onResizeEnd}
                  resetOnDoubleClick={resetOnDoubleClick}
                  defaultSizes={defaultSizes}
                  paneId={`${id}-pane-${i - 1}`}
                />
              )}
              <View
                nativeID={`${id}-pane-${i}`}
                style={[
                  orientation === 'horizontal'
                    ? fixed
                      ? { width: basis, flexShrink: 1 }
                      : hasFixed
                        ? {
                            flexGrow: typeof size === 'number' ? size : parseFloat(size),
                            flexBasis: 0,
                          }
                        : { width: basis, flexShrink: 0 }
                    : fixed
                      ? { height: basis, flexShrink: 1 }
                      : hasFixed
                        ? {
                            flexGrow: typeof size === 'number' ? size : parseFloat(size),
                            flexBasis: 0,
                          }
                        : { height: basis, flexShrink: 0 },
                  { minWidth: 0, minHeight: 0 },
                ]}
              >
                {pane}
              </View>
            </React.Fragment>
          );
        })}
      </View>
    );
  },
  { displayName: 'Splitter' },
);

export const Splitter = withStatics(Root, { Pane: SplitterPane });
