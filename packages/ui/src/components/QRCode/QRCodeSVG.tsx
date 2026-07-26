import React, { useMemo } from 'react';
import { Image, View } from 'react-native';
import Svg, { Path, Rect, Defs, LinearGradient, Stop, RadialGradient, ClipPath } from 'react-native-svg';
// Internal encoder implementation (replaces external dependency)
import { encode as internalEncode } from './core/encoder';
import { buildMatrix as internalBuildMatrix } from './core/buildMatrix';
import { useTheme } from '../../core/theme';
import { getSpacingStyles, extractSpacingProps, getLayoutStyles, extractLayoutProps } from '../../core/utils';
import { Text } from '../Text';
import type { QRCodeSVGProps } from './types';
import { resolveImageSource } from '../../utils/imageSource';

export function QRCodeSVG(props: QRCodeSVGProps) {
  const { spacingProps, otherProps: propsAfterSpacing } = extractSpacingProps(props);
  const { layoutProps, otherProps } = extractLayoutProps(propsAfterSpacing);

  const {
    value,
    size = 200,
    backgroundColor = '#FFFFFF',
    color = '#000000',
    errorCorrectionLevel = 'M',
    quietZone = 4,
    logo,
    style,
    testID,
    accessibilityLabel,
    onError,
    moduleShape = 'square',
    finderShape = 'square',
    cornerRadius = 0.25,
    gradient,
    ...rest
  } = otherProps;

  const theme = useTheme();

  const spacingStyles = getSpacingStyles(spacingProps);
  const layoutStyles = getLayoutStyles(layoutProps);

  // Generate QR code matrix (external library by default; internal experimental encoder if sentinel prefix)
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
    spacingStyles,
    layoutStyles,
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
      <View style={containerStyle} testID={testID} {...rest}>
        <View
          style={{
            width: size * 0.8,
            height: size * 0.8,
            backgroundColor: theme.colors.gray[2],
            alignItems: 'center',
            // justifyContent: 'center',
            borderRadius: 8,
          }}
        >
          <Text variant="caption" color="secondary" align="center">
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
    <View style={containerStyle} testID={testID} {...rest}>
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        accessibilityLabel={accessibilityLabel || `QR Code containing: ${value}`}
      >
        <Defs>
          {gradient && gradient.type !== 'radial' && (
            <LinearGradient id="qrGradient" x1="0%" y1="0%" x2={gradient.rotation ? '100%' : '100%'} y2={gradient.rotation ? '0%' : '100%'}>
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
                rx={logo.borderRadius || 8}
                ry={logo.borderRadius || 8}
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
            rx={logo.borderRadius || 8}
            ry={logo.borderRadius || 8}
            fill={logo.backgroundColor || '#FFFFFF'}
          />
        )}
      </Svg>

      {/* Logo overlay */}
      {logo && (
        <View
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: [
              { translateX: -logoSize / 2 },
              { translateY: -logoSize / 2 },
            ],
            width: logoSize,
            height: logoSize,
            backgroundColor: logo.backgroundColor || '#FFFFFF',
            borderRadius: logo.borderRadius || 8,
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
              style={{
                width: logoSize,
                height: logoSize,
                borderRadius: logo.borderRadius || 8,
              }}
            />
            // <Text variant="caption" color="secondary" align="center">
            //   LOGO
            // </Text>
          )}
        </View>
      )}
    </View>
  );
}

QRCodeSVG.displayName = 'QRCodeSVG';
