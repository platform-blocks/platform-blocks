import React, { useCallback } from 'react';
import { View, type LayoutChangeEvent, type PanResponderInstance, type ViewProps } from 'react-native';

import type { AdjustableProps } from '../../../core/accessibility/useAdjustable';
import { getGestureSurfaceStyle } from '../../../core/gestures';
import { knobStyles as styles } from '../styles';
import { SurfaceLayers, type SurfaceLayersProps } from './SurfaceLayers';
import { TickLayers, type TickLayersProps } from './TickLayers';
import { PointerLayer, type PointerLayerProps } from './PointerLayer';
import { ThumbLayer, type ThumbLayerProps } from './ThumbLayer';

/**
 * Encapsulates the interactive host view for the Knob plus its visual layers so the
 * root component can stay focused on state/logic.
 */
export type KnobSurfaceProps = Omit<ViewProps, 'onLayout' | 'children'> & {
  size: number;
  disabled: boolean;
  trackColor: string;
  /**
   * The control's accessibility: `role="slider"` (native adjustable), aria-value*,
   * the name/description wiring, increment/decrement actions, and the web
   * keyboard handler + tab stop — from `useAdjustable`.
   */
  a11y: AdjustableProps;
  setHostRef: (node: View | null) => void;
  panHandlers?: PanResponderInstance['panHandlers'];
  handleLayout?: (event: LayoutChangeEvent) => void;
  surfaceLayersProps: SurfaceLayersProps;
  tickLayersProps: TickLayersProps;
  pointerLayerProps: PointerLayerProps;
  thumbLayerProps: ThumbLayerProps;
  centerSlot?: React.ReactNode;
  onLayout?: ViewProps['onLayout'];
};

export const KnobSurface: React.FC<KnobSurfaceProps> = ({
  size,
  disabled,
  trackColor,
  a11y,
  setHostRef,
  panHandlers,
  handleLayout,
  surfaceLayersProps,
  tickLayersProps,
  pointerLayerProps,
  thumbLayerProps,
  centerSlot,
  style,
  testID,
  onLayout: userOnLayout,
  ...rest
}) => {
  const combinedOnLayout = useCallback(
    (event: LayoutChangeEvent) => {
      handleLayout?.(event);
      userOnLayout?.(event);
    },
    [handleLayout, userOnLayout]
  );

  return (
    <View
      ref={setHostRef}
      {...panHandlers}
      onLayout={combinedOnLayout}
      accessible
      {...a11y}
      style={[
        styles.knob,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: trackColor,
          opacity: disabled ? 0.6 : 1,
        },
        // The knob owns both axes: a spin or a vertical slide must never be
        // reinterpreted as a page scroll once the pointer leaves the dial.
        getGestureSurfaceStyle({ enabled: !disabled, cursor: disabled ? undefined : 'grab' }),
        style,
      ]}
      testID={testID}
      {...rest}
    >
      <SurfaceLayers {...surfaceLayersProps} />
      <TickLayers {...tickLayersProps} />
      {/* The pointer reaches the centre, so it draws *under* the centre slot — otherwise an
          arm would run straight through a centred value label or status icon. */}
      <PointerLayer {...pointerLayerProps} />
      {centerSlot}
      <ThumbLayer {...thumbLayerProps} />
    </View>
  );
};
