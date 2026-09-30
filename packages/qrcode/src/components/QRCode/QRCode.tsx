import React, { useCallback } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';

import {
  a11yProps,
  CopyButton,
  factory,
  getLayoutStyles,
  mergeSlotProps,
  resolveComponentSize,
  resolveRadius,
  Text,
  useClipboard,
  useStyleProps,
  useTheme,
  useToast,
} from '@plocks/ui';
import type { ComponentSize } from '@plocks/ui';
import type { QRCodeProps } from './types';
import { QRCodeSVG } from './QRCodeSVG';
import { getQRCodeLabel } from './a11y';

/**
 * Pixel footprint for each size token. These are QR box sizes, not control
 * heights, so they don't come from the control-size table. QR codes stay
 * legible down to `xs` because the module grid scales with the overall box.
 */
const QR_CODE_SIZE_SCALE: Record<ComponentSize, number> = {
  xs: 96,
  sm: 128,
  md: 160,
  lg: 200,
  xl: 256,
  '2xl': 320,
  '3xl': 400,
};

const styles = StyleSheet.create({
  captioned: { alignItems: 'center', gap: 6 },
  caption: { alignItems: 'center', gap: 2 },
  code: { overflow: 'hidden' },
});

/**
 * QRCode Component
 *
 * Generates QR codes using the internal full-spec SVG engine. The code is
 * exposed to assistive technology as an image named by `accessibilityLabel`,
 * a string `label`, or `"QR code: <value>"`.
 */
export const QRCode = factory<{ props: QRCodeProps; ref: View }>((props, ref) => {
  const {
    value,
    size = 400,
    bg: backgroundColor,
    color,
    errorCorrectionLevel = 'M',
    quietZone = 4,
    logo,
    label,
    description,
    labelPosition = 'bottom',
    labelProps,
    descriptionProps,
    style,
    testID,
    accessibilityLabel,
    onError,
    moduleShape,
    cornerRadius,
    gradient,
    copyOnPress,
    showCopyButton,
    copyToastTitle,
    copyToastMessage,
    fullWidth,
  } = props;

  const theme = useTheme();
  // `bg` is the code's background (passed to QRCodeSVG), not the root's.
  const spacingStyles = useStyleProps({ ...props, bg: undefined });
  const layoutStyles = getLayoutStyles({ fullWidth });

  // A caption already names the code, so it doubles as the accessibility label.
  const resolvedAccessibilityLabel = getQRCodeLabel(value, accessibilityLabel ?? (typeof label === 'string' ? label : undefined));

  // A scanner needs a dark foreground on a light background in every theme.
  const resolvedColor = color ?? '#000000';

  // `size` accepts a token or a raw pixel value; numbers pass straight through.
  const resolvedSize = resolveComponentSize(size, QR_CODE_SIZE_SCALE, { fallback: 'md' }) as number;

  const { copy } = useClipboard();
  const toast = useToast();

  const shouldCopyOnPress = !!copyOnPress;
  const copyValue = typeof copyOnPress === 'object' && copyOnPress?.value ? copyOnPress.value : value;

  const handleCopy = useCallback(async () => {
    await copy(copyValue);
    if (toast) {
      toast.show({
        title: copyToastTitle || 'Copied',
        message: copyToastMessage || (copyValue.length > 60 ? copyValue.slice(0, 57) + '…' : copyValue),
      });
    }
  }, [copy, copyValue, toast, copyToastMessage, copyToastTitle]);

  const content = (
    <View style={[styles.code, { borderRadius: resolveRadius(theme, 'lg') }]}>
      <QRCodeSVG
        value={value}
        size={resolvedSize}
        maw="100%"
        bg={backgroundColor}
        color={resolvedColor}
        errorCorrectionLevel={errorCorrectionLevel}
        quietZone={quietZone}
        logo={logo}
        moduleShape={moduleShape}
        cornerRadius={cornerRadius}
        gradient={gradient}
        testID={testID ? `${testID}-code` : undefined}
        onError={onError}
        accessibilityLabel={resolvedAccessibilityLabel}
      />
      {showCopyButton && (
        <CopyButton value={copyValue} iconOnly size="sm" style={{ position: 'absolute', top: 8, end: 8 }} />
      )}
    </View>
  );

  const code = shouldCopyOnPress ? (
    <Pressable
      onPress={handleCopy}
      {...a11yProps({ role: 'button', label: resolvedAccessibilityLabel, hint: 'Copies the encoded value' })}
    >
      {content}
    </Pressable>
  ) : (
    content
  );

  // The caption sits outside the pressable so tapping the text doesn't copy.
  const hasCaption = label != null || description != null;
  const caption = hasCaption ? (
    <View style={styles.caption}>
      {label != null ? (
        <Text {...mergeSlotProps({ variant: 'small', c: 'muted' }, labelProps)}>{label}</Text>
      ) : null}
      {description != null ? (
        <Text {...mergeSlotProps({ variant: 'small', c: 'secondary' }, descriptionProps)}>{description}</Text>
      ) : null}
    </View>
  ) : null;

  return (
    <View
      ref={ref}
      // `fullWidth` first, so an explicit `w` (in `spacingStyles`) wins.
      style={[hasCaption ? styles.captioned : null, layoutStyles, spacingStyles, style]}
      testID={testID}
    >
      {labelPosition === 'top' ? caption : null}
      {code}
      {labelPosition === 'bottom' ? caption : null}
    </View>
  );
}, { displayName: 'QRCode' });
