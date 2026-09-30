import type { ReactNode, RefObject } from 'react';
import type { StyleProp, View, ViewStyle } from 'react-native';

import type { BaseProps } from '../../core/types/base';
import type { TextProps } from '../Text';

/** Something that can take focus: a TextInput, an imperative field handle, a host view. */
export interface DialogFocusable {
  focus?: () => void;
}

/**
 * Where focus goes when the dialog opens. Focus always moves into the dialog
 * (it is modal); this picks the element.
 * - `false` (default) — the dialog itself, so screen readers announce it and
 *   Tab enters it without popping an on-screen keyboard.
 * - `true` — the first focusable element inside the dialog body (web).
 * - a ref — that element (e.g. an `Input`'s `inputRef`), on every platform.
 */
export type DialogAutoFocus = boolean | RefObject<DialogFocusable | null>;

export type DialogVariant = 'modal' | 'bottomsheet' | 'fullscreen';

// Public props for the <Dialog /> component
export interface DialogProps extends BaseProps {
  /** Whether the dialog is shown. */
  opened?: boolean;
  /** Presentation style of the dialog. @default 'modal' */
  variant?: DialogVariant;
  /** Title shown in the header; also the dialog's accessible name. */
  title?: string | null;
  /** Accessible name when there is no `title`. */
  accessibilityLabel?: string;
  /** Dialog body content. */
  children: ReactNode;
  /** Allows the user to close the dialog via the close button, Escape and Android back. @default true */
  closable?: boolean;
  /** Whether to render the dimming backdrop behind the dialog. @default true */
  backdrop?: boolean;
  /** Whether tapping the backdrop should close the dialog. @default true */
  backdropClosable?: boolean;
  /** Triggers the close animation when set to true. */
  shouldClose?: boolean;
  /** Called when the dialog requests to close (after the exit transition). */
  onClose?: () => void;
  /** Optional explicit width for the dialog content (modal/bottomsheet). */
  w?: number;
  /** Optional explicit height for the dialog content. */
  h?: number;
  /** Corner radius for the dialog container (bottom sheet rounds top corners only). */
  radius?: number;
  /** Style overrides for the dialog body. */
  style?: StyleProp<ViewStyle>;
  /** Whether to paint the header area with the dialog surface. @default true */
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
  /** Override props applied to the title `<Text>` (style, weight, ff, size, color). */
  titleProps?: Omit<TextProps, 'children'>;
  /** Accessible label of the close button. @default 'Close dialog' */
  closeButtonLabel?: string;
  /**
   * Where focus lands when the dialog opens. See {@link DialogAutoFocus}.
   * @default false
   */
  autoFocus?: DialogAutoFocus;
  /**
   * Keep Tab focus cycling inside the dialog while it is open (web). Focus
   * always returns to the previously focused element when it closes.
   * @default true
   */
  trapFocus?: boolean;
}

export interface DialogFactoryPayload {
  props: DialogProps;
  ref: View;
}

// Internal configuration object stored in context for stacked dialogs
export interface DialogConfig {
  id: string;
  variant: DialogVariant;
  content: ReactNode;
  title?: string;
  accessibilityLabel?: string;
  closable?: boolean;
  onClose?: () => void;
  backdrop?: boolean;
  backdropClosable?: boolean;
  isClosing?: boolean; // Flag used to animate out before removal
  bottomSheetSwipeZone?: 'container' | 'handle' | 'none';
  w?: number;
  h?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  showHeader?: boolean;
  titleProps?: Omit<TextProps, 'children'>;
  /** Where focus lands when the dialog opens. See {@link DialogAutoFocus}. */
  autoFocus?: DialogAutoFocus;
  /** Trap Tab focus inside the dialog (web, default true). */
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
