import React from 'react';
import { Dialog } from './Dialog';
import { useDialog } from './DialogContext';

export function DialogRenderer() {
  const { dialogs, removeDialog } = useDialog();

  if (dialogs.length === 0) return null;

  // Only the topmost dialog renders: iOS cannot present a second Modal next to
  // the first, and the layer stack gives Escape / back to the top one anyway.
  const topDialog = dialogs[dialogs.length - 1];

  return (
    <Dialog
      opened
      variant={topDialog.variant}
      title={topDialog.title}
      accessibilityLabel={topDialog.accessibilityLabel}
      closable={topDialog.closable}
      bottomSheetSwipeZone={topDialog.bottomSheetSwipeZone}
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
