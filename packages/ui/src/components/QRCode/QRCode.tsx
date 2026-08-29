import React, { useCallback } from 'react';
import { View, Pressable } from 'react-native';
import { extractSpacingProps, extractLayoutProps, mergeSlotProps } from '../../core/utils';
import { Text } from '../Text';
import type { QRCodeProps } from './types';
import { QRCodeSVG } from './QRCodeSVG';
import { CopyButton } from '../CopyButton/CopyButton';
import { useClipboard } from '../../hooks';
import { useToast } from '../Toast/ToastProvider';
import { useTheme } from '../../core/theme';
import { resolveComponentSize, type ComponentSize } from '../../core/theme/componentSize';

/**
 * Pixel footprint for each size token. QR codes stay legible down to `xs`
 * because the module grid scales with the overall box.
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

/**
 * QRCode Component
 *
 * Generates QR codes using the internal full-spec SVG engine.
 */
export function QRCode(props: QRCodeProps) {
  const theme = useTheme();
  const { spacingProps, otherProps: propsAfterSpacing } = extractSpacingProps(props);
  const { layoutProps, otherProps } = extractLayoutProps(propsAfterSpacing);
  
  const {
    value,
    size = 400,
    backgroundColor = 'transparent',
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
    onLoadStart, // deprecated noop
    onLoadEnd,   // deprecated noop
    ...rest
  } = otherProps;

  // A caption already names the code, so it doubles as the accessibility label.
  const resolvedAccessibilityLabel =
    accessibilityLabel ?? (typeof label === 'string' ? label : undefined);

  // Default color to theme's primary text color for dark mode support
  const resolvedColor = color ?? theme.text.primary;

  // `size` accepts a token or a raw pixel value; numbers pass straight through.
  const resolvedSize = resolveComponentSize(size, QR_CODE_SIZE_SCALE, { fallback: 'md' }) as number;

  const { copy } = useClipboard();
  const toast = useToast();

  const shouldCopyOnPress = !!otherProps.copyOnPress;
  const copyValue = typeof otherProps.copyOnPress === 'object' && otherProps.copyOnPress?.value
    ? otherProps.copyOnPress.value
    : value;

  const handleCopy = useCallback(async () => {
    await copy(copyValue);
    if (toast) {
      toast.show({
        title: otherProps.copyToastTitle || 'Copied',
        message: otherProps.copyToastMessage || (copyValue.length > 60 ? copyValue.slice(0,57)+'…' : copyValue)
      });
    }
  }, [copy, copyValue, toast, otherProps.copyToastMessage, otherProps.copyToastTitle]);

  const content = (
    <View
      style={{ borderRadius: 8, overflow: 'hidden'}}>
      <QRCodeSVG
        value={value}
        size={resolvedSize}
        maxW={'100%'}
        backgroundColor={backgroundColor}
        color={resolvedColor}
        errorCorrectionLevel={errorCorrectionLevel}
        quietZone={quietZone}
        logo={logo}
        style={style}
        testID={testID}
        onError={onError}
        accessibilityLabel={resolvedAccessibilityLabel}
        {...spacingProps}
        {...layoutProps}
        {...rest}
      />
      {otherProps.showCopyButton && (
        <CopyButton
          value={copyValue}
          iconOnly
          size="sm"
          style={{ position: 'absolute', top: 8, right: 8 }}
          onCopy={() => { /* toast handled in button itself via provider */ }}
        />
      )}
    </View>
  );

  const code = shouldCopyOnPress ? (
    <Pressable onPress={handleCopy} accessibilityLabel={resolvedAccessibilityLabel || 'QR code'}>
      {content}
    </Pressable>
  ) : (
    content
  );

  if (label == null && description == null) return code;

  // The caption sits outside the pressable so tapping the text doesn't copy.
  const caption = (
    <View style={{ alignItems: 'center', gap: 2 }}>
      {label != null ? (
        <Text {...mergeSlotProps({ variant: 'small', color: 'muted' }, labelProps)}>
          {label}
        </Text>
      ) : null}
      {description != null ? (
        <Text {...mergeSlotProps({ variant: 'small', color: 'secondary' }, descriptionProps)}>
          {description}
        </Text>
      ) : null}
    </View>
  );

  return (
    <View style={{ alignItems: 'center', gap: 6 }}>
      {labelPosition === 'top' ? caption : null}
      {code}
      {labelPosition === 'bottom' ? caption : null}
    </View>
  );
}

QRCode.displayName = 'QRCode';
