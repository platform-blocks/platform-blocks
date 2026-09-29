import React from 'react';
import type { ReactNode } from 'react';

import { OverlayProvider } from '../providers/OverlayProvider';
import { OverlayRenderer } from '../providers/OverlayRenderer';

export interface OverlayHostProps {
  children?: ReactNode;
}

/**
 * A nested overlay host for modal surfaces (Dialog, Drawer, DropdownSheet, a
 * custom RN `Modal`).
 *
 * Floating content — popovers, menus, selects, tooltips — opened from inside
 * the modal renders into this host instead of the app root's, so it lives in
 * the modal's window:
 * - native: it stacks above the modal (a root-level overlay would sit in the
 *   window *behind* the Modal, and iOS can't present a second Modal from
 *   outside the first);
 * - web: it stays inside the modal's DOM, so react-native-web's modal focus
 *   trap doesn't pull focus out of it.
 *
 * Render it as (or directly inside) the root of the modal's content. It adds
 * no wrapper view, so layout is unchanged. Components pick the nearest host
 * automatically.
 *
 * @example
 * <Modal visible={opened} transparent onRequestClose={handleModalRequestClose}>
 *   <OverlayHost>
 *     <DialogCard>…<Popover>…</Popover></DialogCard>
 *   </OverlayHost>
 * </Modal>
 */
export function OverlayHost({ children }: OverlayHostProps) {
  return (
    <OverlayProvider>
      {children}
      <OverlayRenderer hosted />
    </OverlayProvider>
  );
}
