import React, { useEffect } from 'react';
import { View, ViewProps } from 'react-native';
import { ChartInteractionProvider, InteractionConfig, useOptionalChartInteraction } from './interaction/ChartInteractionContext';
import { ChartActiveTooltip } from './interaction/ChartActiveTooltip';
import { useElementOffset } from './interaction/useElementOffset';

export interface ChartsProviderProps extends ViewProps {
  /** Shared interaction configuration for all nested charts */
  config?: InteractionConfig;
  /** Automatically render the single shared tooltip (disable to mount manually) */
  withPopover?: boolean;
  /** Render children */
  children: React.ReactNode;
}

/**
 * ChartsProvider lets multiple charts share one interaction context (pointer, crosshair, series registry, zoom state).
 * Nested charts automatically reuse this interaction context and shared
 * popover. `useOwnInteractionProvider={false}` remains available for custom
 * chart compositions that provide their own root.
 *
 * Example:
 * <ChartsProvider config={{ multiTooltip: true, invertPinchZoom: true, invertWheelZoom: true }}>
 *   <LineChart ... />
 *   <ScatterChart ... />
 * </ChartsProvider>
 */
export const ChartsProvider: React.FC<ChartsProviderProps> = ({ config, withPopover = true, style, children, ...rest }) => {
  return (
    <ChartInteractionProvider config={config}>
      <RootOffsetCapture style={style} {...rest}>
        {children}
        {withPopover && <ChartActiveTooltip />}
      </RootOffsetCapture>
    </ChartInteractionProvider>
  );
};

// Alias more explicit name for docs friendliness
export const GlobalChartsRoot = ChartsProvider;

// Internal wrapper to capture the container's page offset cross-platform
// (web: getBoundingClientRect + scroll; native: measureInWindow) so the shared
// popover positions correctly on both platforms.
const RootOffsetCapture: React.FC<ViewProps> = ({ children, style, ...rest }) => {
  const ctx = useOptionalChartInteraction();
  const { offset, onLayout, ref } = useElementOffset();

  useEffect(() => {
    ctx?.setRootOffset?.({ left: offset.left, top: offset.top });
  }, [ctx, offset.left, offset.top]);

  return (
    <View ref={ref} onLayout={onLayout} style={[{ position: 'relative' }, style]} {...rest}>
      {children}
    </View>
  );
};

ChartsProvider.displayName = 'ChartsProvider';
