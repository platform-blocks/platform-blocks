import React, { useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Svg, { Path, Rect, Defs, LinearGradient, Stop, RadialGradient, ClipPath } from 'react-native-svg';
// Internal encoder implementation
import { encode as internalEncode } from './core/encoder';
import { buildMatrix as internalBuildMatrix } from './core/buildMatrix';
import {
  a11yProps,
  factory,
  getLayoutStyles,
  resolveBg,
  resolveImageSource,
  resolveRadius,
  Text,
  useStyleProps,
  useTheme,
} from '@plocks/ui';
import type { QRCodeSVGProps } from './types';
import { getQRCodeLabel } from './a11y';

/**
 * Behind-the-logo fill. White (not a theme color) on purpose: scanners need the
 * quiet area under a logo to read as "light" whatever the app's color scheme.
 */
const LOGO_BACKGROUND = '#FFFFFF';

function gradientEndpoints(rotation = 0) {
  const radians = rotation * Math.PI / 180;
  const dx = Math.cos(radians) * 50;
  const dy = Math.sin(radians) * 50;
  const percent = (value: number) => `${Number(value.toFixed(6))}%`;
  return {
    x1: percent(50 - dx),
    y1: percent(50 - dy),
    x2: percent(50 + dx),
    y2: percent(50 + dy),
  };
}

const styles = StyleSheet.create({
  logoOverlay: { position: 'absolute', top: 0, bottom: 0, start: 0, end: 0, alignItems: 'center', justifyContent: 'center' },
});

export const QRCodeSVG = factory<{ props: QRCodeSVGProps; ref: View }>((props, ref) => {
  const {
    value,
    size = 200,
    bg,
    // Scanner-facing defaults: black on white reads everywhere.
    color = '#000000',
    errorCorrectionLevel = 'M',
    quietZone = 4,
    logo,
    style,
    testID,
    accessibilityLabel,
    onError,
    moduleShape = 'square',
    cornerRadius = 0.25,
    gradient,
    fullWidth,
  } = props;

  const theme = useTheme();
  const backgroundColor = resolveBg(theme, bg) ?? '#FFFFFF';

  // `bg` fills the code itself (below), so it stays off the generic root style.
  const spacingStyles = useStyleProps({ ...props, bg: undefined });
  const layoutStyles = getLayoutStyles({ fullWidth });
  const imageA11y = a11yProps({ role: 'img', label: getQRCodeLabel(value, accessibilityLabel), accessible: true });
  const logoRadius = logo?.borderRadius ?? resolveRadius(theme, 'lg');

  // Generate the QR code matrix with the package's encoder.
  const qrData = useMemo(() => {
    try {
      if (!value || value.trim() === '') {
        throw new Error('QR Code value cannot be empty');
      }

      const eccMap: Record<string, 'L' | 'M' | 'Q' | 'H'> = { L: 'L', M: 'M', Q: 'Q', H: 'H' };
      const ecc = eccMap[errorCorrectionLevel] || 'M';

      const displayValue = value;
      const enc = internalEncode(displayValue, ecc);
      const darkMatrix = internalBuildMatrix(enc);
      const moduleCount = darkMatrix.length;
      const totalModules = moduleCount + quietZone * 2;
      const moduleSize = size / totalModules;
      const actualSize = moduleSize * totalModules;
      const offset = (size - actualSize) / 2;
      const format = (num: number) => Number(num.toFixed(6));

      // Build module paths individually (needed for rounded / diamond shapes)
      let path = '';
      let roundedRects: string[] = [];
      const diamondPaths: string[] = [];
      const isRounded = moduleShape === 'rounded';
      const isDiamond = moduleShape === 'diamond';
      const radius = isRounded ? Math.min(moduleSize / 2, moduleSize * cornerRadius) : 0;

      // Finder patterns coordinates (top-left, top-right, bottom-left) 7x7 squares
      const finderCoords = [
        { r: 0, c: 0 },
        { r: 0, c: moduleCount - 7 },
        { r: moduleCount - 7, c: 0 },
      ];
      const inFinder = (rr: number, cc: number) => {
        return finderCoords.some(f => rr >= f.r && rr < f.r + 7 && cc >= f.c && cc < f.c + 7);
      };

      for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
          if (darkMatrix[r][c] !== 1) continue;
          const x = offset + (c + quietZone) * moduleSize;
          const y = offset + (r + quietZone) * moduleSize;

          // Always use square shapes for finder patterns (corner anchors) regardless of moduleShape
          const isInFinder = inFinder(r, c);

          if (isInFinder || (!isDiamond && !isRounded)) {
            // Square modules (default, or finder patterns)
            const ms = format(moduleSize);
            path += `M${format(x)},${format(y)}h${ms}v${ms}h-${ms}z`;
          } else if (isDiamond) {
            // Diamond modules (but not finder patterns)
            const cx = x + moduleSize / 2;
            const cy = y + moduleSize / 2;
            const d = moduleSize / Math.SQRT2;
            diamondPaths.push(
              `M${format(cx)} ${format(cy - d / 2)}L${format(cx + d / 2)} ${format(cy)}L${format(cx)} ${format(cy + d / 2)}L${format(cx - d / 2)} ${format(cy)}Z`
            );
          } else if (isRounded) {
            // Rounded modules (but not finder patterns)
            roundedRects.push(
              `M${format(x)} ${format(y + radius)}Q${format(x)} ${format(y)} ${format(x + radius)} ${format(y)}H${format(x + moduleSize - radius)}Q${format(x + moduleSize)} ${format(y)} ${format(x + moduleSize)} ${format(y + radius)}V${format(y + moduleSize - radius)}Q${format(x + moduleSize)} ${format(y + moduleSize)} ${format(x + moduleSize - radius)} ${format(y + moduleSize)}H${format(x + radius)}Q${format(x)} ${format(y + moduleSize)} ${format(x)} ${format(y + moduleSize - radius)}Z`
            );
          }
        }
      }

      return { moduleCount, moduleSize, actualSize, offset, path, roundedRects, diamondPaths, error: null };
    } catch (error) {
      onError?.(error as Error);
      return {
        moduleCount: 0,
        moduleSize: 0,
        actualSize: size,
        offset: 0,
        path: '',
        roundedRects: [],
        diamondPaths: [],

        error: error as Error,
      };
    }
  }, [value, size, errorCorrectionLevel, quietZone, onError, moduleShape, cornerRadius]);

  const containerStyle = [
    {
      width: size,
      height: size,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      backgroundColor: backgroundColor,
    },
    // `fullWidth` first, so an explicit `w` (in `spacingStyles`) wins.
    layoutStyles,
    spacingStyles,
    style,
  ];

  // Error fallback
  // Determine if we actually have drawable geometry (square path OR rounded/diamond collections)
  const hasGeometry = (
    (qrData.path && qrData.path.length > 0) ||
    (qrData.roundedRects && qrData.roundedRects.length > 0) ||
    (qrData.diamondPaths && qrData.diamondPaths.length > 0)
  );

  // Error fallback – previously treated an empty path as failure which broke rounded / diamond shapes
  if (qrData.error || !hasGeometry) {
    return (
      <View ref={ref} style={containerStyle} testID={testID} {...imageA11y}>
        <View
          style={{
            width: size * 0.8,
            height: size * 0.8,
            backgroundColor: theme.backgrounds.subtle,
            alignItems: 'center',
            borderRadius: resolveRadius(theme, 'lg'),
          }}
        >
          <Text variant="caption" c="secondary" ta="center">
            QR Code
            {'\n'}
            Generation
            {'\n'}
            Error
          </Text>
        </View>
      </View>
    );
  }

  const { moduleSize, offset, path: qrPath, roundedRects, diamondPaths } = qrData;
  const logoSize = logo?.size ?? 40;
  const logoX = (size - logoSize) / 2;
  const logoY = (size - logoSize) / 2;

  return (
    <View ref={ref} style={containerStyle} testID={testID} {...imageA11y}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          {gradient && gradient.type !== 'radial' && (
            <LinearGradient id="qrGradient" {...gradientEndpoints(gradient.rotation)}>
              <Stop offset="0%" stopColor={gradient.from} />
              <Stop offset="100%" stopColor={gradient.to} />
            </LinearGradient>
          )}
          {gradient && gradient.type === 'radial' && (
            <RadialGradient id="qrGradient" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={gradient.from} />
              <Stop offset="100%" stopColor={gradient.to} />
            </RadialGradient>
          )}
          {logo && (
            <ClipPath id="logoClip">
              <Rect
                x={logoX}
                y={logoY}
                width={logoSize}
                height={logoSize}
                rx={logoRadius}
                ry={logoRadius}
              />
            </ClipPath>
          )}
        </Defs>
        {/* Background */}
        <Rect
          x={0}
          y={0}
          width={size}
          height={size}
          fill={backgroundColor}
        />
        {/* Modules - Square modules (including finder patterns) and shaped data modules */}
        {/* Always render square modules (finder patterns + square moduleShape) */}
        <Path d={qrPath} fill={gradient ? 'url(#qrGradient)' : color} fillRule="evenodd" />

        {/* Render additional shaped modules if moduleShape is not square */}
        {moduleShape === 'rounded' && roundedRects.length > 0 && (
          roundedRects.map((d, i) => <Path key={`rounded-${i}`} d={d} fill={gradient ? 'url(#qrGradient)' : color} />)
        )}
        {moduleShape === 'diamond' && diamondPaths.length > 0 && (
          diamondPaths.map((d, i) => <Path key={`diamond-${i}`} d={d} fill={gradient ? 'url(#qrGradient)' : color} />)
        )}
        {logo && (
          <Rect
            // Clear area under logo (white rect) for better scan reliability
            x={logoX}
            y={logoY}
            width={logoSize}
            height={logoSize}
            rx={logoRadius}
            ry={logoRadius}
            fill={logo.backgroundColor || LOGO_BACKGROUND}
          />
        )}
      </Svg>

      {/* Logo overlay — centered by a full-cover flex box, so RTL can't offset it. */}
      {logo && (
        <View style={styles.logoOverlay} pointerEvents="none">
          <View
            style={{
              width: logoSize,
              height: logoSize,
              backgroundColor: logo.backgroundColor || LOGO_BACKGROUND,
              borderRadius: logoRadius,
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              padding: 2,
            }}
          >
            {logo.element ? (
              logo.element
            ) : (
              <Image
                source={resolveImageSource(logo.uri)}
                style={{ width: logoSize, height: logoSize, borderRadius: logoRadius }}
              />
            )}
          </View>
        </View>
      )}
    </View>
  );
}, { displayName: 'QRCodeSVG' });
