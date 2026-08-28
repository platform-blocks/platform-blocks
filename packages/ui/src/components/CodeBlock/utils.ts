import type { CSSProperties } from 'react';
import { composite, normalizeHex, pickReadable } from '../../core/theme/colorUtils';
import type { PlatformBlocksTheme } from '../../core/theme/types';
import type { CodeBlockToken } from './types';

/**
 * Normalizes language identifiers to standard values for syntax highlighting
 */
export function normalizeLanguage(lang: string): string {
  switch (lang) {
    case 'ts':
    case 'tsx':
    case 'typescript': return 'tsx';
    case 'js':
    case 'jsx':
    case 'javascript': return 'jsx';
    case 'md':
    case 'mdx': return 'markdown';
    case 'yml':
    case 'yaml': return 'json';
    case 'sh':
    case 'zsh':
    case 'shell':
    case 'shellscript':
    case 'console':
    case 'terminal':
    case 'bash': return 'bash';
    default: return lang;
  }
}

/** Language ids that tokenize as shell rather than as JavaScript. */
const SHELL_LANGUAGES = new Set([
  'bash', 'sh', 'zsh', 'shell', 'shellscript', 'console', 'terminal',
]);

/**
 * Whether `lang` is a shell dialect. Accepts raw ids as well as the output of
 * `normalizeLanguage`, so callers don't have to normalize first.
 */
export function isShellLanguage(lang: string | undefined): boolean {
  return Boolean(lang) && SHELL_LANGUAGES.has(lang!.toLowerCase());
}

/** Lowercase extension of a file name, without the dot (`data.ts` → `ts`). */
function fileExtension(fileName: string): string {
  const idx = fileName.lastIndexOf('.');
  return idx === -1 ? '' : fileName.slice(idx + 1).toLowerCase();
}

/**
 * Highlighting language for a file name, so multi-file code blocks can label a
 * tab `data.ts` and still highlight it as TypeScript.
 */
export function languageFromFileName(fileName: string): string {
  const ext = fileExtension(fileName);
  return ext ? normalizeLanguage(ext) : 'tsx';
}

/**
 * Official language logo for a file tab, where one exists in the brand registry.
 * `CodeBlock` prefers this over the generic Tabler glyph so a `.ts` tab carries
 * the TypeScript mark the way an editor's file tree would.
 */
export function brandFromFileName(fileName: string): 'typescript' | 'css' | undefined {
  switch (fileExtension(fileName)) {
    case 'ts':
    case 'tsx':
    case 'mts':
    case 'cts':
      return 'typescript';
    case 'css':
    case 'scss':
      return 'css';
    default:
      return undefined;
  }
}

/**
 * Icon name (from the bundled Tabler set) for a file tab. Used for extensions
 * with no language logo, so those group into code / data / prose / style rather
 * than getting a per-extension glyph; pass `file.icon` to override either.
 */
export function iconFromFileName(fileName: string): string {
  switch (fileExtension(fileName)) {
    case 'tsx':
    case 'jsx':
    case 'ts':
    case 'js':
    case 'mjs':
    case 'cjs':
      return 'code';
    case 'json':
    case 'yml':
    case 'yaml':
      return 'database';
    case 'md':
    case 'mdx':
      return 'markdown';
    case 'css':
    case 'scss':
      return 'palette';
    default:
      return 'file';
  }
}

/**
 * Parses highlight line specifications like "1", "3-5", "7,9-12" into a Set of line numbers.
 * Entries may be plain numbers (docs frontmatter yields `highlightLines: [3, 5]`), so each
 * spec is coerced to a string before parsing.
 */
export function parseHighlightLines(specs: Array<string | number> | undefined, total: number): Set<number> {
  const set = new Set<number>();
  if (!specs) return set;

  for (const raw of specs) {
    const part = String(raw ?? '').trim();
    if (!part) continue;
    
    // Single line number like "5"
    if (/^\d+$/.test(part)) {
      const n = parseInt(part, 10);
      if (n >= 1 && n <= total) set.add(n);
      continue;
    }
    
    // Range like "3-7"
    const range = part.match(/^(\d+)-(\d+)$/);
    if (range) {
      const start = parseInt(range[1], 10);
      const end = parseInt(range[2], 10);
      if (start <= end) {
        for (let i = start; i <= end && i <= total; i++) {
          set.add(i);
        }
      }
      continue;
    }
  }
  return set;
}

/**
 * Color schemes for different code block variants
 */
export type SyntaxColorMap = Record<CodeBlockToken, string>;

export interface SyntaxColorOptions {
  /**
   * Background the code sits on. Token shades are picked for contrast against
   * it, so a themed or overridden surface still yields legible highlighting.
   * Accepts hex or `rgb()`/`rgba()`.
   */
  surface?: string;
}

/**
 * Type emphasis per token, shared by the web (Prism) and native renderers so
 * both read the same. Kept separate from the color map because `colors.text`
 * lets consumers override colors without inheriting our weights.
 */
export const SYNTAX_TOKEN_EMPHASIS: Partial<
  Record<CodeBlockToken, { fontStyle?: 'italic'; fontWeight?: '500' | '600' }>
> = {
  comment: { fontStyle: 'italic' },
  keyword: { fontWeight: '600' },
  tag: { fontWeight: '500' },
};

/** WCAG AA for body text — the floor for tokens that carry meaning. */
const ACCENT_MIN_CONTRAST = 4.5;
/** Deliberately recessed tokens (comments, punctuation) only need to be legible. */
const MUTED_MIN_CONTRAST = 3.0;

/**
 * Shade preference within a palette scale. Both themes put the brand at index 5
 * and gain contrast against their own background as the index climbs — the light
 * theme's scale runs light→dark, the dark theme's dark→light — so one ascending
 * order serves both, and `pickReadable` stops at the first shade that clears the
 * contrast floor on the actual code surface.
 */
const SHADE_ORDER = [5, 6, 7, 4, 8, 3];

const RGB_PATTERN = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+))?\s*\)$/i;

/**
 * Contrast math needs an opaque hex. Accepts hex or `rgb()`/`rgba()`, and
 * composites translucent colors over `behind` so the measured ratio matches what
 * the reader actually sees.
 */
export function toOpaqueHex(color: string | undefined, behind: string): string {
  const fallback = normalizeHex(behind) ?? '#000000';
  if (!color) return fallback;

  const hex = normalizeHex(color);
  if (hex) return hex;

  const match = RGB_PATTERN.exec(color.trim());
  if (!match) return fallback;

  const channel = (value: string) =>
    Math.max(0, Math.min(255, Math.round(Number(value)))).toString(16).padStart(2, '0');
  const solid = `#${channel(match[1])}${channel(match[2])}${channel(match[3])}`;
  const alpha = match[4] === undefined ? 1 : Number(match[4]);
  return alpha >= 1 ? solid : composite(solid, fallback, alpha);
}

export function getSyntaxColors(
  theme: PlatformBlocksTheme,
  isDark: boolean,
  variant: 'code' | 'terminal' | 'hacker' = 'code',
  overrides?: Partial<Record<CodeBlockToken, string>>,
  options: SyntaxColorOptions = {}
): SyntaxColorMap {
  if (variant === 'hacker') {
    const base: SyntaxColorMap = {
      keyword: '#00ff00',
      string: '#00cc00',
      comment: '#006600',
      number: '#00ff99',
      function: '#00dd00',
      operator: '#00ff66',
      punctuation: '#00aa00',
      tag: '#00ff33',
      attribute: '#00bb00',
      className: '#00ee00',
    };
    return applyOverrides(base, overrides);
  }

  // Token colors are derived from the app theme's own palettes rather than a
  // prebuilt editor theme, so a rebranded theme rebrands the code block with it.
  // Every color is measured against the actual code surface and stepped along
  // its scale until it clears a contrast floor — that is what keeps the same
  // role legible on a pale panel and a near-black one without two hand-tuned
  // hex tables. The One-Dark hexes survive only as last-resort fallbacks for
  // themes that omit a scale entirely.
  const c = theme.colors as Record<string, string[] | undefined>;
  // Callers pass the panel they actually painted; the fallback is the same
  // theme token that panel defaults to, so contrast is never measured against
  // a surface color from outside the theme.
  const surface = toOpaqueHex(
    options.surface,
    theme.backgrounds?.subtle ?? theme.backgrounds?.base ?? (isDark ? '#000000' : '#ffffff')
  );

  /**
   * First shade of the first listed palette that reads on `surface`. Families
   * are ordered most- to least-preferred: a theme that drops `purple` still
   * gets a keyword color from `violet`, then `primary`, before the fallback.
   */
  const role = (
    families: Array<string[] | undefined>,
    fallback: string,
    min: number = ACCENT_MIN_CONTRAST
  ): string => {
    const candidates: string[] = [];
    for (const scale of families) {
      if (!scale?.length) continue;
      for (const idx of SHADE_ORDER) {
        const color = scale[Math.min(idx, scale.length - 1)];
        if (color) candidates.push(color);
      }
    }
    candidates.push(fallback);
    return pickReadable(candidates, surface, min);
  };

  /** Text tokens come from the theme's text ramp, kept above a legibility floor. */
  const textRole = (preferred: string | undefined, fallback: string, min: number): string =>
    pickReadable(
      [preferred, theme.text.secondary, theme.text.primary, fallback].filter(Boolean) as string[],
      surface,
      min
    );

  const base: SyntaxColorMap = {
    keyword: role([c.purple, c.violet, c.primary], isDark ? '#c678dd' : '#a626a4'),
    string: role([c.success, c.teal], isDark ? '#98c379' : '#50a14f'),
    comment: textRole(theme.text.muted, isDark ? '#5c6370' : '#a0a1a7', MUTED_MIN_CONTRAST),
    number: role([c.warning, c.amber], isDark ? '#d19a66' : '#986801'),
    function: role([c.sky, c.primary], isDark ? '#61afef' : '#4078f2'),
    operator: textRole(theme.text.secondary, isDark ? '#56b6c2' : '#0184bc', MUTED_MIN_CONTRAST),
    punctuation: textRole(theme.text.muted, isDark ? '#abb2bf' : '#383a42', MUTED_MIN_CONTRAST),
    tag: role([c.tertiary, c.pink, c.error], isDark ? '#e06c75' : '#e45649'),
    attribute: role([c.amber, c.warning], isDark ? '#d19a66' : '#986801'),
    className: role([c.cyan, c.teal, c.sky], isDark ? '#e5c07b' : '#c18401'),
  };

  return applyOverrides(base, overrides);
}

/**
 * Builds a react-syntax-highlighter (Prism) theme object from a resolved syntax
 * color map, so the web highlighter uses the same theme-derived palette as the
 * native tokenizer instead of a generic prebuilt Prism theme.
 */
export function buildPrismTheme(
  colors: SyntaxColorMap,
  baseColor: string,
  fontFamily?: string
): Record<string, CSSProperties> {
  const token = (color: string, extra?: CSSProperties): CSSProperties => ({
    color,
    background: 'none',
    ...extra,
  });

  const rootStyle: CSSProperties = {
    color: baseColor,
    background: 'none',
    ...(fontFamily ? { fontFamily } : {}),
  };

  return {
    'code[class*="language-"]': rootStyle,
    'pre[class*="language-"]': rootStyle,
    comment: token(colors.comment, SYNTAX_TOKEN_EMPHASIS.comment as CSSProperties),
    prolog: token(colors.comment),
    doctype: token(colors.comment),
    cdata: token(colors.comment),
    punctuation: token(colors.punctuation),
    namespace: { opacity: 0.7 } as CSSProperties,
    property: token(colors.attribute),
    tag: token(colors.tag, SYNTAX_TOKEN_EMPHASIS.tag as CSSProperties),
    boolean: token(colors.number),
    number: token(colors.number),
    constant: token(colors.number),
    symbol: token(colors.tag),
    deleted: token(colors.tag),
    selector: token(colors.string),
    'attr-name': token(colors.attribute),
    string: token(colors.string),
    char: token(colors.string),
    builtin: token(colors.className),
    inserted: token(colors.string),
    operator: token(colors.operator),
    entity: token(colors.operator, { cursor: 'help' }),
    url: token(colors.operator),
    atrule: token(colors.keyword),
    'attr-value': token(colors.string),
    keyword: token(colors.keyword, SYNTAX_TOKEN_EMPHASIS.keyword as CSSProperties),
    function: token(colors.function),
    'function-variable': token(colors.function),
    'class-name': token(colors.className),
    regex: token(colors.string),
    important: token(colors.keyword, { fontWeight: 'bold' }),
    // Plain identifiers stay at the base text color — only punctuation recedes.
    variable: token(baseColor),
    bold: { fontWeight: 'bold' } as CSSProperties,
    italic: { fontStyle: 'italic' } as CSSProperties,
  };
}

function applyOverrides(
  base: SyntaxColorMap,
  overrides?: Partial<Record<CodeBlockToken, string>>
): SyntaxColorMap {
  if (!overrides) return base;
  const next = { ...base };
  (Object.keys(overrides) as CodeBlockToken[]).forEach((key) => {
    const color = overrides[key];
    if (color) {
      next[key] = color;
    }
  });
  return next;
}

/** One rule for the built-in tokenizer. */
export interface SyntaxPattern {
  token: CodeBlockToken;
  pattern: RegExp;
  color: string;
  /**
   * Color this capture group rather than the whole match, for rules that need
   * left context — a preceding space, a pipe — to decide but must not swallow
   * it. The group has to sit at the *end* of the match: its offset is derived
   * from the two lengths, which avoids a lookbehind (still unsupported on the
   * older Safari and Hermes builds this ships to, and a parse-time error there,
   * not a runtime one).
   */
  group?: number;
}

/**
 * Regex patterns for the built-in tokenizer, ordered by precedence: the first
 * pattern to claim a range wins, so a keyword inside a string or a quote inside
 * a comment can't be re-colored by a later pattern. Patterns run against the
 * whole source, not one line at a time, so block comments and template literals
 * keep their color across line breaks.
 *
 * `language` selects the grammar. Anything that isn't a shell dialect gets the
 * JavaScript/TSX set, which is what every language fell back to before shell
 * existed — a `bash` block came out as good as plain text, since none of the JS
 * patterns match a command line except the operator rule catching the hyphens
 * and slash in a package name.
 */
export function getSyntaxPatterns(
  colors: ReturnType<typeof getSyntaxColors>,
  language?: string
): SyntaxPattern[] {
  return isShellLanguage(language) ? getShellPatterns(colors) : getJsPatterns(colors);
}

function getJsPatterns(colors: ReturnType<typeof getSyntaxColors>): SyntaxPattern[] {
  return [
    // Block comments — first, so nothing inside them is tokenized separately
    { token: 'comment' as const, pattern: /\/\*[\s\S]*?\*\//g, color: colors.comment },
    // Line comments
    { token: 'comment' as const, pattern: /\/\/[^\n]*/g, color: colors.comment },
    // Template literals (may span lines)
    { token: 'string' as const, pattern: /`(?:[^`\\]|\\[\s\S])*`/g, color: colors.string },
    // Quoted strings — newline-bounded, so an unpaired quote can't run away
    { token: 'string' as const, pattern: /(["'])(?:(?!\1)[^\\\n]|\\.)*\1/g, color: colors.string },
    // JSX/TSX tags
    { token: 'tag' as const, pattern: /<\/?[A-Z][a-zA-Z0-9]*(?:\.[a-zA-Z0-9]+)*/g, color: colors.tag },
    // JSX attributes — the value must follow `=` with no space, which is what
    // separates `title="x"` from an assignment like `const title = "x"`
    { token: 'attribute' as const, pattern: /\b[a-zA-Z][\w-]*(?==["'{`])/g, color: colors.attribute },
    // Keywords
    { token: 'keyword' as const, pattern: /\b(const|let|var|function|class|interface|type|import|export|from|default|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|new|this|super|extends|implements|public|private|protected|static|async|await|yield|true|false|null|undefined|void|never|any|string|number|boolean|object|Array|Promise)\b/g, color: colors.keyword },
    // Numbers
    { token: 'number' as const, pattern: /\b\d+\.?\d*\b/g, color: colors.number },
    // Function calls
    { token: 'function' as const, pattern: /\b[a-zA-Z_$][\w$]*(?=\s*\()/g, color: colors.function },
    // Type / class names (PascalCase)
    { token: 'className' as const, pattern: /\b[A-Z][a-zA-Z0-9]*\b/g, color: colors.className },
    // Operators and punctuation — last, filling whatever is left
    { token: 'operator' as const, pattern: /[+\-*/%=<>!&|^~?:]+/g, color: colors.operator },
    { token: 'punctuation' as const, pattern: /[{}[\]().,;]/g, color: colors.punctuation },
  ];
}

/**
 * Shell grammar for the built-in tokenizer, used for `bash`/`sh`/`zsh` blocks
 * and for every `variant="terminal"` block (which is a transcript by
 * definition, and rarely bothers to declare a language).
 *
 * Commands are found by position — the first word of a line or of a pipeline
 * segment — rather than by matching a list of known binaries, so a project's own
 * script colors the same as `npm`. The two rules that carry `group` need the
 * character in front of the token to decide and must not paint it.
 */
function getShellPatterns(colors: ReturnType<typeof getSyntaxColors>): SyntaxPattern[] {
  return [
    // Shebang, then `#` comments. A comment has to start a word, so the `#` in a
    // URL fragment or a `#!/bin/sh` argument isn't mistaken for one.
    { token: 'comment' as const, pattern: /^#![^\n]*/gm, color: colors.comment },
    { token: 'comment' as const, pattern: /(?:^|[ \t])(#[^\n]*)/gm, color: colors.comment, group: 1 },
    // The `$`/`>` prompt `variant="terminal"` prepends: punctuation, not content.
    // Claimed before `$VAR` so the two can't fight over the same character.
    { token: 'punctuation' as const, pattern: /^[ \t]*[$>](?=[ \t])/gm, color: colors.punctuation },
    // Quoted strings, ahead of anything that could tokenize their contents.
    { token: 'string' as const, pattern: /"(?:[^"\\\n]|\\.)*"|'[^'\n]*'/g, color: colors.string },
    // $VAR, ${VAR}, $1, $@ — a bare `$` followed by a space is the prompt above.
    { token: 'className' as const, pattern: /\$\{[^}\n]*\}|\$[A-Za-z_]\w*|\$[0-9@*#?!$-]/g, color: colors.className },
    // Control words, ahead of the command rule so `if`/`for` don't read as commands.
    { token: 'keyword' as const, pattern: /\b(if|then|else|elif|fi|for|while|until|do|done|case|esac|in|select|function|return|break|continue|export|local|readonly|declare|unset|source|alias|trap|exit)\b/g, color: colors.keyword },
    // Command position: start of a line (past any prompt), or the head of a
    // pipeline / list segment / `$(…)` substitution.
    { token: 'function' as const, pattern: /(?:^[ \t]*(?:[$>][ \t]+)?|[|;&][ \t]*|\$\([ \t]*)([A-Za-z_][\w.-]*)/gm, color: colors.function, group: 1 },
    // Tools named mid-command (`sudo npm i`, `env FOO=1 node app.js`). Anchored
    // to a space and closed with `(?![\w.-])` so the `node` inside a package name
    // like `react-native-node` stays plain.
    { token: 'function' as const, pattern: /(?:^|[ \t])(npm|npx|yarn|pnpm|bun|bunx|node|deno|expo|eas|git|docker|kubectl|brew|pod|gradle|make|cargo|go|python3?|pip3?)(?![\w.-])/gm, color: colors.function, group: 1 },
    // Common subcommands (`npm install`, `git status`, `expo start`). Enumerated
    // rather than "the word after the command", because that positional rule
    // can't see past a tool the previous rule already claimed — `expo` in
    // `npx expo install` would eat the lookahead and leave `install` plain.
    { token: 'keyword' as const, pattern: /(?:^|[ \t])(install|uninstall|add|remove|run|start|stop|restart|build|test|init|create|publish|link|unlink|update|upgrade|clone|commit|push|pull|fetch|checkout|merge|rebase|status|dev|exec|serve|login|logout|prebuild|doctor)(?![\w.-])/gm, color: colors.keyword, group: 1 },
    // Flags. `\B` is what keeps the hyphens inside `react-native-svg` out of this:
    // there is a word boundary before each of those, and none before a lone `-`.
    { token: 'attribute' as const, pattern: /\B--?[A-Za-z][\w-]*/g, color: colors.attribute },
    { token: 'number' as const, pattern: /\b\d+\b/g, color: colors.number },
    // Redirection, pipes, and assignment. Deliberately no `/` or `-`: those are
    // path and package-name characters far more often than operators here.
    { token: 'operator' as const, pattern: /\|\||&&|[|&]|>>?|<<?|=/g, color: colors.operator },
    { token: 'punctuation' as const, pattern: /[{}[\]();,]/g, color: colors.punctuation },
  ];
}

/** One rendered run of source text. Emphasis mirrors the Prism theme's. */
export interface NativeSyntaxToken {
  text: string;
  color: string;
  fontStyle?: 'italic';
  fontWeight?: '500' | '600';
}

export interface NativeHighlighterOptions extends SyntaxColorOptions {
  /** Color for text no pattern claims — identifiers, JSX text, whitespace. */
  baseColor?: string;
  /**
   * Grammar to tokenize with. Shell dialects get the shell patterns; everything
   * else gets the JavaScript/TSX set. `variant: 'terminal'` implies shell.
   */
  language?: string;
}

/**
 * Built-in tokenizer used wherever Prism isn't available (native, and web bundles
 * that can't resolve `react-syntax-highlighter`). It scans the whole source once,
 * letting higher-precedence patterns claim their ranges first, then slices the
 * claimed ranges back into per-line token runs.
 */
export function createNativeHighlighter(
  theme: PlatformBlocksTheme,
  isDark: boolean,
  variant: 'code' | 'terminal' | 'hacker' = 'code',
  overrides?: Partial<Record<CodeBlockToken, string>>,
  options: NativeHighlighterOptions = {}
) {
  const colors = getSyntaxColors(theme, isDark, variant, overrides, options);
  // A terminal block is a shell transcript whether or not it declared a
  // language — `language` defaults to `tsx`, so waiting for an explicit `bash`
  // would leave every prompt line tokenized as JavaScript.
  const grammar = variant === 'terminal' ? 'bash' : options.language;
  const patterns = getSyntaxPatterns(colors, grammar);
  const plainColor = options.baseColor ?? theme.text.primary;

  const styleFor = (token: CodeBlockToken, color: string): NativeSyntaxToken => ({
    text: '',
    color,
    ...SYNTAX_TOKEN_EMPHASIS[token],
  });

  return function highlightCode(code: string): NativeSyntaxToken[][] {
    const claimed: Array<{ start: number; end: number; style: NativeSyntaxToken }> = [];
    // Character-level occupancy map — keeps overlap tests O(1) per char instead
    // of comparing every new match against every range already claimed.
    const taken = new Uint8Array(code.length);

    const isFree = (start: number, end: number): boolean => {
      for (let i = start; i < end; i++) {
        if (taken[i]) return false;
      }
      return true;
    };

    for (const { pattern, color, token, group } of patterns) {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(code)) !== null) {
        // Zero-width matches would spin the loop forever.
        if (match[0].length === 0) {
          pattern.lastIndex += 1;
          continue;
        }
        // A `group` rule paints only its capture, which the pattern guarantees
        // is the tail of the match — hence the offset from the two lengths.
        const claimedText = group === undefined ? match[0] : match[group];
        if (!claimedText) continue;
        const start = match.index + (match[0].length - claimedText.length);
        const end = start + claimedText.length;
        if (isFree(start, end)) {
          claimed.push({ start, end, style: styleFor(token, color) });
          taken.fill(1, start, end);
        }
      }
      pattern.lastIndex = 0;
    }

    claimed.sort((a, b) => a.start - b.start);

    // Walk the source line by line, emitting a run per claimed range and filling
    // the gaps with plain text. Ranges that straddle a newline are split at it.
    const lines = code.split('\n');
    const result: NativeSyntaxToken[][] = [];
    let cursor = 0;
    let rangeIdx = 0;

    for (const line of lines) {
      const lineStart = cursor;
      const lineEnd = cursor + line.length;
      const tokens: NativeSyntaxToken[] = [];
      let pos = lineStart;

      // Ranges that ended on an earlier line are behind us.
      while (rangeIdx < claimed.length && claimed[rangeIdx].end <= lineStart) rangeIdx++;

      for (let i = rangeIdx; i < claimed.length && claimed[i].start < lineEnd; i++) {
        const range = claimed[i];
        const start = Math.max(range.start, lineStart);
        const end = Math.min(range.end, lineEnd);
        if (end <= pos) continue;
        if (start > pos) {
          tokens.push({ text: code.slice(pos, start), color: plainColor });
        }
        tokens.push({ ...range.style, text: code.slice(start, end) });
        pos = end;
      }

      if (pos < lineEnd) {
        tokens.push({ text: code.slice(pos, lineEnd), color: plainColor });
      }

      result.push(tokens.length > 0 ? tokens : [{ text: line || ' ', color: plainColor }]);
      cursor = lineEnd + 1; // step past the newline
    }

    return result;
  };
}