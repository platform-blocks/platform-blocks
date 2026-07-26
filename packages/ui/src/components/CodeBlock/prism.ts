import { Platform } from 'react-native';

/**
 * Lazy, Metro-safe loader for `react-syntax-highlighter`.
 *
 * The library is web-only and optional — native falls back to the built-in
 * tokenizer — so it can never be a static import: Metro bundles every
 * `require()` it can see, including ones inside `try`/`catch`. Building the
 * require through `new Function` hides it from static analysis, which is the
 * whole reason this lives apart from the component.
 *
 * Token colors come from a theme-derived Prism theme (`buildPrismTheme`), not a
 * prebuilt stylesheet, so highlighting follows the app theme.
 */

let PrismSyntaxHighlighter: any = null;
let initialized = false;

const safeRequire: ((name: string) => any) | null = (() => {
  try {
    // Compiles to `function (moduleName) { return require(moduleName); }` at
    // runtime — the string 'require' is not statically analyzable by Metro.
    return new Function('moduleName', 'return require(moduleName)') as (name: string) => any;
  } catch {
    return null;
  }
})();

/** Languages registered on the highlighter; each is optional at runtime. */
const PRISM_LANGUAGES = ['jsx', 'tsx', 'typescript', 'javascript', 'json', 'bash'];

/** Loads the highlighter once. Safe (and free) to call on every render. */
export function initSyntaxHighlighter() {
  if (initialized) return;
  initialized = true;

  if (Platform.OS !== 'web') return;
  if (!safeRequire) return;

  try {
    PrismSyntaxHighlighter = safeRequire('react-syntax-highlighter').PrismLight;
    if (!PrismSyntaxHighlighter) return;

    for (const language of PRISM_LANGUAGES) {
      try {
        const definition = safeRequire(`react-syntax-highlighter/dist/esm/languages/prism/${language}`).default;
        PrismSyntaxHighlighter.registerLanguage(language, definition);
      } catch {
        // Language not available in this install — Prism falls back to plain text.
      }
    }
  } catch {
    // react-syntax-highlighter not installed; the native tokenizer handles it.
    if (__DEV__) {
      console.warn('[platform-blocks] react-syntax-highlighter not found, CodeBlock will use basic formatting');
    }
  }
}

/** The Prism component, or null when it could not be loaded (native, or absent). */
export function getPrismHighlighter(): any {
  return PrismSyntaxHighlighter;
}
