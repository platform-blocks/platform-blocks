import React, { useCallback, useMemo, useState } from 'react';
import { View, Image as RNImage, StyleSheet } from 'react-native';
import type { DimensionValue, ImageErrorEventData, NativeSyntheticEvent, ViewStyle } from 'react-native';

import { factory } from '../../core/factory/factory';
import { a11yProps } from '../../core/accessibility/a11yProps';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveRadius } from '../../core/theme/tokens';
import { resolveStyleProps, useStyleProps } from '../../core/utils/spacing';
import { getLayoutStyles } from '../../core/utils/layout';
import { resolveImageSource } from '../../utils/imageSource';
import type { ImageProps } from './types';

/**
 * Square box presets for `size`. These are image footprints (thumbnail /
 * avatar-like sizes), not control heights, so they don't come from the
 * control-size table.
 */
const IMAGE_PRESET_SIZES: Record<string, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
  '2xl': 80,
  '3xl': 96,
};

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    zIndex: 1,
  },
});

function numericDimension(value: DimensionValue | undefined): number {
  if (typeof value === 'number') return value;
  return parseInt(String(value ?? ''), 10) || 0;
}

export const Image = factory<{ props: ImageProps; ref: View }>((props, ref) => {
  const {
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
    radius,
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
    fullWidth,
    ...rest
  } = props;

  const theme = useTheme();
  // `w` / `h` size the image too, so they are applied below (`sizeStyle`,
  // `imageBoxStyle`) rather than with the other style props.
  const propStyles = useStyleProps(rest);
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Dimensions: explicit w/h win over the size preset.
  const box = resolveStyleProps({ w, h });
  let finalWidth = box.width;
  let finalHeight = box.height;
  if (typeof size === 'number') {
    finalWidth = finalWidth ?? size;
    finalHeight = finalHeight ?? size;
  } else if (size && IMAGE_PRESET_SIZES[size]) {
    finalWidth = finalWidth ?? IMAGE_PRESET_SIZES[size];
    finalHeight = finalHeight ?? IMAGE_PRESET_SIZES[size];
  }
  if (circle && finalWidth !== undefined && finalHeight === undefined) {
    finalHeight = finalWidth;
  }

  let borderRadius: number | undefined;
  if (circle && finalWidth !== undefined) {
    borderRadius = numericDimension(finalWidth) / 2;
  } else if (radius !== undefined) {
    borderRadius = resolveRadius(theme, radius);
  } else if (rounded) {
    borderRadius = resolveRadius(theme, 'md');
  }

  // Read-only view of the caller's box styles: `style`/`containerStyle` size the
  // wrapper, not the image. When a caller sizes the box that way instead of
  // through `w`/`h`/`size`, the image fills the box on each constrained axis
  // (otherwise it falls back to its intrinsic size and ignores `resizeMode`).
  const callerBox = StyleSheet.flatten([containerStyle, style]) as ViewStyle | undefined;
  const layoutStyles = getLayoutStyles({ fullWidth });
  const boxWidth = callerBox?.width ?? layoutStyles.width;
  const boxHeight = callerBox?.height;

  const sizeStyle: ViewStyle = {};
  if (finalWidth !== undefined) sizeStyle.width = finalWidth;
  if (finalHeight !== undefined) sizeStyle.height = finalHeight;
  if (aspectRatio !== undefined) sizeStyle.aspectRatio = aspectRatio;
  if (borderRadius !== undefined) sizeStyle.borderRadius = borderRadius;

  // Rounded corners must clip the square image, whether the radius came from
  // `rounded`/`circle`/`radius` or from the caller's style.
  const needsClip =
    (borderRadius !== undefined || callerBox?.borderRadius !== undefined) && callerBox?.overflow === undefined;

  // Shared by the image and its loading/fallback boxes (valid as View and Image style).
  const imageBoxStyle = {
    width: finalWidth ?? (boxWidth !== undefined ? '100%' : undefined),
    height: finalHeight ?? (boxHeight !== undefined ? '100%' : undefined),
    aspectRatio,
    borderWidth,
    borderColor: borderColor || theme.backgrounds.border,
    borderRadius,
  };

  const imageSource = useMemo(() => source ?? resolveImageSource(src), [source, src]);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    onLoadStart?.();
  }, [onLoadStart]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setLoadError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(
    (error: NativeSyntheticEvent<ImageErrorEventData>) => {
      setIsLoading(false);
      setLoadError(true);
      onError?.(error);
    },
    [onError]
  );

  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
    onLoadEnd?.();
  }, [onLoadEnd]);

  if (!imageSource && !fallback) {
    return null;
  }

  // `alt=""` (or no text alternative at all) marks the image decorative.
  const label = accessibilityLabel ?? alt;
  const imageA11y = label
    ? a11yProps({ role: 'img', label, accessible: true })
    : a11yProps({ hidden: true, accessible: false });

  return (
    <View
      ref={ref}
      style={[propStyles, layoutStyles, containerStyle, sizeStyle, needsClip && { overflow: 'hidden' }, style]}
      testID={testID}
    >
      {isLoading && loading ? <View style={[imageBoxStyle, styles.overlay]}>{loading}</View> : null}

      {loadError && fallback ? (
        <View style={[imageBoxStyle, styles.center]}>{fallback}</View>
      ) : imageSource ? (
        <RNImage
          source={imageSource}
          resizeMode={resizeMode}
          style={[imageBoxStyle, imageStyle]}
          {...imageA11y}
          onLoadStart={handleLoadStart}
          onLoad={handleLoad}
          onError={handleError}
          onLoadEnd={handleLoadEnd}
          testID={testID ? `${testID}-image` : undefined}
        />
      ) : fallback ? (
        <View style={[imageBoxStyle, styles.center]}>{fallback}</View>
      ) : null}
    </View>
  );
}, { displayName: 'Image' });
