import React from 'react';
import { ViewStyle, TextStyle, StyleProp } from 'react-native';
import { SpacingProps } from '../../core/utils';
import type { RadiusValue } from '../../core/theme/radius';

export type CodeBlockToken =
  | 'keyword'
  | 'string'
  | 'comment'
  | 'number'
  | 'function'
  | 'operator'
  | 'punctuation'
  | 'tag'
  | 'attribute'
  | 'className';

/**
 * `code` follows the theme; `terminal` sits a step deeper on the elevation
 * ladder; `hacker` is a fixed neon-on-black skin in both color schemes.
 */
export type CodeBlockVariant = 'code' | 'terminal' | 'hacker';

export type CodeBlockTextPalette =
  | string
  | string[]
  | Partial<Record<CodeBlockToken, string>>;

export interface CodeBlockColorOverrides {
  /** Background color (hex, rgb, or theme token like `primary.6`) */
  background?: string;
  /** Border/accent color (hex/rgb/theme token) */
  border?: string;
  /** Override text/token colors. Accepts a single color, an array, or a token map. */
  text?: CodeBlockTextPalette;
  /** Highlight colors for emphasized lines */
  highlight?: {
    background?: string;
  };
}

/** One source file of a `CodeBlock` — a header label on its own, a tab among several. */
export interface CodeBlockFile {
  /** File name shown on the tab, e.g. `data.ts` */
  name: string;
  /** Source displayed while this file is active. Falls back to `children`. */
  code?: string;
  /** Highlighting language. Inferred from the file extension when omitted. */
  language?: string;
  /** Replaces the extension-derived tab icon */
  icon?: React.ReactNode;
  /** Lines to highlight for this file only */
  highlightLines?: Array<string | number>;
  /**
   * GitHub URL for this file, opened by the header's edit button while this tab
   * is active. Falls back to the block-level `githubUrl` when omitted.
   */
  githubUrl?: string;
}

export interface CodeBlockProps extends SpacingProps {
  /** Optional language for syntax highlighting */
  language?: string;
  /** Source to display. Optional when `files` is provided. */
  children?: string;
  /**
   * The block's source files. One entry renders its name as a header label;
   * several render as switchable tabs. `children` is ignored while `files` is
   * set, and a lone entry may omit `code` to keep using `children`.
   */
  files?: CodeBlockFile[];
  /** File name that starts active (uncontrolled). Defaults to the first file. */
  defaultFile?: string;
  /** Active file name (controlled). Pair with `onFileChange`. */
  activeFile?: string;
  /** Fired when the reader switches tabs */
  onFileChange?: (fileName: string) => void;
  /** Optional title displayed above the code block */
  title?: string;
  /**
   * @deprecated Use `files={[{ name: 'App.tsx' }]}`. Removed in 0.12.0.
   * Ignored when `files` is set.
   */
  fileName?: string;
  /**
   * @deprecated Use `files={[{ name: 'App.tsx', icon: <… /> }]}`. Removed in 0.12.0.
   * Ignored when `files` is set.
   */
  fileIcon?: React.ReactNode;
  /** Show line numbers in the code block */
  showLineNumbers?: boolean;
  /** Enable syntax highlighting */
  highlight?: boolean;
  /** Make the code block take the full width of its container */
  fullWidth?: boolean;
  /**
   * Corner radius of the code surface (size token or px). Set `'none'` to sit
   * flush inside a bordered container such as `Card.Section`.
   */
  radius?: RadiusValue;
  /** Draw the code surface's 1px border. Defaults to `true`. */
  withBorder?: boolean;
  /** Show a copy button to copy the code to clipboard */
  showCopyButton?: boolean;
  /** Callback when code is copied */
  onCopy?: (code: string) => void;
  /** Custom styles for the code block container and text */
  style?: StyleProp<ViewStyle>;
  /** Custom styles for the code text */
  textStyle?: StyleProp<TextStyle>;
  /** Custom styles for the title text */
  titleStyle?: StyleProp<TextStyle>;
  /** Lines to highlight, e.g. ["1", "3-5"] or [1, 3] */
  highlightLines?: Array<string | number>;
  /** Show a spoiler for the code block */
  spoiler?: boolean;
  /** Maximum height for the spoiler, if exceeded a "Show More" button appears */
  spoilerMaxHeight?: number;
  /** Visual variant: default code styling, terminal emulation, or hacker theme */
  variant?: CodeBlockVariant;
  /** Optional prompt prefix for terminal variant (ignored if lines already prefixed) */
  promptSymbol?: string;
  /**
   * GitHub URL for the source shown here. Adds an edit button beside the copy
   * button that opens it. Per-file URLs (`files[].githubUrl`) win over this one,
   * so a multi-file block points each tab at its own source.
   */
  githubUrl?: string;
  /**
   * Render the file name in a detached bar above the panel instead of inline
   * inside it. Single-file blocks only — tabs always sit inside the panel.
   */
  fileHeader?: boolean;
  /** Override base colors (background, text, highlights) */
  colors?: CodeBlockColorOverrides;
  /** Control whether long lines wrap (defaults to true). Set to false to enable horizontal scrolling instead. */
  wrap?: boolean;
  /** Custom font family for the code text (overrides the default monospace stack) */
  fontFamily?: string;
  /** Shorthand alias for `fontFamily` */
  ff?: string;
}
