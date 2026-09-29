import type { StyleProp, TextStyle } from 'react-native';

import type { PlatformBlocksTheme } from '../../core/theme/types';
import type { TextProps } from '../Text/Text';

export type HighlightValue = string | number;

/** Styles for the highlighted fragments, or a function of the theme returning them. */
export type HighlightStyles = StyleProp<TextStyle> | ((theme: PlatformBlocksTheme) => StyleProp<TextStyle>);

/**
 * Props for `Highlight`. Everything `Text` accepts (typography, `color`,
 * spacing, `style`, accessibility props) applies to the surrounding text.
 */
export interface HighlightProps extends TextProps {
  /** Substring or substrings to emphasize within the provided children */
  highlight?: HighlightValue | HighlightValue[];
  /**
   * Optional override for the highlighted segment styles. Accepts either a style object/array
   * or a callback that receives the current theme and returns styles.
   */
  highlightStyles?: HighlightStyles;
  /**
   * Marker background. Defaults to the theme's `backgrounds.mark`. A theme
   * palette name (`'teal'`, `'highlight'`) uses a soft shade of that palette;
   * `'primary.2'` shade syntax, a background role (`'selected'`) or any CSS
   * color is used as-is. The fragment's text color stays readable on it.
   */
  highlightColor?: string;
  /** Toggle case-sensitive matching (defaults to case-insensitive). */
  caseSensitive?: boolean;
  /** Trim highlight values before matching to ignore accidental whitespace. Defaults to true. */
  trim?: boolean;
  /** Additional props applied to the highlighted Text nodes. */
  highlightProps?: Partial<TextProps>;
}
