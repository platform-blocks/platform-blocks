import type React from 'react';
import type { ViewProps, ViewStyle } from 'react-native';

import type { BaseProps, ColorProp } from '../../core/types/base';

export type StickyNoteColor = 'yellow' | 'pink' | 'blue' | 'green' | 'purple' | ColorProp;

export interface StickyNoteProps
  extends BaseProps<ViewStyle>, Omit<ViewProps, 'style' | 'testID' | 'children' | 'accessibilityRole'> {
  /** Note body. Plain text receives the note's readable text color automatically. */
  children?: React.ReactNode;
  /** Optional heading above the body. */
  title?: string;
  /** Optional content anchored below the body, such as a date or author. */
  footer?: React.ReactNode;
  /** Paper color preset, theme palette token, or CSS color. @default 'yellow' */
  color?: StickyNoteColor;
  /** Width and minimum height in pixels. @default 220 */
  size?: number;
  /** Rotation in degrees for a casual pinboard layout. @default 0 */
  rotation?: number;
  /** Makes the note an accessible button. */
  onPress?: () => void;
  /** Disables an interactive note. */
  disabled?: boolean;
}
