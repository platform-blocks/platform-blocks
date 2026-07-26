import React from 'react';
import { Dialog } from './Dialog';
import { useDialog } from './DialogContext';

export function DialogRenderer() {
  const { dialogs, removeDialog } = useDialog();

  if (dialogs.length === 0) return null;

  // Render the topmost dialog
  const topDialog = dialogs[dialogs.length - 1];

  return (
    <Dialog
      visible={true}
      variant={topDialog.variant}
      title={topDialog.title}
      closable={topDialog.closable}
      backdrop={topDialog.backdrop}
      backdropClosable={topDialog.backdropClosable}
      shouldClose={topDialog.isClosing}
      onClose={() => removeDialog(topDialog.id)}
      w={topDialog.w}
      h={topDialog.h}
      radius={topDialog.radius}
      style={topDialog.style}
      showHeader={topDialog.showHeader}
      titleProps={topDialog.titleProps}
      autoFocus={topDialog.autoFocus}
      trapFocus={topDialog.trapFocus}
    >
      {topDialog.content}
    </Dialog>
  );
}
