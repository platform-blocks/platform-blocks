import React from 'react';
import { Platform, Text } from 'react-native';
import { act, render } from '@testing-library/react';

import { getColorSchemeScript } from '../colorSchemeMarker';
import { createCSSVariablesStylesheet } from '../CSSVariables';
import {
  createThemeColorVariablesCss,
  themeColorVariables,
  themeCssVariables,
  withCssVariableColors,
} from '../cssVariableTheme';
import { DARK_THEME } from '../darkTheme';
import { DEFAULT_THEME } from '../defaultTheme';
import { BUILT_IN_DARK_THEME, PlocksProvider } from '../PlocksProvider';
import { useTheme } from '../ThemeProvider';
import { generateUniversalCSS } from '../../utils/UniversalCSS';

const html = () => document.documentElement;
const variableTags = () => Array.from(document.head.querySelectorAll('style[data-plocks-variables]'));

function resetDocument() {
  document.head.innerHTML = '';
  html().removeAttribute('data-plocks-color-scheme');
  html().className = '';
  html().style.colorScheme = '';
  window.localStorage.clear();
}

beforeEach(resetDocument);

describe('CSS variable generator', () => {
  it('runs as web', () => {
    expect(Platform.OS).toBe('web');
  });

  it('uses one naming scheme, including the new background roles', () => {
    const vars = themeCssVariables(DEFAULT_THEME);
    expect(vars['--plocks-palette-primary-5']).toBe(DEFAULT_THEME.colors.primary[5]);
    expect(vars['--plocks-text-on-primary']).toBe(DEFAULT_THEME.text.onPrimary);
    expect(vars['--plocks-bg-base']).toBe(DEFAULT_THEME.backgrounds.base);
    expect(vars['--plocks-bg-border']).toBe(DEFAULT_THEME.backgrounds.border);
    expect(vars['--plocks-bg-border-strong']).toBe(DEFAULT_THEME.backgrounds.borderStrong);
    expect(vars['--plocks-bg-hover']).toBe(DEFAULT_THEME.backgrounds.hover);
    expect(vars['--plocks-bg-mark']).toBe(DEFAULT_THEME.backgrounds.mark);
    expect(vars['--plocks-bg-scrim']).toBe(DEFAULT_THEME.backgrounds.scrim);
    expect(vars['--plocks-surface-2-background']).toBe(DEFAULT_THEME.surfaces?.[2].background);
    expect(vars['--plocks-z-modal']).toBe('1400');
    expect(vars['--plocks-control-height-md']).toBe('40px');
    expect(Object.keys(vars).some((name) => name.startsWith('--plocks-color-primary'))).toBe(false);
  });

  it('emits the focus ring in both schemes', () => {
    expect(themeColorVariables(DEFAULT_THEME)['--plocks-focus-ring']).toBe(DEFAULT_THEME.states?.focusRing);
    expect(themeColorVariables(BUILT_IN_DARK_THEME)['--plocks-focus-ring']).toBe(DARK_THEME.states?.focusRing);
    const css = createThemeColorVariablesCss(DEFAULT_THEME, BUILT_IN_DARK_THEME);
    expect(css).toContain(`--plocks-focus-ring: ${DARK_THEME.states?.focusRing}`);
  });

  it('reads literal colors — no self-referencing var() cycles', () => {
    const rewritten = withCssVariableColors(DEFAULT_THEME);
    expect(rewritten.backgrounds.base).toMatch(/^var\(--plocks-bg-base,/);
    const vars = themeCssVariables(rewritten);
    Object.entries(vars).forEach(([name, value]) => {
      expect(value).not.toContain(`var(${name}`);
    });
    expect(vars['--plocks-bg-base']).toBe(DEFAULT_THEME.backgrounds.base);
    const stylesheet = createCSSVariablesStylesheet(rewritten);
    expect(stylesheet).toContain(`body {\n  background-color: ${DEFAULT_THEME.backgrounds.base};`);
    expect(stylesheet).not.toMatch(/--plocks-bg-base: var\(/);
  });

  it('paints the body from the theme, not hard-coded colors', () => {
    const css = createCSSVariablesStylesheet(BUILT_IN_DARK_THEME);
    expect(css).toContain(`background-color: ${DARK_THEME.backgrounds.base}`);
    expect(css).toContain(`color: ${DARK_THEME.text.primary}`);
    expect(createCSSVariablesStylesheet(DEFAULT_THEME, '#app')).not.toContain('body {');
  });
});

describe('PlocksProvider on web', () => {
  it('injects variables, marks <html> and paints body before paint', () => {
    render(
      <PlocksProvider colorSchemeMode="dark">
        <Text>hi</Text>
      </PlocksProvider>
    );
    expect(html().getAttribute('data-plocks-color-scheme')).toBe('dark');
    expect(html().classList.contains('plocks-dark')).toBe(true);
    const tags = variableTags();
    expect(tags).toHaveLength(1);
    expect(tags[0].textContent).toContain(`--plocks-bg-base: ${DARK_THEME.backgrounds.base}`);
    expect(tags[0].textContent).toContain(`color: ${DARK_THEME.text.primary}`);
  });

  it('stamps no explicit-choice class in auto mode', () => {
    render(
      <PlocksProvider>
        <Text>hi</Text>
      </PlocksProvider>
    );
    expect(html().getAttribute('data-plocks-color-scheme')).toBe('light');
    expect(html().classList.contains('plocks-light')).toBe(false);
    expect(html().classList.contains('plocks-dark')).toBe(false);
  });

  it('nested providers neither override the root marker nor delete its style tag', () => {
    const view = render(
      <PlocksProvider colorSchemeMode="light">
        <PlocksProvider colorSchemeMode="dark" cssVariablesSelector="#inner">
          <Text>inner</Text>
        </PlocksProvider>
      </PlocksProvider>
    );
    expect(html().getAttribute('data-plocks-color-scheme')).toBe('light');
    expect(variableTags()).toHaveLength(2);

    view.rerender(
      <PlocksProvider colorSchemeMode="light">
        <Text>no inner</Text>
      </PlocksProvider>
    );
    const remaining = variableTags();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].textContent).toContain(':root {');

    view.unmount();
    expect(variableTags()).toHaveLength(0);
  });

  it('a nested provider on :root does not rewrite the page variables', () => {
    render(
      <PlocksProvider colorSchemeMode="light">
        <PlocksProvider colorSchemeMode="dark">
          <Text>inner</Text>
        </PlocksProvider>
      </PlocksProvider>
    );
    const tags = variableTags();
    expect(tags).toHaveLength(1);
    expect(tags[0].textContent).toContain(`--plocks-bg-base: ${DEFAULT_THEME.backgrounds.base}`);
  });

  it('keeps light/dark switching for a { light, dark } theme pair and partial overrides', () => {
    const seen: string[] = [];
    const Probe = () => {
      const theme = useTheme();
      seen.push(`${theme.colorScheme}:${theme.primaryColor}:${theme.backgrounds.base}`);
      return null;
    };
    const pair = { light: { primaryColor: '#111111' }, dark: { primaryColor: '#EEEEEE' } };
    const view = render(
      <PlocksProvider theme={pair} colorSchemeMode="dark">
        <Probe />
      </PlocksProvider>
    );
    expect(seen[seen.length - 1]).toBe(`dark:#EEEEEE:${DARK_THEME.backgrounds.base}`);

    view.rerender(
      <PlocksProvider theme={pair} colorSchemeMode="light">
        <Probe />
      </PlocksProvider>
    );
    expect(seen[seen.length - 1]).toBe(`light:#111111:${DEFAULT_THEME.backgrounds.base}`);

    const partial = { primaryColor: '#ABCDEF' };
    view.rerender(
      <PlocksProvider theme={partial} colorSchemeMode="dark">
        <Probe />
      </PlocksProvider>
    );
    expect(seen[seen.length - 1]).toBe(`dark:#ABCDEF:${DARK_THEME.backgrounds.base}`);
  });

  it('injects a focus ring and no global outline:none', () => {
    render(
      <PlocksProvider>
        <Text>hi</Text>
      </PlocksProvider>
    );
    const css = document.getElementById('plocks-universal-css')?.textContent ?? '';
    expect(css).toContain(':focus-visible');
    expect(css).toContain('var(--plocks-focus-ring');
    expect(css).toContain(':where([data-plocks-input]):focus');
    expect(css).not.toMatch(/outline:\s*none\s*!important/);
    expect(generateUniversalCSS()).not.toContain('@media');
  });
});

describe('getColorSchemeScript', () => {
  const run = (options?: Parameters<typeof getColorSchemeScript>[0]) => {
    act(() => {
      new Function(getColorSchemeScript(options))();
    });
  };

  it('marks a stored explicit choice with the attribute and class', () => {
    window.localStorage.setItem('plocks-theme-mode', 'dark');
    run();
    expect(html().getAttribute('data-plocks-color-scheme')).toBe('dark');
    expect(html().classList.contains('plocks-dark')).toBe(true);
    expect(html().style.colorScheme).toBe('dark');
  });

  it('follows prefers-color-scheme in auto mode without stamping a class', () => {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({ ...original(query), matches: query.includes('dark') })) as typeof window.matchMedia;
    try {
      run();
      expect(html().getAttribute('data-plocks-color-scheme')).toBe('dark');
      expect(html().className).toBe('');
    } finally {
      window.matchMedia = original;
    }
  });

  it('honours custom storage key, default mode and class names', () => {
    run({ storageKey: 'my-key', defaultMode: 'light', lightClass: 'is-light', modeAttribute: 'data-manual' });
    expect(html().getAttribute('data-plocks-color-scheme')).toBe('light');
    expect(html().classList.contains('is-light')).toBe(true);
    expect(html().getAttribute('data-manual')).toBe('light');
  });
});
