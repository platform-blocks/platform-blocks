import { useEffect, useId, useLayoutEffect, useMemo, useRef } from 'react';
import { Platform } from 'react-native';

import { cssVariablesRule, literalBackgrounds, literalText, themeCssVariables } from './cssVariableTheme';
import { useTheme } from './ThemeProvider';
import { PlatformBlocksTheme } from './types';

interface CSSVariablesProps {
  /** CSS selector where variables should be applied */
  selector?: string;
  /**
   * Also paint `body` with the theme's page background and text color. Defaults
   * to `true` when `selector` targets the document (`:root` / `html` / `body`).
   */
  withBodyColors?: boolean;
}

const useIsomorphicLayoutEffect =
  Platform.OS === 'web' && typeof document !== 'undefined' ? useLayoutEffect : useEffect;

const targetsDocument = (selector: string) => selector === ':root' || selector === 'html' || selector === 'body';

/**
 * The stylesheet `CSSVariables` injects for `theme`: every variable from the
 * one generator (`themeCssVariables`, which reads literal colors, so a theme
 * rewritten to `var()` references never produces self-referencing cycles),
 * `::selection`, and — for the document — the body's background and text.
 */
export function createCSSVariablesStylesheet(
  theme: PlatformBlocksTheme,
  selector: string = ':root',
  withBodyColors: boolean = targetsDocument(selector)
): string {
  const variables = themeCssVariables(theme);
  const parts = [cssVariablesRule(selector, variables)];

  const selection = theme.states?.textSelection;
  if (selection) {
    const scope = targetsDocument(selector) ? '' : `${selector} `;
    parts.push(`${scope}::selection {\n  background-color: ${selection};\n}`);
    parts.push(`${scope}::-moz-selection {\n  background-color: ${selection};\n}`);
  }

  if (withBodyColors) {
    const background = literalBackgrounds(theme)?.base;
    const color = literalText(theme)?.primary;
    const declarations = [
      background ? `  background-color: ${background};` : '',
      color ? `  color: ${color};` : '',
    ].filter(Boolean);
    if (declarations.length) parts.push(`body {\n${declarations.join('\n')}\n}`);
  }

  return parts.filter(Boolean).join('\n\n');
}

/**
 * Injects the theme's CSS variables (web only; renders nothing).
 *
 * Each instance owns its own `<style data-platform-blocks-variables>` tag,
 * updated in place when the theme changes and removed only on unmount — so
 * nested providers never delete each other's tags. The tag is written in a
 * layout effect, before the browser paints.
 */
export function CSSVariables({ selector = ':root', withBodyColors }: CSSVariablesProps) {
  const theme = useTheme();
  const instanceId = useId();
  const styleRef = useRef<HTMLStyleElement | null>(null);
  const isWeb = Platform.OS === 'web' && typeof document !== 'undefined';

  const css = useMemo(
    () => (isWeb ? createCSSVariablesStylesheet(theme, selector, withBodyColors ?? targetsDocument(selector)) : ''),
    [isWeb, theme, selector, withBodyColors]
  );

  useIsomorphicLayoutEffect(() => {
    if (!isWeb) return;
    let element = styleRef.current;
    if (!element || !element.isConnected) {
      element = document.createElement('style');
      element.setAttribute('data-platform-blocks-variables', instanceId);
      document.head.appendChild(element);
      styleRef.current = element;
    }
    if (element.textContent !== css) element.textContent = css;
  }, [isWeb, css, instanceId]);

  useIsomorphicLayoutEffect(
    () => () => {
      styleRef.current?.remove();
      styleRef.current = null;
    },
    []
  );

  return null;
}
