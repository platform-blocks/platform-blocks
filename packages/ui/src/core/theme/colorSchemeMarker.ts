/**
 * The color-scheme DOM marker — ONE code path for both halves of it:
 *
 *   <html data-platform-blocks-color-scheme="light|dark" class="platform-blocks-dark">
 *
 * - The attribute always carries the resolved scheme. `UniversalCSS` and app
 *   CSS key off it.
 * - The `.platform-blocks-light` / `.platform-blocks-dark` class is stamped
 *   only for an EXPLICIT choice (mode `light` / `dark`). In `auto` mode both
 *   classes are removed so the `prefers-color-scheme` block emitted by
 *   `createThemeColorVariablesCss` stays in control.
 *
 * `applyColorSchemeMarker` is what the providers call after render;
 * `getColorSchemeScript` is the same logic as an inline `<script>` for the
 * document head, so a statically rendered page is marked before first paint.
 */

export type ColorSchemeMode = 'light' | 'dark' | 'auto';

export interface ColorSchemeMarkerOptions {
  /** Element that carries the marker. Default: the document element (`html`). */
  selector?: string;
  /** Attribute holding the resolved scheme. Default `data-platform-blocks-color-scheme`. */
  attribute?: string;
  /** Class for an explicit light choice. Default `platform-blocks-light`. */
  lightClass?: string;
  /** Class for an explicit dark choice. Default `platform-blocks-dark`. */
  darkClass?: string;
  /**
   * Optional attribute recording an explicit mode (`ThemeModeConfig.domConfig.attribute`,
   * e.g. `data-platform-blocks-manual`); removed in `auto` mode.
   */
  modeAttribute?: string;
  /** Also set `style.colorScheme` (native form controls, scrollbars). Default `true`. */
  setColorSchemeStyle?: boolean;
}

export const COLOR_SCHEME_ATTRIBUTE = 'data-platform-blocks-color-scheme';
export const LIGHT_SCHEME_CLASS = 'platform-blocks-light';
export const DARK_SCHEME_CLASS = 'platform-blocks-dark';
/** localStorage key `ThemeModeProvider` persists the mode under. */
export const COLOR_SCHEME_STORAGE_KEY = 'platform-blocks-theme-mode';

function resolveTarget(selector: string | undefined): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  if (!selector || selector === 'html' || selector === ':root') return document.documentElement;
  return document.querySelector(selector) as HTMLElement | null;
}

/**
 * Stamps the marker for `scheme` on the document (web only; a no-op without a
 * DOM). `mode` decides whether the explicit-choice class is set.
 */
export function applyColorSchemeMarker(
  scheme: 'light' | 'dark',
  mode: ColorSchemeMode,
  options: ColorSchemeMarkerOptions = {}
): void {
  const element = resolveTarget(options.selector);
  if (!element) return;
  const {
    attribute = COLOR_SCHEME_ATTRIBUTE,
    lightClass = LIGHT_SCHEME_CLASS,
    darkClass = DARK_SCHEME_CLASS,
    modeAttribute,
    setColorSchemeStyle = true,
  } = options;

  if (element.getAttribute(attribute) !== scheme) element.setAttribute(attribute, scheme);

  element.classList.remove(lightClass, darkClass);
  if (mode !== 'auto') element.classList.add(scheme === 'dark' ? darkClass : lightClass);

  if (modeAttribute) {
    if (mode === 'auto') element.removeAttribute(modeAttribute);
    else element.setAttribute(modeAttribute, mode);
  }

  if (setColorSchemeStyle && element.style) element.style.colorScheme = scheme;
}

export interface ColorSchemeScriptOptions extends Omit<ColorSchemeMarkerOptions, 'setColorSchemeStyle'> {
  /** localStorage key holding `'light' | 'dark' | 'auto'`. Default `platform-blocks-theme-mode` (what `ThemeModeProvider` writes). */
  storageKey?: string;
  /** Mode when nothing is stored. Default `'auto'` (follow `prefers-color-scheme`). */
  defaultMode?: ColorSchemeMode;
  /** Also set `style.colorScheme` on the element. Default `true`. */
  setColorSchemeStyle?: boolean;
}

/**
 * An inline script (as a string) that marks the document with the reader's
 * color scheme BEFORE first paint — read from `localStorage` (the mode
 * `ThemeModeProvider` persists), falling back to `defaultMode` and, for
 * `'auto'`, to `prefers-color-scheme`. It sets exactly what the providers set
 * after hydration (see `applyColorSchemeMarker`), so they pick up where it
 * leaves off instead of fighting it.
 *
 * Put it in the document head of a statically rendered / SSR app, next to the
 * stylesheet from `createThemeColorVariablesCss`:
 *
 * ```tsx
 * // Expo Router app/+html.tsx, Next.js app/layout.tsx, …
 * <head>
 *   <style dangerouslySetInnerHTML={{ __html: createThemeColorVariablesCss(DEFAULT_THEME, BUILT_IN_DARK_THEME) }} />
 *   <script dangerouslySetInnerHTML={{ __html: getColorSchemeScript() }} />
 * </head>
 * ```
 *
 * Pass the same `domConfig` values you give `ThemeModeConfig` (selector,
 * classes, attribute) if you customised them. The script touches only the
 * target element (never `document.body`, which does not exist yet in the head)
 * and swallows every error, so it can never break the page.
 */
export function getColorSchemeScript(options: ColorSchemeScriptOptions = {}): string {
  const {
    storageKey = COLOR_SCHEME_STORAGE_KEY,
    defaultMode = 'auto',
    selector,
    attribute = COLOR_SCHEME_ATTRIBUTE,
    lightClass = LIGHT_SCHEME_CLASS,
    darkClass = DARK_SCHEME_CLASS,
    modeAttribute,
    setColorSchemeStyle = true,
  } = options;
  const json = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');
  const target =
    !selector || selector === 'html' || selector === ':root'
      ? 'document.documentElement'
      : `document.querySelector(${json(selector)})`;

  return [
    '(function(){try{',
    `var r=${target};if(!r)return;`,
    `var m=null;try{m=window.localStorage.getItem(${json(storageKey)});}catch(e){}`,
    `if(m!=='light'&&m!=='dark'&&m!=='auto')m=${json(defaultMode)};`,
    "var s=m==='auto'?((window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light'):m;",
    `r.setAttribute(${json(attribute)},s);`,
    `r.classList.remove(${json(lightClass)},${json(darkClass)});`,
    `if(m!=='auto'){r.classList.add(s==='dark'?${json(darkClass)}:${json(lightClass)});}`,
    modeAttribute ? `if(m==='auto'){r.removeAttribute(${json(modeAttribute)});}else{r.setAttribute(${json(modeAttribute)},m);}` : '',
    setColorSchemeStyle ? 'r.style.colorScheme=s;' : '',
    '}catch(e){}})();',
  ].join('');
}
