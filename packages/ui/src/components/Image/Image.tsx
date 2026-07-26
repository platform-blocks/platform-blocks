import React, { useCallback, useMemo, useState } from 'react';
import { View, ViewStyle, ImageStyle, Image as RNImage, DimensionValue, StyleSheet } from 'react-native';
import { useTheme } from '../../core/theme';
import { getSpacingStyles, extractSpacingProps } from '../../core/utils';
import { getBorderRadius, RADIUS_SCALE } from '../../core/theme/radius';
import type { ImageProps } from './types';
import { resolveImageSource } from '../../utils/imageSource';

const IMAGE_SIZES = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
  '2xl': 80,
  '3xl': 96,
};

export function Image({
  src,
  source,
  alt,
  accessibilityLabel,
  resizeMode = 'cover',
  size,
  w,
  h,
  aspectRatio,
  borderWidth,
  borderColor,
  rounded,
  circle,
  fallback,
  loading,
  onLoad,
  onError,
  onLoadStart,
  onLoadEnd,
  containerStyle,
  imageStyle,
  testID,
  style,
  ...rest
}: ImageProps) {
  const theme = useTheme();
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const { spacingProps } = extractSpacingProps(rest);
  
  // Determine dimensions
  let finalWidth: DimensionValue | undefined = w as DimensionValue;
  let finalHeight: DimensionValue | undefined = h as DimensionValue;
  
  if (size && typeof size === 'string' && IMAGE_SIZES[size]) {
    finalWidth = finalWidth || IMAGE_SIZES[size];
    finalHeight = finalHeight || IMAGE_SIZES[size];
  } else if (typeof size === 'number') {
    finalWidth = finalWidth || size;
    finalHeight = finalHeight || size;
  }
  
  if (circle && finalWidth && !finalHeight) {
    finalHeight = finalWidth;
  }
  
  // Determine border radius
  let borderRadius: number | undefined;
  if (circle && finalWidth) {
    const dimension = typeof finalWidth === 'number' ? finalWidth : parseInt(String(finalWidth)) || 0;
    borderRadius = dimension / 2;
  } else if (rounded) {
    borderRadius = RADIUS_SCALE.md;
  }
  
  // Build styles
  const spacingStyles = getSpacingStyles(spacingProps);

  const flatContainerStyle = StyleSheet.flatten(containerStyle) as ViewStyle | undefined;
  const flatStyle = StyleSheet.flatten(style) as ViewStyle | undefined;

  const containerStyles: ViewStyle = {
    ...spacingStyles,
    ...flatContainerStyle,
  };

  // `style`/`containerStyle` size the wrapper, not the image. When a caller sizes the box
  // that way instead of through `w`/`h`/`size`, the inner image would otherwise fall back
  // to its intrinsic dimensions and ignore `resizeMode` — fill the box on each axis the
  // wrapper actually constrains.
  const boxWidth = flatStyle?.width ?? flatContainerStyle?.width;
  const boxHeight = flatStyle?.height ?? flatContainerStyle?.height;

  const imageStyles: ImageStyle = {
    width: finalWidth ?? (boxWidth !== undefined ? '100%' : undefined),
    height: finalHeight ?? (boxHeight !== undefined ? '100%' : undefined),
    aspectRatio,
    borderWidth,
    borderColor: borderColor || theme.colors.gray[3],
    borderRadius,
    ...StyleSheet.flatten(imageStyle),
  };

  if (finalWidth !== undefined) {
    containerStyles.width = finalWidth;
  }

  if (finalHeight !== undefined) {
    containerStyles.height = finalHeight;
  }

  if (aspectRatio !== undefined) {
    containerStyles.aspectRatio = aspectRatio;
  }

  if (borderRadius !== undefined) {
    containerStyles.borderRadius = borderRadius;
    // Ensure rounded corners clip child image/overlays when applicable
    if (containerStyles.overflow === undefined) {
      containerStyles.overflow = 'hidden';
    }
  }
  
  const combinedStyles: ViewStyle = {
    ...containerStyles,
    ...style,
  };

  // A radius supplied through `style` needs the same clipping the `rounded`/`circle` props get,
  // otherwise the square-cornered image bleeds past the rounded wrapper.
  if (combinedStyles.borderRadius !== undefined && combinedStyles.overflow === undefined) {
    combinedStyles.overflow = 'hidden';
  }

  // Determine image source (memoized to avoid re-triggering loads on each render)
  const imageSource = useMemo(() => {
    if (source) return source;
    return resolveImageSource(src);
  }, [source, src]);
  
  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    onLoadStart?.();
  }, [onLoadStart]);
  
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setLoadError(false);
    onLoad?.();
  }, [onLoad]);
  
  const handleError = useCallback((error: any) => {
    setIsLoading(false);
    setLoadError(true);
    onError?.(error);
  }, [onError]);
  
  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
    onLoadEnd?.();
  }, [onLoadEnd]);
  
  if (!imageSource && !fallback) {
    return null;
  }
  
  return (
    <View style={combinedStyles} testID={testID}>
      {isLoading && loading && (
        <View style={{ position: 'absolute', ...imageStyles, justifyContent: 'center', alignItems: 'center', zIndex: 1 }}>
          {loading}
        </View>
      )}
      
      {loadError && fallback ? (
        <View style={{ ...imageStyles, justifyContent: 'center', alignItems: 'center' }}>
          {fallback}
        </View>
      ) : imageSource ? (
        <RNImage
          source={imageSource}
          resizeMode={resizeMode}
          style={imageStyles}
          accessibilityLabel={accessibilityLabel || alt}
          onLoadStart={handleLoadStart}
          onLoad={handleLoad}
          onError={handleError}
          onLoadEnd={handleLoadEnd}
          testID={testID ? `${testID}-image` : undefined}
        />
      ) : fallback ? (
        <View style={{ ...imageStyles, justifyContent: 'center', alignItems: 'center' }}>
          {fallback}
        </View>
      ) : null}
    </View>
  );
}