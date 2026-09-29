import React from 'react';
import { View } from 'react-native';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';

import { defaultExportOf, resolveOptionalModule } from './optionalModule';

/** The expo-linear-gradient props the library uses (plus View props, which it forwards). */
type LinearGradientProps = Omit<ViewProps, 'style'> & {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  colors?: readonly string[];
  locations?: readonly number[] | null;
  start?: { x: number; y: number } | [number, number] | null;
  end?: { x: number; y: number } | [number, number] | null;
};

const LinearGradientFallback: React.FC<LinearGradientProps> = ({ children, style, colors }) => {
  const styles = [
    colors?.[0] ? { backgroundColor: colors[0] } : undefined,
    ...(Array.isArray(style) ? style : style ? [style] : []),
  ].filter(Boolean);

  return React.createElement(View, { style: styles }, children);
};

export function resolveLinearGradient() {
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
