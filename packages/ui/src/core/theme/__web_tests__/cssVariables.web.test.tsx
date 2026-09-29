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
import { BUILT_IN_DARK_THEME, PlatformBlocksProvider } from '../PlatformBlocksProvider';
import { useTheme } from '../ThemeProvider';
import { generateUniversalCSS } from '../../utils/UniversalCSS';

const html = () => document.documentElement;
const variableTags = () => Array.from(document.head.querySelectorAll('style[data-platform-blocks-variables]'));

function resetDocument() {
  document.head.innerHTML = '';
  html().removeAttribute('data-platform-blocks-color-scheme');
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
    expect(vars['--platform-blocks-palette-primary-5']).toBe(DEFAULT_THEME.colors.primary[5]);
    expect(vars['--platform-blocks-text-on-primary']).toBe(DEFAULT_THEME.text.onPrimary);
    expect(vars['--platform-blocks-bg-base']).toBe(DEFAULT_THEME.backgrounds.base);
    expect(vars['--platform-blocks-bg-border']).toBe(DEFAULT_THEME.backgrounds.border);
    expect(vars['--platform-blocks-bg-border-strong']).toBe(DEFAULT_THEME.backgrounds.borderStrong);
    expect(vars['--platform-blocks-bg-hover']).toBe(DEFAULT_THEME.backgrounds.hover);
    expect(vars['--platform-blocks-bg-mark']).toBe(DEFAULT_THEME.backgrounds.mark);
    expect(vars['--platform-blocks-bg-scrim']).toBe(DEFAULT_THEME.backgrounds.scrim);
    expect(vars['--platform-blocks-surface-2-background']).toBe(DEFAULT_THEME.surfaces?.[2].background);
    expect(vars['--platform-blocks-z-modal']).toBe('1400');
    expect(vars['--platform-blocks-control-height-md']).toBe('40px');
    expect(Object.keys(vars).some((name) => name.startsWith('--platform-blocks-color-primary'))).toBe(false);
  });

  it('emits the focus ring in both schemes', () => {
    expect(themeColorVariables(DEFAULT_THEME)['--platform-blocks-focus-ring']).toBe(DEFAULT_THEME.states?.focusRing);
    expect(themeColorVariables(BUILT_IN_DARK_THEME)['--platform-blocks-focus-ring']).toBe(DARK_THEME.states?.focusRing);
    const css = createThemeColorVariablesCss(DEFAULT_THEME, BUILT_IN_DARK_THEME);
    expect(css).toContain(`--platform-blocks-focus-ring: ${DARK_THEME.states?.focusRing}`);
  });

  it('reads literal colors — no self-referencing var() cycles', () => {
    const rewritten = withCssVariableColors(DEFAULT_THEME);
    expect(rewritten.backgrounds.base).toMatch(/^var\(--platform-blocks-bg-base,/);
    const vars = themeCssVariables(rewritten);
    Object.entries(vars).forEach(([name, value]) => {
      expect(value).not.toContain(`var(${name}`);
    });
    expect(vars['--platform-blocks-bg-base']).toBe(DEFAULT_THEME.backgrounds.base);
    const stylesheet = createCSSVariablesStylesheet(rewritten);
    expect(stylesheet).toContain(`body {\n  background-color: ${DEFAULT_THEME.backgrounds.base};`);
    expect(stylesheet).not.toMatch(/--platform-blocks-bg-base: var\(/);
  });

  it('paints the body from the theme, not hard-coded colors', () => {
    const css = createCSSVariablesStylesheet(BUILT_IN_DARK_THEME);
    expect(css).toContain(`background-color: ${DARK_THEME.backgrounds.base}`);
    expect(css).toContain(`color: ${DARK_THEME.text.primary}`);
    expect(createCSSVariablesStylesheet(DEFAULT_THEME, '#app')).not.toContain('body {');
  });
});

describe('PlatformBlocksProvider on web', () => {
  it('injects variables, marks <html> and paints body before paint', () => {
    render(
      <PlatformBlocksProvider colorSchemeMode="dark">
        <Text>hi</Text>
      </PlatformBlocksProvider>
    );
    expect(html().getAttribute('data-platform-blocks-color-scheme')).toBe('dark');
    expect(html().classList.contains('platform-blocks-dark')).toBe(true);
    const tags = variableTags();
    expect(tags).toHaveLength(1);
    expect(tags[0].textContent).toContain(`--platform-blocks-bg-base: ${DARK_THEME.backgrounds.base}`);
    expect(tags[0].textContent).toContain(`color: ${DARK_THEME.text.primary}`);
  });

  it('stamps no explicit-choice class in auto mode', () => {
    render(
      <PlatformBlocksProvider>
        <Text>hi</Text>
      </PlatformBlocksProvider>
    );
    expect(html().getAttribute('data-platform-blocks-color-scheme')).toBe('light');
    expect(html().classList.contains('platform-blocks-light')).toBe(false);
    expect(html().classList.contains('platform-blocks-dark')).toBe(false);
  });

  it('nested providers neither override the root marker nor delete its style tag', () => {
    const view = render(
      <PlatformBlocksProvider colorSchemeMode="light">
        <PlatformBlocksProvider colorSchemeMode="dark" cssVariablesSelector="#inner">
          <Text>inner</Text>
        </PlatformBlocksProvider>
      </PlatformBlocksProvider>
    );
    expect(html().getAttribute('data-platform-blocks-color-scheme')).toBe('light');
    expect(variableTags()).toHaveLength(2);

    view.rerender(
      <PlatformBlocksProvider colorSchemeMode="light">
        <Text>no inner</Text>
      </PlatformBlocksProvider>
    );
    const remaining = variableTags();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].textContent).toContain(':root {');

    view.unmount();
    expect(variableTags()).toHaveLength(0);
  });

  it('a nested provider on :root does not rewrite the page variables', () => {
    render(
      <PlatformBlocksProvider colorSchemeMode="light">
        <PlatformBlocksProvider colorSchemeMode="dark">
          <Text>inner</Text>
        </PlatformBlocksProvider>
      </PlatformBlocksProvider>
    );
    const tags = variableTags();
    expect(tags).toHaveLength(1);
    expect(tags[0].textContent).toContain(`--platform-blocks-bg-base: ${DEFAULT_THEME.backgrounds.base}`);
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
      <PlatformBlocksProvider theme={pair} colorSchemeMode="dark">
        <Probe />
      </PlatformBlocksProvider>
    );
    expect(seen[seen.length - 1]).toBe(`dark:#EEEEEE:${DARK_THEME.backgrounds.base}`);

    view.rerender(
      <PlatformBlocksProvider theme={pair} colorSchemeMode="light">
        <Probe />
      </PlatformBlocksProvider>
    );
    expect(seen[seen.length - 1]).toBe(`light:#111111:${DEFAULT_THEME.backgrounds.base}`);

    const partial = { primaryColor: '#ABCDEF' };
    view.rerender(
      <PlatformBlocksProvider theme={partial} colorSchemeMode="dark">
        <Probe />
      </PlatformBlocksProvider>
    );
    expect(seen[seen.length - 1]).toBe(`dark:#ABCDEF:${DARK_THEME.backgrounds.base}`);
  });

  it('injects a focus ring and no global outline:none', () => {
    render(
      <PlatformBlocksProvider>
        <Text>hi</Text>
      </PlatformBlocksProvider>
    );
    const css = document.getElementById('platform-blocks-universal-css')?.textContent ?? '';
    expect(css).toContain(':focus-visible');
    expect(css).toContain('var(--platform-blocks-focus-ring');
    expect(css).toContain(':where([data-pb-input]):focus');
    expect(css).not.toMatch(/outline:\s*none\s*!important/);
    expect(generateUniversalCSS()).toContain('@media (min-width: 768px)');
  });
});

describe('getColorSchemeScript', () => {
  const run = (options?: Parameters<typeof getColorSchemeScript>[0]) => {
    act(() => {
      new Function(getColorSchemeScript(options))();
    });
  };

  it('marks a stored explicit choice with the attribute and class', () => {
    window.localStorage.setItem('platform-blocks-theme-mode', 'dark');
    run();
    expect(html().getAttribute('data-platform-blocks-color-scheme')).toBe('dark');
    expect(html().classList.contains('platform-blocks-dark')).toBe(true);
    expect(html().style.colorScheme).toBe('dark');
  });

  it('follows prefers-color-scheme in auto mode without stamping a class', () => {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({ ...original(query), matches: query.includes('dark') })) as typeof window.matchMedia;
    try {
      run();
      expect(html().getAttribute('data-platform-blocks-color-scheme')).toBe('dark');
      expect(html().className).toBe('');
    } finally {
      window.matchMedia = original;
    }
  });

  it('honours custom storage key, default mode and class names', () => {
    run({ storageKey: 'my-key', defaultMode: 'light', lightClass: 'is-light', modeAttribute: 'data-manual' });
    expect(html().getAttribute('data-platform-blocks-color-scheme')).toBe('light');
    expect(html().classList.contains('is-light')).toBe(true);
    expect(html().getAttribute('data-manual')).toBe('light');
  });
});
