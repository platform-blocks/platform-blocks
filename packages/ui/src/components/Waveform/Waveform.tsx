import React, { useMemo, useCallback, useRef, useState, useEffect, useId } from 'react';
import { View, Text as RNText } from 'react-native';
import type { GestureResponderEvent, LayoutChangeEvent } from 'react-native';
import {
  acquirePageScrollLock,
  getGestureSurfaceStyle,
  releasePageScrollLock,
} from '../../core/gestures';
import Svg, { Path, Rect, LinearGradient, Stop, Defs, Line, G, Circle, Text as SvgText } from 'react-native-svg';

import { factory } from '../../core/factory/factory';
import { a11yProps } from '../../core/accessibility/a11yProps';
import { useAdjustable } from '../../core/accessibility/useAdjustable';
import { useLatestCallback } from '../../core/hooks/useLatestCallback';
import { hasDOM } from '../../core/platform';
import type { WebKeyboardEvent } from '../../core/platform';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveAccentColor } from '../../core/theme/resolveColors';
import { literalBackgrounds, literalText } from '../../core/theme/cssVariableTheme';
import { onColor, resolveFontSize, resolveRadius } from '../../core/theme/tokens';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import type { WaveformProps, PerformanceMetrics, WaveformSizeMetrics } from './types';
import { WaveformSkeleton } from './WaveformSkeleton';
import { useMergedRef } from '../../core/utils/mergeRefs';
import {
  resolveComponentSize,
  type ComponentSize,
  type ComponentSizeValue,
} from '../../core/theme/componentSize';
import { devWarn, warnOnce } from '../../core/utils/logger';
import { useElementSize } from '../../hooks/useElementSize';

/** `m:ss` / `h:mm:ss`. */
export function formatWaveformTime(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/** Keyboard seek step when the duration is known. */
const SEEK_STEP_SECONDS = 5;

/** Reads the web-only `shiftKey` off a responder event (false on native). */
const isShiftPressed = (event: GestureResponderEvent) =>
  !!(event.nativeEvent as unknown as { shiftKey?: boolean }).shiftKey;

const WAVEFORM_ALLOWED_SIZES: ComponentSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];

// Full seven-token scale. `md` reproduces the historical prop defaults exactly,
// so adding the prop is a no-op for existing usage.
const WAVEFORM_SIZE_SCALE: Record<ComponentSize, WaveformSizeMetrics> = {
  xs: { height: 24, barWidth: 1, barGap: 1, strokeWidth: 1, minBarHeight: 1, labelFontSize: 8 },
  sm: { height: 40, barWidth: 2, barGap: 1, strokeWidth: 1.5, minBarHeight: 1, labelFontSize: 9 },
  md: { height: 60, barWidth: 2, barGap: 1, strokeWidth: 2, minBarHeight: 1, labelFontSize: 10 },
  lg: { height: 80, barWidth: 3, barGap: 2, strokeWidth: 2.5, minBarHeight: 2, labelFontSize: 11 },
  xl: { height: 104, barWidth: 4, barGap: 2, strokeWidth: 3, minBarHeight: 2, labelFontSize: 12 },
  '2xl': { height: 132, barWidth: 5, barGap: 3, strokeWidth: 4, minBarHeight: 3, labelFontSize: 14 },
  '3xl': { height: 160, barWidth: 6, barGap: 3, strokeWidth: 5, minBarHeight: 3, labelFontSize: 16 },
};

const BASE_WAVEFORM_METRICS = WAVEFORM_SIZE_SCALE.md;

const resolveWaveformMetrics = (value: ComponentSizeValue | undefined): WaveformSizeMetrics => {
  // A numeric size is read as the waveform height; the bar metrics scale with it
  // so a custom value stays proportional instead of snapping to the nearest token.
  if (typeof value === 'number') {
    const ratio = value / BASE_WAVEFORM_METRICS.height;
    return {
      height: value,
      barWidth: Math.max(1, Math.round(BASE_WAVEFORM_METRICS.barWidth * ratio)),
      barGap: Math.max(1, Math.round(BASE_WAVEFORM_METRICS.barGap * ratio)),
      strokeWidth: Math.max(1, Math.round(BASE_WAVEFORM_METRICS.strokeWidth * ratio * 2) / 2),
      minBarHeight: Math.max(1, Math.round(BASE_WAVEFORM_METRICS.minBarHeight * ratio)),
      labelFontSize: Math.max(8, Math.round(BASE_WAVEFORM_METRICS.labelFontSize * ratio)),
    };
  }

  const resolved = resolveComponentSize(value, WAVEFORM_SIZE_SCALE, {
    allowedSizes: WAVEFORM_ALLOWED_SIZES,
    fallback: 'md',
  });

  return typeof resolved === 'number' ? resolveWaveformMetrics(resolved) : resolved;
};

export const Waveform = factory<{ props: WaveformProps; ref: View }>((props, ref) => {
  // `w` / `h` are the drawing's px geometry: they are applied with it below,
  // not with the other style props.
  const { w = 300, h: hProp, ...propsWithoutSize } = props;
  const { styleProps, otherProps } = extractStyleProps(propsWithoutSize);
  const {
    peaks,
    color = 'primary',
    size,
    barWidth: barWidthProp,
    barGap: barGapProp,
    strokeWidth: strokeWidthProp,
    minBarHeight: minBarHeightProp,
    variant = 'bars',
    gradientColors,
    progress = 0,
    progressColor,
    interactive = false,
    normalize = false,
    fullWidth = false,
    onSeek,
    onDragStart,
    onDrag,
    onDragEnd,
    accessibilityLabel,
    accessibilityHint,
    style,
    testID,
    maxVisibleBars,
    showProgressLine = false,
    progressLineStyle,
    showTimeStamps = false,
    duration,
    timeStampInterval,
    loading = false,
    error,
    loadingProgress,
    selection,
    onSelectionChange,
    showRMS = false,
    rmsData,
    markers = [],
    enablePerformanceMonitoring = false,
    onPerformanceMetrics,
    onKeyDown,
    onLayout: onLayoutProp,
    ...restProps
  } = otherProps;

  const theme = useTheme();
  const spacingStyles = useStyleProps(styleProps);
  // SVG paint attributes can't take the `var()` references web themes use for
  // text / background roles, so the drawing reads the literal colors.
  const svgText = literalText(theme);
  const svgBackgrounds = literalBackgrounds(theme);

  // Size token supplies the defaults; an explicit prop always wins over the
  // value its token would have contributed.
  const metrics = useMemo(() => resolveWaveformMetrics(size), [size]);
  const h = hProp ?? metrics.height;
  const barWidth = barWidthProp ?? metrics.barWidth;
  const barGap = barGapProp ?? metrics.barGap;
  const strokeWidth = strokeWidthProp ?? metrics.strokeWidth;
  const minBarHeight = minBarHeightProp ?? metrics.minBarHeight;
  const labelFontSize = metrics.labelFontSize;

  const containerRef = useRef<View>(null);
  // Layout measurement keeps its own handle; the consumer's ref is composed in.
  const mergedContainerRef = useMergedRef<View>(containerRef, ref);
  const { width: containerWidth, onLayout: measureLayout } = useElementSize();
  const [isDragging, setIsDragging] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);

  // Performance monitoring: time from render start to commit.
  const renderStartTime = useRef<number>(0);
  if (enablePerformanceMonitoring) {
    renderStartTime.current = performance.now();
  }
  const reportPerformance = useLatestCallback(onPerformanceMetrics);
  useEffect(() => {
    if (!enablePerformanceMonitoring || renderStartTime.current <= 0) return;
    reportPerformance({
      renderTime: performance.now() - renderStartTime.current,
      elementsRendered: peaks.length,
      memoryUsage: peaks.length * 8, // Rough estimate
      averageFPS: 60, // Would need proper FPS tracking
    } satisfies PerformanceMetrics);
  }, [peaks, enablePerformanceMonitoring, reportPerformance]);

  // A palette token, `primary.6` shade syntax, or a raw color string.
  const resolveColor = useCallback(
    (val: string | undefined, fallback: string) => resolveAccentColor(theme, val) ?? fallback,
    [theme],
  );

  const waveformColor = resolveColor(color, theme.colors.primary[5]);
  const actualProgressColor = resolveColor(progressColor, theme.colors.success[5]);

  // Normalize gradient colors (allow semantic keys inside gradientColors too).
  // Without an explicit list the `gradient` variant would have no stops and
  // render nothing, so derive a two-stop ramp from `color` instead.
  const resolvedGradientColors = useMemo(() => {
    if (gradientColors && gradientColors.length > 0) {
      return gradientColors.map(c => resolveColor(c, c));
    }

    const palette = (theme.colors as Record<string, string[] | undefined>)[color];
    if (Array.isArray(palette)) {
      return [palette[3] ?? waveformColor, palette[7] ?? waveformColor];
    }

    return [waveformColor, waveformColor];
  }, [gradientColors, resolveColor, theme.colors, color, waveformColor]);

  // Process peaks data for rendering with virtual windowing
  const processedPeaks = useMemo(() => {
    if (!peaks || peaks.length === 0) {
      warnOnce('waveform:no-peaks', 'Waveform: No peaks data provided');
      return [];
    }

    // Validate peaks data
    if (!Array.isArray(peaks)) {
      warnOnce('waveform:peaks-type', 'Waveform: peaks must be an array');
      return [];
    }

    const totalBarSpace = barWidth + barGap;
    let targetBars: number;

    if (fullWidth) {
      // For fullWidth, use maxVisibleBars or render all peaks
      targetBars = maxVisibleBars || peaks.length;
    } else {
      // For fixed w, calculate how many bars fit
      const maxBars = Math.floor(w / totalBarSpace);
      targetBars = maxVisibleBars ? Math.min(maxBars, maxVisibleBars) : maxBars;
    }

    if (targetBars <= 0) {
      warnOnce('waveform:too-narrow', 'Waveform: Not enough width to render any bars');
      return [];
    }

    // If we have fewer peaks than target bars, return all peaks
    if (peaks.length <= targetBars) {
      return peaks;
    }

    // Implement virtual windowing - downsample to target number of bars
    const ratio = peaks.length / targetBars;
    const downsampled: number[] = [];

    for (let i = 0; i < targetBars; i++) {
      const start = Math.floor(i * ratio);
      const end = Math.floor((i + 1) * ratio);

      let maxValue = 0;
      for (let j = start; j < end && j < peaks.length; j++) {
        const value = peaks[j];
        if (typeof value === 'number' && !isNaN(value)) {
          maxValue = Math.max(maxValue, Math.abs(value));
        }
      }
      downsampled.push(maxValue);
    }

    return downsampled;
  }, [peaks, w, barWidth, barGap, fullWidth, maxVisibleBars]);

  // Normalize peaks if requested
  const normalizedPeaks = useMemo(() => {
    if (!normalize || processedPeaks.length === 0) {
      return processedPeaks;
    }

    // Find the maximum absolute value in the processed peaks
    const maxValue = Math.max(...processedPeaks.map(Math.abs));

    // If maxValue is 0 or very small, return original values to avoid division by zero
    if (maxValue <= 0.001) {
      return processedPeaks;
    }

    // Scale all values so the maximum becomes 1.0
    return processedPeaks.map(peak => peak / maxValue);
  }, [processedPeaks, normalize]);

  // Calculate progress position relative to actual waveform width
  const actualWaveformWidth = normalizedPeaks.length * (barWidth + barGap) - barGap;
  const clampedProgress = Math.max(0, Math.min(1, typeof progress === 'number' && !isNaN(progress) ? progress : 0));
  const progressX = clampedProgress * actualWaveformWidth;

  // Handle fullWidth behavior - SVG configuration
  const svgProps = useMemo(() => {
    if (fullWidth) {
      return {
        width: '100%',
        height: h,
        viewBox: `0 0 ${actualWaveformWidth} ${h}`,
        preserveAspectRatio: 'none'
      };
    }
    return {
      width: w,
      height: h
    };
  }, [fullWidth, actualWaveformWidth, h, w]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    measureLayout(event);
    onLayoutProp?.(event);
  }, [measureLayout, onLayoutProp]);

  const calculatePosition = useCallback((locationX: number) => {
    let position: number;

    if (fullWidth) {
      // For fullWidth, use the measured container width
      position = containerWidth > 0 ? locationX / containerWidth : locationX / (w || 300);
    } else {
      // For fixed width, calculate position relative to actual waveform width
      position = Math.min(locationX, actualWaveformWidth) / actualWaveformWidth;
    }

    return Math.max(0, Math.min(1, position));
  }, [fullWidth, containerWidth, w, actualWaveformWidth]);

  const handleResponderGrant = useCallback((event: GestureResponderEvent) => {
    if (!interactive) return;

    try {
      const position = calculatePosition(event.nativeEvent?.locationX ?? 0);

      // Shift+press selects a range instead of seeking (web).
      if (isShiftPressed(event) && onSelectionChange) {
        setIsSelecting(true);
        setSelectionStart(position);
      } else {
        setIsDragging(true);
        onDragStart?.(position);
        onSeek?.(position);
      }
    } catch (err) {
      devWarn('Waveform: Error handling drag start', err);
    }
  }, [interactive, calculatePosition, onDragStart, onSeek, onSelectionChange]);

  const handleResponderMove = useCallback((event: GestureResponderEvent) => {
    if (!interactive) return;

    try {
      const position = calculatePosition(event.nativeEvent?.locationX ?? 0);

      if (isSelecting && selectionStart !== null && onSelectionChange) {
        // Update selection range
        onSelectionChange([Math.min(selectionStart, position), Math.max(selectionStart, position)]);
      } else if (isDragging) {
        onDrag?.(position);
        onSeek?.(position);
      }
    } catch (err) {
      devWarn('Waveform: Error handling drag move', err);
    }
  }, [interactive, isDragging, isSelecting, selectionStart, calculatePosition, onDrag, onSeek, onSelectionChange]);

  const handleResponderRelease = useCallback((event: GestureResponderEvent) => {
    if (!interactive) return;

    try {
      const position = calculatePosition(event.nativeEvent?.locationX ?? 0);

      if (isSelecting && selectionStart !== null && onSelectionChange) {
        // Finalize selection
        onSelectionChange([Math.min(selectionStart, position), Math.max(selectionStart, position)]);
        setIsSelecting(false);
        setSelectionStart(null);
      } else if (isDragging) {
        setIsDragging(false);
        onDragEnd?.(position);
      }
    } catch (err) {
      devWarn('Waveform: Error handling drag end', err);
    }
  }, [interactive, isDragging, isSelecting, selectionStart, calculatePosition, onDragEnd, onSelectionChange]);

  // Seek to the pressed position when interaction is enabled.
  const handlePress = useCallback((event: GestureResponderEvent) => {
    if (!interactive || !onSeek) return;

    try {
      onSeek(calculatePosition(event.nativeEvent?.locationX ?? 0));
    } catch (err) {
      devWarn('Waveform: Error handling press event', err);
    }
  }, [interactive, onSeek, calculatePosition]);

  // --- Accessibility: a seek slider when interactive, otherwise an image ---
  const seekable = interactive && !!onSeek;
  const percent = Math.round(clampedProgress * 1000) / 10;
  const valueText = duration && duration > 0
    ? `${formatWaveformTime(clampedProgress * duration)} of ${formatWaveformTime(duration)}`
    : `${Math.round(clampedProgress * 100)}%`;
  const { adjustableProps } = useAdjustable({
    value: percent,
    min: 0,
    max: 100,
    step: duration && duration > 0 ? Math.min(100, (SEEK_STEP_SECONDS / duration) * 100) : 1,
    largeStep: 10,
    onChange: (next) => onSeek?.(next / 100),
    label: accessibilityLabel || 'Audio waveform',
    hint: accessibilityHint || 'Tap to seek to a position, or drag to scrub through',
    valueText,
    disabled: !seekable,
  });
  const adjustableKeyDown = adjustableProps.onKeyDown;

  // Web keys: the consumer's handler first (AudioPlayer shortcuts), then the
  // slider keys, then Space — which, for compatibility, dispatches the
  // documented `waveformSpacePress` DOM event for apps that toggle playback.
  const handleKeyDown = useCallback((event: WebKeyboardEvent) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    adjustableKeyDown?.(event);
    if (event.defaultPrevented || !interactive) return;
    if (event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      if (hasDOM) document.dispatchEvent(new CustomEvent('waveformSpacePress'));
    }
  }, [onKeyDown, adjustableKeyDown, interactive]);

  const renderBars = () => {
    return normalizedPeaks.map((peak, index) => {
      const x = index * (barWidth + barGap);
      const barHeight = Math.max(minBarHeight, Math.abs(peak) * h * 0.8);
      const y = (h - barHeight) / 2;

      const isProgress = x < progressX;
      const fillColor = isProgress ? actualProgressColor : waveformColor;

      return (
        <Rect
          key={index}
          x={x}
          y={y}
          width={barWidth}
          height={barHeight}
          fill={fillColor}
          rx={variant === 'rounded' ? barWidth / 2 : 0}
        />
      );
    });
  };

  const renderLine = () => {
    if (normalizedPeaks.length === 0) return null;

    let pathData = '';
    let progressPathData = '';
    const stepX = actualWaveformWidth / (normalizedPeaks.length - 1);

    normalizedPeaks.forEach((peak, index) => {
      const x = index * stepX;
      const y = h / 2 + (peak * h * 0.4);

      const lineCommand = index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
      pathData += lineCommand;

      // Build progress path up to the progress position
      if (x <= progressX) {
        progressPathData += lineCommand;
      }
    });

    return (
      <>
        {/* Main waveform line */}
        <Path d={pathData} stroke={waveformColor} strokeWidth={strokeWidth} fill="none" />
        {/* Progress highlight line */}
        {progressPathData && (
          <Path d={progressPathData} stroke={actualProgressColor} strokeWidth={strokeWidth} fill="none" />
        )}
      </>
    );
  };

  const gradientId = `waveform-gradient-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  const renderGradient = () => {
    return (
      <>
        <Defs>
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            {resolvedGradientColors.map((stopColor, index) => (
              <Stop
                key={index}
                offset={`${(index / (resolvedGradientColors.length - 1 || 1)) * 100}%`}
                stopColor={stopColor}
              />
            ))}
          </LinearGradient>
        </Defs>
        {normalizedPeaks.map((peak, index) => {
          const x = index * (barWidth + barGap);
          const barHeight = Math.max(minBarHeight, Math.abs(peak) * h * 0.8);
          const y = (h - barHeight) / 2;

          return (
            <Rect key={index} x={x} y={y} width={barWidth} height={barHeight} fill={`url(#${gradientId})`} />
          );
        })}
      </>
    );
  };

  // Progress line component
  const ProgressLine = useMemo(() => {
    if (!showProgressLine) return null;

    const lineX = clampedProgress * actualWaveformWidth;

    return (
      <Line
        x1={lineX}
        y1={0}
        x2={lineX}
        y2={h}
        stroke={progressLineStyle?.color || svgText.secondary}
        strokeWidth={progressLineStyle?.width || 2}
        strokeOpacity={progressLineStyle?.opacity || 0.8}
      />
    );
  }, [showProgressLine, clampedProgress, actualWaveformWidth, h, progressLineStyle, svgText.secondary]);

  // Timestamp markers component
  const TimeStamps = useMemo(() => {
    if (!showTimeStamps || !duration || !timeStampInterval) return null;

    const timestamps = [];
    const intervalCount = Math.floor(duration / timeStampInterval);

    for (let i = 0; i <= intervalCount; i++) {
      const time = i * timeStampInterval;
      const x = (time / duration) * actualWaveformWidth;

      timestamps.push(
        <G key={i}>
          <Line x1={x} y1={h - 10} x2={x} y2={h} stroke={svgText.muted} strokeWidth={1} strokeOpacity={0.6} />
          <SvgText
            x={x}
            y={h + 15}
            fill={svgText.secondary}
            fontSize={labelFontSize}
            textAnchor="middle"
            opacity={0.8}
          >
            {formatWaveformTime(time)}
          </SvgText>
        </G>
      );
    }

    return <G>{timestamps}</G>;
  }, [showTimeStamps, duration, timeStampInterval, actualWaveformWidth, h, labelFontSize, svgText.muted, svgText.secondary]);

  // Selection overlay component
  const SelectionOverlay = useMemo(() => {
    if (!selection || selection[0] === selection[1]) return null;

    const [start, end] = selection;
    const startX = start * actualWaveformWidth;
    const endX = end * actualWaveformWidth;

    return (
      <Rect
        x={startX}
        y={0}
        width={endX - startX}
        height={h}
        fill={theme.colors.primary[3]}
        opacity={0.3}
        stroke={theme.colors.primary[5]}
        strokeWidth={1}
        strokeOpacity={0.8}
      />
    );
  }, [selection, actualWaveformWidth, h, theme.colors.primary]);

  // Markers component
  const Markers = useMemo(() => {
    if (!markers || markers.length === 0) return null;

    return (
      <G>
        {markers.map((marker, index) => {
          const x = marker.position * actualWaveformWidth;
          const markerColor = marker.color || theme.colors.warning[5];

          switch (marker.type || 'line') {
            case 'line':
              return (
                <G key={index}>
                  <Line x1={x} y1={0} x2={x} y2={h} stroke={markerColor} strokeWidth={2} strokeOpacity={0.8} />
                  {marker.label && (
                    <SvgText x={x} y={-5} fill={markerColor} fontSize={labelFontSize} textAnchor="middle" fontWeight="bold">
                      {marker.label}
                    </SvgText>
                  )}
                </G>
              );
            case 'flag':
              return (
                <G key={index}>
                  <Line x1={x} y1={0} x2={x} y2={h} stroke={markerColor} strokeWidth={1} strokeOpacity={0.6} />
                  <Rect
                    x={x + 2}
                    y={2}
                    width={marker.label ? marker.label.length * 6 + 4 : 20}
                    height={14}
                    fill={markerColor}
                    rx={2}
                  />
                  {marker.label && (
                    <SvgText
                      x={x + 4}
                      y={12}
                      fill={onColor(theme, markerColor)}
                      fontSize={Math.max(8, labelFontSize - 1)}
                      fontWeight="bold"
                    >
                      {marker.label}
                    </SvgText>
                  )}
                </G>
              );
            case 'dot':
              return (
                <G key={index}>
                  <Circle cx={x} cy={h / 2} r={4} fill={markerColor} stroke={svgBackgrounds.base} strokeWidth={1} />
                  {marker.label && (
                    <SvgText
                      x={x}
                      y={h / 2 + 20}
                      fill={markerColor}
                      fontSize={labelFontSize}
                      textAnchor="middle"
                      fontWeight="bold"
                    >
                      {marker.label}
                    </SvgText>
                  )}
                </G>
              );
            default:
              return null;
          }
        })}
      </G>
    );
  }, [markers, actualWaveformWidth, h, labelFontSize, theme, svgBackgrounds.base]);

  // RMS visualization component
  const RMSBars = useMemo(() => {
    if (!showRMS || !rmsData || rmsData.length === 0) return null;

    const processedRMS = rmsData.slice(0, normalizedPeaks.length);

    return (
      <G opacity={0.5}>
        {processedRMS.map((rms, index) => {
          const x = index * (barWidth + barGap);
          const rmsHeight = Math.max(minBarHeight, Math.abs(rms) * h * 0.4); // RMS bars are shorter
          const y = (h - rmsHeight) / 2;

          return (
            <Rect
              key={`rms-${index}`}
              x={x}
              y={y}
              width={barWidth}
              height={rmsHeight}
              fill={svgText.muted}
              rx={variant === 'rounded' ? barWidth / 2 : 0}
            />
          );
        })}
      </G>
    );
  }, [showRMS, rmsData, normalizedPeaks, barWidth, barGap, minBarHeight, h, variant, svgText.muted]);

  const renderWaveform = () => {
    switch (variant) {
      case 'line':
        return renderLine();
      case 'gradient':
        return renderGradient();
      case 'bars':
      case 'rounded':
      default:
        return renderBars();
    }
  };

  const widthStyle = fullWidth ? { width: '100%' as const } : { width: w };

  if (loading) {
    return (
      <WaveformSkeleton
        ref={ref}
        w={w}
        h={h}
        fullWidth={fullWidth}
        barsCount={maxVisibleBars || 20}
        progress={loadingProgress}
        style={[spacingStyles, style]}
        testID={testID}
      />
    );
  }

  if (error) {
    return (
      <View
        ref={ref}
        style={[
          spacingStyles,
          style,
          widthStyle,
          {
            height: h,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.error[1],
            borderRadius: resolveRadius(theme, 'sm'),
            borderWidth: 1,
            borderColor: theme.colors.error[3],
          }
        ]}
        testID={testID}
        {...restProps}
        role="alert"
        aria-label={`Waveform error: ${error}`}
      >
        <RNText style={{ color: theme.colors.error[7], fontSize: resolveFontSize(theme, 'xs'), textAlign: 'center' }}>
          {error}
        </RNText>
      </View>
    );
  }

  // Empty state
  if (normalizedPeaks.length === 0) {
    return (
      <View
        ref={ref}
        style={[spacingStyles, style, widthStyle, { height: h, justifyContent: 'center', alignItems: 'center' }]}
        testID={testID}
        {...restProps}
        {...a11yProps({ role: 'img', label: accessibilityLabel || 'Empty waveform', accessible: true })}
      >
        <Svg {...svgProps}>
          {/* Render a minimal placeholder */}
          <Rect x={0} y={h / 2 - 1} width={fullWidth ? '100%' : w} height={2} fill={waveformColor} opacity={0.3} />
        </Svg>
      </View>
    );
  }

  const interactionProps = interactive
    ? {
        onStartShouldSetResponder: () => true,
        onMoveShouldSetResponder: () => true,
        onResponderGrant: (event: GestureResponderEvent) => {
          acquirePageScrollLock();
          if (onDragStart || onDrag || onDragEnd || onSelectionChange) handleResponderGrant(event);
          else handlePress(event);
        },
        onResponderMove: onDrag || onSelectionChange ? handleResponderMove : undefined,
        onResponderRelease: (event: GestureResponderEvent) => {
          releasePageScrollLock();
          if (onDragEnd || onSelectionChange) handleResponderRelease(event);
        },
        // A scrub that drifts vertically stays a scrub: neither an enclosing
        // ScrollView nor the browser gets to take the gesture back mid-drag.
        onResponderTerminationRequest: () => false,
        onResponderTerminate: () => {
          releasePageScrollLock();
        },
        onShouldBlockNativeResponder: () => true,
      }
    : null;

  const roleProps = seekable
    ? adjustableProps
    : a11yProps({
        role: 'img',
        label: accessibilityLabel || (interactive ? 'Audio waveform' : 'Audio waveform visualization'),
      });

  return (
    <View
      ref={mergedContainerRef}
      style={[
        // A waveform is a large surface, so it keeps `pan-y`: vertical page
        // scrolling still works over it, while a horizontal scrub is ours for
        // the whole gesture. Compact controls (Slider, Knob) claim both axes.
        getGestureSurfaceStyle({ axis: 'x', enabled: interactive, cursor: interactive ? 'pointer' : undefined }),
        spacingStyles,
        style,
        widthStyle,
      ]}
      testID={testID}
      accessible
      focusable={seekable}
      onLayout={handleLayout}
      {...interactionProps}
      {...roleProps}
      {...restProps}
      onKeyDown={handleKeyDown}
    >
      <Svg {...svgProps}>
        {SelectionOverlay}
        {RMSBars}
        {renderWaveform()}
        {ProgressLine}
        {TimeStamps}
        {Markers}
      </Svg>
    </View>
  );
}, { displayName: 'Waveform' });
