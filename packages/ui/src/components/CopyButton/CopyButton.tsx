import React, { useCallback, useMemo } from 'react';
import { View, Pressable, Platform } from 'react-native';
import { IconButton } from '../IconButton';
import { Icon } from '../Icon/Icon';
import { useClipboard } from '../../hooks';
import { useToast } from '../Toast/ToastProvider';
import type { CopyButtonProps } from './types';
import { Tooltip, resolveTooltipProps } from '../Tooltip';
import { DEFAULT_COMPONENT_SIZE, clampComponentSize, type ComponentSize } from '../../core/theme/componentSize';
import { getHeight, getIconSize } from '../../core/theme/sizes';
import { useTheme } from '../../core/theme';

const COPY_BUTTON_ALLOWED_SIZES: ComponentSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];

/**
 * Reusable copy control that uses useClipboard & toast toast.
 * Provides a quick consistent UX across components (CodeBlock, QRCode, etc).
 */
export function CopyButton({
  value,
  onCopy,
  iconOnly = true,
  label = 'Copy',
  size = 'md',
  style,
  tooltip,
  tooltipPosition = 'top',
  disableToast = false,
  toastTitle = 'Copied to clipboard',
  toastMessage,
  mode = 'button',
  buttonVariant = 'secondary',
  iconName = 'copy',
  copiedIconName = 'check',
  iconColor,
  copiedIconColor,
}: CopyButtonProps) {
  const { copy, copied } = useClipboard();

  const toast = useToast();
  const theme = useTheme();
  const resolvedSize = clampComponentSize(size, COPY_BUTTON_ALLOWED_SIZES, DEFAULT_COMPONENT_SIZE);

  const dims = useMemo(() => {
    if (typeof resolvedSize === 'number') {
      const box = resolvedSize;
      return {
        box,
        icon: Math.max(12, Math.round(box * 0.6)),
      } as const;
    }

    return {
      box: getHeight(resolvedSize),
      icon: getIconSize(resolvedSize),
    } as const;
  }, [resolvedSize]);

  const truncate = useCallback((val: string, max = 60) => (
    val.length > max ? val.slice(0, max - 1) + '…' : val
  ), []);

  const effectiveMessage = toastMessage || truncate(value);
  const accLabel = copied ? 'Copied' : label;
  const tooltipProps = resolveTooltipProps(tooltip ?? accLabel, { position: tooltipPosition });
  const iconGlyph = copied ? copiedIconName : iconName;
  const baseIconColor = iconColor ?? theme.text.primary;
  const successPalette = theme.colors.success ?? [];
  const fallbackSuccess = theme.colorScheme === 'dark' ? '#34d399' : '#22c55e';
  const copiedTint = copiedIconColor ?? successPalette[5] ?? successPalette[4] ?? fallbackSuccess;
  const iconTint = copied ? copiedTint : baseIconColor;
  const isIconMode = mode === 'icon';

  const handleCopy = useCallback(async () => {
    await copy(value);
    onCopy?.(value);
    if (
      Platform.OS === 'web' &&
      // only show if toast provider exists
      !!toast &&
      // only show if not disabled
      !disableToast
    ) {
      toast.success({
        title: toastTitle,
      });
    }
  }, [value, onCopy, disableToast, toast, toastTitle, effectiveMessage, copy]);

  if (isIconMode) {
    return (
      <Tooltip label={accLabel} {...(tooltipProps ?? {})}>
        <Pressable
          onPress={handleCopy}
          style={[{ width: dims.box, height: dims.box, alignItems: 'center', justifyContent: 'center' }, style]}
          accessibilityRole="button"
          accessibilityLabel={accLabel}
        >
          <Icon
            name={iconGlyph}
            size={dims.icon}
            color={iconTint}
            style={{ pointerEvents: 'none' }}
          />
        </Pressable>
      </Tooltip>
    );
  }

  return (
    <View style={style}>
      <IconButton
        onPress={handleCopy}
        size={typeof resolvedSize === 'number' ? DEFAULT_COMPONENT_SIZE : resolvedSize}
        variant={buttonVariant}
        icon={iconGlyph}
        iconColor={iconTint}
        accessibilityLabel={accLabel}
      />
    </View>
  );
}

CopyButton.displayName = 'CopyButton';
