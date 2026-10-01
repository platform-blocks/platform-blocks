import React, { useId } from 'react';
import { View } from 'react-native';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Rect, Stop } from 'react-native-svg';

import { defaultExportOf, resolveOptionalModule } from './optionalModule';
import { isNative } from '../core/platform';

/** The expo-linear-gradient props the library uses (plus View props, which it forwards). */
type LinearGradientProps = Omit<ViewProps, 'style'> & {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  colors?: readonly string[];
  locations?: readonly number[] | null;
  start?: { x: number; y: number } | [number, number] | null;
  end?: { x: number; y: number } | [number, number] | null;
};

const LinearGradientFallback = React.forwardRef<View, LinearGradientProps>(function LinearGradientFallback({ children, style, colors, locations: _locations, start: _start, end: _end, ...viewProps }, ref) {
  const styles = [
    colors?.[0] ? { backgroundColor: colors[0] } : undefined,
    ...(Array.isArray(style) ? style : style ? [style] : []),
  ].filter(Boolean);

  return React.createElement(View, { ...viewProps, ref, style: styles }, children);
});

const NativeSvgGradient = React.forwardRef<View, LinearGradientProps>(function NativeSvgGradient({
  children,
  style,
  colors = [],
  locations,
  start = { x: 0.5, y: 0 },
  end = { x: 0.5, y: 1 },
  onLayout,
  ...viewProps
}, ref) {
  const id = `plocks-gradient-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  const stops = colors.length > 1 ? colors : [colors[0] ?? 'transparent', colors[0] ?? 'transparent'];
  const startPoint = Array.isArray(start) ? { x: start[0], y: start[1] } : start ?? { x: 0.5, y: 0 };
  const endPoint = Array.isArray(end) ? { x: end[0], y: end[1] } : end ?? { x: 0.5, y: 1 };

  return (
    <View
      ref={ref}
      {...viewProps}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setSize((previous) => previous.width === width && previous.height === height ? previous : { width, height });
        onLayout?.(event);
      }}
      style={[{ overflow: 'hidden', backgroundColor: stops[0] }, style]}
    >
      {size.width > 0 && size.height > 0 && <Svg width={size.width} height={size.height} style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
        <Defs>
          <SvgLinearGradient
            id={id}
            x1={`${startPoint.x * 100}%`}
            y1={`${startPoint.y * 100}%`}
            x2={`${endPoint.x * 100}%`}
            y2={`${endPoint.y * 100}%`}
          >
            {stops.map((color, index) => (
              <Stop
                key={index}
                offset={`${(locations?.[index] ?? index / (stops.length - 1)) * 100}%`}
                stopColor={color}
              />
            ))}
          </SvgLinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>}
      {children}
    </View>
  );
});

export function resolveLinearGradient() {
  if (isNative) {
    return { LinearGradient: NativeSvgGradient, hasLinearGradient: true } as const;
  }

  const linearGradientModule = resolveOptionalModule<React.ComponentType<LinearGradientProps>>('expo-linear-gradient', {
    accessor: (mod: { LinearGradient?: React.ComponentType<LinearGradientProps> } | null) =>
      mod?.LinearGradient ?? defaultExportOf<React.ComponentType<LinearGradientProps>>(mod),
    devWarning: 'expo-linear-gradient not installed; gradient-based components fall back to solid colors.',
  });

  const LinearGradientComponent = linearGradientModule ?? LinearGradientFallback;
  const hasLinearGradient = !!linearGradientModule;

  return {
    LinearGradient: LinearGradientComponent,
    hasLinearGradient,
  } as const;
}

/** The part of expo-document-picker the library calls. */
type DocumentPickerModule = {
  getDocumentAsync?: (options?: {
    multiple?: boolean;
    copyToCacheDirectory?: boolean;
    type?: string | string[];
  }) => Promise<unknown>;
};

export function resolveDocumentPicker() {
  const documentPickerModule = resolveOptionalModule<DocumentPickerModule>('expo-document-picker', {
    devWarning: 'expo-document-picker not installed; native file picker support is disabled.',
  });

  const hasDocumentPicker = !!documentPickerModule?.getDocumentAsync;

  return {
    DocumentPicker: documentPickerModule,
    hasDocumentPicker,
  } as const;
}
