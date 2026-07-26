import React from 'react';
import { View } from 'react-native';
import { useDialog } from '../DialogContext';
import { Text } from '../../Text';
import { Button } from '../../Button';
import { Flex } from '../../Flex';
import type { DialogAutoFocus } from '../types';

export interface UseSimpleDialogOptions {
  title?: string;
  closable?: boolean;
  backdrop?: boolean;
  backdropClosable?: boolean;
  width?: number;
  height?: number;
  /** Moves focus into the dialog once it has finished opening. See {@link DialogAutoFocus}. */
  autoFocus?: DialogAutoFocus;
  /** Trap Tab focus inside the dialog and restore it on close (web only, default true). */
  trapFocus?: boolean;
}

/**
 * Simple hook for opening dialogs with less boilerplate
 */
export function useSimpleDialog() {
  const { openDialog, closeDialog, closeAllDialogs } = useDialog();

  const modal = (content: React.ReactNode, options: UseSimpleDialogOptions = {}) => {
    return openDialog({
      variant: 'modal',
      content,
      ...options,
    });
  };

  const bottomSheet = (content: React.ReactNode, options: UseSimpleDialogOptions = {}) => {
    return openDialog({
      variant: 'bottomsheet',
      content,
      ...options,
    });
  };

  const fullScreen = (content: React.ReactNode, options: UseSimpleDialogOptions = {}) => {
    return openDialog({
      variant: 'fullscreen',
      content,
      backdrop: false, // Default to no backdrop for fullscreen
      ...options,
    });
  };

  const confirm = (
    message: string,
    options: UseSimpleDialogOptions & {
      onConfirm?: () => void;
      onCancel?: () => void;
      confirmText?: string;
      cancelText?: string;
    } = {}
  ) => {
    const {
      onConfirm,
      onCancel,
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      ...dialogOptions
    } = options;

    return openDialog({
      variant: 'modal',
      title: 'Confirm',
      content: (
        <View style={{ gap: 16 }}>
          <Text>{message}</Text>
          <Flex direction="row" gap={12} justify="flex-end">
            <Button
              title={cancelText}
              variant="outline"
              onPress={() => {
                onCancel?.();
                closeDialog(''); // Will be replaced with actual ID
              }}
            />
            <Button
              title={confirmText}
              onPress={() => {
                onConfirm?.();
                closeDialog(''); // Will be replaced with actual ID
              }}
            />
          </Flex>
        </View>
      ),
      ...dialogOptions,
    });
  };

  return {
    modal,
    bottomSheet,
    fullScreen,
    confirm,
    close: closeDialog,
    closeAll: closeAllDialogs,
  };
}
