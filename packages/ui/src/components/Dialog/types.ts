import { ReactNode, RefObject } from 'react';
import type { TextProps } from '../Text';

/**
 * Focus behaviour applied once the dialog's enter transition settles.
 * - `true` — focus the first focusable element inside the dialog body. Web
 *   only; native platforms have no way to enumerate focusable nodes, so pass a
 *   ref there instead.
 * - a ref — call `.focus()` on that element (e.g. an `Input`'s `inputRef`).
 *   Works on every platform.
 * - `false` — leave focus where it is.
 */
export type DialogAutoFocus = boolean | RefObject<any>;

// Public props for the imperative <Dialog /> component instance
export interface DialogProps {
  /** Controls whether the dialog is visible. */
  visible: boolean;
  /** Presentation style of the dialog. */
  variant?: 'modal' | 'bottomsheet' | 'fullscreen';
  /** Optional title text shown in the header area. */
  title?: string | null;
  /** Dialog body content. */
  children: ReactNode;
  /** Allows the user to close the dialog via UI controls or escape/back. */
  closable?: boolean;
  /** Whether to render the dimming backdrop behind the dialog. */
  backdrop?: boolean;
  /** Whether tapping the backdrop should close the dialog. */
  backdropClosable?: boolean;
  /** Triggers close animation when set to true. */
  shouldClose?: boolean;
  /** Called when the dialog requests to close. */
  onClose?: () => void;
  /** Optional explicit width for the dialog content (modal/bottomsheet). */
  w?: number;
  /** Optional explicit height for the dialog content. */
  h?: number;
  /** Corner radius for the dialog container (bottom sheet rounds top corners only). */
  radius?: number;
  /** Optional style overrides for the dialog container. */
  style?: object;
  /** Whether to show the styled header area with background and border (default true). */
  showHeader?: boolean;
  /** Controls which part of the bottom sheet responds to swipe-to-dismiss gestures */
  bottomSheetSwipeZone?: 'container' | 'handle' | 'none';
  /**
   * Length of the open/close transition in ms; the built-in timings scale
   * against a 300ms baseline. `0` shows and dismisses the dialog instantly.
   * Always 0 under reduced motion.
   * @default 300
   */
  transitionDuration?: number;
  /** Override props applied to the title `<Text>` (style, weight, ff, size, colorVariant). */
  titleProps?: Omit<TextProps, 'children'>;
  /**
   * Moves focus into the dialog once it has finished opening. See
   * {@link DialogAutoFocus}.
   * @default false
   */
  autoFocus?: DialogAutoFocus;
  /**
   * Keeps Tab focus cycling inside the dialog while it is open and restores
   * focus to the previously focused element when it closes. Web only.
   * @default true
   */
  trapFocus?: boolean;
}

// Internal configuration object stored in context for stacked dialogs
export interface DialogConfig {
  id: string;
  variant: 'modal' | 'bottomsheet' | 'fullscreen';
  content: ReactNode;
  title?: string;
  closable?: boolean;
  onClose?: () => void;
  backdrop?: boolean;
  backdropClosable?: boolean;
  isClosing?: boolean; // Flag used to animate out before removal
  bottomSheetSwipeZone?: 'container' | 'handle' | 'none';
  w?: number;
  h?: number;
  radius?: number;
  style?: object;
  showHeader?: boolean;
  titleProps?: Omit<TextProps, 'children'>;
  /** Moves focus into the dialog once it has finished opening. See {@link DialogAutoFocus}. */
  autoFocus?: DialogAutoFocus;
  /** Trap Tab focus inside the dialog and restore it on close (web only, default true). */
  trapFocus?: boolean;
}

// Value shape provided by DialogContext
export interface DialogContextValue {
  dialogs: DialogConfig[];
  openDialog: (config: Omit<DialogConfig, 'id'> & { id?: string }) => string;
  closeDialog: (id: string) => void;
  removeDialog: (id: string) => void;
  closeAllDialogs: () => void;
}
