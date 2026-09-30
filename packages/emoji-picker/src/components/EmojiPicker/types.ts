import type { ViewStyle } from 'react-native';
import type { BaseProps, LayoutProps } from '@plocks/ui';

/** An emoji in the catalog. Pass `emojis` to replace the built-in Unicode catalog. */
export interface EmojiPickerItem {
  id: string;
  emoji: string;
  name: string;
  category: string;
  keywords?: readonly string[];
  /** Unicode variants ordered light through dark; use null for an unavailable tone. */
  skins?: readonly (string | null)[];
}

export type EmojiSkinTone = 0 | 1 | 2 | 3 | 4 | 5;

/** The selected Unicode string and its catalog metadata. */
export interface EmojiPickerSelection {
  id: string;
  emoji: string;
  name: string;
  category: string;
  skinTone: EmojiSkinTone;
}

export interface EmojiPickerProps extends BaseProps<ViewStyle>, LayoutProps {
  /** Called with the selected Unicode emoji and its metadata. */
  onSelect: (selection: EmojiPickerSelection) => void;
  /** Replace the built-in Unicode catalog with app-specific emoji. */
  emojis?: readonly EmojiPickerItem[];
  /** Labels for custom category keys. */
  categoryLabels?: Record<string, string>;
  /** Current skin tone; omit for internal state. 0 means the emoji's default appearance. */
  skinTone?: EmojiSkinTone;
  defaultSkinTone?: EmojiSkinTone;
  onSkinToneChange?: (tone: EmojiSkinTone) => void;
  /** Most recently selected Unicode strings; omit for internal session recents. */
  recent?: readonly string[];
  defaultRecent?: readonly string[];
  onRecentChange?: (recent: string[]) => void;
  /** Maximum number of recent emoji to retain. @default 24 */
  maxRecent?: number;
  searchPlaceholder?: string;
  emptyText?: string;
}
