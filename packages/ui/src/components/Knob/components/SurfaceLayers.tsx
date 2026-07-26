import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import type { KnobFillStyle } from '../types';
import type { LayoutState } from '../hooks/useKnobGeometry';
import { knobStyles as styles } from '../styles';

export type SurfaceLayersProps = {
  layoutState: LayoutState;
  fillConfig?: KnobFillStyle | null;
  fillRadius: number;
  fillDiameter: number;
  ringBaseDiameter: number;
  ringSvgCenter: number;
  ringBackgroundColor?: string;
  ringBaseStroke: string;
  ringPath: string;
  ringSegmentPaths: { key: string; path: string; color: string; thickness: number }[];
  ringThickness: number;
  ringCap: 'butt' | 'round';
  ringShadowStyle: ViewStyle | null;
  trackStyle?: StyleProp<ViewStyle>;
  showContiguousProgress: boolean;
  progressPath: string;
  progressStrokeColor: string;
  progressThickness: number;
  progressStrokeCap: 'butt' | 'round';
  showSplitProgress: boolean;
  splitPositivePath?: string;
  splitNegativePath?: string;
  splitPositiveColor: string;
  splitNegativeColor: string;
  showZeroIndicator: boolean;
  zeroIndicatorPoints?: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null;
  zeroIndicatorColor: string;
};

export const SurfaceLayers: React.FC<SurfaceLayersProps> = ({
  layoutState,
  fillConfig,
  fillRadius,
  fillDiameter,
  ringBaseDiameter,
  ringSvgCenter,
  ringBackgroundColor,
  ringBaseStroke,
  ringPath,
  ringSegmentPaths,
  ringThickness,
  ringCap,
  ringShadowStyle,
  trackStyle,
  showContiguousProgress,
  progressPath,
  progressStrokeColor,
  progressThickness,
  progressStrokeCap,
  showSplitProgress,
  splitPositivePath,
  splitNegativePath,
  splitPositiveColor,
  splitNegativeColor,
  showZeroIndicator,
  zeroIndicatorPoints,
  zeroIndicatorColor,
}) => {
  const shouldRenderFill = Boolean(fillConfig && fillDiameter > 0);

  return (
    <>
      {/* Background disk first: it spans the whole knob, so painting it after the fill hid
          the body entirely and made `appearance.fill` a no-op. */}
      <View
        pointerEvents="none"
        style={[
          styles.ringBase,
          {
            left: layoutState.cx - ringSvgCenter,
            top: layoutState.cy - ringSvgCenter,
            width: ringBaseDiameter,
            height: ringBaseDiameter,
            borderRadius: ringBaseDiameter / 2,
            backgroundColor: ringBackgroundColor,
          },
          ringShadowStyle ?? undefined,
          trackStyle,
        ]}
      />

      {shouldRenderFill && fillConfig ? (
        <Svg
          pointerEvents="none"
          width={fillDiameter}
          height={fillDiameter}
          style={[
            styles.fillLayer,
            {
              left: layoutState.cx - fillRadius,
              top: layoutState.cy - fillRadius,
            },
          ]}
        >
          <Circle
            cx={fillRadius}
            cy={fillRadius}
            r={Math.max(0, fillRadius - (fillConfig.borderWidth ?? 0) / 2)}
            fill={fillConfig.color}
            stroke={fillConfig.borderColor}
            strokeWidth={fillConfig.borderWidth ?? 0}
          />
        </Svg>
      ) : null}

      <Svg
        pointerEvents="none"
        width={ringBaseDiameter}
        height={ringBaseDiameter}
        style={[
          styles.ringSvg,
          {
            left: layoutState.cx - ringSvgCenter,
            top: layoutState.cy - ringSvgCenter,
          },
        ]}
      >
        <Path
          d={ringPath}
          stroke={ringBaseStroke}
          strokeWidth={ringThickness}
          strokeLinecap={ringCap}
          fill="none"
        />
        {ringSegmentPaths.map((segment) => (
          <Path
            key={segment.key}
            d={segment.path}
            stroke={segment.color}
            strokeWidth={segment.thickness}
            strokeLinecap="butt"
            fill="none"
          />
        ))}
        {showContiguousProgress && progressPath ? (
          <Path
            d={progressPath}
            stroke={progressStrokeColor}
            strokeWidth={progressThickness}
            strokeLinecap={progressStrokeCap}
            fill="none"
          />
        ) : null}
        {showSplitProgress && splitNegativePath ? (
          <Path
            d={splitNegativePath}
            stroke={splitNegativeColor}
            strokeWidth={progressThickness}
            strokeLinecap={progressStrokeCap}
            fill="none"
          />
        ) : null}
        {showSplitProgress && splitPositivePath ? (
          <Path
            d={splitPositivePath}
            stroke={splitPositiveColor}
            strokeWidth={progressThickness}
            strokeLinecap={progressStrokeCap}
            fill="none"
          />
        ) : null}
        {showZeroIndicator && zeroIndicatorPoints ? (
          <Line
            x1={zeroIndicatorPoints.x1}
            y1={zeroIndicatorPoints.y1}
            x2={zeroIndicatorPoints.x2}
            y2={zeroIndicatorPoints.y2}
            stroke={zeroIndicatorColor}
            strokeWidth={Math.min(progressThickness * 0.6, 4)}
            strokeLinecap="round"
          />
        ) : null}
      </Svg>
    </>
  );
};
