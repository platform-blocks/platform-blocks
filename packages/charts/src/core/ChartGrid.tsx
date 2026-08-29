import React from 'react';
import { View } from 'react-native';
import Svg, { Line, Defs, Pattern } from 'react-native-svg';
import Animated from 'react-native-reanimated';
import { useChartTheme } from '../theme/ChartThemeContext';
import { ChartGrid as ChartGridProps } from '../types';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const AnimatedLine = Animated.createAnimatedComponent(Line);

interface ChartGridComponentProps {
  /** Grid configuration */
  grid: ChartGridProps;
  /** Chart plot width */
  plotWidth: number;
  /** Chart plot height */
  plotHeight: number;
  /** X-axis tick positions (normalized 0-1) */
  xTicks?: number[];
  /** Y-axis tick positions (normalized 0-1) */
  yTicks?: number[];
  /** Chart padding */
  padding: { top: number; right: number; bottom: number; left: number };
  /** Use SVG rendering (default: true) */
  useSVG?: boolean;
}

export const ChartGrid: React.FC<ChartGridComponentProps> = ({
  grid,
  plotWidth,
  plotHeight,
  xTicks = [],
  yTicks = [],
  padding,
  useSVG = true,
}) => {
  const theme = useChartTheme();

  if (!grid.show) {
    return null;
  }

  const {
    color = theme.colors.grid,
    thickness = 1,
    style = 'solid',
    showMajor = true,
    showMinor = false,
    majorLines,
    minorLines,
  } = grid;

  const opacity = 0.3;
  const minorOpacity = 0.15;

  // Get stroke dash array based on style
  const getStrokeDashArray = (lineStyle: string, lineThickness: number) => {
    switch (lineStyle) {
      case 'dashed':
        return `${lineThickness * 4},${lineThickness * 2}`;
      case 'dotted':
        return `${lineThickness},${lineThickness}`;
      default:
        return undefined;
    }
  };

  if (useSVG) {
    return (
      <AnimatedSvg
        width={plotWidth}
        height={plotHeight}
        style={{ 
          position: 'absolute', 
          left: padding.left, 
          top: padding.top,
          pointerEvents: 'none' 
        }}
      >
        <Defs>
          {/* Pattern for dotted lines if needed */}
          {style === 'dotted' && (
            <Pattern
              id="dots"
              patternUnits="userSpaceOnUse"
              width={thickness * 2}
              height={thickness * 2}
            >
              <Line
                x1="0"
                y1={thickness}
                x2={thickness * 2}
                y2={thickness}
                stroke={color}
                strokeWidth={thickness}
              />
            </Pattern>
          )}
        </Defs>

        {/* Major horizontal grid lines (Y-axis ticks) */}
        {showMajor && yTicks.map((tick, index) => {
          const y = tick * plotHeight;
          return (
            <AnimatedLine
              key={`y-major-${index}`}
              x1="0"
              y1={y}
              x2={plotWidth}
              y2={y}
              stroke={color}
              strokeWidth={thickness}
              strokeOpacity={opacity}
              strokeDasharray={getStrokeDashArray(style, thickness)}
            />
          );
        })}

        {/* Major vertical grid lines (X-axis ticks) */}
        {showMajor && xTicks.map((tick, index) => {
          const x = tick * plotWidth;
          return (
            <AnimatedLine
              key={`x-major-${index}`}
              x1={x}
              y1="0"
              x2={x}
              y2={plotHeight}
              stroke={color}
              strokeWidth={thickness}
              strokeOpacity={opacity}
              strokeDasharray={getStrokeDashArray(style, thickness)}
            />
          );
        })}

        {/* Custom major lines */}
        {majorLines?.map((line, index) => (
          <AnimatedLine
            key={`custom-major-${index}`}
            x1="0"
            y1={line * plotHeight}
            x2={plotWidth}
            y2={line * plotHeight}
            stroke={color}
            strokeWidth={thickness}
            strokeOpacity={opacity}
            strokeDasharray={getStrokeDashArray(style, thickness)}
          />
        ))}

        {/* Minor grid lines */}
        {showMinor && minorLines?.map((line, index) => (
          <AnimatedLine
            key={`minor-${index}`}
            x1="0"
            y1={line * plotHeight}
            x2={plotWidth}
            y2={line * plotHeight}
            stroke={color}
            strokeWidth={thickness * 0.5}
            strokeOpacity={minorOpacity}
            strokeDasharray={getStrokeDashArray(style, thickness * 0.5)}
          />
        ))}
      </AnimatedSvg>
    );
  }

  // Fallback to View-based rendering
  return (
    <View 
      style={{ 
        position: 'absolute', 
        left: padding.left, 
        top: padding.top,
        pointerEvents: 'none' 
      }}
    >
      {/* Major horizontal grid lines (Y-axis ticks) */}
      {showMajor && yTicks.map((tick, index) => {
        const y = tick * plotHeight;
        return (
          <View
            key={`y-major-${index}`}
            style={{
              position: 'absolute',
              left: 0,
              top: y,
              width: plotWidth,
              height: thickness,
              backgroundColor: color,
              opacity,
            }}
          />
        );
      })}

      {/* Major vertical grid lines (X-axis ticks) */}
      {showMajor && xTicks.map((tick, index) => {
        const x = tick * plotWidth;
        return (
          <View
            key={`x-major-${index}`}
            style={{
              position: 'absolute',
              left: x,
              top: 0,
              width: thickness,
              height: plotHeight,
              backgroundColor: color,
              opacity,
            }}
          />
        );
      })}

      {/* Custom major lines */}
      {majorLines?.map((line, index) => (
        <View
          key={`custom-major-${index}`}
          style={{
            position: 'absolute',
            left: 0,
            top: line * plotHeight,
            width: plotWidth,
            height: thickness,
            backgroundColor: color,
            opacity,
          }}
        />
      ))}

      {/* Minor grid lines */}
      {showMinor && minorLines?.map((line, index) => (
        <View
          key={`minor-${index}`}
          style={{
            position: 'absolute',
            left: 0,
            top: line * plotHeight,
            width: plotWidth,
            height: thickness * 0.5,
            backgroundColor: color,
            opacity: minorOpacity,
          }}
        />
      ))}
    </View>
  );
};

export default ChartGrid;