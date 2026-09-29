import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import type { LayoutChangeEvent, StyleProp, TextStyle, ViewStyle } from 'react-native';

import { factory, withStatics } from '../../core/factory';
import { resolveAccentColor } from '../../core/theme/resolveColors';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getControlSize } from '../../core/theme/tokens';
import type { PlatformBlocksTheme, SizeValue } from '../../core/theme/types';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import type { TimelineContextValue, TimelineItemProps, TimelineProps, TimelineSizeMetrics } from './types';

// Context
const TimelineContext = createContext<TimelineContextValue | null>(null);
const useTimelineContext = () => {
  const ctx = useContext(TimelineContext);
  if (!ctx) throw new Error('Timeline components must be used within a Timeline');
  return ctx;
};

/**
 * Timeline proportions, derived from the shared control-size scale: bullets are
 * 60% of the control height, labels one step above the control font. A numeric
 * `size` is the title font size (px), scaled off the `md` proportions.
 */
function getTimelineMetrics(theme: PlatformBlocksTheme, size: SizeValue): TimelineSizeMetrics {
  const fromControl = (token: SizeValue): TimelineSizeMetrics => {
    const control = getControlSize(theme, token);
    const bulletSize = Math.round(control.height * 0.6);
    return {
      bulletSize,
      lineWidth: Math.max(1, Math.round(bulletSize / 12)),
      fontSize: control.fontSize + 2,
      spacing: Math.round(control.height * 0.4),
    };
  };
  if (typeof size !== 'number') return fromControl(size);

  const base = fromControl('md');
  const ratio = size / base.fontSize;
  return {
    fontSize: size,
    bulletSize: Math.max(12, Math.round(base.bulletSize * ratio)),
    lineWidth: Math.max(1, Math.round(base.lineWidth * ratio)),
    spacing: Math.max(8, Math.round(base.spacing * ratio)),
  };
}

interface TimelineItemInternalProps extends TimelineItemProps {
  /** Position among the items (set by Timeline). */
  itemIndex?: number;
  /** Set by Timeline on the last item (no trailing line). */
  isLastItem?: boolean;
}

type StyledChildProps = { style?: StyleProp<TextStyle>; children?: React.ReactNode };

/** Applies `styleOverride` to text-like descendants (strings, Text elements). */
function applyTextStyle(nodes: React.ReactNode, styleOverride?: TextStyle): React.ReactNode {
  if (!styleOverride) return nodes;
  return React.Children.map(nodes, (child): React.ReactNode => {
    if (typeof child === 'string' || typeof child === 'number') {
      return <Text style={styleOverride}>{child}</Text>;
    }
    if (!React.isValidElement<StyledChildProps>(child)) return child;
    const props = child.props;
    const typeName = typeof child.type === 'string' ? undefined : (child.type as { displayName?: string }).displayName;
    const isTextLike = typeName === 'Text' || child.type === Text || typeof props.children === 'string';
    if (isTextLike) {
      return React.cloneElement(child, { style: [props.style, styleOverride] });
    }
    if (props.children) {
      return React.cloneElement(child, { children: applyTextStyle(props.children, styleOverride) });
    }
    return child;
  });
}

// Item
const TimelineItem = factory<{ props: TimelineItemInternalProps; ref: View }>(({
  children,
  title,
  timestamp,
  bullet,
  lineVariant = 'solid',
  color,
  titleColor,
  descriptionColor,
  timestampColor,
  active,
  itemIndex = 0,
  isLastItem = false,
  itemAlign,
  style,
  ...rest
}, ref) => {
  const theme = useTheme();
  const {
    active: timelineActive,
    color: timelineColor,
    lineWidth,
    bulletSize: contextBulletSize,
    align,
    reverseActive,
    centerMode,
    metrics,
    titleColor: timelineTitleColor,
    descriptionColor: timelineDescriptionColor,
    timestampColor: timelineTimestampColor,
  } = useTimelineContext();
  const { styleProps, otherProps } = extractStyleProps(rest);
  const spacingStyle = useStyleProps(styleProps);

  const sizeConfig = metrics;
  const finalBulletSize = contextBulletSize || sizeConfig.bulletSize;
  const [patternHeight, setPatternHeight] = useState(0);
  const handlePatternLayout = useCallback((event: LayoutChangeEvent) => {
    const nextHeight = event.nativeEvent.layout.height;
    setPatternHeight((previous) => (nextHeight > 0 && Math.abs(nextHeight - previous) > 0.5 ? nextHeight : previous));
  }, []);

  const resolvedItemColor = resolveAccentColor(theme, color) ?? timelineColor;
  // Inactive bullets and lines read as neutral chrome.
  const inactiveColor = theme.backgrounds.borderStrong;

  const resolvedTitleColor = titleColor ?? timelineTitleColor;
  const resolvedDescriptionColor = descriptionColor ?? timelineDescriptionColor;
  const resolvedTimestampColor = timestampColor ?? timelineTimestampColor;

  // Active logic
  const isActive =
    timelineActive === undefined
      ? true
      : active !== undefined
        ? active
        : reverseActive
          ? itemIndex > timelineActive
          : itemIndex <= timelineActive;

  // `left` / `right` are the start / end sides: they flip under RTL.
  const effectiveAlign = itemAlign || align;
  const atEnd = effectiveAlign === 'right';

  const lineColor = isActive ? resolvedItemColor : inactiveColor;

  const getLine = () => {
    if (isLastItem) return null;

    const inset = finalBulletSize / 2 - lineWidth / 2;
    const baseLinePosition: ViewStyle = {
      position: 'absolute',
      ...(atEnd ? { end: inset } : { start: inset }),
      top: finalBulletSize,
      bottom: -(finalBulletSize / 2),
      zIndex: 1,
    };

    if (lineVariant === 'solid') {
      return <View style={[baseLinePosition, { width: lineWidth, backgroundColor: lineColor }]} />;
    }

    if (lineVariant === 'dashed') {
      const dashHeight = 6;
      const gapHeight = 3;
      const totalHeight = patternHeight || 0;
      const segmentHeight = dashHeight + gapHeight;
      const dashCount = Math.max(1, Math.ceil(totalHeight / segmentHeight));
      return (
        <View style={baseLinePosition} onLayout={handlePatternLayout}>
          {patternHeight > 0 &&
            Array.from({ length: dashCount }, (_, i) => {
              const isLast = i === dashCount - 1;
              const remaining = totalHeight - i * segmentHeight;
              const actualDashHeight = isLast && remaining < dashHeight ? Math.max(remaining, 2) : dashHeight;
              return (
                <View
                  key={i}
                  style={{
                    width: lineWidth,
                    height: actualDashHeight,
                    backgroundColor: lineColor,
                    marginBottom: isLast ? 0 : gapHeight,
                  }}
                />
              );
            })}
        </View>
      );
    }

    if (lineVariant === 'dotted') {
      const dotSize = lineWidth * 1.5;
      const gapHeight = 3;
      const totalHeight = patternHeight || 0;
      const segmentHeight = dotSize + gapHeight;
      const dotCount = Math.max(1, Math.ceil(totalHeight / segmentHeight));
      return (
        <View
          style={[baseLinePosition, { alignItems: atEnd ? 'flex-end' : 'flex-start' }]}
          onLayout={handlePatternLayout}
        >
          {patternHeight > 0 &&
            Array.from({ length: dotCount }, (_, i) => (
              <View
                key={i}
                style={{
                  width: dotSize,
                  height: dotSize,
                  borderRadius: dotSize / 2,
                  backgroundColor: lineColor,
                  marginBottom: i === dotCount - 1 ? 0 : gapHeight,
                }}
              />
            ))}
        </View>
      );
    }
    return null;
  };

  const bulletStyle: ViewStyle = {
    width: finalBulletSize,
    height: finalBulletSize,
    borderRadius: finalBulletSize / 2,
    backgroundColor: lineColor,
    borderWidth: lineWidth,
    borderColor: lineColor,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    position: 'relative',
  };

  const contentStyle: ViewStyle = {
    flex: 1,
    marginStart: atEnd ? 0 : sizeConfig.spacing,
    marginEnd: atEnd ? sizeConfig.spacing : 0,
    paddingBottom: sizeConfig.spacing * 2,
    alignItems: atEnd ? 'flex-end' : 'flex-start',
  };

  const titleStyle: TextStyle = {
    fontSize: sizeConfig.fontSize,
    fontWeight: '600',
    color: resolvedTitleColor ?? theme.text.primary,
    marginBottom: title && children ? 4 : 0,
    textAlign: atEnd ? 'right' : 'left',
  };

  const timestampStyle: TextStyle = {
    fontSize: Math.max(10, Math.round(sizeConfig.fontSize * 0.8)),
    color: resolvedTimestampColor ?? theme.text.secondary,
    marginBottom: title || children ? 4 : 0,
    textAlign: atEnd ? 'right' : 'left',
  };

  const bulletNode = <View style={bulletStyle}>{bullet}</View>;

  if (centerMode) {
    // Three column layout: start content | bullet/line | end content
    const startContent = !atEnd && (title || children);
    const endContent = atEnd && (title || children);

    // Helper to clone Text children with alignment
    const alignChildText = (nodes: React.ReactNode, side: 'left' | 'right'): React.ReactNode =>
      applyTextStyle(nodes, {
        textAlign: side,
        ...(resolvedDescriptionColor ? { color: resolvedDescriptionColor } : null),
      });

    return (
      <View
        ref={ref}
        style={[{ flexDirection: 'row', position: 'relative', alignItems: 'stretch', width: '100%' }, spacingStyle, style]}
        {...otherProps}
      >
        <View style={{ flex: 1, paddingEnd: sizeConfig.spacing, alignItems: 'flex-end' }}>
          {startContent && (
            <View style={{ width: '100%', alignItems: 'flex-end' }}>
              {timestamp && <Text style={[timestampStyle, { textAlign: 'right' }]}>{timestamp}</Text>}
              {title && <Text style={[titleStyle, { textAlign: 'right' }]}>{title}</Text>}
              {alignChildText(children, 'right')}
            </View>
          )}
        </View>
        {/* Bullet & line column */}
        <View style={{ width: finalBulletSize, alignItems: 'center', position: 'relative' }}>
          {getLine()}
          {bulletNode}
        </View>
        <View style={{ flex: 1, paddingStart: sizeConfig.spacing, alignItems: 'flex-start' }}>
          {endContent && (
            <View style={{ width: '100%', alignItems: 'flex-start' }}>
              {timestamp && <Text style={[timestampStyle, { textAlign: 'left' }]}>{timestamp}</Text>}
              {title && <Text style={[titleStyle, { textAlign: 'left' }]}>{title}</Text>}
              {alignChildText(children, 'left')}
            </View>
          )}
        </View>
      </View>
    );
  }

  const content = (title || children) ? (
    <View style={contentStyle}>
      {timestamp && <Text style={timestampStyle}>{timestamp}</Text>}
      {title && <Text style={titleStyle}>{title}</Text>}
      {resolvedDescriptionColor
        ? applyTextStyle(children, { color: resolvedDescriptionColor, textAlign: atEnd ? 'right' : 'left' })
        : children}
    </View>
  ) : null;

  // An end-aligned item puts its content before the bullet (the row flips under RTL).
  return (
    <View
      ref={ref}
      style={[{ flexDirection: 'row', position: 'relative', alignItems: 'flex-start' }, atEnd && { justifyContent: 'flex-end' }, spacingStyle, style]}
      {...otherProps}
    >
      {getLine()}
      {atEnd ? content : bulletNode}
      {atEnd ? bulletNode : content}
    </View>
  );
}, { displayName: 'Timeline.Item' });

const isTimelineItem = (child: React.ReactNode): child is React.ReactElement<TimelineItemInternalProps> =>
  React.isValidElement(child) && child.type === TimelineItem;

// Root Timeline
const TimelineRoot = factory<{ props: TimelineProps; ref: View }>(({
  children,
  active,
  color,
  titleColor,
  descriptionColor,
  timestampColor,
  lineWidth,
  bulletSize,
  align = 'left',
  reverseActive = false,
  size = 'md',
  centerMode = false,
  style,
  ...rest
}, ref) => {
  const theme = useTheme();
  const { styleProps, otherProps } = extractStyleProps(rest);
  const spacingStyle = useStyleProps(styleProps);

  const baseMetrics = useMemo(() => getTimelineMetrics(theme, size), [theme, size]);
  const resolvedTimelineColor = resolveAccentColor(theme, color) ?? theme.colors.primary[5];
  const effectiveLineWidth = lineWidth ?? baseMetrics.lineWidth;
  const effectiveBulletSize = bulletSize ?? baseMetrics.bulletSize;

  const contextValue = useMemo<TimelineContextValue>(
    () => ({
      active,
      color: resolvedTimelineColor,
      lineWidth: effectiveLineWidth,
      bulletSize: effectiveBulletSize,
      align,
      reverseActive,
      size,
      metrics: { ...baseMetrics, lineWidth: effectiveLineWidth, bulletSize: effectiveBulletSize },
      centerMode,
      titleColor,
      descriptionColor,
      timestampColor,
    }),
    [
      active,
      resolvedTimelineColor,
      effectiveLineWidth,
      effectiveBulletSize,
      align,
      reverseActive,
      size,
      baseMetrics,
      centerMode,
      titleColor,
      descriptionColor,
      timestampColor,
    ]
  );

  // Items are numbered in item order (other children are ignored).
  const items = React.Children.toArray(children).filter(isTimelineItem);
  const processedItems = items.map((item, idx) =>
    React.cloneElement(item, {
      key: item.key ?? idx,
      itemIndex: idx,
      isLastItem: idx === items.length - 1,
      // Center mode alternates sides unless an item picks one.
      ...(centerMode ? { itemAlign: item.props.itemAlign || (idx % 2 === 0 ? 'left' : 'right') } : null),
    })
  );

  return (
    <TimelineContext.Provider value={contextValue}>
      <View ref={ref} style={[{ position: 'relative', width: '100%' }, spacingStyle, style]} {...otherProps}>
        {processedItems}
      </View>
    </TimelineContext.Provider>
  );
}, { displayName: 'Timeline' });

/** A vertical sequence of events with bullets and connecting lines. */
export const Timeline = withStatics(TimelineRoot, { Item: TimelineItem });

export type { TimelineProps, TimelineItemProps };
