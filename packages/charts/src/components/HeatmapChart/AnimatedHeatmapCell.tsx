import React, { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedProps, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { Rect as SvgRect, Text as SvgText } from 'react-native-svg';
import type { HeatmapCell } from '../../types';

const AnimatedRect = Animated.createAnimatedComponent(SvgRect);
const AnimatedText = Animated.createAnimatedComponent(SvgText);

// Utility to determine if text should be light or dark based on background color
function getContrastColor(hexColor: string): string {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance using relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return dark text for light backgrounds, light text for dark backgrounds
  return luminance > 0.5 ? '#1f2937' : '#ffffff';
}

export interface AnimatedHeatmapCellProps {
  cell: HeatmapCell & {
    x: number; // Grid index x position
    y: number; // Grid index y position
    pixelX: number; // Actual pixel x position
    pixelY: number; // Actual pixel y position
    width: number;
    height: number;
    color: string;
    normalizedValue: number; // 0-1 value for animation
    displayValue?: string;
  };
  isHovered?: boolean;
  index: number;
  disabled?: boolean;
  cornerRadius?: number;
  totalCells?: number; // Total number of cells for adaptive timing
  showText?: boolean; // Whether to show text inside cells
}

export const AnimatedHeatmapCell: React.FC<AnimatedHeatmapCellProps> = React.memo(({
  cell,
  isHovered = false,
  index,
  disabled = false,
  cornerRadius = 2,
  totalCells = 100,
  showText = true,
}) => {
  const opacity = useSharedValue(disabled ? 1 : 0);
  const scale = useSharedValue(disabled ? 1 : 0.3);
  const strokeWidth = useSharedValue(0);
  const emphasis = useSharedValue(isHovered ? 1 : 0);

  // Adaptive timing based on cell count
  const adaptiveTiming = React.useMemo(() => {
    if (totalCells <= 50) {
      return { opacityDuration: 400, scaleDuration: 500, staggerDelay: 8 };
    } else if (totalCells <= 200) {
      return { opacityDuration: 250, scaleDuration: 300, staggerDelay: 4 };
    } else if (totalCells <= 500) {
      return { opacityDuration: 150, scaleDuration: 200, staggerDelay: 2 };
    } else {
      return { opacityDuration: 80, scaleDuration: 120, staggerDelay: 1 };
    }
  }, [totalCells]);

  // Calculate adaptive font size based on cell dimensions
  const fontSize = React.useMemo(() => {
    const minDimension = Math.min(cell.width, cell.height);
    if (minDimension <= 20) return 8;
    if (minDimension <= 40) return 10;
    if (minDimension <= 60) return 12;
    if (minDimension <= 80) return 14;
    return 16;
  }, [cell.width, cell.height]);

  // Hover emphasis grows the label the cell already draws rather than stacking a
  // second, larger one over it. The growth is capped by the cell's own height so
  // an emphasised value can never spill into its neighbours.
  const hoverFontSize = React.useMemo(
    () => Math.max(fontSize, Math.min(fontSize * 1.25, cell.height * 0.45)),
    [fontSize, cell.height]
  );

  // Get text color for contrast
  const textColor = React.useMemo(() => getContrastColor(cell.color), [cell.color]);

  useEffect(() => {
    if (disabled) {
      opacity.value = 1;
      scale.value = 1;
      strokeWidth.value = isHovered ? 1.2 : 0;
      emphasis.value = isHovered ? 1 : 0;
      return;
    }

    const delay = index * adaptiveTiming.staggerDelay; // Adaptive staggered animation
    opacity.value = withDelay(
      delay,
      withTiming(1, {
        duration: adaptiveTiming.opacityDuration,
        easing: Easing.out(Easing.cubic),
      })
    );
    
    scale.value = withDelay(
      delay,
      withTiming(1, {
        duration: adaptiveTiming.scaleDuration,
        easing: Easing.out(Easing.back(1.1)),
      })
    );

    // Handle hover state
    strokeWidth.value = withTiming(isHovered ? 1.2 : 0, {
      duration: 150,
      easing: Easing.out(Easing.quad),
    });

    emphasis.value = withTiming(isHovered ? 1 : 0, {
      duration: 150,
      easing: Easing.out(Easing.quad),
    });
  }, [disabled, index, isHovered, opacity, scale, strokeWidth, emphasis, adaptiveTiming]);

  // We animate scale by adjusting width/height and compensating x/y so cells grow from center.
  const animatedProps = useAnimatedProps(() => {
    const currentScale = scale.value;
    const w = cell.width * currentScale;
    const h = cell.height * currentScale;
    const dx = (cell.width - w) / 2;
    const dy = (cell.height - h) / 2;
    return {
      opacity: opacity.value,
      strokeWidth: strokeWidth.value,
      x: cell.pixelX + dx,
      y: cell.pixelY + dy,
      width: w,
      height: h,
    } as any; // cast for reanimated animated props on SvgRect
  });

  // The label is the cell's alone: hover only changes how it is drawn, so there is
  // never a second text node to double up on this one.
  const textAnimatedProps = useAnimatedProps(() => {
    const t = emphasis.value;
    const size = fontSize + (hoverFontSize - fontSize) * t;
    // Cells without a permanent label still reveal their value on hover, which is
    // what the old overlay existed for.
    const reveal = showText ? 1 : t;
    return {
      opacity: opacity.value * reveal,
      fontSize: size,
      // Re-centre the baseline as the glyphs grow so the label stays put.
      y: cell.pixelY + cell.height / 2 + size * 0.35,
    } as any;
  });

  return (
    <>
      <AnimatedRect
        animatedProps={animatedProps}
        // Static props; animated ones supplied via animatedProps
        fill={cell.color}
        stroke={isHovered ? '#111827' : 'none'}
        rx={cornerRadius}
        ry={cornerRadius}
      />
      {(showText || isHovered) && fontSize >= 8 && (
        <AnimatedText
          animatedProps={textAnimatedProps}
          x={cell.pixelX + cell.width / 2}
          fill={textColor}
          textAnchor="middle"
          pointerEvents="none"
          fontWeight={isHovered || fontSize <= 10 ? '600' : '500'} // Bolder text for small sizes
        >
          {cell.displayValue ?? (typeof cell.value === 'number'
            ? cell.value % 1 === 0
              ? cell.value.toString()
              : cell.value.toFixed(1)
            : String(cell.value))}
        </AnimatedText>
      )}
    </>
  );
});

AnimatedHeatmapCell.displayName = 'AnimatedHeatmapCell';