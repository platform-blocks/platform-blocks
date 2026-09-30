import React, { useEffect, useRef } from 'react';
import type { View } from 'react-native';

import { announce } from '../../core/accessibility/announce';
import { factory } from '../../core/factory';
import { useLatestCallback } from '../../core/hooks/useLatestCallback';
import { isWeb } from '../../core/platform';
import { resolveAccentColor } from '../../core/theme/resolveColors';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getControlSize } from '../../core/theme/tokens';
import { useClipboard } from '../../hooks/useClipboard';
import { Button } from '../Button/Button';
import { resolveTooltipProps } from '../Tooltip/resolveTooltipProps';
import { Icon } from '../Icon/Icon';
import { IconButton } from '../IconButton/IconButton';
import { useOptionalToast } from '../Toast/ToastProvider';
import type { CopyButtonProps } from './types';

/**
 * Copies a value to the clipboard, swaps to a check mark, and confirms the copy
 * — with a toast on web (when a ToastProvider is mounted), otherwise with a
 * screen-reader announcement. Used by CodeBlock, QRCode, etc. to standardize
 * the UX. The ref is the underlying Pressable.
 */
export const CopyButton = factory<{ props: CopyButtonProps; ref: View }>(
  (props, ref) => {
    const {
      value,
      onCopy,
      onCopyError,
      iconOnly = true,
      label = 'Copy',
      copiedLabel = 'Copied',
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
      ...rest
    } = props;

    const { copy, copied, error } = useClipboard();
    // Null outside a ToastProvider, where a toast would never show.
    const toast = useOptionalToast();
    const theme = useTheme();

    // A toast on web when a ToastProvider is mounted (the toast announces
    // itself), otherwise a screen-reader announcement — the icon swap alone is
    // invisible to assistive technology.
    const settleSuccess = useLatestCallback((copiedValue: string) => {
      onCopy?.(copiedValue);
      if (isWeb && toast && !disableToast) {
        toast.success({ title: toastTitle, ...(toastMessage ? { message: toastMessage } : null) });
      } else {
        announce(copiedLabel);
      }
    });

    // `copy` resolves with the outcome, so `onCopy` and the confirmation fire
    // only for a copy that actually succeeded. A failure's Error is the hook's
    // `error` state, which may render before or after the promise settles —
    // whichever comes second reports it (once per Error).
    const failurePending = useRef(false);
    const renderedError = useRef<Error | null>(null);
    const reportedError = useRef<Error | null>(null);
    const settleFailure = useLatestCallback(() => {
      const failure = renderedError.current;
      if (!failurePending.current || !failure || failure === reportedError.current) return;
      failurePending.current = false;
      reportedError.current = failure;
      onCopyError?.(failure);
    });
    useEffect(() => {
      renderedError.current = error;
      settleFailure();
    }, [error, settleFailure]);

    const handleCopy = useLatestCallback(() => {
      const copiedValue = value;
      failurePending.current = false;
      // The previous failure (if any) is settled; don't report it again.
      reportedError.current = renderedError.current;
      void copy(copiedValue).then((ok) => {
        if (ok) {
          settleSuccess(copiedValue);
          return;
        }
        failurePending.current = true;
        settleFailure();
      });
    });

    const accessibleLabel = copied ? copiedLabel : label;
    const iconGlyph = copied ? copiedIconName : iconName;
    const copiedTint = copiedIconColor ?? resolveAccentColor(theme, 'success');
    // Only override the icon color when asked or when showing the success state;
    // otherwise the button variant picks a legible one.
    const iconTint = copied ? copiedTint : iconColor;

    if (!iconOnly && mode !== 'icon') {
      return (
        <Button
          ref={ref}
          {...rest}
          onPress={handleCopy}
          size={size}
          variant={buttonVariant}
          style={style}
          tooltip={resolveTooltipProps(tooltip, { position: tooltipPosition })}
          startSection={<Icon name={iconGlyph} size={getControlSize(theme, size).iconSize} color={iconTint} />}
        >
          {accessibleLabel}
        </Button>
      );
    }

    return (
      <IconButton
        ref={ref}
        {...rest}
        onPress={handleCopy}
        size={size}
        variant={mode === 'icon' ? 'none' : buttonVariant}
        icon={iconGlyph}
        iconColor={iconTint ?? (mode === 'icon' ? theme.text.primary : undefined)}
        accessibilityLabel={accessibleLabel}
        tooltip={resolveTooltipProps(tooltip ?? accessibleLabel, { position: tooltipPosition })}
        style={style}
      />
    );
  },
  { displayName: 'CopyButton' }
);
