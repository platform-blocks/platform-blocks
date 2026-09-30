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

/** `width` / `height` are the friendly spellings of the dialog's `w` / `h`. */
function toDialogOptions({ width, height, ...rest }: UseSimpleDialogOptions) {
  return { ...rest, ...(width !== undefined ? { w: width } : null), ...(height !== undefined ? { h: height } : null) };
}

/**
 * Returns one-call dialog helpers — `modal`, `bottomSheet`, `fullScreen` and
 * `confirm` (each returns the new dialog's id) plus `close(id)` and
 * `closeAll()` — for opening common dialogs without building a `DialogConfig`;
 * like `useDialog()` it never throws, but a `DialogProvider` with a
 * `DialogRenderer` inside must be mounted for anything to show.
 *
 * `modal(content, options)`, `bottomSheet(content, options)` and
 * `fullScreen(content, options)` wrap arbitrary content;
 * `confirm(message, { onConfirm, onCancel, confirmText, cancelText })` renders
 * a message with Cancel / Confirm buttons that close the dialog.
 */
export function useSimpleDialog() {
  const { openDialog, closeDialog, closeAllDialogs } = useDialog();

  const modal = (content: React.ReactNode, options: UseSimpleDialogOptions = {}) => {
    return openDialog({
      variant: 'modal',
      content,
      ...toDialogOptions(options),
    });
  };

  const bottomSheet = (content: React.ReactNode, options: UseSimpleDialogOptions = {}) => {
    return openDialog({
      variant: 'bottomsheet',
      content,
      ...toDialogOptions(options),
    });
  };

  const fullScreen = (content: React.ReactNode, options: UseSimpleDialogOptions = {}) => {
    return openDialog({
      variant: 'fullscreen',
      content,
      backdrop: false, // Default to no backdrop for fullscreen
      ...toDialogOptions(options),
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

    // Assigned before any button can be pressed, so the handlers close this dialog.
    let dialogId = '';
    dialogId = openDialog({
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
                closeDialog(dialogId);
              }}
            />
            <Button
              title={confirmText}
              onPress={() => {
                onConfirm?.();
                closeDialog(dialogId);
              }}
            />
          </Flex>
        </View>
      ),
      ...toDialogOptions(dialogOptions),
    });
    return dialogId;
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
