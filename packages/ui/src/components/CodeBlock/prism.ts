import type { ComponentType, CSSProperties } from 'react';
import { Platform } from 'react-native';

import { devWarn } from '../../core/utils/logger';

/**
 * Lazy loader for the optional `react-syntax-highlighter` peer. It is only
 * used on web; native (and web without the package) falls back to CodeBlock's
 * built-in tokenizer.
 *
 * Every require below is a string literal wrapped in its own try/catch — the
 * same pattern as utils/optionalModule.ts. Bundlers see the literal, so the
 * module is bundled when it is installed; when it isn't, Metro (with
 * `allowOptionalDependencies`, on by default in Expo and RN CLI configs) and
 * webpack (which treats a require inside `try` as optional) leave a runtime
 * throw that the catch turns into the fallback. The requires also sit inside
 * a literal `Platform.OS === 'web'` branch, which Metro's production
 * constant-folding removes from native bundles — that is why this file reads
 * `Platform.OS` directly instead of the shared `isWeb` flag (an imported
 * constant is not inlined, so the requires would stay in native bundles).
 *
 * Only the Prism "light" build and the grammars below are loaded — the
 * package root would pull in every highlight.js and Prism language.
 *
 * Token colors come from a theme-derived Prism theme (`buildPrismTheme`), not a
 * prebuilt stylesheet, so highlighting follows the app theme.
 */

/** Attributes `lineProps` puts on one rendered line. */
export interface PrismLineProps {
  style?: CSSProperties;
  'data-highlighted'?: string;
}

/** The subset of react-syntax-highlighter's props CodeBlock uses. */
export interface PrismHighlighterProps {
  language?: string;
  style?: Record<string, CSSProperties>;
  PreTag?: string;
  customStyle?: CSSProperties;
  codeTagProps?: { style?: CSSProperties };
  wrapLongLines?: boolean;
  wrapLines?: boolean;
  showLineNumbers?: boolean;
  lineNumberStyle?: CSSProperties;
  lineProps?: (lineNumber: number) => PrismLineProps;
  children: string;
}

type PrismHighlighterComponent = ComponentType<PrismHighlighterProps>;

/** The Prism "light" build: a component with a grammar registry. */
type PrismLightModule = PrismHighlighterComponent & {
  registerLanguage?: (language: string, definition: unknown) => void;
};

let PrismSyntaxHighlighter: PrismHighlighterComponent | null = null;
let initialized = false;

/** `require()` of an ES module yields its namespace; the export is `.default`. */
const interop = (mod: unknown): unknown => {
  if (mod && (typeof mod === 'object' || typeof mod === 'function')) {
    const fromDefault = (mod as { default?: unknown }).default;
    if (fromDefault) return fromDefault;
  }
  return mod;
};

/** Loads the highlighter once. Safe (and free) to call on every render. */
export function initSyntaxHighlighter(): void {
  if (initialized) return;
  initialized = true;

  // eslint-disable-next-line no-restricted-syntax -- must stay a literal Platform.OS check so Metro strips the web-only requires from native bundles (see above)
  if (Platform.OS === 'web') {
    let highlighter: PrismLightModule | null = null;
    try {
      highlighter = interop(require('react-syntax-highlighter/dist/esm/prism-light')) as PrismLightModule | null;
    } catch {
      highlighter = null;
    }

    const register = highlighter?.registerLanguage;
    if (!highlighter || typeof register !== 'function') {
      devWarn('[platform-blocks] react-syntax-highlighter not found, CodeBlock will use basic formatting');
      return;
    }

    // Each grammar is optional at runtime; a missing one renders as plain text.
    const languages: Array<[string, () => unknown]> = [
      ['jsx', () => { try { return require('react-syntax-highlighter/dist/esm/languages/prism/jsx'); } catch { return null; } }],
      ['tsx', () => { try { return require('react-syntax-highlighter/dist/esm/languages/prism/tsx'); } catch { return null; } }],
      ['typescript', () => { try { return require('react-syntax-highlighter/dist/esm/languages/prism/typescript'); } catch { return null; } }],
      ['javascript', () => { try { return require('react-syntax-highlighter/dist/esm/languages/prism/javascript'); } catch { return null; } }],
      ['json', () => { try { return require('react-syntax-highlighter/dist/esm/languages/prism/json'); } catch { return null; } }],
      ['bash', () => { try { return require('react-syntax-highlighter/dist/esm/languages/prism/bash'); } catch { return null; } }],
    ];

    for (const [language, load] of languages) {
      const definition = interop(load());
      if (!definition) continue;
      try {
        register.call(highlighter, language, definition);
      } catch {
        // A grammar that fails to register renders as plain text.
      }
    }

    PrismSyntaxHighlighter = highlighter;
  }
}

/** The Prism component, or null when it could not be loaded (native, or absent). */
export function getPrismHighlighter(): PrismHighlighterComponent | null {
  return PrismSyntaxHighlighter;
}
